import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-gray-800 text-white p-4 mt-8 w-full">
      <div class="container mx-auto text-center">
        <p>&copy; {{ currentYear }} Recruiter Portal. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {
  currentYear: number;

  constructor() {
    this.currentYear = new Date().getFullYear();
  }
} 