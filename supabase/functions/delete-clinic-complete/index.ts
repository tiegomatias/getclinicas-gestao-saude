import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { clinicId } = await req.json();

    if (!clinicId) {
      return new Response(
        JSON.stringify({ error: 'clinicId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Buscar o admin_id da clínica
    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from('clinics')
      .select('admin_id')
      .eq('id', clinicId)
      .single();

    if (clinicError || !clinic) {
      return new Response(
        JSON.stringify({ error: 'Clinic not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminId = clinic.admin_id;

    // 2. Deletar todos os dados relacionados à clínica
    // A ordem importa devido às foreign keys
    
    // Deletar administrações de medicamentos
    await supabaseAdmin.from('medication_administrations').delete().eq('clinic_id', clinicId);
    
    // Deletar histórico de estoque
    await supabaseAdmin.from('medication_stock_history').delete().eq('clinic_id', clinicId);
    
    // Deletar prescrições
    await supabaseAdmin.from('medication_prescriptions').delete().eq('clinic_id', clinicId);
    
    // Deletar inventário de medicamentos
    await supabaseAdmin.from('medication_inventory').delete().eq('clinic_id', clinicId);
    
    // Deletar medicamentos
    await supabaseAdmin.from('medications').delete().eq('clinic_id', clinicId);
    
    // Deletar registros médicos
    await supabaseAdmin.from('medical_records').delete().eq('clinic_id', clinicId);
    
    // Deletar participantes de atividades
    const { data: activities } = await supabaseAdmin
      .from('activities')
      .select('id')
      .eq('clinic_id', clinicId);
    
    if (activities && activities.length > 0) {
      const activityIds = activities.map(a => a.id);
      await supabaseAdmin.from('activity_participants').delete().in('activity_id', activityIds);
    }
    
    // Deletar atividades
    await supabaseAdmin.from('activities').delete().eq('clinic_id', clinicId);
    
    // Deletar agendamentos
    await supabaseAdmin.from('appointments').delete().eq('clinic_id', clinicId);
    
    // Deletar consumo de alimentos
    await supabaseAdmin.from('food_consumption').delete().eq('clinic_id', clinicId);
    
    // Deletar inventário de alimentos
    await supabaseAdmin.from('food_inventory').delete().eq('clinic_id', clinicId);
    
    // Deletar listas de compras
    await supabaseAdmin.from('shopping_lists').delete().eq('clinic_id', clinicId);
    
    // Deletar contratos
    await supabaseAdmin.from('contracts').delete().eq('clinic_id', clinicId);
    
    // Deletar documentos
    await supabaseAdmin.from('documents').delete().eq('clinic_id', clinicId);
    
    // Deletar finanças
    await supabaseAdmin.from('finances').delete().eq('clinic_id', clinicId);
    
    // Deletar admissões
    await supabaseAdmin.from('admissions').delete().eq('clinic_id', clinicId);
    
    // Deletar leitos
    await supabaseAdmin.from('beds').delete().eq('clinic_id', clinicId);
    
    // Deletar pacientes
    await supabaseAdmin.from('patients').delete().eq('clinic_id', clinicId);
    
    // Deletar permissões de profissionais
    await supabaseAdmin.from('professional_permissions').delete().eq('clinic_id', clinicId);
    
    // Deletar profissionais
    await supabaseAdmin.from('professionals').delete().eq('clinic_id', clinicId);
    
    // Deletar notificações
    await supabaseAdmin.from('notifications').delete().eq('clinic_id', clinicId);
    
    // Deletar configurações
    await supabaseAdmin.from('clinic_settings').delete().eq('clinic_id', clinicId);
    
    // Deletar tickets de suporte
    await supabaseAdmin.from('support_tickets').delete().eq('clinic_id', clinicId);
    
    // 3. Deletar registros em clinic_users
    await supabaseAdmin.from('clinic_users').delete().eq('clinic_id', clinicId);
    
    // 4. Deletar a clínica
    const { error: deleteClinicError } = await supabaseAdmin
      .from('clinics')
      .delete()
      .eq('id', clinicId);

    if (deleteClinicError) {
      throw deleteClinicError;
    }

    // 5. Deletar o usuário admin do auth.users
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(adminId);

    if (deleteUserError) {
      console.error('Error deleting user from auth:', deleteUserError);
      // Não falhar a operação se não conseguir deletar o usuário
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Clinic and all related data deleted successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in delete-clinic-complete:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
