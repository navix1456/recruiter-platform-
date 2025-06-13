import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment'; // Assuming you'll have an environment.ts file
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _session = new BehaviorSubject<Session | null>(null);
  readonly authChanges: Observable<Session | null> = this._session.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Listen for auth changes and update the session subject
    this.supabase.auth.onAuthStateChange((event, session) => {
      this._session.next(session);
    });

    // Immediately get the session on service initialization
    this.getSession().then(session => {
      this._session.next(session);
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return data.session;
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }
} 