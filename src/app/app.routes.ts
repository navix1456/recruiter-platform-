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
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'post-job', component: PostJobComponent, canActivate: [authGuard] },
  { path: 'my-jobs', component: JobListingsComponent, canActivate: [authGuard] },
  { path: 'jobs/:id', component: JobDetailComponent, canActivate: [authGuard] },
  { path: 'edit-job/:id', component: EditJobComponent, canActivate: [authGuard] },
  { path: 'apply/:jobId', component: ApplyComponent },
  { path: 'applicants/:jobId', component: ViewApplicantsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } // Redirect unknown paths to login
];
