
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isMasterAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Check if user is master admin - using setTimeout to avoid recursion
          setTimeout(async () => {
            const { data, error } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentSession.user.id)
              .eq('role', 'master_admin');
            
            setIsMasterAdmin(!!data && data.length > 0);
            
            // Save auth state to localStorage for persistence
            localStorage.setItem('isAuthenticated', 'true');
            
            if (!!data && data.length > 0 && data[0].role === 'master_admin') {
              localStorage.setItem('isMasterAdmin', 'true');
            }
          }, 0);
        } else {
          // Clear local storage on logout
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('isMasterAdmin');
          localStorage.removeItem('currentClinicId');
          localStorage.removeItem('clinicData');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Check if user is master admin on initial load
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentSession.user.id)
          .eq('role', 'master_admin')
          .then(({ data }) => {
            setIsMasterAdmin(!!data && data.length > 0);
            
            if (!!data && data.length > 0 && data[0].role === 'master_admin') {
              localStorage.setItem('isMasterAdmin', 'true');
            }
          });
          
        localStorage.setItem('isAuthenticated', 'true');
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // User will be set by onAuthStateChange
      toast.success("Login realizado com sucesso!");
      navigate(isMasterAdmin ? '/master' : '/dashboard');
    } catch (error: any) {
      toast.error(`Erro ao fazer login: ${error.message || 'Tente novamente'}`);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (error) throw error;
      toast.success("Conta criada com sucesso! Verifique seu email para confirmar.");
    } catch (error: any) {
      toast.error(`Erro ao criar conta: ${error.message || 'Tente novamente'}`);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast.success("Logout realizado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao fazer logout: ${error.message}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        isMasterAdmin,
        signIn,
        signUp,
        signOut,
      }}
    >
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
