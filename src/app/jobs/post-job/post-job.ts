import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Post New Job</h2>
        <form [formGroup]="jobForm" (ngSubmit)="onPostJob()">
          <div class="mb-4">
            <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Job Title</label>
            <input
              type="text"
              id="title"
              formControlName="title"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., Software Engineer"
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
              placeholder="Detailed job description..."
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
              placeholder="e.g., Remote, New York, NY"
            />
          </div>

          <div class="mb-6">
            <label for="salary" class="block text-gray-700 text-sm font-bold mb-2">Salary (Optional)</label>
            <input
              type="text"
              id="salary"
              formControlName="salary"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., $80,000 - $100,000/year"
            />
          </div>

          <div class="flex items-center justify-between">
            <button
              type="submit"
              [disabled]="jobForm.invalid"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Post Job
            </button>
            <a routerLink="/dashboard" class="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: ``
})
export class PostJobComponent {
  jobForm: FormGroup;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: [''],
      salary: [''],
    });
  }

  async onPostJob() {
    if (this.jobForm.valid) {
      const { title, description, location, salary } = this.jobForm.value;

      try {
        const user = await this.supabaseService.client.auth.getUser();
        if (user.data.user) {
          const recruiter_id = user.data.user.id;
          const { data, error } = await this.supabaseService.client.from('jobs').insert([
            { title, description, location, salary, recruiter_id }
          ]);

          if (error) {
            this.toastService.error('Error posting job: ' + error.message);
          } else {
            this.toastService.success('Job posted successfully!');
            this.router.navigate(['/dashboard']); // Redirect to dashboard after posting
          }
        } else {
          this.toastService.error('User not authenticated.');
          this.router.navigate(['/login']);
        }
      } catch (error: any) {
        this.toastService.error('An unexpected error occurred: ' + error.message);
      }
    }
  }
}
