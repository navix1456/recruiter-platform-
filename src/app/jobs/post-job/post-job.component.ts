import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div class="max-w-xl w-full bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Post a New Job</h2>

        <form (ngSubmit)="postJob()" class="space-y-6">
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
            Post Job
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
export class PostJobComponent {
  job = {
    title: '',
    description: '',
    salary: '',
    location: '',
    job_type: 'full-time',
  };

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {}

  async postJob() {
    const session = await this.supabaseService.getSession();
    const user = session?.user;
    if (!user) {
      this.toastService.error('You must be logged in to post a job.');
      this.router.navigate(['/auth']);
      return;
    }

    try {
      const { error } = await this.supabaseService.client.from('jobs').insert({
        title: this.job.title,
        description: this.job.description,
        salary: this.job.salary,
        location: this.job.location,
        job_type: this.job.job_type,
        recruiter_id: user.id, // Associate job with the logged-in recruiter
      });

      if (error) {
        this.toastService.error('Error posting job: ' + error.message);
      } else {
        this.toastService.success('Job posted successfully!');
        this.router.navigate(['/my-jobs']); // Redirect to my jobs page
      }
    } catch (error: any) {
      this.toastService.error('An unexpected error occurred: ' + error.message);
    }
  }
} 