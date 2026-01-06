import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// NG-ZORRO imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { AppState } from '../../../store/app.state';
import { ApiService } from '../../../services/api.service';
import { IssueDetailResponse } from '../../../types/civica-api.types';
import * as UserIssuesActions from '../../../store/user-issues/user-issues.actions';

@Component({
  selector: 'app-edit-issue',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzFormModule,
    NzInputModule,
    NzSpinModule,
    NzUploadModule,
    NzAlertModule
  ],
  templateUrl: './edit-issue.component.html',
  styleUrls: ['./edit-issue.component.scss']
})
export class EditIssueComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);
  private apiService = inject(ApiService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  issueId: string = '';
  issue: IssueDetailResponse | null = null;
  isLoading = true;
  isSaving = false;
  loadError: string | null = null;

  editForm: FormGroup;
  photoList: NzUploadFile[] = [];

  constructor() {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(2000)]]
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.issueId = params['id'];
      if (this.issueId) {
        this.loadIssue();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadIssue(): void {
    this.isLoading = true;
    this.loadError = null;

    this.apiService.getIssueById(this.issueId).subscribe({
      next: (issue) => {
        this.issue = issue;
        this.isLoading = false;

        // Check if issue can be edited (only Rejected status)
        if (issue.status.toLowerCase() !== 'rejected') {
          this.loadError = 'Doar problemele respinse pot fi editate.';
          return;
        }

        // Populate form
        this.editForm.patchValue({
          title: issue.title,
          description: issue.description
        });

        // Populate photos
        if (issue.photos && issue.photos.length > 0) {
          this.photoList = issue.photos.map((photo, index) => ({
            uid: photo.id || `${index}`,
            name: `photo-${index + 1}`,
            status: 'done',
            url: photo.url,
            thumbUrl: photo.url
          }));
        }
      },
      error: (error) => {
        console.error('[EditIssue] Failed to load issue:', error);
        this.isLoading = false;
        this.loadError = 'Nu am putut incarca problema. Incearca din nou.';
      }
    });
  }

  // Photo upload handling
  beforeUpload = (file: NzUploadFile): boolean => {
    // For now, we'll handle photo uploads similarly to the photo-upload component
    // This is a simplified version - in production you'd upload to storage
    const isImage = file.type?.startsWith('image/');
    if (!isImage) {
      this.message.error('Poti incarca doar imagini!');
      return false;
    }

    const isLt5M = (file.size || 0) / 1024 / 1024 < 5;
    if (!isLt5M) {
      this.message.error('Imaginea trebuie sa fie mai mica de 5MB!');
      return false;
    }

    // Add to list (in real implementation, upload to storage first)
    this.photoList = [...this.photoList, file];
    return false; // Prevent auto upload
  };

  handleRemovePhoto = (file: NzUploadFile): boolean => {
    this.photoList = this.photoList.filter(p => p.uid !== file.uid);
    return true;
  };

  onSubmit(): void {
    if (this.editForm.invalid) {
      Object.values(this.editForm.controls).forEach(control => {
        control.markAsTouched();
        control.updateValueAndValidity();
      });
      return;
    }

    this.modal.confirm({
      nzTitle: 'Retrimite problema',
      nzContent: 'Esti sigur ca vrei sa retrimiti aceasta problema pentru aprobare? Statusul va fi schimbat in "In verificare".',
      nzOkText: 'Da, retrimite',
      nzCancelText: 'Anuleaza',
      nzOnOk: () => this.saveChanges()
    });
  }

  private saveChanges(): void {
    this.isSaving = true;

    const photoUrls = this.photoList
      .filter(p => p.url)
      .map(p => p.url as string);

    const updateData = {
      title: this.editForm.value.title,
      description: this.editForm.value.description,
      photoUrls: photoUrls,
      resubmit: true
    };

    this.apiService.editUserIssue(this.issueId, updateData).subscribe({
      next: () => {
        this.isSaving = false;
        this.message.success('Problema a fost retrimisa pentru aprobare!');

        // Refresh user issues list
        this.store.dispatch(UserIssuesActions.refreshUserIssues());

        // Navigate back to my issues
        this.router.navigate(['/my-issues']);
      },
      error: (error) => {
        console.error('[EditIssue] Failed to save:', error);
        this.isSaving = false;
        this.message.error('Eroare la salvare. Incearca din nou.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/my-issues']);
  }
}
