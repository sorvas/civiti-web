import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MockDataService, Issue, Authority } from '../../services/mock-data.service';

@Component({
    selector: 'app-email-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
    ],
    template: `
    <div class="email-modal-container">
      <h2 mat-dialog-title class="text-oxford-blue font-semibold text-xl mb-4">
        <mat-icon class="mr-2 text-orange-web">email</mat-icon>
        Email către {{ authority?.name }}
      </h2>

      <mat-dialog-content class="max-h-96 overflow-y-auto">
        <!-- User Details Form -->
        <form [formGroup]="emailForm" class="space-y-4 mb-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Numele tău *</mat-label>
            <input matInput formControlName="name" placeholder="Ex: Ion Popescu">
            <mat-icon matSuffix>person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email-ul tău *</mat-label>
            <input matInput type="email" formControlName="email" placeholder="ion.popescu@example.com">
            <mat-icon matSuffix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Telefon (opțional)</mat-label>
            <input matInput type="tel" formControlName="phone" placeholder="+40 123 456 789">
            <mat-icon matSuffix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Comentarii suplimentare (opțional)</mat-label>
            <textarea 
              matInput 
              formControlName="additionalComments" 
              rows="3"
              placeholder="Adaugă orice informații suplimentare relevante...">
            </textarea>
          </mat-form-field>
        </form>

        <!-- Email Preview -->
        <div class="email-preview bg-platinum p-4 rounded-lg border">
          <h3 class="font-semibold text-oxford-blue mb-3 flex items-center">
            <mat-icon class="mr-2">preview</mat-icon>
            Previzualizare Email
          </h3>
          
          <!-- Email To -->
          <div class="mb-3">
            <div class="flex items-center justify-between">
              <strong class="text-oxford-blue">Către:</strong>
              <button mat-icon-button (click)="copyToClipboard(authority?.email || '')" 
                      matTooltip="Copiază adresa email">
                <mat-icon class="text-orange-web">content_copy</mat-icon>
              </button>
            </div>
            <p class="text-sm text-oxford-blue opacity-75 mt-1">{{ authority?.email }}</p>
          </div>

          <!-- Email Subject -->
          <div class="mb-3">
            <div class="flex items-center justify-between">
              <strong class="text-oxford-blue">Subiect:</strong>
              <button mat-icon-button (click)="copyToClipboard(emailTemplate?.subject || '')" 
                      matTooltip="Copiază subiectul">
                <mat-icon class="text-orange-web">content_copy</mat-icon>
              </button>
            </div>
            <p class="text-sm text-oxford-blue opacity-75 mt-1">{{ emailTemplate?.subject }}</p>
          </div>

          <!-- Email Body -->
          <div class="mb-3">
            <div class="flex items-center justify-between">
              <strong class="text-oxford-blue">Mesaj:</strong>
              <button mat-icon-button (click)="copyToClipboard(emailTemplate?.body || '')" 
                      matTooltip="Copiază mesajul">
                <mat-icon class="text-orange-web">content_copy</mat-icon>
              </button>
            </div>
            <div class="text-sm text-oxford-blue opacity-75 mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {{ emailTemplate?.body }}
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="instructions bg-orange-web-20 p-4 rounded-lg mt-4">
          <h4 class="font-semibold text-oxford-blue mb-2 flex items-center">
            <mat-icon class="mr-2 text-orange-web">info</mat-icon>
            Instrucțiuni
          </h4>
          <ol class="text-sm text-oxford-blue space-y-1 ml-4">
            <li>1. Copiază adresa de email, subiectul și mesajul</li>
            <li>2. Deschide aplicația ta de email preferată</li>
            <li>3. Lipește informațiile copiate și trimite email-ul</li>
            <li>4. Revino să confirmi că ai trimis email-ul</li>
          </ol>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="flex justify-between p-4">
        <button mat-button (click)="onCancel()" class="btn-secondary">
          <mat-icon class="mr-2">close</mat-icon>
          Anulează
        </button>
        
        <div class="flex gap-2">
          <button 
            mat-raised-button 
            (click)="copyAllAndOpenEmail()" 
            class="btn-secondary"
            [disabled]="emailForm.invalid"
          >
            <mat-icon class="mr-2">launch</mat-icon>
            Copiază Tot & Deschide Email
          </button>
          
          <button 
            mat-raised-button 
            color="accent" 
            (click)="confirmEmailSent()" 
            class="btn-primary"
            [disabled]="emailForm.invalid"
          >
            <mat-icon class="mr-2">mark_email_read</mat-icon>
            Am Trimis Email-ul
          </button>
        </div>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .email-modal-container {
      width: 100%;
      max-width: 600px;
    }

    .space-y-4 > * + * {
      margin-top: 1rem;
    }

    .email-preview {
      background-color: var(--platinum);
      border: 1px solid var(--platinum);
    }

    .bg-orange-web-20 {
      background-color: var(--orange-web-20);
    }

    .text-oxford-blue {
      color: var(--oxford-blue);
    }

    .text-orange-web {
      color: var(--orange-web);
    }

    .instructions ol {
      list-style: decimal;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class EmailModalComponent implements OnInit {
    private _fb = inject(FormBuilder);
    private _dialog = inject(MatDialog);
    private _snackBar = inject(MatSnackBar);
    private _mockDataService = inject(MockDataService);

    issue: Issue | null = null;
    authority: Authority | null = null;
    emailTemplate: any = null;

    emailForm = this._fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        additionalComments: ['']
    });

    ngOnInit(): void {
        if (this.issue && this.authority) {
            this.generateEmailTemplate();
        }
    }

    private generateEmailTemplate(): void {
        if (this.issue && this.authority && this.emailForm.value.name && this.emailForm.value.email) {
            this.emailTemplate = this._mockDataService.generateEmailTemplate(
                this.issue,
                this.authority,
                this.emailForm.value
            );
        }
    }

    onFormChange(): void {
        this.generateEmailTemplate();
    }

    copyToClipboard(text: string): void {
        navigator.clipboard.writeText(text).then(() => {
            this._snackBar.open('Copiat în clipboard!', 'OK', {
                duration: 2000,
                panelClass: ['success-snackbar']
            });
        });
    }

    copyAllAndOpenEmail(): void {
        if (this.emailTemplate && this.emailForm.valid) {
            const allText = `Către: ${this.authority?.email}\n\nSubiect: ${this.emailTemplate.subject}\n\nMesaj:\n${this.emailTemplate.body}`;
            this.copyToClipboard(allText);

            // Try to open default email client
            window.open(`mailto:${this.authority?.email}?subject=${encodeURIComponent(this.emailTemplate.subject)}&body=${encodeURIComponent(this.emailTemplate.body)}`);
        }
    }

    confirmEmailSent(): void {
        if (this.issue && this.authority && this.emailForm.valid) {
            this._mockDataService.trackEmailSent(this.issue.id, this.authority.id).subscribe(() => {
                this._snackBar.open('Mulțumim! Email-ul a fost înregistrat.', 'OK', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });
                this._dialog.closeAll();
            });
        }
    }

    onCancel(): void {
        this._dialog.closeAll();
    }
}

@Component({
    selector: 'app-issue-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatToolbarModule,
        MatTabsModule,
        MatExpansionModule,
        MatSnackBarModule
    ],
    template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <mat-toolbar class="navbar shadow-md">
        <button mat-icon-button (click)="goBack()" class="text-white">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="text-white font-semibold flex-1">
          Detalii Problemă
        </span>
        <mat-icon class="text-orange-web">visibility</mat-icon>
      </mat-toolbar>

      <div *ngIf="isLoading" class="text-center py-12">
        <mat-icon class="text-oxford-blue text-4xl mb-4 animate-spin">refresh</mat-icon>
        <p class="text-oxford-blue">Se încarcă detaliile...</p>
      </div>

      <div *ngIf="!isLoading && issue" class="container mx-auto p-4 max-w-6xl">
        <!-- Issue Header -->
        <mat-card class="mb-6">
          <mat-card-content class="p-6">
            <div class="flex flex-col md:flex-row gap-6">
              <!-- Main Info -->
              <div class="flex-1">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h1 class="text-oxford-blue font-bold text-2xl mb-2">{{ issue.title }}</h1>
                    <div class="flex items-center gap-3 mb-4">
                      <mat-chip class="official-badge">{{ getStatusText(issue.status) }}</mat-chip>
                      <mat-chip class="text-oxford-blue opacity-75">{{ issue.id }}</mat-chip>
                      <mat-chip *ngIf="getUrgencyLevel(issue) === 'urgent'" class="priority-urgent">
                        URGENT
                      </mat-chip>
                    </div>
                  </div>
                </div>

                <p class="text-oxford-blue opacity-75 text-lg mb-4">{{ issue.description }}</p>

                <!-- Location -->
                <div class="flex items-center text-oxford-blue mb-4">
                  <mat-icon class="mr-2 text-orange-web">place</mat-icon>
                  <span class="font-semibold">{{ issue.location.address }}</span>
                </div>

                <!-- Date -->
                <div class="flex items-center text-oxford-blue opacity-60">
                  <mat-icon class="mr-2">calendar_today</mat-icon>
                  <span>Raportat la {{ issue.dateCreated | date:'dd MMMM yyyy':'ro' }}</span>
                </div>
              </div>

              <!-- Email Counter - PROMINENT -->
              <div class="text-center">
                <div class="bg-orange-web-20 p-6 rounded-lg border-l-4 border-orange-web">
                  <mat-icon class="text-orange-web text-4xl mb-2">email</mat-icon>
                  <div class="email-counter-number text-orange-web font-bold text-4xl mb-1">
                    {{ issue.emailsSent }}
                  </div>
                  <div class="text-oxford-blue font-semibold mb-2">
                    email-uri trimise
                  </div>
                  <div class="text-oxford-blue opacity-60 text-sm">
                    de către cetățeni îngrijorați
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Photo Gallery -->
            <mat-card>
              <mat-card-header>
                <mat-card-title class="text-oxford-blue flex items-center">
                  <mat-icon class="mr-2 text-orange-web">photo_library</mat-icon>
                  Galerie Foto
                </mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    *ngFor="let photo of issue.photos; let i = index" 
                    class="relative group cursor-pointer"
                    (click)="openPhotoGallery(i)"
                  >
                    <img 
                      [src]="getPhotoUrl(photo)" 
                      [alt]="'Foto ' + (i + 1) + ' - ' + issue.title"
                      class="w-full h-48 object-cover rounded-lg shadow-sm group-hover:shadow-lg transition-shadow"
                      (error)="onImageError($event, i)"
                    >
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <mat-icon class="text-white opacity-0 group-hover:opacity-100 text-3xl">zoom_in</mat-icon>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Problem Details -->
            <mat-card>
              <mat-card-header>
                <mat-card-title class="text-oxford-blue flex items-center">
                  <mat-icon class="mr-2 text-orange-web">info</mat-icon>
                  Detalii Problemă
                </mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <mat-tab-group>
                  <mat-tab label="Situația Actuală">
                    <div class="p-4">
                      <p class="text-oxford-blue leading-relaxed">{{ issue.currentSituation }}</p>
                    </div>
                  </mat-tab>
                  <mat-tab label="Rezultat Dorit">
                    <div class="p-4">
                      <p class="text-oxford-blue leading-relaxed">{{ issue.desiredOutcome }}</p>
                    </div>
                  </mat-tab>
                  <mat-tab label="Impact Comunitate">
                    <div class="p-4">
                      <p class="text-oxford-blue leading-relaxed">{{ issue.communityImpact }}</p>
                    </div>
                  </mat-tab>
                </mat-tab-group>
              </mat-card-content>
            </mat-card>

            <!-- Map -->
            <mat-card>
              <mat-card-header>
                <mat-card-title class="text-oxford-blue flex items-center">
                  <mat-icon class="mr-2 text-orange-web">map</mat-icon>
                  Localizare
                </mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <div class="bg-platinum h-64 rounded-lg flex items-center justify-center border">
                  <div class="text-center text-oxford-blue">
                    <mat-icon class="text-4xl mb-2 opacity-50">map</mat-icon>
                    <p class="font-semibold">Hartă Interactivă</p>
                    <p class="text-sm opacity-75">{{ issue.location.address }}</p>
                    <p class="text-xs opacity-50 mt-2">Lat: {{ issue.location.lat }}, Lng: {{ issue.location.lng }}</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Sidebar - Actions -->
          <div class="space-y-6">
            <!-- Take Action -->
            <mat-card>
              <mat-card-header>
                <mat-card-title class="text-oxford-blue flex items-center">
                  <mat-icon class="mr-2 text-orange-web">campaign</mat-icon>
                  Ia Atitudine
                </mat-card-title>
                <mat-card-subtitle class="text-oxford-blue opacity-75">
                  Ajută la rezolvarea acestei probleme
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content class="p-4">
                <div class="space-y-3">
                  <button 
                    *ngFor="let authority of issue.authorities" 
                    mat-raised-button 
                    color="primary"
                    class="w-full btn-secondary justify-start"
                    (click)="openEmailModal(authority)"
                  >
                    <mat-icon class="mr-2">email</mat-icon>
                    Contactează {{ authority.name }}
                  </button>
                </div>

                <div class="mt-6 p-4 bg-orange-web-20 rounded-lg">
                  <div class="flex items-start">
                    <mat-icon class="text-orange-web mr-2 mt-1">lightbulb</mat-icon>
                    <div class="text-sm">
                      <p class="font-semibold text-oxford-blue mb-1">Sfat:</p>
                      <p class="text-oxford-blue opacity-75">
                        Cu cât mai multe persoane trimit email-uri, cu atât șansele de rezolvare sunt mai mari.
                      </p>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Statistics -->
            <mat-card>
              <mat-card-header>
                <mat-card-title class="text-oxford-blue flex items-center">
                  <mat-icon class="mr-2 text-orange-web">analytics</mat-icon>
                  Statistici
                </mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-oxford-blue">Email-uri trimise:</span>
                    <span class="font-bold text-orange-web">{{ issue.emailsSent }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-oxford-blue">Zile în urmă:</span>
                    <span class="font-bold text-oxford-blue">{{ getDaysSince(issue.dateCreated) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-oxford-blue">Autorități notificate:</span>
                    <span class="font-bold text-oxford-blue">{{ issue.authorities.length }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-oxford-blue">Status:</span>
                    <mat-chip class="official-badge text-xs">{{ getStatusText(issue.status) }}</mat-chip>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div *ngIf="!isLoading && !issue" class="text-center py-12">
        <mat-icon class="text-oxford-blue text-6xl mb-4 opacity-50">error_outline</mat-icon>
        <h3 class="text-oxford-blue text-xl font-semibold mb-2">Problema nu a fost găsită</h3>
        <p class="text-oxford-blue opacity-75 mb-6">
          Este posibil ca această problemă să fi fost ștearsă sau ID-ul să fie incorect.
        </p>
        <button mat-raised-button color="accent" (click)="goBack()" class="btn-primary">
          <mat-icon class="mr-2">arrow_back</mat-icon>
          Înapoi la Lista de Probleme
        </button>
      </div>
    </div>
  `,
    styles: [`
    .space-y-6 > * + * {
      margin-top: 1.5rem;
    }

    .space-y-3 > * + * {
      margin-top: 0.75rem;
    }

    .space-y-4 > * + * {
      margin-top: 1rem;
    }

    .email-counter-number {
      font-size: 3rem;
      line-height: 1;
    }

    .priority-urgent {
      background-color: var(--orange-web) !important;
      color: white !important;
      font-weight: 700;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .animate-spin {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .navbar {
      background-color: var(--oxford-blue);
    }

    .bg-background {
      background-color: var(--color-background);
    }

    .bg-orange-web-20 {
      background-color: var(--orange-web-20);
    }

    .border-orange-web {
      border-color: var(--orange-web);
    }

    .text-oxford-blue {
      color: var(--oxford-blue);
    }

    .text-orange-web {
      color: var(--orange-web);
    }

    .official-badge {
      background-color: var(--oxford-blue);
      color: var(--white);
    }

    .container {
      max-width: 1200px;
    }

    button[mat-raised-button] {
      text-transform: none;
      font-weight: 600;
    }

    .btn-secondary {
      background-color: var(--oxford-blue);
      color: var(--white);
    }

    .btn-secondary:hover {
      background-color: var(--oxford-blue-90);
    }

    @media (max-width: 1024px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class IssueDetailComponent implements OnInit {
    private _route = inject(ActivatedRoute);
    private _router = inject(Router);
    private _mockDataService = inject(MockDataService);
    private _dialog = inject(MatDialog);

    issue: Issue | null = null;
    isLoading = false;

    ngOnInit(): void {
        const issueId = this._route.snapshot.paramMap.get('id');
        if (issueId) {
            this.loadIssue(issueId);
        } else {
            this.goBack();
        }
    }

    private loadIssue(id: string): void {
        this.isLoading = true;
        this._mockDataService.getIssueById(id).subscribe({
            next: (issue) => {
                this.issue = issue || null;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading issue:', error);
                this.isLoading = false;
            }
        });
    }

    openEmailModal(authority: Authority): void {
        if (!this.issue) return;

        const dialogRef = this._dialog.open(EmailModalComponent, {
            width: '600px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            disableClose: false,
            data: { issue: this.issue, authority }
        });

        // Pass data to modal
        const modalInstance = dialogRef.componentInstance;
        modalInstance.issue = this.issue;
        modalInstance.authority = authority;
        modalInstance.ngOnInit();

        // Listen for form changes to regenerate email template
        modalInstance.emailForm.valueChanges.subscribe(() => {
            modalInstance.onFormChange();
        });

        // Refresh issue data after modal closes to update email count
        dialogRef.afterClosed().subscribe(() => {
            if (this.issue) {
                this.loadIssue(this.issue.id);
            }
        });
    }

    openPhotoGallery(index: number): void {
        // For now, just show a larger version of the image
        // In a real app, this would open a proper photo gallery modal
        console.log('Opening photo gallery at index:', index);
    }

    getPhotoUrl(photoPath: string): string {
        // Return placeholder for development
        return 'https://via.placeholder.com/400x300/E5E5E5/14213D?text=' +
            encodeURIComponent('Foto Problemă');
    }

    onImageError(event: any, index?: number): void {
        event.target.src = 'https://via.placeholder.com/400x300/E5E5E5/14213D?text=Foto+' + (index ? index + 1 : 'Problemă');
    }

    getUrgencyLevel(issue: Issue): 'urgent' | 'normal' {
        return issue.emailsSent > 100 ? 'urgent' : 'normal';
    }

    getDaysSince(date: Date): string {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return days.toString();
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'open': return 'DESCHISĂ';
            case 'in-progress': return 'ÎN PROGRES';
            case 'resolved': return 'REZOLVATĂ';
            default: return 'NECUNOSCUTĂ';
        }
    }

    goBack(): void {
        this._router.navigate(['/issues']);
    }
} 