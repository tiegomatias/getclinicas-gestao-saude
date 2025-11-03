import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'VIEW' 
  | 'LOGIN' 
  | 'LOGOUT'
  | 'EXPORT';

export type EntityType = 
  | 'clinic' 
  | 'user' 
  | 'patient' 
  | 'professional'
  | 'medication'
  | 'bed'
  | 'appointment'
  | 'finance'
  | 'report';

export const auditService = {
  /**
   * Registra uma ação de auditoria
   */
  async logAction(
    action: AuditAction,
    entityType: EntityType,
    entityId?: string,
    details?: any
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const logEntry = {
        user_id: user?.id || null,
        user_email: user?.email || null,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: details || {},
        ip_address: null, // Pode ser obtido via API externa se necessário
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert(logEntry);

      if (error) {
        console.error('Error logging audit action:', error);
      }
    } catch (error) {
      console.error('Error in audit service:', error);
    }
  },

  /**
   * Busca logs de auditoria com filtros
   */
  async getLogs(options?: {
    action?: AuditAction;
    entityType?: EntityType;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ data: AuditLog[]; total: number }> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

      if (options?.action) {
        query = query.eq('action', options.action);
      }

      if (options?.entityType) {
        query = query.eq('entity_type', options.entityType);
      }

      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options?.startDate) {
        query = query.gte('created_at', options.startDate.toISOString());
      }

      if (options?.endDate) {
        query = query.lte('created_at', options.endDate.toISOString());
      }

      query = query.order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { data: [], total: 0 };
    }
  },

  /**
   * Busca logs recentes
   */
  async getRecentLogs(limit: number = 50): Promise<AuditLog[]> {
    const { data } = await this.getLogs({ limit });
    return data;
  },

  /**
   * Busca estatísticas de auditoria
   */
  async getStats(days: number = 7): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByEntity: Record<string, number>;
    topUsers: Array<{ user_email: string; count: number }>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: logs } = await this.getLogs({
        startDate,
        limit: 10000
      });

      const actionsByType: Record<string, number> = {};
      const actionsByEntity: Record<string, number> = {};
      const userCounts: Record<string, number> = {};

      logs.forEach(log => {
        // Contar por tipo de ação
        actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
        
        // Contar por tipo de entidade
        actionsByEntity[log.entity_type] = (actionsByEntity[log.entity_type] || 0) + 1;
        
        // Contar por usuário
        if (log.user_email) {
          userCounts[log.user_email] = (userCounts[log.user_email] || 0) + 1;
        }
      });

      const topUsers = Object.entries(userCounts)
        .map(([user_email, count]) => ({ user_email, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalActions: logs.length,
        actionsByType,
        actionsByEntity,
        topUsers
      };
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      return {
        totalActions: 0,
        actionsByType: {},
        actionsByEntity: {},
        topUsers: []
      };
    }
  },

  /**
   * Exporta logs para CSV
   */
  async exportLogs(options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<void> {
    try {
      const { data: logs } = await this.getLogs({
        startDate: options?.startDate,
        endDate: options?.endDate,
        limit: 10000
      });

      const headers = ['Data/Hora', 'Usuário', 'Ação', 'Tipo', 'ID Entidade', 'Detalhes'];
      
      let csvContent = headers.join(',') + '\n';
      
      logs.forEach(log => {
        const row = [
          new Date(log.created_at).toLocaleString('pt-BR'),
          log.user_email || 'N/A',
          log.action,
          log.entity_type,
          log.entity_id || 'N/A',
          JSON.stringify(log.details).replace(/,/g, ';')
        ].join(',');
        csvContent += row + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }
};
