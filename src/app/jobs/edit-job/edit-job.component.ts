import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

interface Job {
  id: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  job_type: string;
  created_at: string;
  recruiter_id: string; // The recruiter who posted the job
}

@Component({
  selector: 'app-edit-job',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div class="max-w-xl w-full bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Edit Job Listing</h2>

        <div *ngIf="!job && loading" class="text-center text-gray-600 mb-4">
          <p>Loading job details...</p>
        </div>
        <div *ngIf="!job && !loading" class="text-center text-red-600 mb-4">
          <p>Job not found or access denied.</p>
        </div>

        <form *ngIf="job" (ngSubmit)="updateJob()" class="space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              [(ngModel)]="job.title"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              id="description"
              name="description"
              [(ngModel)]="job.description"
              rows="5"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>

          <div>
            <label for="salary" class="block text-sm font-medium text-gray-700">Salary (e.g., $80,000 - $120,000)</label>
            <input
              type="text"
              id="salary"
              name="salary"
              [(ngModel)]="job.salary"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              [(ngModel)]="job.location"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="job_type" class="block text-sm font-medium text-gray-700">Job Type</label>
            <select
              id="job_type"
              name="job_type"
              [(ngModel)]="job.job_type"
              required
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Job
          </button>
        </form>

        <div class="mt-6 text-center">
          <a routerLink="/my-jobs" class="text-blue-600 hover:text-blue-800 font-medium">
            Back to My Job Listings
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class EditJobComponent implements OnInit {
  jobId: string | null = null;
  job: Job | null = null;
  loading: boolean = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly supabaseService: SupabaseService,
    private readonly toastService: ToastService
  ) {}

  async ngOnInit() {
    this.jobId = this.route.snapshot.paramMap.get('id');
    if (this.jobId) {
      await this.fetchJobDetails(this.jobId);
    } else {
      this.toastService.error('No job ID provided for editing.');
      this.router.navigate(['/my-jobs']);
    }
  }

  async fetchJobDetails(jobId: string) {
    this.loading = true;
    try {
      const user = await this.supabaseService.getSession();
      if (!user?.user) {
        this.toastService.error('You must be logged in to edit a job.');
        this.router.navigate(['/auth']);
        return;
      }

      const { data, error } = await this.supabaseService.client
        .from('jobs')
        .select('id, title, description, salary, location, job_type, created_at, recruiter_id')
        .eq('id', jobId)
        .eq('recruiter_id', user.user.id)
        .single();

      if (error) {
        console.error('Error fetching job details:', error);
        this.toastService.error('Error fetching job details: ' + error.message);
        this.job = null;
      } else if (data) {
        this.job = data as Job;
      } else {
        this.job = null; // Job not found or not authorized
        this.toastService.error('Job not found or you are not authorized to edit this job.');
      }
    } catch (error: any) {
      console.error('Unexpected error fetching job details:', error);
      this.toastService.error('An unexpected error occurred: ' + error.message);
      this.job = null;
    } finally {
      this.loading = false;
    }
  }

  async updateJob() {
    if (!this.job || !this.jobId) {
      this.toastService.error('No job data to update.');
      return;
    }

    try {
      const { error } = await this.supabaseService.client
        .from('jobs')
        .update({
          title: this.job.title,
          description: this.job.description,
          salary: this.job.salary,
          location: this.job.location,
          job_type: this.job.job_type,
        })
        .eq('id', this.jobId);

      if (error) {
        this.toastService.error('Error updating job: ' + error.message);
      } else {
        this.toastService.success('Job updated successfully!');
        this.router.navigate(['/my-jobs']);
      }
    } catch (error: any) {
      this.toastService.error('An unexpected error occurred while updating job: ' + error.message);
    }
  }
} 