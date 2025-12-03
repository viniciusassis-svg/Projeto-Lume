
(() => {
  const tariff = 0.8;
  const co2Factor = 0.233;

  const panelSizeSel = document.getElementById('panelSize');
  const panelQtyInput = document.getElementById('panelQty');
  const previewSolarEl = document.getElementById('previewSolar');
  const solarPreviewCard = document.getElementById('solarPreviewCard');
  const totalKwhEl = document.getElementById('totalKwh');
  const totalCostEl = document.getElementById('totalCost');
  const totalCO2El = document.getElementById('totalCO2');
  const generateBtn = document.getElementById('generateReportBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const noReports = document.getElementById('noReports');
  const reportsTable = document.getElementById('reportsTable');
  const reportsTbody = document.getElementById('reportsTbody');
  const monthInput = document.getElementById('reportMonth');

  const reportsChartCtx = document.getElementById('reportsChart').getContext('2d');

  let chart = null;
  let reports = [];

  function formatBR(value) {
    return Number(value)
      .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function calcPreviewSolar() {
    const base = parseFloat(panelSizeSel.value) || 0;
    const qty = Math.max(0, parseInt(panelQtyInput.value || '0'));
    const gen = base * qty;
    previewSolarEl.textContent = gen.toFixed(2);
    solarPreviewCard.textContent = gen.toFixed(2) + ' kWh';
    return gen;
  }

  panelSizeSel.addEventListener('change', calcPreviewSolar);
  panelQtyInput.addEventListener('input', calcPreviewSolar);

  async function fetchReports() {
    try {
      const res = await fetch('get_reports.php');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erro');
      reports = data.reports || [];
      renderReports();
    } catch (err) {
      console.error(err);
      noReports.textContent = 'Erro ao carregar relatórios.';
    }
  }

  function renderReports() {
    if (!reports.length) {
      noReports.style.display = 'block';
      noReports.textContent = 'Nenhum relatório salvo ainda.';
      reportsTable.style.display = 'none';
      updateSummaryCards(0, 0, 0, 0);
      renderChart([]);
      return;
    }

    noReports.style.display = 'none';
    reportsTable.style.display = 'table';
    reportsTbody.innerHTML = '';

    reports.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.month_year}</td>
        <td>${formatBR(r.total_kwh)}</td>
        <td>R$ ${formatBR(r.total_cost)}</td>
        <td>${formatBR(r.total_co2)}</td>
        <td>${formatBR(r.solar_generated)}</td>
        <td>R$ ${formatBR(r.solar_savings)}</td>
        <td>${r.created_at}</td>
      `;
      reportsTbody.appendChild(tr);
    });

    const latest = reports[0];
    updateSummaryCards(
      latest.total_kwh,
      latest.total_cost,
      latest.total_co2,
      latest.solar_generated
    );

    renderChart(reports.map(r => ({
      label: r.month_year,
      value: Number(r.total_kwh)
    })));
  }

  function updateSummaryCards(kwh, cost, co2, solarGen) {
    totalKwhEl.textContent = ${formatBR(kwh)} kWh;
    totalCostEl.textContent = R$ ${formatBR(cost)};
    totalCO2El.textContent = ${formatBR(co2)} kg CO₂;
    solarPreviewCard.textContent = ${formatBR(solarGen)} kWh;
  }

  function renderChart(dataPoints) {
    const labels = dataPoints.map(d => d.label).reverse();
    const values = dataPoints.map(d => d.value).reverse();

    if (chart) chart.destroy();

    chart = new Chart(reportsChartCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Consumo (kWh)',
          data: values,
          backgroundColor: 'rgba(108,99,255,0.8)'
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  async function generateReport() {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Gerando...';

    try {
      const solar_generated = calcPreviewSolar();
      const month_year = monthInput.value;

      if (!month_year) {
        alert("Selecione um mês para gerar o relatório.");
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fa-solid fa-file-circle-plus"></i> Gerar relatório';
        return;
      }

      const res = await fetch('generate_report.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solar_generated, month_year })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erro ao gerar relatório');

      await fetchReports();
      alert('Relatório gerado com sucesso!');
      
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar relatório: ' + err.message);
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<i class="fa-solid fa-file-circle-plus"></i> Gerar relatório';
    }
  }

  generateBtn.addEventListener('click', generateReport);
  refreshBtn.addEventListener('click', fetchReports);

  calcPreviewSolar();
  fetchReports();
})();