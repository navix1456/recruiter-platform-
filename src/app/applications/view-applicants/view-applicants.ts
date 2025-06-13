import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

interface Application {
  id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  resume_url: string;
  status: string;
  is_shortlisted: boolean;
  created_at: string;
}

@Component({
  selector: 'app-view-applicants',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Applicants for: {{ jobTitle || 'Job' }}</h2>

        <div *ngIf="applications.length === 0 && !loading" class="text-center text-gray-600">
          <p>No applications received for this job yet.</p>
        </div>

        <div *ngIf="loading" class="text-center text-gray-600">
          <p>Loading applicants...</p>
        </div>

        <div *ngIf="applications.length > 0 && !loading">
          <div *ngFor="let app of applications" class="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
            <h3 class="text-xl font-semibold text-blue-700">{{ app.candidate_name }}</h3>
            <p class="text-gray-700 mt-1">Email: {{ app.candidate_email }}</p>
            <p class="text-gray-500 text-sm mt-1">Applied: {{ app.created_at | date:'mediumDate' }}</p>
            
            <div class="mt-2 mb-4 flex items-center space-x-4">
              <label class="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  class="form-checkbox h-5 w-5 text-purple-600"
                  [checked]="app.is_shortlisted"
                  (change)="toggleShortlist(app.id, app.is_shortlisted)"
                >
                <span class="ml-2 text-gray-700 font-medium">Shortlisted</span>
              </label>

              <div class="flex items-center space-x-2">
                <label class="text-gray-700 text-sm font-medium">Status:</label>
                <select
                  [(ngModel)]="app.status"
                  (change)="updateApplicationStatus(app.id, app.status)"
                  class="mt-1 block w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <button
                (click)="downloadResume(app.resume_url)"
                class="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded focus:outline-none focus:shadow-outline"
              >
                Download Resume
              </button>
              <!-- Future: other actions -->
            </div>
          </div>
        </div>

        <div class="mt-8 text-center">
          <a routerLink="/my-jobs" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center justify-center">
            Back to Job Listings
          </a>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class ViewApplicantsComponent implements OnInit {
  applications: Application[] = [];
  jobId: string | null = null;
  jobTitle: string = '';
  loading = true;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {}

  async ngOnInit() {
    this.jobId = this.route.snapshot.paramMap.get('jobId');
    if (this.jobId) {
      await this.fetchJobTitle(this.jobId);
      await this.fetchApplications(this.jobId);
    } else {
      this.toastService.error('No job ID provided to view applicants.');
      this.router.navigate(['/my-jobs']);
    }
  }

  async fetchJobTitle(jobId: string) {
    try {
      const { data, error } = await this.supabaseService.client
        .from('jobs')
        .select('title')
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job title:', error);
        this.jobTitle = 'Unknown Job';
      } else if (data) {
        this.jobTitle = data.title;
      }
    } catch (error) {
      console.error('Unexpected error fetching job title:', error);
      this.jobTitle = 'Unknown Job';
    }
  }

  async fetchApplications(jobId: string) {
    this.loading = true;
    try {
      const { data, error } = await this.supabaseService.client
        .from('applications')
        .select('id, candidate_name, candidate_email, resume_url, status, is_shortlisted, created_at')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) {
        this.toastService.error('Error fetching applications: ' + error.message);
      } else {
        this.applications = data as Application[];
      }
    } catch (error: any) {
      this.toastService.error('An unexpected error occurred while fetching applications: ' + error.message);
    } finally {
      this.loading = false;
    }
  }

  async toggleShortlist(applicationId: string, currentStatus: boolean) {
    try {
      const { error } = await this.supabaseService.client
        .from('applications')
        .update({ is_shortlisted: !currentStatus })
        .eq('id', applicationId);

      if (error) {
        this.toastService.error('Error updating shortlist status: ' + error.message);
      } else {
        // Update the local application object immediately
        const index = this.applications.findIndex(app => app.id === applicationId);
        if (index !== -1) {
          this.applications[index].is_shortlisted = !currentStatus;
        }
        this.toastService.success('Shortlist status updated successfully!');
      }
    } catch (error: any) {
      this.toastService.error('An unexpected error occurred while toggling shortlist: ' + error.message);
    }
  }

  async updateApplicationStatus(applicationId: string, newStatus: string) {
    try {
      const { error } = await this.supabaseService.client
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) {
        this.toastService.error('Error updating application status: ' + error.message);
      } else {
        // Local update is already handled by ngModel
        this.toastService.success('Application status updated successfully!');
      }
    } catch (error: any) {
      this.toastService.error('An unexpected error occurred while updating status: ' + error.message);
    }
  }

  async downloadResume(resumePath: string) {
    try {
      const { data, error } = await this.supabaseService.client.storage
        .from('resumes')
        .createSignedUrl(resumePath, 3600);

      if (error) {
        this.toastService.error('Error generating download link: ' + error.message);
      } else if (data && data.signedUrl) {
        window.open(data.signedUrl, '_blank');
        this.toastService.success('Resume download link generated!');
      } else {
        this.toastService.error('Signed URL not returned.');
      }
    } catch (error: any) {
      this.toastService.error('An unexpected error occurred during resume download: ' + error.message);
    }
  }
}
