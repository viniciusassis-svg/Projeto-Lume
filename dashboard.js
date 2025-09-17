const form = document.getElementById('applianceForm');
const ctx = document.getElementById('consumptionChart').getContext('2d');
const status = document.getElementById('consumptionStatus');
const co2 = document.getElementById('co2Impact');
const list = document.getElementById('applianceList');
const finalCost = document.getElementById('finalCost');
const solarSelect = document.getElementById('solarPanels');
const panelQtyInput = document.getElementById('panelQty');
const solarBtn = document.getElementById('simulate');
const solarGen = document.getElementById('solarGen');
const solarCoverage = document.getElementById('solarCoverage');
const solarSavings = document.getElementById('solarSavings');
const solarCO2 = document.getElementById('solarCO2');

let user = JSON.parse(localStorage.getItem('loggedUser'));
if(!user) window.location.href = 'index.html';
let appliances = user.appliances || [];

const tariff = 0.8;
const co2Factor = 0.233;

let chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: appliances.map(a => a.name),
        datasets: [{
            label: 'Consumo Mensal (kWh)',
            data: appliances.map(a => parseFloat(a.monthlyConsumption)),
            backgroundColor: 'rgba(253, 216, 53, 0.7)',
            borderColor: 'rgba(253, 216, 53, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
    }
});

function totalConsumption() {
    return appliances.reduce((sum,a)=>sum+parseFloat(a.monthlyConsumption||0),0);
}

function updateList() {
    list.innerHTML = '';
    appliances.forEach((a, index) => {
        const li = document.createElement('li');
        li.textContent = `${a.name} - ${parseFloat(a.monthlyConsumption).toFixed(2)} kWh/mês`;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remover';
        removeBtn.style.marginLeft = '10px';
        removeBtn.onclick = () => {
            appliances.splice(index, 1);
            user.appliances = appliances;
            localStorage.setItem('loggedUser', JSON.stringify(user));
            chart.data.labels.splice(index, 1);
            chart.data.datasets[0].data.splice(index, 1);
            chart.update();
            updateStatus();
            calculateSolar();
            updateList();
        };
        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

function updateStatus(){
    const total = totalConsumption();
    let level = '';
    if(total <= 50) level = 'BOM';
    else if(total <= 150) level = 'MÉDIO';
    else level = 'GRAVE';
    status.textContent = `Seu consumo está ${level}`;
    co2.textContent = `Impacto ambiental: ${(total*co2Factor).toFixed(2)} kg CO₂/mês`;
    const cost = total * tariff;
    finalCost.textContent = `Sua conta estimada: R$ ${cost.toFixed(2)}/mês (sem impostos)`;
}

function calculateSolar(){
    const basePanel = parseFloat(solarSelect.value);
    const qty = Math.max(1, parseInt(panelQtyInput.value || '1'));
    const systemGen = basePanel * qty;
    const total = totalConsumption();
    const usable = Math.min(systemGen, total);
    const savings = usable * tariff;
    const co2Reduction = usable * co2Factor;
    solarGen.textContent = `Geração mensal estimada do sistema: ${systemGen.toFixed(2)} kWh`;
    solarCoverage.textContent = total > 0 ? `Cobertura do consumo: ${(usable/total*100).toFixed(0)}%` : `Cobertura do consumo: 0%`;
    solarSavings.textContent = `Economia aproximada: R$ ${savings.toFixed(2)}/mês`;
    solarCO2.textContent = `Redução de CO₂: ${co2Reduction.toFixed(2)} kg/mês`;
}

updateList();
updateStatus();
calculateSolar();

form.addEventListener('submit', function(e){
    e.preventDefault();
    const select = document.getElementById('applianceName');
    const name = select.value;
    const power = parseFloat(select.selectedOptions[0].dataset.power);
    const minutes = parseFloat(document.getElementById('applianceMinutes').value);
    if(!name || isNaN(power) || isNaN(minutes) || minutes < 0) return;
    const hours = minutes / 60;
    const monthlyConsumption = power * hours * 30;
    appliances.push({name, monthlyConsumption: monthlyConsumption.toFixed(2)});
    user.appliances = appliances;
    localStorage.setItem('loggedUser', JSON.stringify(user));
    chart.data.labels.push(name);
    chart.data.datasets[0].data.push(parseFloat(monthlyConsumption.toFixed(2)));
    chart.update();
    updateStatus();
    calculateSolar();
    updateList();
    form.reset();
});

solarBtn.addEventListener('click', function(){
    calculateSolar();
});

solarSelect.addEventListener('change', calculateSolar);
panelQtyInput.addEventListener('input', calculateSolar);
