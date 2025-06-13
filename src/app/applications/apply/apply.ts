import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Apply for Job</h2>
        <p *ngIf="jobTitle" class="text-center text-gray-600 mb-6">Applying for: <span class="font-semibold">{{ jobTitle }}</span></p>

        <form [formGroup]="applyForm" (ngSubmit)="onApply()">
          <div class="mb-4">
            <label for="candidateName" class="block text-gray-700 text-sm font-bold mb-2">Your Name</label>
            <input
              type="text"
              id="candidateName"
              formControlName="candidateName"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your full name"
            />
            <div *ngIf="applyForm.controls['candidateName'].invalid && applyForm.controls['candidateName'].touched" class="text-red-500 text-xs mt-1">
              Your Name is required.
            </div>
          </div>

          <div class="mb-4">
            <label for="candidateEmail" class="block text-gray-700 text-sm font-bold mb-2">Your Email</label>
            <input
              type="email"
              id="candidateEmail"
              formControlName="candidateEmail"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email address"
            />
            <div *ngIf="applyForm.controls['candidateEmail'].invalid && applyForm.controls['candidateEmail'].touched" class="text-red-500 text-xs mt-1">
              Valid Email is required.
            </div>
          </div>

          <div class="mb-6">
            <label for="resume" class="block text-gray-700 text-sm font-bold mb-2">Upload Resume (PDF only)</label>
            <input
              type="file"
              id="resume"
              (change)="onFileSelected($event)"
              accept=".pdf"
              class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            <div *ngIf="!selectedFile && applyForm.controls['resume'].touched" class="text-red-500 text-xs mt-1">
              Resume upload is required.
            </div>
            <p *ngIf="selectedFile" class="text-gray-500 text-xs mt-1">Selected file: {{ selectedFile.name }}</p>
          </div>

          <div class="flex items-center justify-between">
            <button
              type="submit"
              [disabled]="applyForm.invalid || !selectedFile"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit Application
            </button>
            <a routerLink="/my-jobs" class="inline-block align-baseline font-bold text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: ``
})
export class ApplyComponent implements OnInit {
  applyForm!: FormGroup;
  jobId: string | null = null;
  jobTitle: string = '';
  selectedFile: File | null = null;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    this.applyForm = this.fb.group({
      candidateName: ['', Validators.required],
      candidateEmail: ['', [Validators.required, Validators.email]],
      resume: [null, Validators.required], // Placeholder for file input validity
    });
  }

  async ngOnInit() {
    this.jobId = this.route.snapshot.paramMap.get('jobId');
    if (this.jobId) {
      await this.fetchJobTitle(this.jobId);
    } else {
      this.toastService.error('No job ID provided for application.');
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
        this.toastService.error('Error fetching job details: ' + error.message);
        this.router.navigate(['/my-jobs']);
      } else if (data) {
        this.jobTitle = data.title;
      } else {
        this.toastService.error('Job not found.');
        this.router.navigate(['/my-jobs']);
      }
    } catch (error: any) {
      this.toastService.error('An unexpected error occurred while fetching job details: ' + error.message);
      this.router.navigate(['/my-jobs']);
    }
  }

  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.applyForm.patchValue({ resume: this.selectedFile }); // Update form control value
    } else {
      this.selectedFile = null;
      this.applyForm.patchValue({ resume: null });
    }
  }

  async onApply() {
    this.applyForm.controls['resume'].markAsTouched(); // Mark resume as touched for validation message
    if (!this.selectedFile) {
      return; // Prevent submission if no file selected
    }

    if (this.applyForm.valid && this.jobId && this.selectedFile) {
      const { candidateName, candidateEmail } = this.applyForm.value;

      try {
        // 1. Upload resume to Supabase Storage
        const filePath = `${this.jobId}/${this.selectedFile.name}`;
        const { data: uploadData, error: uploadError } = await this.supabaseService.client.storage
          .from('resumes')
          .upload(filePath, this.selectedFile, { upsert: false });

        if (uploadError) {
          if (uploadError.message.includes('The resource already exists')) {
            this.toastService.error('A resume with this name already exists for this job. Please rename your file or use a different one.');
          } else {
            this.toastService.error('Error uploading resume: ' + uploadError.message);
          }
          return;
        }

        const resumeUrl = uploadData.path; // This is the path within the bucket

        // 2. Insert application details into Supabase database
        const { data: applicationData, error: applicationError } = await this.supabaseService.client
          .from('applications')
          .insert([
            {
              job_id: this.jobId,
              candidate_name: candidateName,
              candidate_email: candidateEmail,
              resume_url: resumeUrl,
            },
          ]);

        if (applicationError) {
          // If application insertion fails, attempt to delete the uploaded resume
          try {
            await this.supabaseService.client.storage.from('resumes').remove([filePath]);
          } catch (deleteError) {
            console.error('Failed to clean up resume after application error:', deleteError);
          }
          this.toastService.error('Error submitting application: ' + applicationError.message);
        } else {
          this.toastService.success('Application submitted successfully!');
          this.router.navigate(['/my-jobs']); // Redirect to job listings or a success page
        }
      } catch (error: any) {
        this.toastService.error('An unexpected error occurred during application submission: ' + error.message);
      }
    }
  }
}
