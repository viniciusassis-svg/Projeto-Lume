
async function fetchAppliancesFromServer() {
    const res = await fetch("get_appliances.php");
    return await res.json();
}

async function addApplianceToServer(data) {
    const res = await fetch("add_appliance.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return await res.json();
}

async function deleteApplianceFromServer(id) {
    const res = await fetch("delete_appliance.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });
    return await res.json();
}




const form = document.getElementById('applianceForm');
const ctxEl = document.getElementById('consumptionChart');
let ctx = null;
if (ctxEl) ctx = ctxEl.getContext('2d');
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
if (!user && window.location.pathname.endsWith('dashboard.html'))
    window.location.href = 'index.html';


let appliances = [];
let loaded = false;



let chart = null;



async function loadInitial() {
    const serverData = await fetchAppliancesFromServer();

    appliances = serverData.map(item => ({
        id: item.id,
        name: item.name,
        monthlyConsumption: item.monthly_consumption
    }));

    initChart();
    updateList();
    updateStatus();
    calculateSolar();
    loaded = true;
}

function initChart() {
    if (!ctx) return;

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: appliances.map(a => a.name),
            datasets: [{
                label: 'Consumo Mensal (kWh)',
                data: appliances.map(a => parseFloat(a.monthlyConsumption)),
                backgroundColor: 'rgba(108,99,255,0.85)',
                borderColor: 'rgba(108,99,255,1)',
                borderWidth: 1
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

function totalConsumption() {
    return appliances.reduce((sum, a) => sum + parseFloat(a.monthlyConsumption || 0), 0);
}


function updateList() {
    if (!list) return;
    list.innerHTML = '';

    appliances.forEach((a, index) => {

        const li = document.createElement('li');
        li.className = 'appliance-item';

        const left = document.createElement('div');
        left.className = 'left';

        const nameEl = document.createElement('div');
        nameEl.className = 'name';
        nameEl.textContent = a.name;

        const metaEl = document.createElement('div');
        metaEl.className = 'meta';
        metaEl.textContent = ${parseFloat(a.monthlyConsumption).toFixed(2)} kWh/mês;

        left.appendChild(nameEl);
        left.appendChild(metaEl);

        const kwhEl = document.createElement('div');
        kwhEl.className = 'kwh';
        kwhEl.textContent = ${parseFloat(a.monthlyConsumption).toFixed(2)} kWh;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove';
        removeBtn.innerHTML = "✖";

        removeBtn.onclick = async () => {
            await deleteApplianceFromServer(a.id);
            appliances.splice(index, 1);

            if (chart) {
                chart.data.labels.splice(index, 1);
                chart.data.datasets[0].data.splice(index, 1);
                chart.update();
            }

            updateStatus();
            calculateSolar();
            updateList();
        };

        li.appendChild(left);
        li.appendChild(kwhEl);
        li.appendChild(removeBtn);

        list.appendChild(li);
    });
}



const tariff = 0.8;
const co2Factor = 0.233;

function updateStatus() {
    const total = totalConsumption();

    let level = '';
    if (total <= 50) level = 'BOM';
    else if (total <= 150) level = 'MÉDIO';
    else level = 'GRAVE';

    if (status) status.textContent = Seu consumo está ${level};
    if (co2) co2.textContent = Impacto ambiental: ${(total * co2Factor).toFixed(2)} kg CO₂/mês;

    const cost = total * tariff;
    if (finalCost) finalCost.textContent = Sua conta estimada: R$ ${cost.toFixed(2)}/mês (sem impostos);
}


function calculateSolar() {
    if (!solarSelect || !panelQtyInput) return;

    const basePanel = parseFloat(solarSelect.value);
    const qty = Math.max(1, parseInt(panelQtyInput.value || '1'));

    const systemGen = basePanel * qty;
    const total = totalConsumption();
    const usable = Math.min(systemGen, total);

    const savings = usable * tariff;
    const co2Reduction = usable * co2Factor;

    if (solarGen) solarGen.textContent = Geração mensal estimada do sistema: ${systemGen.toFixed(2)} kWh;
    if (solarCoverage) solarCoverage.textContent = total > 0 ?
        Cobertura do consumo: ${(usable / total * 100).toFixed(0)}% :
        Cobertura do consumo: 0%;

    if (solarSavings) solarSavings.textContent = Economia aproximada: R$ ${savings.toFixed(2)}/mês;
    if (solarCO2) solarCO2.textContent = Redução de CO₂: ${co2Reduction.toFixed(2)} kg/mês;
}



if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const select = document.getElementById('applianceName');
        const name = select.value;
        const power = parseFloat(select.selectedOptions[0].dataset.power);
        const minutes = parseFloat(document.getElementById('applianceMinutes').value);

        if (!name || isNaN(power) || isNaN(minutes) || minutes < 0) return;

        const hours = minutes / 60;
        const monthlyConsumption = power * hours * 30;
        const formatted = monthlyConsumption.toFixed(2);

        const saved = await addApplianceToServer({
            name,
            monthlyConsumption: formatted
        });

        if (saved.success) {
            appliances.push({
                id: saved.id,
                name,
                monthlyConsumption: formatted
            });

            if (chart) {
                chart.data.labels.push(name);
                chart.data.datasets[0].data.push(parseFloat(formatted));
                chart.update();
            }

            updateStatus();
            calculateSolar();
            updateList();
            form.reset();
        }
    });
}



if (solarBtn) solarBtn.addEventListener('click', calculateSolar);
if (solarSelect) solarSelect.addEventListener('change', calculateSolar);
if (panelQtyInput) panelQtyInput.addEventListener('input', calculateSolar);



const showSolutionContainers = () => {
    const containers = document.querySelectorAll('.dashboard-container .solution-container');
    containers.forEach((el, i) => {
        setTimeout(() => el.classList.add('show'), i * 120);
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showSolutionContainers);
} else {
    showSolutionContainers();
}



loadInitial();
document.addEventListener("DOMContentLoaded", () => {
    console.log("dashboard.js loaded");
    const btn = document.getElementById("openProfile");
    const popup = document.getElementById("profilePopup");
    const closeBtn = document.getElementById("closeProfile");
    if (!btn || !popup || !closeBtn) {
        console.log("perfil: elemento(s) de popup não encontrado(s)", { btn, popup, closeBtn });
        return;
    }
    btn.addEventListener("click", async () => {
        try {
            const res = await fetch("perfil.php");
            const data = await res.json();
            if (data && data.success) {
                document.getElementById("profileName").textContent = data.data.name || "";
                document.getElementById("profileEmail").textContent = data.data.email || "";
                document.getElementById("profileCreated").textContent = data.data.created_at || "";
            } else {
                document.getElementById("profileName").textContent = "Erro ao carregar";
                document.getElementById("profileEmail").textContent = "";
                document.getElementById("profileCreated").textContent = "";
            }
        } catch (err) {
            console.error("Erro ao buscar perfil:", err);
            document.getElementById("profileName").textContent = "Erro ao carregar";
        }
        popup.style.display = "flex";
    });
    closeBtn.addEventListener("click", () => {
        popup.style.display = "none";
    });
});