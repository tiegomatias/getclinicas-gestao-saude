
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
              const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', currentSession.user.id)
                .eq('role', 'master_admin');
              
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
              
              // Também carrega as clínicas do usuário
              const { data: clinics, error: clinicsError } = await supabase
                .from('clinics')
                .select('*')
                .eq('admin_id', currentSession.user.id);
                
              if (clinicsError) {
                console.error("Error fetching user clinics:", clinicsError);
              } else if (clinics && clinics.length > 0) {
                localStorage.setItem('allClinics', JSON.stringify(clinics));
                
                // Se não tiver uma clínica selecionada, seleciona a primeira
                if (!localStorage.getItem('currentClinicId')) {
                  localStorage.setItem('currentClinicId', clinics[0].id);
                  localStorage.setItem('clinicData', JSON.stringify(clinics[0]));
                }
              }
            } catch (err) {
              console.error("Error in auth state change handler:", err);
            }
          }, 0);
        } else {
          // Clear local storage on logout
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('isMasterAdmin');
          localStorage.removeItem('currentClinicId');
          localStorage.removeItem('clinicData');
          localStorage.removeItem('allClinics');
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
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentSession.user.id)
          .eq('role', 'master_admin')
          .then(({ data, error }) => {
            if (error) {
              console.error("Error checking master admin status:", error);
            }
            
            const isMaster = !!data && data.length > 0;
            setIsMasterAdmin(isMaster);
            
            if (isMaster) {
              localStorage.setItem('isMasterAdmin', 'true');
            }
            
            // Também carrega as clínicas do usuário
            supabase
              .from('clinics')
              .select('*')
              .eq('admin_id', currentSession.user.id)
              .then(({ data: clinics, error: clinicsError }) => {
                if (clinicsError) {
                  console.error("Error fetching user clinics:", clinicsError);
                } else if (clinics && clinics.length > 0) {
                  localStorage.setItem('allClinics', JSON.stringify(clinics));
                  
                  // Se não tiver uma clínica selecionada, seleciona a primeira
                  if (!localStorage.getItem('currentClinicId')) {
                    localStorage.setItem('currentClinicId', clinics[0].id);
                    localStorage.setItem('clinicData', JSON.stringify(clinics[0]));
                  }
                }
              });
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      if (data.user) {
        console.log("User signed in successfully:", data.user.email);
        
        // Fetch user clinics after login
        const { data: clinics, error: clinicsError } = await supabase
          .from('clinics')
          .select('*')
          .eq('admin_id', data.user.id);
          
        if (clinicsError) {
          console.error("Error fetching user clinics:", clinicsError);
        } else if (clinics && clinics.length > 0) {
          localStorage.setItem('allClinics', JSON.stringify(clinics));
          localStorage.setItem('currentClinicId', clinics[0].id);
          localStorage.setItem('clinicData', JSON.stringify(clinics[0]));
        }
        
        // Check if user is master admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'master_admin');
          
        if (!roleError && roleData && roleData.length > 0) {
          setIsMasterAdmin(true);
          localStorage.setItem('isMasterAdmin', 'true');
          navigate('/master');
        } else {
          navigate('/dashboard');
        }
        
        toast.success("Login realizado com sucesso!");
      }
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
