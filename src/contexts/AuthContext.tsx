
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DbRole, 
  DbUUID, 
  asDbRole, 
  asDbUUID,
  isSupabaseError, 
  safelyParseArray, 
  safelyParseObject,
  castDbInsert
} from '@/lib/types';

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
              // Properly format query parameters with type casting
              const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', currentSession.user.id as any)
                .eq('role', 'master_admin' as any);
              
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
              
              // Load user's clinics and professional data
              try {
                let clinics = [];
                let isProfessional = false;
                let professionalData = null;
                
                // First, check if user is clinic admin
                const { data: adminClinics, error: clinicsError } = await supabase
                  .from('clinics')
                  .select('*')
                  .eq('admin_id', currentSession.user.id as any);
                  
                if (clinicsError) {
                  console.error("Error fetching admin clinics:", clinicsError);
                } else if (adminClinics && Array.isArray(adminClinics) && adminClinics.length > 0) {
                  clinics = adminClinics;
                } else {
                  // If not admin, check if user is a professional
                  const { data: professionalClinics, error: profError } = await supabase
                    .from('clinic_users')
                    .select('clinic:clinics(*), role')
                    .eq('user_id', currentSession.user.id as any);
                    
                  if (profError) {
                    console.error("Error fetching professional clinics:", profError);
                  } else if (professionalClinics && Array.isArray(professionalClinics) && professionalClinics.length > 0) {
                    isProfessional = true;
                    clinics = professionalClinics.map(pc => pc.clinic).filter(Boolean);
                    
                    // Get professional data
                    const { data: professional, error: professionalError } = await supabase
                      .from('professionals')
                      .select('*')
                      .eq('email', currentSession.user.email)
                      .single();
                      
                    if (!professionalError && professional) {
                      professionalData = professional;
                      localStorage.setItem('professionalData', JSON.stringify(professional));
                    }
                  }
                }
                
                if (clinics.length > 0) {
                  // Safely parse and store clinic data
                  localStorage.setItem('allClinics', JSON.stringify(clinics));
                  localStorage.setItem('isProfessional', String(isProfessional));
                  
                  // If no clinic is selected, select the first one
                  if (!localStorage.getItem('currentClinicId')) {
                    const clinic = clinics[0];
                    if (clinic && clinic.id) {
                      localStorage.setItem('currentClinicId', String(clinic.id));
                      localStorage.setItem('clinicData', JSON.stringify(clinic));
                    }
                  }
                  
                  // Redirect the user after authentication if on the login page
                  if (location.pathname === '/login') {
                    let redirectPath = '/dashboard';
                    if (isMaster) {
                      redirectPath = '/master';
                    } else if (isProfessional) {
                      redirectPath = '/professional-dashboard';
                    }
                    console.log("Redirecting after auth state change to", redirectPath);
                    navigate(redirectPath, { replace: true });
                  }
                }
              } catch (err) {
                console.error("Error processing clinics data:", err);
              } finally {
                setLoading(false);
              }
            } catch (err) {
              console.error("Error in auth state change handler:", err);
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
        const checkMasterAdminStatus = async () => {
          try {
            const { data, error } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentSession.user.id as any)
              .eq('role', 'master_admin' as any);
            
            if (error) {
              console.error("Error checking master admin status:", error);
              return;
            }
            
            const isMaster = !!data && data.length > 0;
            setIsMasterAdmin(isMaster);
            
            if (isMaster) {
              localStorage.setItem('isMasterAdmin', 'true');
            }
            
            // Load user's clinics and professional data (session check)
            try {
              let clinics = [];
              let isProfessional = false;
              let professionalData = null;
              
              // First, check if user is clinic admin
              const { data: adminClinics, error: clinicsError } = await supabase
                .from('clinics')
                .select('*')
                .eq('admin_id', currentSession.user.id as any);
                
              if (clinicsError) {
                console.error("Error fetching admin clinics:", clinicsError);
              } else if (adminClinics && Array.isArray(adminClinics) && adminClinics.length > 0) {
                clinics = adminClinics;
              } else {
                // If not admin, check if user is a professional
                const { data: professionalClinics, error: profError } = await supabase
                  .from('clinic_users')
                  .select('clinic:clinics(*), role')
                  .eq('user_id', currentSession.user.id as any);
                  
                if (profError) {
                  console.error("Error fetching professional clinics:", profError);
                } else if (professionalClinics && Array.isArray(professionalClinics) && professionalClinics.length > 0) {
                  isProfessional = true;
                  clinics = professionalClinics.map(pc => pc.clinic).filter(Boolean);
                  
                  // Get professional data
                  const { data: professional, error: professionalError } = await supabase
                    .from('professionals')
                    .select('*')
                    .eq('email', currentSession.user.email)
                    .single();
                    
                  if (!professionalError && professional) {
                    professionalData = professional;
                    localStorage.setItem('professionalData', JSON.stringify(professional));
                  }
                }
              }
              
              if (clinics.length > 0) {
                // Safely store clinic data
                localStorage.setItem('allClinics', JSON.stringify(clinics));
                localStorage.setItem('isProfessional', String(isProfessional));
                
                // If no clinic is selected, select the first one
                if (!localStorage.getItem('currentClinicId')) {
                  const clinic = clinics[0];
                  if (clinic && clinic.id) {
                    localStorage.setItem('currentClinicId', String(clinic.id));
                    localStorage.setItem('clinicData', JSON.stringify(clinic));
                  }
                }
                
                // Redirect the user after loading session if on the login page
                if (location.pathname === '/login') {
                  let redirectPath = '/dashboard';
                  if (isMaster) {
                    redirectPath = '/master';
                  } else if (isProfessional) {
                    redirectPath = '/professional-dashboard';
                  }
                  console.log("Redirecting after getting session to", redirectPath);
                  navigate(redirectPath, { replace: true });
                }
              }
            } catch (err) {
              console.error("Error processing clinics data:", err);
            } finally {
              setLoading(false);
            }
          } catch (err) {
            console.error("Error checking master admin status:", err);
            setLoading(false);
          }
        };
        
        checkMasterAdminStatus();
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
        
        // Fetch user clinics and professional data after login
        let clinics = [];
        let isProfessional = false;
        let professionalData = null;
        
        try {
          // First, check if user is clinic admin
          const { data: adminClinics, error: clinicsError } = await supabase
            .from('clinics')
            .select('*')
            .eq('admin_id', data.user.id as any);
            
          if (clinicsError) {
            console.error("Error fetching admin clinics:", clinicsError);
          } else if (adminClinics && Array.isArray(adminClinics) && adminClinics.length > 0) {
            clinics = adminClinics;
          } else {
            // If not admin, check if user is a professional
            const { data: professionalClinics, error: profError } = await supabase
              .from('clinic_users')
              .select('clinic:clinics(*), role')
              .eq('user_id', data.user.id as any);
              
            if (profError) {
              console.error("Error fetching professional clinics:", profError);
            } else if (professionalClinics && Array.isArray(professionalClinics) && professionalClinics.length > 0) {
              isProfessional = true;
              clinics = professionalClinics.map(pc => pc.clinic).filter(Boolean);
              
              // Get professional data
              const { data: professional, error: professionalError } = await supabase
                .from('professionals')
                .select('*')
                .eq('email', data.user.email)
                .single();
                
              if (!professionalError && professional) {
                professionalData = professional;
                localStorage.setItem('professionalData', JSON.stringify(professional));
              }
            }
          }
          
          if (clinics.length > 0) {
            // Safely store clinic data
            localStorage.setItem('allClinics', JSON.stringify(clinics));
            localStorage.setItem('isProfessional', String(isProfessional));
            
            // If no clinic is selected, select the first one
            const clinic = clinics[0];
            if (clinic && clinic.id) {
              localStorage.setItem('currentClinicId', String(clinic.id));
              localStorage.setItem('clinicData', JSON.stringify(clinic));
            }
          }
        } catch (err) {
          console.error("Error processing clinics data:", err);
        }
        
        // Check if user is master admin
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id as any)
            .eq('role', 'master_admin' as any);
            
          if (!roleError && roleData && roleData.length > 0) {
            setIsMasterAdmin(true);
            localStorage.setItem('isMasterAdmin', 'true');
            console.log("Redirecting master admin to /master");
            navigate('/master', { replace: true });
          } else if (isProfessional) {
            console.log("Redirecting professional to /professional-dashboard");
            navigate('/professional-dashboard', { replace: true });
          } else {
            console.log("Redirecting regular user to /dashboard");
            navigate('/dashboard', { replace: true });
          }
        } catch (err) {
          console.error("Error checking master admin role:", err);
          navigate(isProfessional ? '/professional-dashboard' : '/dashboard');
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
