import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service'; // Import ToastService

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  created_at: string;
}

@Component({
  selector: 'app-job-listings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Your Job Listings</h2>

        <div *ngIf="jobs.length === 0" class="text-center text-gray-600">
          <p class="mb-4">You haven't posted any jobs yet.</p>
          <a routerLink="/post-job"
             class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Post Your First Job
          </a>
        </div>

        <div *ngIf="jobs.length > 0">
          <div *ngFor="let job of jobs" class="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
            <a [routerLink]="['/jobs', job.id]" class="block">
              <h3 class="text-xl font-semibold text-blue-700 hover:underline">{{ job.title }}</h3>
            </a>
            <p class="text-gray-700 mt-2">{{ job.description }}</p>
            <p *ngIf="job.location" class="text-gray-500 text-sm mt-1"><i class="fas fa-map-marker-alt"></i> {{ job.location }}</p>
            <p *ngIf="job.salary" class="text-gray-500 text-sm mt-1"><i class="fas fa-dollar-sign"></i> {{ job.salary }}</p>
            <p class="text-gray-500 text-sm mt-1">Posted: {{ job.created_at | date:'mediumDate' }}</p>
            <div class="mt-4 flex space-x-2">
              <a [routerLink]="['/applicants', job.id]" class="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded focus:outline-none focus:shadow-outline inline-flex items-center justify-center">View Applicants</a>
              <a [routerLink]="['/edit-job', job.id]" class="bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-1 px-3 rounded focus:outline-none focus:shadow-outline inline-flex items-center justify-center">Edit</a>
              <button (click)="onDeleteJob(job.id)" class="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded focus:outline-none focus:shadow-outline">Delete</button>
            </div>
          </div>
        </div>

        <div class="mt-8 text-center">
          <a routerLink="/dashboard" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center justify-center">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class JobListingsComponent implements OnInit {
  jobs: Job[] = [];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
    private readonly toastService: ToastService // Inject ToastService
  ) {}

  async ngOnInit() {
    await this.fetchJobs();
  }

  async fetchJobs() {
    try {
      const user = await this.supabaseService.client.auth.getUser();
      if (user.data.user) {
        const recruiter_id = user.data.user.id;
        const { data, error } = await this.supabaseService.client
          .from('jobs')
          .select('id, title, description, location, salary, created_at')
          .eq('recruiter_id', recruiter_id)
          .order('created_at', { ascending: false });

        if (error) {
          this.toastService.error('Error fetching jobs: ' + error.message); // Replace alert
        } else {
          this.jobs = data as Job[];
        }
      } else {
        this.toastService.error('User not authenticated. Please log in.'); // Replace alert
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      this.toastService.error('An unexpected error occurred while fetching jobs: ' + error.message); // Replace alert
    }
  }

  async onDeleteJob(jobId: string) {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        const { error } = await this.supabaseService.client
          .from('jobs')
          .delete()
          .eq('id', jobId);

        if (error) {
          this.toastService.error('Error deleting job: ' + error.message); // Replace alert
        } else {
          this.toastService.success('Job deleted successfully!'); // Replace alert
          await this.fetchJobs(); // Re-fetch jobs after deletion
        }
      } catch (error: any) {
        this.toastService.error('An unexpected error occurred: ' + error.message); // Replace alert
      }
    }
  }
}
