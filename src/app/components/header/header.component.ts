import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-blue-700 p-4 shadow-lg">
      <div class="container mx-auto flex justify-between items-center">
        <a routerLink="/dashboard" class="text-white text-2xl font-bold">Recruiter Portal</a>
        <div class="flex space-x-6">
          <a routerLink="/dashboard" class="text-white hover:text-blue-200 transition-colors duration-200">Dashboard</a>
          <a routerLink="/my-jobs" class="text-white hover:text-blue-200 transition-colors duration-200">My Jobs</a>
          <a routerLink="/post-job" class="text-white hover:text-blue-200 transition-colors duration-200">Post Job</a>
          <button (click)="onLogout()" class="text-white hover:text-blue-200 transition-colors duration-200 focus:outline-none">Logout</button>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class HeaderComponent {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {}

  async onLogout() {
    try {
      const { error } = await this.supabaseService.client.auth.signOut();
      if (error) {
        this.toastService.error('Logout failed: ' + error.message);
      } else {
        this.toastService.success('Logged out successfully.');
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      this.toastService.error('An unexpected error occurred during logout: ' + error.message);
    }
  }
} 