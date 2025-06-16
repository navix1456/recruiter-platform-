import { Component } from '@angular/core';
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
export class App {
  protected title = 'recruiter-portal';
  showHeader = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Don't show header on login, register, and apply pages
      this.showHeader = !['/login', '/register', '/apply'].some(path => 
        event.url.startsWith(path)
      );
    });
  }
}
