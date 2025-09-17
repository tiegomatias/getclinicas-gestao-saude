import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClinicDebug() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    if (!user) {
      setDebugInfo({ error: 'Usuário não logado' });
      return;
    }

    setLoading(true);
    try {
      console.log('Running debug for user:', user.id, user.email);

      // Check clinics where user is admin
      const { data: adminClinics, error: adminError } = await supabase
        .from('clinics')
        .select('*')
        .eq('admin_id', user.id);

      // Check if user exists in clinic_users
      const { data: userClinics, error: userError } = await supabase
        .from('clinic_users')
        .select('*, clinic:clinics(*)')
        .eq('user_id', user.id);

      // Check user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      // Check professionals table
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('email', user.email);

      const debug = {
        user: {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        },
        adminClinics: {
          data: adminClinics,
          error: adminError,
          count: adminClinics?.length || 0
        },
        userClinics: {
          data: userClinics,
          error: userError,
          count: userClinics?.length || 0
        },
        roles: {
          data: roles,
          error: rolesError,
          count: roles?.length || 0
        },
        professional: {
          data: professional,
          error: profError,
          count: professional?.length || 0
        },
        localStorage: {
          isAuthenticated: localStorage.getItem('isAuthenticated'),
          currentClinicId: localStorage.getItem('currentClinicId'),
          clinicData: localStorage.getItem('clinicData'),
          allClinics: localStorage.getItem('allClinics'),
          isProfessional: localStorage.getItem('isProfessional'),
          isMasterAdmin: localStorage.getItem('isMasterAdmin')
        }
      };

      setDebugInfo(debug);
      console.log('Debug info:', debug);
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Debug de Clínica</CardTitle>
        <Button onClick={runDebug} disabled={loading}>
          {loading ? 'Executando...' : 'Executar Debug'}
        </Button>
      </CardHeader>
      <CardContent>
        {debugInfo && (
          <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}