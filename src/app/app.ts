import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, HeaderComponent, FooterComponent],
  template: `
    <app-header *ngIf="showHeader"></app-header>
    <router-outlet></router-outlet>
    <app-toast></app-toast>
    <app-footer *ngIf="showHeader"></app-footer>
  `,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'recruiter-portal';
  showHeader = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Set initial header visibility based on current route
    this.updateHeaderVisibility(this.router.url);

    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateHeaderVisibility(event.url);
    });
  }

  private updateHeaderVisibility(url: string) {
    // Don't show header on login, register, apply pages, or root path
    this.showHeader = !['/login', '/register', '/apply', '/'].some(path => 
      url.startsWith(path)
    );
  }
}
