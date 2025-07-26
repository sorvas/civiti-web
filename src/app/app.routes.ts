import { Routes } from '@angular/router';

// Import components (will be created)
import { LocationSelectionComponent } from './components/location-selection/location-selection.component';
import { IssuesListComponent } from './components/issues-list/issues-list.component';
import { IssueDetailComponent } from './components/issue-detail/issue-detail.component';

// Route structure based on ux.md user journey
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/location',
    pathMatch: 'full'
  },
  {
    path: 'location',
    component: LocationSelectionComponent,
    data: { animation: 'LocationPage' }
  },
  {
    path: 'issues',
    component: IssuesListComponent,
    data: { animation: 'IssuesPage' }
  },
  {
    path: 'issue/:id',
    component: IssueDetailComponent,
    data: { animation: 'DetailPage' }
  },
  // Fallback route
  {
    path: '**',
    redirectTo: '/location'
  }
];
