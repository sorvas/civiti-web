# Photo Upload Specification

Technical reference for the photo upload system used during issue creation. This document covers the Supabase storage configuration, upload pipeline, image compression, retry strategy, and common failure points — intended for any client (web or mobile) that needs to implement photo uploads.

---

## Table of Contents

- [Supabase Storage Configuration](#supabase-storage-configuration)
- [RLS Policies](#rls-policies)
- [Upload API Call](#upload-api-call)
- [Path Generation & Filename Sanitization](#path-generation--filename-sanitization)
- [Image Compression Pipeline](#image-compression-pipeline)
- [Retry Strategy](#retry-strategy)
- [Upload Lifecycle & Cancellation](#upload-lifecycle--cancellation)
- [PhotoData Object Shape](#photodata-object-shape)
- [What Gets Sent to the Backend](#what-gets-sent-to-the-backend)
- [Orphan Image Problem](#orphan-image-problem)
- [Common Mobile Failure Points](#common-mobile-failure-points)

---

## Supabase Storage Configuration

| Setting            | Value                                                              |
| ------------------ | ------------------------------------------------------------------ |
| Bucket name        | `issue-photos`                                                     |
| Public             | `true` (read via public URL, no signed URLs needed)                |
| Max file size      | 10,485,760 bytes (10MB) — enforced server-side                     |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/gif` |
| Path convention    | `{userId}/{timestamp}-{sanitizedFilename}`                         |

**Source**: `supabase/migrations/20241203000001_storage_setup.sql`

---

## RLS Policies

These are Supabase-side policies. Any client must satisfy them or uploads will fail.

| Operation  | Who                | Constraint                                                                  |
| ---------- | ------------------ | --------------------------------------------------------------------------- |
| **INSERT** | Authenticated only | First folder in path **must** equal `auth.uid()`                            |
| **SELECT** | Public             | `anon` + `authenticated` — anyone can read from `issue-photos`              |
| **UPDATE** | Authenticated only | Own folder only — `(storage.foldername(name))[1] = auth.uid()::text`        |
| **DELETE** | Authenticated only | Own folder only — `(storage.foldername(name))[1] = auth.uid()::text`        |

The RLS check `(storage.foldername(name))[1] = auth.uid()::text` means the **first path segment** must be the user's UUID. A path like `photos/{userId}/file.jpg` instead of `{userId}/file.jpg` will be silently rejected — Supabase storage returns a generic error, not an RLS-specific one.

---

## Upload API Call

The Supabase SDK upload call with exact parameters:

```typescript
supabase.storage
  .from('issue-photos')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: true
  })
```

| Parameter      | Value    | Why                                                                                    |
| -------------- | -------- | -------------------------------------------------------------------------------------- |
| `cacheControl` | `'3600'` | 1-hour browser cache header                                                            |
| `upsert`       | `true`   | Allows overwrite on retry — prevents failure if first attempt uploaded but response was lost |

After upload, the public URL is retrieved via:

```typescript
const { data } = supabase.storage
  .from('issue-photos')
  .getPublicUrl(data.path);
```

**Important for mobile**: The SDK infers `contentType` from the `File` object. If constructing the file/blob manually (common on mobile), you **must** set the content type explicitly or it may default to `application/octet-stream`, which will be rejected by the `allowed_mime_types` bucket constraint.

**Source**: `src/app/services/storage.service.ts`

---

## Path Generation & Filename Sanitization

```typescript
// Path generation (done ONCE, outside the retry loop)
const timestamp = Date.now();
const sanitizedFilename = sanitizeFilename(file.name);
const filePath = `${userId}/${timestamp}-${sanitizedFilename}`;

// Sanitization
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}
```

The path is generated **once before the retry loop** — combined with `upsert: true`, this prevents orphaned duplicate files when a retry succeeds after a previous attempt already wrote the file.

**Example path**: `abc123-def456/1701619200000-photo_from_park.jpg`

---

## Image Compression Pipeline

### Settings

```
maxSizeMB:         1       // Target ≤1MB after compression
maxWidthOrHeight:  1920    // Max dimension (px)
useWebWorker:      true    // Non-blocking (web-specific)
preserveExif:      false   // STRIPS ALL EXIF DATA (privacy requirement)
initialQuality:    0.85    // 85% JPEG quality — visually identical
```

### Logic

```
if file.size < 500KB  →  EXIF strip only, no size compression
if file.size ≥ 500KB  →  Full compression + EXIF strip
if compression fails  →  REJECT upload entirely (do not upload original)
```

### Requirements for Any Client

1. **EXIF stripping is mandatory** — the app must refuse to upload if EXIF cannot be stripped. This is a privacy protection measure (GPS coordinates, device info).
2. **Quality target**: 85%, max 1MB, max 1920px on longest side.
3. **Small files** (< 500KB): only strip EXIF, skip recompression to avoid unnecessary quality loss.
4. **Never fall back to the original file** if compression/EXIF stripping fails. The upload must be rejected to protect user privacy.

### Web Implementation

The web app uses the [`browser-image-compression`](https://github.com/niclin/browser-image-compression) library. Mobile clients will need a platform-appropriate equivalent (e.g., `expo-image-manipulator` for React Native, `UIImage` compression for iOS, `Bitmap.compress` for Android).

**Source**: `src/app/components/issue-creation/photo-upload/photo-upload.component.ts`

---

## Retry Strategy

```
Attempt 1 → fail → wait 1s
Attempt 2 → fail → wait 2s
Attempt 3 → fail → wait 4s
Attempt 4 → fail → GIVE UP

Max retries:     3 (4 total attempts)
Initial delay:   1000ms
Max delay:       8000ms
Formula:         delay = min(initialDelay × 2^(retryCount - 1), maxDelay)
```

This same strategy applies to both uploads and deletions.

**Source**: `src/app/services/storage.service.ts`

---

## Upload Lifecycle & Cancellation

### Full Flow per File

```
1. VALIDATE
   - Is image? (file.type starts with 'image/')
   - ≤ 10MB?
   - User authenticated?

2. PREVIEW
   - Create blob URL for instant thumbnail preview
   - Add PhotoData placeholder to array (storagePath = '')

3. COMPRESS
   - Strip EXIF data (mandatory)
   - Compress if ≥ 500KB
   - Reject if compression fails

4. UPLOAD
   - Upload to Supabase with retry (up to 3 retries)
   - Path: {userId}/{timestamp}-{sanitizedFilename}

5. ON SUCCESS
   - Update PhotoData with real Supabase URL + storagePath
   - Revoke blob URL (after 500ms delay to avoid flicker)
   - Persist to sessionStorage for back-navigation support

6. ON FAILURE
   - Remove PhotoData from array
   - Revoke blob URL immediately
   - Show error message to user
```

### Cancellation Scenarios

| Scenario                        | What happens                                                     |
| ------------------------------- | ---------------------------------------------------------------- |
| User removes photo mid-upload   | RxJS subscription cancelled, if upload completed → delete from storage |
| Component destroyed mid-upload  | All ongoing uploads cancelled via cancellation Map               |
| User removes photo after upload | `deletePhotoWithRetry()` called to clean up storage              |

### Validation Rules

- Maximum 8 photos per issue
- At least 1 photo required to continue
- All photos must have a `storagePath` (fully uploaded) before proceeding to next step
- First photo is automatically marked as primary

---

## PhotoData Object Shape

```typescript
interface PhotoData {
  id: string;           // 'photo-{timestamp}-{random5chars}'
  url: string;          // Supabase public URL (after upload), blob URL (before)
  thumbnail: string;    // Same as url (no separate thumbnail generated)
  storagePath: string;  // '{userId}/{timestamp}-{filename}' — empty until uploaded
  quality: 'low' | 'medium' | 'high';
  timestamp: Date;
  isPrimary: boolean;   // First photo = true by default, user can change
  metadata: {
    size: number;       // File size in bytes (updated after compression)
    dimensions: { width: number; height: number };
    format: string;     // MIME type
  };
}
```

### Quality Classification

| Original file size | Quality rating |
| ------------------ | -------------- |
| > 2MB              | `high`         |
| > 500KB            | `medium`       |
| ≤ 500KB            | `low`          |

### Primary Photo

- The first uploaded photo is primary by default.
- User can change which photo is primary.
- If the primary photo is removed, the first remaining photo becomes primary.
- Photos are sorted so the primary photo comes first when submitted to the backend.

---

## What Gets Sent to the Backend

The backend receives **only URLs**, not files:

```typescript
const issueToSubmit: CreateIssueRequest = {
  title: string,
  description: string,
  category: IssueCategory,
  address: string,
  district: string,
  latitude: number,
  longitude: number,
  urgency: UrgencyLevel,
  desiredOutcome: string,
  communityImpact: string,
  photoUrls: string[],              // Public Supabase URLs, primary first
  authorities: IssueAuthorityInput[]
};
```

The backend stores URL references in the issue record. It has **no knowledge** of the storage paths or the upload process — all file management happens client-side via the Supabase SDK.

---

## Orphan Image Problem

### How Orphans Occur

Photos are uploaded **eagerly** during the photo-upload step — before the issue exists in the backend. If the user abandons the flow, the photos remain in Supabase storage with no associated issue.

| Scenario                              | Photos cleaned up? |
| ------------------------------------- | ------------------ |
| User removes a photo via UI           | Yes                |
| User cancels upload mid-progress      | Yes                |
| Component destroyed during upload     | Yes (cancelled)    |
| User closes browser/tab               | **No — orphaned**  |
| User navigates away from issue flow   | **No — orphaned**  |
| Issue submission API call fails       | **No — orphaned**  |
| Session storage cleared unexpectedly  | **No — orphaned**  |

### Current Mitigation

The `clearIssueCreationSession()` utility only clears sessionStorage keys — it does **not** delete files from Supabase storage.

### Recommended Solution

A server-side cleanup mechanism (e.g., Supabase Edge Function on a daily cron) that:

1. Lists all files in the `issue-photos` bucket.
2. Cross-references with `photoUrls` stored in the issues table.
3. Deletes any file older than 24 hours that is not referenced by any issue.

---

## Common Mobile Failure Points

| Failure                              | Root Cause                                              | Fix                                                                 |
| ------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------- |
| RLS rejection (403 / vague error)    | Path doesn't start with `auth.uid()`                    | Ensure path = `{userId}/...` as first segment                       |
| MIME type rejection                  | Content type not set or not in allowed list              | Explicitly set `contentType` on upload                              |
| Auth token missing                   | Supabase client not using authenticated session          | Ensure `supabase.auth.getSession()` returns valid session before upload |
| Silent failure on retry              | Not using `upsert: true`                                | Enable upsert so retries to same path succeed                       |
| HEIC not handled                     | iOS photos default to HEIC format                       | Convert to JPEG before upload, or ensure compression handles HEIC   |
| File too large                       | No compression before upload                            | Compress to ≤1MB before upload                                      |
| Upload fires before auth is ready    | Auth session not yet restored from persistence           | Wait for auth session to be fully initialized before allowing uploads |

### Auth Timing (Most Common Issue)

The web app uses `getCurrentUserOnceReady()` which waits for the Supabase auth session to be fully restored from persistence before allowing uploads. If a mobile client fires an upload before the auth session is restored, the Supabase client sends the request as `anon`, and the INSERT RLS policy rejects it. The error message from Supabase will **not** say "not authenticated" — it will be something vague like "new row violates row-level security policy".
