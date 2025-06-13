import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number; // Optional duration in milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();

  constructor() { }

  show(message: string, type: 'success' | 'error' | 'info', duration: number = 3000) {
    this.toastSubject.next({ message, type, duration });
  }

  getToastObservable(): Observable<Toast> {
    return this.toastSubject.asObservable();
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }
} 