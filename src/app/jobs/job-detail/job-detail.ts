import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  created_at: string;
}

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div *ngIf="job; else loadingOrNotFound">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">{{ job.title }}</h2>
          <p class="text-gray-700 mb-4 whitespace-pre-wrap">{{ job.description }}</p>
          <p *ngIf="job.location" class="text-gray-600 text-md mb-2">
            <i class="fas fa-map-marker-alt"></i> Location: {{ job.location }}
          </p>
          <p *ngIf="job.salary" class="text-gray-600 text-md mb-2">
            <i class="fas fa-dollar-sign"></i> Salary: {{ job.salary }}
          </p>
          <p class="text-gray-500 text-sm mb-6">Posted: {{ job.created_at | date:'mediumDate' }}</p>

          <div class="flex space-x-4 mb-6">
            <a
              [routerLink]="['/applicants', job.id]"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center justify-center"
            >
              View Applicants
            </a>
            <a
              [routerLink]="['/edit-job', job.id]"
              class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center justify-center"
            >
              Edit Job
            </a>
            <button
              (click)="onDeleteJob()"
              class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Delete Job
            </button>
            <a
              [routerLink]="['/apply', job.id]"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center justify-center"
            >
              Apply Now
            </a>
            <button
              (click)="shareJob(job.id)"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center justify-center"
            >
              Share Job
            </button>
            <a routerLink="/my-jobs" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center justify-center">
              Back to Listings
            </a>
          </div>
        </div>

        <ng-template #loadingOrNotFound>
          <div class="text-center text-gray-600">
            <p *ngIf="!job && !loading">Job not found or an error occurred.</p>
            <p *ngIf="loading">Loading job details...</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: ``
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  loading = true;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const jobId = params.get('id');
      if (jobId) {
        await this.fetchJob(jobId);
      } else {
        this.loading = false;
        this.toastService.error('No job ID provided.');
      }
    });
  }

  async fetchJob(id: string) {
    this.loading = true;
    try {
      const { data, error } = await this.supabaseService.client
        .from('jobs')
        .select('id, title, description, location, salary, created_at')
        .eq('id', id)
        .single();

      if (error) {
        this.toastService.error('Error fetching job details: ' + error.message);
        this.router.navigate(['/my-jobs']);
      } else if (data) {
        this.job = data as Job;
      } else {
        this.job = null;
        this.toastService.error('Job not found.');
      }
    } catch (error: any) {
      this.toastService.error('An unexpected error occurred: ' + error.message);
      this.router.navigate(['/my-jobs']);
    } finally {
      this.loading = false;
    }
  }

  async onDeleteJob() {
    if (this.job && confirm('Are you sure you want to delete this job?')) {
      try {
        const { error } = await this.supabaseService.client
          .from('jobs')
          .delete()
          .eq('id', this.job.id);

        if (error) {
          this.toastService.error('Error deleting job: ' + error.message);
        } else {
          this.toastService.success('Job deleted successfully!');
          this.router.navigate(['/my-jobs']);
        }
      } catch (error: any) {
        this.toastService.error('An unexpected error occurred: ' + error.message);
      }
    }
  }

  shareJob(jobId: string) {
    const jobUrl = `${window.location.origin}/jobs/${jobId}`; // Assuming the public job detail route is /jobs/:id
    navigator.clipboard.writeText(jobUrl).then(() => {
      this.toastService.success('Job link copied to clipboard!');
    }).catch(err => {
      this.toastService.error('Failed to copy link: ' + err);
      console.error('Could not copy text: ', err);
    });
  }
}
