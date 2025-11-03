
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

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isMasterAdmin: boolean;
  subscriptionStatus: SubscriptionStatus;
  checkSubscription: () => Promise<void>;
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
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    product_id: null,
    subscription_end: null
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("AuthProvider initializing");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log("User found in session, loading data...");
          
          // Load subscription status from localStorage
          const savedStatus = localStorage.getItem('subscriptionStatus');
          if (savedStatus) {
            setSubscriptionStatus(JSON.parse(savedStatus));
          }
          
          // Check if user is master admin - using setTimeout to avoid recursion
          setTimeout(async () => {
            try {
              // Check subscription status only if user has valid session
              if (currentSession?.access_token) {
                console.log('Checking subscription status for authenticated user');
                checkSubscription();
              } else {
                console.log('Skipping subscription check - no access token');
              }
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
              console.log("Is master admin:", isMaster);
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
                  .eq('admin_id', currentSession.user.id);
                  
                console.log("Admin clinics query result:", { adminClinics, clinicsError, userId: currentSession.user.id });
                
                if (clinicsError) {
                  console.error("Error fetching admin clinics:", clinicsError);
                } else if (adminClinics && Array.isArray(adminClinics) && adminClinics.length > 0) {
                  console.log("Found admin clinics:", adminClinics.length);
                  clinics = adminClinics;
                } else {
                  console.log("No admin clinics found, checking professional clinics...");
                  // If not admin, check if user is a professional
                  const { data: professionalClinics, error: profError } = await supabase
                    .from('clinic_users')
                    .select('clinic:clinics(*), role')
                    .eq('user_id', currentSession.user.id);
                    
                  console.log("Professional clinics query result:", { professionalClinics, profError });
                    
                  if (profError) {
                    console.error("Error fetching professional clinics:", profError);
                  } else if (professionalClinics && Array.isArray(professionalClinics) && professionalClinics.length > 0) {
                    console.log("Found professional clinics:", professionalClinics.length);
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
                  } else {
                    console.log("No professional clinics found either");
                  }
                }
                
                console.log("Clinics found:", clinics.length, "Is professional:", isProfessional);
                
                if (clinics.length > 0) {
                  // Safely parse and store clinic data
                  localStorage.setItem('allClinics', JSON.stringify(clinics));
                  localStorage.setItem('isProfessional', String(isProfessional));
                  
                  // If no clinic is selected, select the first one
                  if (!localStorage.getItem('currentClinicId')) {
                    const clinic = clinics[0];
                    if (clinic && clinic.id) {
                      console.log("Setting current clinic:", clinic.id);
                      localStorage.setItem('currentClinicId', String(clinic.id));
                      localStorage.setItem('clinicData', JSON.stringify(clinic));
                    }
                  }
                } else {
                  console.log("No clinics found for user");
                }
              } catch (err) {
                console.error("Error processing clinics data:", err);
              } finally {
                console.log("Auth state change processing complete");
                setLoading(false);
              }
            } catch (err) {
              console.error("Error in auth state change handler:", err);
              setLoading(false);
            }
          }, 0);
        } else {
          console.log("No user in session, clearing data");
          // Clear local storage on logout
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('isMasterAdmin');
          localStorage.removeItem('currentClinicId');
          localStorage.removeItem('clinicData');
          localStorage.removeItem('allClinics');
          localStorage.removeItem('isProfessional');
          localStorage.removeItem('professionalData');
          localStorage.removeItem('subscriptionStatus');
          setIsMasterAdmin(false);
          setSubscriptionStatus({
            subscribed: false,
            product_id: null,
            subscription_end: null
          });
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got existing session:", currentSession ? "yes" : "no");
      
      if (!currentSession) {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Periodic subscription check every 60 seconds
  useEffect(() => {
    if (!user || !session) {
      console.log('Skipping subscription check - no user or session');
      return;
    }

    console.log('Setting up subscription check interval');
    const interval = setInterval(() => {
      console.log('Running periodic subscription check');
      checkSubscription();
    }, 60000); // 60 seconds

    return () => {
      console.log('Clearing subscription check interval');
      clearInterval(interval);
    };
  }, [user, session]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Starting sign in process");
      
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
            .eq('admin_id', data.user.id);
            
          console.log("SignIn - Admin clinics query:", { adminClinics, clinicsError, userId: data.user.id });
            
          if (clinicsError) {
            console.error("Error fetching admin clinics:", clinicsError);
          } else if (adminClinics && Array.isArray(adminClinics) && adminClinics.length > 0) {
            console.log("SignIn - Found admin clinics:", adminClinics.length);
            clinics = adminClinics;
          } else {
            console.log("SignIn - No admin clinics, checking professional...");
            // If not admin, check if user is a professional
            const { data: professionalClinics, error: profError } = await supabase
              .from('clinic_users')
              .select('clinic:clinics(*), role')
              .eq('user_id', data.user.id);
              
            console.log("SignIn - Professional clinics query:", { professionalClinics, profError });
              
            if (profError) {
              console.error("Error fetching professional clinics:", profError);
            } else if (professionalClinics && Array.isArray(professionalClinics) && professionalClinics.length > 0) {
              console.log("SignIn - Found professional clinics:", professionalClinics.length);
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
            } else {
              console.log("SignIn - No professional clinics found either");
            }
          }
          
          if (clinics.length > 0) {
            // Safely store clinic data
            localStorage.setItem('allClinics', JSON.stringify(clinics));
            localStorage.setItem('isProfessional', String(isProfessional));
            
            console.log("SignIn - Storing clinic data:", { 
              clinicsCount: clinics.length, 
              isProfessional,
              firstClinic: clinics[0]
            });
            
            // If no clinic is selected, select the first one
            const clinic = clinics[0];
            if (clinic && clinic.id) {
              console.log("SignIn - Setting current clinic:", clinic.id, clinic.name);
              localStorage.setItem('currentClinicId', String(clinic.id));
              localStorage.setItem('clinicData', JSON.stringify(clinic));
            }
          } else {
            console.log("SignIn - Clearing clinic data since none found");
            localStorage.removeItem('isProfessional');
            localStorage.removeItem('currentClinicId');
            localStorage.removeItem('clinicData');
          }
        } catch (err) {
          console.error("Error processing clinics data:", err);
        }
        
        // Check if user is master admin and redirect accordingly
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .eq('role', 'master_admin');
            
          console.log("Role check result:", { roleData, roleError });
            
          if (!roleError && roleData && roleData.length > 0) {
            setIsMasterAdmin(true);
            localStorage.setItem('isMasterAdmin', 'true');
            console.log("Redirecting master admin to /master");
            navigate('/master', { replace: true });
          } else if (isProfessional && clinics.length > 0) {
            console.log("Redirecting professional to /professional-dashboard");
            navigate('/professional-dashboard', { replace: true });
          } else if (clinics.length > 0) {
            console.log("Redirecting clinic admin to /dashboard");
            navigate('/dashboard', { replace: true });
          } else {  
            console.log("No clinics found, redirecting to registration");
            navigate('/registro', { replace: true });
            toast.error("Nenhuma clínica encontrada para este usuário. Por favor, registre uma clínica.");
          }
        } catch (err) {
          console.error("Error checking master admin role:", err);
          if (clinics.length > 0) {
            navigate(isProfessional ? '/professional-dashboard' : '/dashboard', { replace: true });
          } else {
            navigate('/registro', { replace: true });
            toast.error("Erro ao verificar permissões. Redirecionando para registro.");
          }
        }
        
        toast.success("Login realizado com sucesso!");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Erro ao fazer login: ${error.message || 'Credenciais inválidas'}`);
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

  const checkSubscription = async (): Promise<void> => {
    try {
      // Verificar se há sessão válida antes de chamar a função
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.log('No active session or access token, skipping subscription check');
        // Limpar status de assinatura quando não há sessão
        setSubscriptionStatus({
          subscribed: false,
          product_id: null,
          subscription_end: null
        });
        localStorage.removeItem('subscriptionStatus');
        return;
      }

      console.log('Calling check-subscription with valid session');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error('Error checking subscription:', error);
        
        // Se a sessão expirou (401), fazer logout automático mas não bloquear a UI
        if (error.message?.includes('401') || error.message?.includes('Session expired')) {
          console.log('Session expired detected');
          
          // Limpar status de assinatura
          setSubscriptionStatus({
            subscribed: false,
            product_id: null,
            subscription_end: null
          });
          localStorage.removeItem('subscriptionStatus');
          
          // Fazer logout em background sem bloquear a UI
          setTimeout(async () => {
            toast.error('Sua sessão expirou. Faça login novamente.');
            await signOut();
          }, 100);
        }
        return;
      }
      
      const status: SubscriptionStatus = {
        subscribed: data.subscribed || false,
        product_id: data.product_id || null,
        subscription_end: data.subscription_end || null
      };
      
      console.log('Subscription status updated:', status);
      setSubscriptionStatus(status);
      localStorage.setItem('subscriptionStatus', JSON.stringify(status));
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process');
      await supabase.auth.signOut();
      
      // Clear local storage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('isMasterAdmin');
      localStorage.removeItem('currentClinicId');
      localStorage.removeItem('clinicData');
      localStorage.removeItem('allClinics');
      localStorage.removeItem('isProfessional');
      localStorage.removeItem('professionalData');
      localStorage.removeItem('subscriptionStatus');
      
      setUser(null);
      setSession(null);
      setIsMasterAdmin(false);
      setSubscriptionStatus({
        subscribed: false,
        product_id: null,
        subscription_end: null
      });
      
      console.log('Sign out completed, redirecting to login');
      navigate('/login', { replace: true });
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
        subscriptionStatus,
        checkSubscription,
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
