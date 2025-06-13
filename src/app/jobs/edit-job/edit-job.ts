import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
}

@Component({
  selector: 'app-edit-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Edit Job</h2>
        <div *ngIf="jobForm; else loadingMessage">
          <form [formGroup]="jobForm" (ngSubmit)="onUpdateJob()">
            <div class="mb-4">
              <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Job Title</label>
              <input
                type="text"
                id="title"
                formControlName="title"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <div *ngIf="jobForm.controls['title'].invalid && jobForm.controls['title'].touched" class="text-red-500 text-xs mt-1">
                Job Title is required.
              </div>
            </div>

            <div class="mb-4">
              <label for="description" class="block text-gray-700 text-sm font-bold mb-2">Job Description</label>
              <textarea
                id="description"
                formControlName="description"
                rows="5"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></textarea>
              <div *ngIf="jobForm.controls['description'].invalid && jobForm.controls['description'].touched" class="text-red-500 text-xs mt-1">
                Job Description is required.
              </div>
            </div>

            <div class="mb-4">
              <label for="location" class="block text-gray-700 text-sm font-bold mb-2">Location (Optional)</label>
              <input
                type="text"
                id="location"
                formControlName="location"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div class="mb-6">
              <label for="salary" class="block text-gray-700 text-sm font-bold mb-2">Salary (Optional)</label>
              <input
                type="text"
                id="salary"
                formControlName="salary"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div class="flex items-center justify-between">
              <button
                type="submit"
                [disabled]="jobForm.invalid"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Update Job
              </button>
              <a routerLink="/my-jobs" class="inline-block align-baseline font-bold text-sm text-gray-600 hover:text-gray-800">
                Cancel
              </a>
            </div>
          </form>
        </div>
        <ng-template #loadingMessage>
          <p class="text-center text-gray-600">Loading job details...</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: ``
})
export class EditJobComponent implements OnInit {
  jobForm!: FormGroup;
  jobId: string | null = null;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {}

  async ngOnInit() {
    this.jobId = this.route.snapshot.paramMap.get('id');
    if (this.jobId) {
      await this.fetchJob(this.jobId);
    } else {
      this.toastService.error('No job ID provided.');
      this.router.navigate(['/my-jobs']);
    }
  }

  async fetchJob(id: string) {
    try {
      const { data, error } = await this.supabaseService.client
        .from('jobs')
        .select('id, title, description, location, salary')
        .eq('id', id)
        .single();

      if (error) {
        this.toastService.error('Error fetching job: ' + error.message);
        this.router.navigate(['/my-jobs']);
      } else if (data) {
        this.jobForm = this.fb.group({
          title: [data.title, Validators.required],
          description: [data.description, Validators.required],
          location: [data.location],
          salary: [data.salary],
        });
      } else {
        this.toastService.error('Job not found.');
        this.router.navigate(['/my-jobs']);
      }
    } catch (error: any) {
      this.toastService.error('An unexpected error occurred: ' + error.message);
      this.router.navigate(['/my-jobs']);
    }
  }

  async onUpdateJob() {
    if (this.jobForm.valid && this.jobId) {
      const { title, description, location, salary } = this.jobForm.value;
      try {
        const { error } = await this.supabaseService.client
          .from('jobs')
          .update({ title, description, location, salary })
          .eq('id', this.jobId);

        if (error) {
          this.toastService.error('Error updating job: ' + error.message);
        } else {
          this.toastService.success('Job updated successfully!');
          this.router.navigate(['/my-jobs']);
        }
      } catch (error: any) {
        this.toastService.error('An unexpected error occurred: ' + error.message);
      }
    }
  }
}
