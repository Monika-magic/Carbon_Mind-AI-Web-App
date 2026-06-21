import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut } from '../lib/supabase';
import { useAppStore } from '../store';
import type { Profile } from '../types';

export function useAuth() {
  const [user, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    let mounted = true;

    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) {
          setAuthUser(session?.user ?? null);
          if (session?.user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setProfile(profileData);
            setUser(profileData);
          }
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthUser(session.user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
        setUser(profileData);
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setProfile(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser]);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await signIn(email, password);
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const data = await signUp(email, password, name);
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setAuthUser(null);
      setProfile(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  };
}
