
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { DbRole, DbUUID, isSupabaseError } from '@/lib/types';

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

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("AuthProvider initializing");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Check if user is master admin - using setTimeout to avoid recursion
          setTimeout(async () => {
            try {
              const userId = currentSession.user.id as DbUUID;
              // Use type casting to fix the TypeScript errors
              const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .eq('role', 'master_admin' as DbRole);
              
              if (error) {
                console.error("Error checking master admin status:", error);
              }
              
              const isMaster = !!data && data.length > 0;
              setIsMasterAdmin(isMaster);
              
              // Save auth state to localStorage for persistence
              localStorage.setItem('isAuthenticated', 'true');
              
              if (isMaster) {
                localStorage.setItem('isMasterAdmin', 'true');
              }
              
              // Also load user's clinics
              const adminId = currentSession.user.id as DbUUID;
              const { data: clinics, error: clinicsError } = await supabase
                .from('clinics')
                .select('*')
                .eq('admin_id', adminId);
                
              if (clinicsError) {
                console.error("Error fetching user clinics:", clinicsError);
              } else if (clinics && Array.isArray(clinics) && clinics.length > 0) {
                localStorage.setItem('allClinics', JSON.stringify(clinics));
                
                // If no clinic is selected, select the first one
                if (!localStorage.getItem('currentClinicId')) {
                  if (clinics[0] && !isSupabaseError(clinics[0])) {
                    localStorage.setItem('currentClinicId', clinics[0].id);
                    localStorage.setItem('clinicData', JSON.stringify(clinics[0]));
                  }
                }
                
                // Redirect the user after authentication if on the login page
                if (location.pathname === '/login') {
                  console.log("Redirecting after auth state change to", isMaster ? '/master' : '/dashboard');
                  navigate(isMaster ? '/master' : '/dashboard');
                }
              }
            } catch (err) {
              console.error("Error in auth state change handler:", err);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          // Clear local storage on logout
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('isMasterAdmin');
          localStorage.removeItem('currentClinicId');
          localStorage.removeItem('clinicData');
          localStorage.removeItem('allClinics');
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got existing session:", currentSession ? "yes" : "no");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Check if user is master admin on initial load
        const userId = currentSession.user.id as DbUUID;
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'master_admin' as DbRole)
          .then(({ data, error }) => {
            if (error) {
              console.error("Error checking master admin status:", error);
            }
            
            const isMaster = !!data && data.length > 0;
            setIsMasterAdmin(isMaster);
            
            if (isMaster) {
              localStorage.setItem('isMasterAdmin', 'true');
            }
            
            // Also load user's clinics
            const adminId = currentSession.user.id as DbUUID;
            supabase
              .from('clinics')
              .select('*')
              .eq('admin_id', adminId)
              .then(({ data: clinics, error: clinicsError }) => {
                if (clinicsError) {
                  console.error("Error fetching user clinics:", clinicsError);
                } else if (clinics && Array.isArray(clinics) && clinics.length > 0) {
                  localStorage.setItem('allClinics', JSON.stringify(clinics));
                  
                  // If no clinic is selected, select the first one
                  if (!localStorage.getItem('currentClinicId')) {
                    const clinicData = clinics[0];
                    if (clinicData && !isSupabaseError(clinicData)) {
                      localStorage.setItem('currentClinicId', clinicData.id);
                      localStorage.setItem('clinicData', JSON.stringify(clinicData));
                    }
                  }
                  
                  // Redirect the user after loading session if on the login page
                  if (location.pathname === '/login') {
                    console.log("Redirecting after getting session to", isMaster ? '/master' : '/dashboard');
                    navigate(isMaster ? '/master' : '/dashboard');
                  }
                  
                  setLoading(false);
                }
              });
          });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      if (data.user) {
        console.log("User signed in successfully:", data.user.email);
        
        // Fetch user clinics after login
        const adminId = data.user.id as DbUUID;
        const { data: clinics, error: clinicsError } = await supabase
          .from('clinics')
          .select('*')
          .eq('admin_id', adminId);
          
        if (clinicsError) {
          console.error("Error fetching user clinics:", clinicsError);
        } else if (clinics && Array.isArray(clinics) && clinics.length > 0) {
          localStorage.setItem('allClinics', JSON.stringify(clinics));
          const firstClinic = clinics[0];
          if (firstClinic && !isSupabaseError(firstClinic)) {
            localStorage.setItem('currentClinicId', firstClinic.id);
            localStorage.setItem('clinicData', JSON.stringify(firstClinic));
          }
        }
        
        // Check if user is master admin
        const userId = data.user.id as DbUUID;
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'master_admin' as DbRole);
          
        if (!roleError && roleData && roleData.length > 0) {
          setIsMasterAdmin(true);
          localStorage.setItem('isMasterAdmin', 'true');
          console.log("Redirecting master admin to /master");
          navigate('/master');
        } else {
          console.log("Redirecting regular user to /dashboard");
          navigate('/dashboard');
        }
        
        toast.success("Login realizado com sucesso!");
      }
    } catch (error: any) {
      toast.error(`Erro ao fazer login: ${error.message || 'Tente novamente'}`);
    } finally {
      setLoading(false);
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
      
      // Clear local storage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('isMasterAdmin');
      localStorage.removeItem('currentClinicId');
      localStorage.removeItem('clinicData');
      localStorage.removeItem('allClinics');
      
      setUser(null);
      setSession(null);
      setIsMasterAdmin(false);
      
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
