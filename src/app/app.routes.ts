import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { DashboardComponent } from './dashboard/dashboard/dashboard';
import { PostJobComponent } from './jobs/post-job/post-job';
import { JobListingsComponent } from './jobs/job-listings/job-listings';
import { JobDetailComponent } from './jobs/job-detail/job-detail';
import { EditJobComponent } from './jobs/edit-job/edit-job';
import { ApplyComponent } from './applications/apply/apply';
import { ViewApplicantsComponent } from './applications/view-applicants/view-applicants';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  // Redirect root path to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'apply/:jobId',
    component: ApplyComponent,
    data: { standalone: true }
  },
  // Authenticated routes
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'post-job', component: PostJobComponent },
      { path: 'my-jobs', component: JobListingsComponent },
      { path: 'jobs/:id', component: JobDetailComponent },
      { path: 'edit-job/:id', component: EditJobComponent },
      { path: 'applicants/:jobId', component: ViewApplicantsComponent },
    ]
  },
  // Wildcard route for any other unknown paths
  { path: '**', redirectTo: 'login' }
];
