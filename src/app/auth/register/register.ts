import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Register for Recruiter Portal</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
          <div class="mb-4">
            <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
            />
            <div *ngIf="registerForm.controls['email'].invalid && registerForm.controls['email'].touched" class="text-red-500 text-xs mt-1">
              Email is required and must be a valid email address.
            </div>
          </div>
          <div class="mb-6">
            <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
            />
            <div *ngIf="registerForm.controls['password'].invalid && registerForm.controls['password'].touched" class="text-red-500 text-xs mt-1">
              Password is required (minimum 6 characters).
            </div>
          </div>
          <div class="flex items-center justify-between">
            <button
              type="submit"
              [disabled]="registerForm.invalid"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Register
            </button>
            <a routerLink="/login" class="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">
              Already have an account? Login
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: ``
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      if (email && password) {
        try {
          const { data, error } = await this.supabaseService.client.auth.signUp({
            email,
            password,
          });
          if (error) {
            if (error.message === 'Email confirmation required') {
              this.toastService.success('Registration successful! Please check your email for a confirmation link.');
              this.router.navigate(['/login']);
            } else {
              this.toastService.error(error.message);
            }
          } else if (data.user) {
            this.toastService.success('Registration successful! Please check your email to confirm your account.');
            this.router.navigate(['/login']);
          }
        } catch (error: any) {
          this.toastService.error(error.message);
        }
      }
    }
  }
}
