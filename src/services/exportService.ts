import { OccupationReport, FinancialReport, ActivitiesReport, PatientsReport } from "./reportService";

export const exportService = {
  exportToCSV: (
    occupationReport: OccupationReport | null,
    financialReport: FinancialReport | null,
    activitiesReport: ActivitiesReport | null,
    patientsReport: PatientsReport | null,
    startDate: string,
    endDate: string
  ) => {
    const csvContent = [
      ['RELATÓRIO GERAL DA CLÍNICA'],
      ['Período', `${startDate} até ${endDate}`],
      [],
      ['OCUPAÇÃO DE LEITOS'],
      ['Métrica', 'Valor'],
      ['Total de Leitos', occupationReport?.totalBeds || 0],
      ['Leitos Ocupados', occupationReport?.occupiedBeds || 0],
      ['Leitos Disponíveis', occupationReport?.availableBeds || 0],
      ['Leitos em Manutenção', occupationReport?.maintenanceBeds || 0],
      ['Taxa de Ocupação', `${occupationReport?.occupationRate || 0}%`],
      [],
      ['FINANCEIRO'],
      ['Métrica', 'Valor'],
      ['Total de Receitas', `R$ ${(financialReport?.totalIncome || 0).toFixed(2)}`],
      ['Total de Despesas', `R$ ${(financialReport?.totalExpenses || 0).toFixed(2)}`],
      ['Saldo do Período', `R$ ${(financialReport?.balance || 0).toFixed(2)}`],
      [],
      ['ATIVIDADES'],
      ['Métrica', 'Valor'],
      ['Total de Atividades', activitiesReport?.totalActivities || 0],
      [],
      ['PACIENTES'],
      ['Métrica', 'Valor'],
      ['Total de Internações', patientsReport?.totalAdmissions || 0],
      ['Altas no Período', patientsReport?.totalDischarges || 0],
      ['Pacientes Ativos', patientsReport?.totalActive || 0],
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_clinica_${startDate}_${endDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToPDF: async (
    occupationReport: OccupationReport | null,
    financialReport: FinancialReport | null,
    activitiesReport: ActivitiesReport | null,
    patientsReport: PatientsReport | null,
    startDate: string,
    endDate: string
  ) => {
    // Create a printable HTML version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório da Clínica</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; }
            h2 { color: #4F46E5; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #4F46E5; color: white; }
            .metric { display: flex; justify-content: space-between; padding: 10px; margin: 5px 0; background: #f3f4f6; }
            .value { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Relatório Geral da Clínica</h1>
          <p><strong>Período:</strong> ${startDate} até ${endDate}</p>
          
          <h2>Ocupação de Leitos</h2>
          <div class="metric">
            <span>Total de Leitos:</span>
            <span class="value">${occupationReport?.totalBeds || 0}</span>
          </div>
          <div class="metric">
            <span>Leitos Ocupados:</span>
            <span class="value">${occupationReport?.occupiedBeds || 0}</span>
          </div>
          <div class="metric">
            <span>Leitos Disponíveis:</span>
            <span class="value">${occupationReport?.availableBeds || 0}</span>
          </div>
          <div class="metric">
            <span>Taxa de Ocupação:</span>
            <span class="value">${occupationReport?.occupationRate || 0}%</span>
          </div>
          
          <h2>Resumo Financeiro</h2>
          <div class="metric">
            <span>Total de Receitas:</span>
            <span class="value" style="color: green;">R$ ${(financialReport?.totalIncome || 0).toFixed(2)}</span>
          </div>
          <div class="metric">
            <span>Total de Despesas:</span>
            <span class="value" style="color: red;">R$ ${(financialReport?.totalExpenses || 0).toFixed(2)}</span>
          </div>
          <div class="metric">
            <span>Saldo do Período:</span>
            <span class="value">R$ ${(financialReport?.balance || 0).toFixed(2)}</span>
          </div>
          
          <h2>Atividades</h2>
          <div class="metric">
            <span>Total de Atividades:</span>
            <span class="value">${activitiesReport?.totalActivities || 0}</span>
          </div>
          
          <h2>Estatísticas de Pacientes</h2>
          <div class="metric">
            <span>Total de Internações:</span>
            <span class="value">${patientsReport?.totalAdmissions || 0}</span>
          </div>
          <div class="metric">
            <span>Altas no Período:</span>
            <span class="value">${patientsReport?.totalDischarges || 0}</span>
          </div>
          <div class="metric">
            <span>Pacientes Ativos:</span>
            <span class="value">${patientsReport?.totalActive || 0}</span>
          </div>
          
          <script>
            window.print();
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },
};
