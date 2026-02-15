
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, handleSupabaseError } from '../utils/supabase';

interface AuthContextType {
  user: UserProfile | null;
  users: UserProfile[];
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  addUser: (userData: any) => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  isLoading: boolean;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchProfile(session.user);
        }
      } catch (err) {
        handleSupabaseError(err, 'initSession');
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setUsers([]);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          createdAt: data.created_at || new Date().toISOString()
        });
        
        if (data.role === UserRole.ADMIN) {
          fetchAllProfiles();
        }
      } else {
        // Fallback: If auth exists but profile table record is missing
        // This handles manually added users in Supabase Dashboard
        const newUserProfile: UserProfile = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Cloud One User',
          role: (authUser.user_metadata?.role as UserRole) || UserRole.ADMIN,
          createdAt: authUser.created_at || new Date().toISOString()
        };
        setUser(newUserProfile);
        
        // Try to sync this back to the table for future persistence
        await supabase.from('user_profiles').insert([{
          id: newUserProfile.id,
          name: newUserProfile.name,
          email: newUserProfile.email,
          role: newUserProfile.role
        }]);

        if (newUserProfile.role === UserRole.ADMIN) {
          fetchAllProfiles();
        }
      }
    } catch (err) {
      handleSupabaseError(err, 'fetchProfile');
    }
  };

  const fetchAllProfiles = async () => {
    try {
      const { data, error } = await supabase.from('user_profiles').select('*').order('name');
      if (data) {
        setUsers(data.map((d: any) => ({
          id: d.id,
          email: d.email,
          name: d.name,
          role: d.role as UserRole,
          createdAt: d.created_at || new Date().toISOString()
        })));
      }
    } catch (err) {
      handleSupabaseError(err, 'fetchAllProfiles');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(handleSupabaseError(error, 'login'));
    }
    return !!data.user;
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: UserRole.ADMIN }
      }
    });
    if (error) {
      throw new Error(handleSupabaseError(error, 'signUp'));
    }
    return !!data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUsers([]);
  };

  const addUser = async (userData: any) => {
    const { error } = await supabase.from('user_profiles').insert([{
      name: userData.name,
      email: userData.email,
      role: userData.role
    }]);
    if (error) throw new Error(handleSupabaseError(error, 'addUser'));
    await fetchAllProfiles();
  };

  const updateUser = async (userData: any) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ name: userData.name, role: userData.role })
      .eq('id', userData.id);
    if (error) throw new Error(handleSupabaseError(error, 'updateUser'));
    await fetchAllProfiles();
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('user_profiles').delete().eq('id', id);
    if (error) throw new Error(handleSupabaseError(error, 'deleteUser'));
    await fetchAllProfiles();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users, 
      login, 
      signUp, 
      logout, 
      addUser, 
      updateUser, 
      deleteUser, 
      isLoading,
      refreshUsers: fetchAllProfiles
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
