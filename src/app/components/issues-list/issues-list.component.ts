import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MockDataService, Issue } from '../../services/mock-data.service';

@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatToolbarModule,
  ],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <mat-toolbar class="navbar shadow-md">
        <button mat-icon-button (click)="goBack()" class="text-white">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="text-white font-semibold flex-1 text-center">
          Probleme Active în Sector 5, București
        </span>
        <mat-icon class="text-orange-web">location_on</mat-icon>
      </mat-toolbar>

      <div class="container mx-auto p-4 max-w-6xl">
        <!-- Filter/Sort Section -->
        <div class="bg-white rounded-lg shadow-sm border border-platinum p-4 mb-6">
          <div class="flex flex-col md:flex-row gap-4 items-center">
            <div class="flex-1">
              <h2 class="text-oxford-blue font-semibold text-lg mb-2">
                {{ totalIssues }} probleme documentate
              </h2>
              <p class="text-oxford-blue opacity-75 text-sm">
                Alege o problemă și ajută la rezolvarea ei prin trimiterea unui email către autorități
              </p>
            </div>
            
            <div class="flex gap-3">
              <mat-form-field appearance="outline" class="w-40">
                <mat-label>Sortare</mat-label>
                <mat-select [(value)]="sortBy" (selectionChange)="onSortChange()">
                  <mat-option value="date">Cele mai noi</mat-option>
                  <mat-option value="emails">Email-uri trimise</mat-option>
                  <mat-option value="urgency">Urgență</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center py-12">
          <mat-icon class="text-oxford-blue text-4xl mb-4 animate-spin">refresh</mat-icon>
          <p class="text-oxford-blue">Se încarcă problemele...</p>
        </div>

        <!-- Issues Grid -->
        <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <mat-card 
            *ngFor="let issue of sortedIssues" 
            class="issue-card cursor-pointer hover:shadow-lg transition-all duration-300"
            (click)="viewIssueDetails(issue.id)"
          >
            <!-- Issue Image -->
            <div class="relative h-48 bg-platinum overflow-hidden">
              <img 
                [src]="getIssueImage(issue)" 
                [alt]="issue.title"
                class="w-full h-full object-cover"
                (error)="onImageError($event)"
              >
              <!-- Status Badge -->
              <div class="absolute top-3 left-3">
                <mat-chip class="official-badge text-xs">
                  {{ getStatusText(issue.status) }}
                </mat-chip>
              </div>
              <!-- Urgency Badge -->
              <div class="absolute top-3 right-3" *ngIf="getUrgencyLevel(issue) === 'urgent'">
                <mat-chip class="priority-urgent text-xs font-bold">
                  URGENT
                </mat-chip>
              </div>
            </div>

            <mat-card-content class="p-4">
              <!-- Title -->
              <h3 class="text-oxford-blue font-semibold text-lg mb-2 line-clamp-2">
                {{ issue.title }}
              </h3>
              
              <!-- Description -->
              <p class="text-oxford-blue opacity-75 text-sm mb-3 line-clamp-3">
                {{ issue.description }}
              </p>

              <!-- Location -->
              <div class="flex items-center text-oxford-blue opacity-60 text-xs mb-4">
                <mat-icon class="text-base mr-1">place</mat-icon>
                <span class="truncate">{{ issue.location.address }}</span>
              </div>

              <!-- Stats Row -->
              <div class="flex items-center justify-between border-t border-platinum pt-3">
                <!-- Email Counter - PROMINENT as required -->
                <div class="email-counter flex items-center">
                  <mat-icon class="text-orange-web mr-2">email</mat-icon>
                  <div>
                    <div class="email-counter-number text-orange-web font-bold text-xl">
                      {{ issue.emailsSent }}
                    </div>
                    <div class="text-xs text-oxford-blue opacity-60">
                      email-uri trimise
                    </div>
                  </div>
                </div>

                <!-- Days Since -->
                <div class="text-right">
                  <div class="text-sm font-semibold text-oxford-blue">
                    {{ getDaysSince(issue.dateCreated) }}
                  </div>
                  <div class="text-xs text-oxford-blue opacity-60">
                    zile în urmă
                  </div>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions class="p-4 pt-0">
              <button 
                mat-raised-button 
                color="accent" 
                class="w-full btn-primary"
                (click)="viewIssueDetails(issue.id); $event.stopPropagation()"
              >
                <mat-icon class="mr-2">visibility</mat-icon>
                Vezi Detalii
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && sortedIssues.length === 0" class="text-center py-12">
          <mat-icon class="text-oxford-blue text-6xl mb-4 opacity-50">search_off</mat-icon>
          <h3 class="text-oxford-blue text-xl font-semibold mb-2">Nu au fost găsite probleme</h3>
          <p class="text-oxford-blue opacity-75 mb-6">
            Încearcă să schimbi criteriile de sortare sau revino mai târziu.
          </p>
        </div>

        <!-- Future Feature: Create Issue Button -->
        <div class="fixed bottom-6 right-6">
          <button 
            mat-fab 
            color="accent" 
            class="shadow-lg"
            disabled
            matTooltip="Funcționalitate disponibilă în curând"
          >
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .issue-card {
      border: 1px solid var(--platinum);
      transition: all 0.3s ease;
    }

    .issue-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(20, 33, 61, 0.15);
    }

    .line-clamp-2 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .line-clamp-3 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    .email-counter-number {
      font-size: 1.5rem;
      line-height: 1.2;
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

    .text-oxford-blue {
      color: var(--oxford-blue);
    }

    .text-orange-web {
      color: var(--orange-web);
    }

    .border-platinum {
      border-color: var(--platinum);
    }

    .official-badge {
      background-color: var(--oxford-blue);
      color: var(--white);
    }

    mat-form-field {
      font-size: 14px;
    }

    .container {
      max-width: 1200px;
    }

    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .container {
        padding: 1rem;
      }
    }
  `]
})
export class IssuesListComponent implements OnInit {
  private _router = inject(Router);
  private _mockDataService = inject(MockDataService);

  issues: Issue[] = [];
  sortedIssues: Issue[] = [];
  isLoading = false;
  sortBy = 'date';
  totalIssues = 0;

  ngOnInit(): void {
    this.loadIssues();
  }

  private loadIssues(): void {
    this.isLoading = true;
    this._mockDataService.getIssues().subscribe({
      next: (issues) => {
        this.issues = issues;
        this.totalIssues = issues.length;
        this.applySorting();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading issues:', error);
        this.isLoading = false;
      }
    });
  }

  onSortChange(): void {
    this.applySorting();
  }

  private applySorting(): void {
    switch (this.sortBy) {
      case 'emails':
        this.sortedIssues = [...this.issues].sort((a, b) => b.emailsSent - a.emailsSent);
        break;
      case 'urgency':
        this.sortedIssues = [...this.issues].sort((a, b) => {
          const urgencyA = this.getUrgencyScore(a);
          const urgencyB = this.getUrgencyScore(b);
          return urgencyB - urgencyA;
        });
        break;
      default: // 'date'
        this.sortedIssues = [...this.issues].sort((a, b) => 
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        );
    }
  }

  private getUrgencyScore(issue: Issue): number {
    // Calculate urgency based on email count and days since creation
    const daysSince = this.getDaysSinceNumber(issue.dateCreated);
    const emailRatio = issue.emailsSent / 100; // Normalize email count
    return emailRatio + (daysSince / 10); // Older issues get higher urgency
  }

  getUrgencyLevel(issue: Issue): 'urgent' | 'normal' {
    return issue.emailsSent > 100 ? 'urgent' : 'normal';
  }

  getDaysSince(date: Date): string {
    const days = this.getDaysSinceNumber(date);
    return days.toString();
  }

  private getDaysSinceNumber(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'open': return 'DESCHISĂ';
      case 'in-progress': return 'ÎN PROGRES';
      case 'resolved': return 'REZOLVATĂ';
      default: return 'NECUNOSCUTĂ';
    }
  }

  getIssueImage(issue: Issue): string {
    // Return placeholder for development
    return 'https://via.placeholder.com/400x300/E5E5E5/14213D?text=' + 
           encodeURIComponent(issue.title.substring(0, 20) + '...');
  }

  onImageError(event: any): void {
    // Fallback to a default placeholder
    event.target.src = 'https://via.placeholder.com/400x300/E5E5E5/14213D?text=Problema+Civica';
  }

  viewIssueDetails(issueId: string): void {
    this._router.navigate(['/issue', issueId]);
  }

  goBack(): void {
    this._router.navigate(['/location']);
  }
} 