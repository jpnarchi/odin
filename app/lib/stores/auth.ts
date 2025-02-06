import { atom } from 'nanostores';
import { supabase } from '../supabase/client';
import type { User } from '@supabase/supabase-js';

export const authStore = {
  user: atom<User | null>(null),
  loading: atom(true),
  initialized: atom(false),

  async initialize() {
    if (typeof window === 'undefined' || this.initialized.get()) return;
    
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      this.user.set(session?.user ?? null);

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user ?? null;
        this.user.set(user);

        if (user && event === 'SIGNED_IN') {
          try {
            const { error } = await supabase
              .from('user_preferences')
              .upsert({ 
                user_id: user.id,
                email_opt_in: false 
              }, { 
                onConflict: 'user_id' 
              });

            if (error) throw error;
          } catch (error) {
            console.error('Error creating user preferences:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      this.loading.set(false);
      this.initialized.set(true);
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      this.user.set(null);
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
};