document.addEventListener('DOMContentLoaded', () => {
    if (!ApiService.getToken()) window.location.href = 'index.html';
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        const data = await ApiService.get('/relatorios/vendas/');
        
        document.getElementById('dashFaturamento').textContent = formatCurrency(data.valor_total_vendido);
        document.getElementById('dashQtdVendas').textContent = data.total_vendas;

        buildCharts(data.vendas);
    } catch (error) {
        if (error.message === 'SILENT_ERROR') return;
        console.error('Erro ao carregar dashboard', error);
    }
}

function buildCharts(vendas) {
    if (!vendas || vendas.length === 0) return;

    // 1. Evolução de Vendas (Por data)
    const salesByDate = {};
    vendas.forEach(v => {
        const date = new Date(v.data).toLocaleDateString('pt-BR');
        if (!salesByDate[date]) salesByDate[date] = 0;
        salesByDate[date] += parseFloat(v.valor_total);
    });

    const dates = Object.keys(salesByDate).slice(-7); // Last 7 days with sales
    const values = dates.map(d => salesByDate[d]);

    const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesGradient = salesCtx.createLinearGradient(0, 0, 0, 400);
    salesGradient.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
    salesGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Faturamento (R$)',
                data: values,
                borderColor: '#8b5cf6',
                backgroundColor: salesGradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
            }
        }
    });

    // 2. Gráfico Auxiliar (Bolinha de BI / Doughnut)
    const productSales = {};
    vendas.forEach(v => {
        if(v.itens) {
            v.itens.forEach(item => {
                if (!productSales[item.produto_nome]) productSales[item.produto_nome] = 0;
                productSales[item.produto_nome] += item.quantidade;
            });
        }
    });

    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const modernColors = [
        'rgba(168, 85, 247, 0.9)', // Purple
        'rgba(59, 130, 246, 0.9)', // Blue
        'rgba(16, 185, 129, 0.9)', // Emerald
        'rgba(245, 158, 11, 0.9)', // Amber
        'rgba(239, 68, 68, 0.9)'   // Red
    ];

    new Chart(document.getElementById('productsChart'), {
        type: 'doughnut',
        data: {
            labels: topProducts.map(p => p[0]),
            datasets: [{
                data: topProducts.map(p => p[1]),
                backgroundColor: modernColors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#e5e7eb', padding: 20 } }
            }
        }
    });

    // 3. Gráfico Principal Alternativo (Evolução de Produtos / Linha)
    new Chart(document.getElementById('mainProductsChart'), {
        type: 'line',
        data: {
            labels: topProducts.map(p => p[0]),
            datasets: [{
                label: 'Unidades Vendidas',
                data: topProducts.map(p => p[1]),
                borderColor: '#10b981', // Emerald
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
            }
        }
    });
}

window.toggleMainChart = function(type) {
    const salesCanvas = document.getElementById('salesChart');
    const productsCanvas = document.getElementById('mainProductsChart');
    const btnSales = document.getElementById('btnShowSales');
    const btnProducts = document.getElementById('btnShowProducts');
    const title = document.getElementById('mainChartTitle');

    if (type === 'sales') {
        salesCanvas.style.display = 'block';
        productsCanvas.style.display = 'none';
        
        btnSales.className = 'btn btn-primary';
        btnProducts.className = 'btn btn-outline';
        title.textContent = 'Evolução de Vendas (Últimos Dias)';
    } else {
        salesCanvas.style.display = 'none';
        productsCanvas.style.display = 'block';
        
        btnSales.className = 'btn btn-outline';
        btnProducts.className = 'btn btn-primary';
        title.textContent = 'Desempenho de Produtos';
    }
}
