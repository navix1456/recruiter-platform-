import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  currentToast: Toast | null = null;
  private toastSubscription: Subscription | null = null;
  private timeoutId: any;

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.toastSubscription = this.toastService.getToastObservable().subscribe(toast => {
      this.showToast(toast);
    });
  }

  ngOnDestroy(): void {
    if (this.toastSubscription) {
      this.toastSubscription.unsubscribe();
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  showToast(toast: Toast): void {
    // Clear any existing timeout to prevent overlapping toasts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.currentToast = toast;

    this.timeoutId = setTimeout(() => {
      this.currentToast = null;
    }, toast.duration || 3000);
  }

  getToastClasses(): string {
    if (!this.currentToast) {
      return '';
    }

    let classes = 'p-4 rounded-md shadow-lg text-white flex items-center justify-between';
    switch (this.currentToast.type) {
      case 'success':
        classes += ' bg-green-500';
        break;
      case 'error':
        classes += ' bg-red-500';
        break;
      case 'info':
        classes += ' bg-blue-500';
        break;
    }
    return classes;
  }

  closeToast(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.currentToast = null;
  }
} 