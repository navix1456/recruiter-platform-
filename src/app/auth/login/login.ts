import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Login to Recruiter Portal</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
          <div class="mb-4">
            <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
            />
            <div *ngIf="loginForm.controls['email'].invalid && loginForm.controls['email'].touched" class="text-red-500 text-xs mt-1">
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
            <div *ngIf="loginForm.controls['password'].invalid && loginForm.controls['password'].touched" class="text-red-500 text-xs mt-1">
              Password is required.
            </div>
          </div>
          <div class="flex items-center justify-between">
            <button
              type="submit"
              [disabled]="loginForm.invalid"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Login
            </button>
            <a routerLink="/register" class="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">
              Don't have an account? Register
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: ``
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      if (email && password) {
        try {
          const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            this.toastService.error(error.message);
          } else if (data.user) {
            this.toastService.success('Logged in successfully!');
            this.router.navigate(['/dashboard']); // We'll create this route later
          }
        } catch (error: any) {
          this.toastService.error(error.message);
        }
      }
    }
  }
}
