
import { supabase } from "@/integrations/supabase/client";
import { DbRole, DbUUID, UserRole, asDbRole, asDbUUID, castDbInsert } from "@/lib/types";

// Function to create a master admin user programmatically
// This should only be used for development/testing purposes
export const setupMasterAdmin = async (email: string, password: string) => {
  try {
    // Check if user exists
    const { data: { user } } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (!user) {
      // Create new user if not exists
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: 'Master Admin',
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Prepare data for insertion with proper type casting
        const userRoleData = {
          user_id: data.user.id,
          role: 'master_admin'
        };
        
        // Use castDbInsert to bypass TypeScript strict checking
        await supabase.from('user_roles').insert(
          castDbInsert<UserRole>(userRoleData)
        );
      }
      
      console.log("Master admin created successfully");
      return data.user;
    } else {
      // Check if user is master_admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select()
        .eq('user_id', user.id as any)
        .eq('role', 'master_admin' as any);
      
      // If not master_admin, set role
      if (!roles || roles.length === 0) {
        const userRoleData = {
          user_id: user.id,
          role: 'master_admin'
        };
        
        // Use castDbInsert to bypass TypeScript strict checking
        await supabase.from('user_roles').insert(
          castDbInsert<UserRole>(userRoleData)
        );
        
        console.log("User promoted to master admin");
      } else {
        console.log("User is already a master admin");
      }
      
      return user;
    }
  } catch (error) {
    console.error("Error setting up master admin:", error);
    throw error;
  }
};

// Function to check if a user exists
export const checkUserExists = async (email: string) => {
  try {
    // Using signIn method to check if user exists instead of admin.getUserByEmail
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    });
    
    if (error && error.message.includes("User not found")) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
};
