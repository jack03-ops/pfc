// Phoenix Fitness Centre - Data Export Utilities
// Generates standardized Excel-compatible CSV exports directly in the browser

export function downloadReportCsv({ cycle, stats, payments = [], members = [] }) {
  const rows = [];
  rows.push(['PHOENIX FITNESS CENTRE - BUSINESS PERFORMANCE REPORT']);
  rows.push(['Report Generated', new Date().toLocaleString('en-IN')]);
  rows.push(['Report Scope / Cycle', cycle]);
  rows.push([]);
  rows.push(['--- EXECUTIVE KPI SUMMARY ---']);
  rows.push(['Metric', 'Value']);
  rows.push(['Total Revenue Collected (INR)', stats.revenue || 0]);
  rows.push(['New Member Registrations', stats.newJoins || 0]);
  rows.push(['Churned Members', stats.churnedCount || 0]);
  rows.push(['Churn Rate', stats.churnRate || '0%']);
  rows.push(['Retention Rate', stats.retentionRate || '100%']);
  rows.push(['Active Subscribers', stats.activeMembers || 0]);
  rows.push(['Average Revenue Per User (ARPU)', `INR ${stats.arpu || 0}`]);
  rows.push([]);
  rows.push(['--- PAYMENT ALLOCATIONS BY METHOD ---']);
  rows.push(['Payment Method', 'Amount (INR)']);
  if (stats.methodCounts) {
    Object.entries(stats.methodCounts).forEach(([method, amt]) => {
      rows.push([method, amt]);
    });
  }
  rows.push([]);
  rows.push(['--- DETAILED TRANSACTION LEDGER ---']);
  rows.push(['Receipt ID', 'Member ID', 'Client Name', 'Plan', 'Payment Mode', 'Amount (INR)', 'Date', 'Notes']);
  payments.forEach(p => {
    rows.push([
      p.id || '',
      p.clientId || '',
      `"${(p.clientName || '').replace(/"/g, '""')}"`,
      p.plan || '',
      p.method || 'UPI',
      p.amount || 0,
      p.date || '',
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);
  });

  const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const fileName = `Phoenix_Report_${cycle}_${Date.now()}.csv`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
