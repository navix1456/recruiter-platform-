import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Welcome to your Dashboard!</h2>
        <p class="text-gray-600 mb-6">You are logged in.</p>
        <div class="flex space-x-4 justify-center">
          <button
            (click)="onLogout()"
            class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Logout
          </button>
          <a
            routerLink="/post-job"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center justify-center"
          >
            Post New Job
          </a>
          <a
            routerLink="/my-jobs"
            class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center justify-center"
          >
            View My Jobs
          </a>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class DashboardComponent {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {}

  async onLogout() {
    try {
      const { error } = await this.supabaseService.client.auth.signOut();
      if (error) {
        this.toastService.error(error.message);
      } else {
        this.router.navigate(['/login']);
        this.toastService.success('Logged out successfully!');
      }
    } catch (error: any) {
      this.toastService.error(error.message);
    }
  }
}
