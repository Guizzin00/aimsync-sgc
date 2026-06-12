document.addEventListener('DOMContentLoaded', () => {
    if (!ApiService.getToken()) window.location.href = 'index.html';
    loadClientes();
    loadRelatorio(); // Load initial data without filters
});

const filterForm = document.getElementById('filterForm');
const clienteSelect = document.getElementById('cliente_id');
const tableBody = document.getElementById('tableBody');
const kpiQtdVendas = document.getElementById('kpiQtdVendas');
const kpiValorTotal = document.getElementById('kpiValorTotal');
const alertContainer = document.getElementById('alertContainer');

function showAlert(message, type = 'success') {
    alertContainer.className = `alert alert-${type}`;
    alertContainer.textContent = message;
    alertContainer.classList.remove('hidden');
    setTimeout(() => alertContainer.classList.add('hidden'), 5000);
}

async function loadClientes() {
    try {
        const clientes = await ApiService.get('/clientes/');
        clientes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nome;
            clienteSelect.appendChild(option);
        });
    } catch (error) {
        if (error.message === 'SILENT_ERROR') return;
        console.error('Erro ao carregar clientes para o filtro:', error);
    }
}

async function loadRelatorio() {
    const dataInicio = document.getElementById('data_inicio').value;
    const dataFim = document.getElementById('data_fim').value;
    const clienteId = document.getElementById('cliente_id').value;

    let url = '/relatorios/vendas/?';
    if (dataInicio) url += `data_inicio=${dataInicio}&`;
    if (dataFim) url += `data_fim=${dataFim}&`;
    if (clienteId) url += `cliente_id=${clienteId}&`;

    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">Buscando relatórios...</td></tr>`;

    try {
        const data = await ApiService.get(url);
        
        kpiQtdVendas.textContent = data.total_vendas;
        kpiValorTotal.textContent = formatCurrency(data.valor_total_vendido);

        renderTable(data.vendas);
    } catch (error) {
        if (error.message === 'SILENT_ERROR') return;
        showAlert(error.message, 'error');
        tableBody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Erro ao gerar relatório.</td></tr>`;
    }
}

function renderTable(vendas) {
    tableBody.innerHTML = '';
    
    if (!vendas || vendas.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">Nenhuma venda encontrada para os filtros selecionados.</td></tr>`;
        return;
    }

    vendas.forEach(venda => {
        // Format items string
        const itensText = venda.itens ? venda.itens.map(i => `${i.quantidade}x ${i.produto_nome}`).join('<br>') : '-';
        const clienteNome = venda.cliente_nome || `Cliente ID: ${venda.cliente}`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${venda.id}</td>
            <td>${formatDate(venda.data)}</td>
            <td>${clienteNome}</td>
            <td>${venda.usuario}</td>
            <td style="font-size: 0.85rem; color: var(--text-secondary);">${itensText}</td>
            <td style="font-weight: 500;">${venda.forma_pagamento || '-'}</td>
            <td style="font-weight: 600;">${formatCurrency(venda.valor_total)}</td>
        `;
        tableBody.appendChild(tr);
    });
}

filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadRelatorio();
});
