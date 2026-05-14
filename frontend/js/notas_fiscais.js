document.addEventListener('DOMContentLoaded', () => {
    if (!ApiService.getToken()) window.location.href = 'index.html';
    loadClientes();
    loadVendas();
});

const filterForm = document.getElementById('filterForm');
const clienteSelect = document.getElementById('cliente_id');
const tableBody = document.getElementById('tableBody');
const alertContainer = document.getElementById('alertContainer');

let currentVendas = [];

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
        console.error('Erro ao carregar clientes:', error);
    }
}

async function loadVendas() {
    const dataInicio = document.getElementById('data_inicio').value;
    const dataFim = document.getElementById('data_fim').value;
    const clienteId = document.getElementById('cliente_id').value;

    let url = '/relatorios/vendas/?';
    if (dataInicio) url += `data_inicio=${dataInicio}&`;
    if (dataFim) url += `data_fim=${dataFim}&`;
    if (clienteId) url += `cliente_id=${clienteId}&`;

    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">Buscando vendas...</td></tr>`;

    try {
        const data = await ApiService.get(url);
        currentVendas = data.vendas;
        renderTable(currentVendas);
    } catch (error) {
        showAlert(error.message, 'error');
        tableBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Erro ao carregar vendas.</td></tr>`;
    }
}

function renderTable(vendas) {
    tableBody.innerHTML = '';
    
    if (!vendas || vendas.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">Nenhuma venda encontrada.</td></tr>`;
        return;
    }

    vendas.forEach(venda => {
        const clienteNome = venda.cliente_nome || `Cliente ID: ${venda.cliente}`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${venda.id}</td>
            <td>${formatDate(venda.data)}</td>
            <td>${clienteNome}</td>
            <td style="font-weight: 600;">${formatCurrency(venda.valor_total)}</td>
            <td style="text-align: center;">
                <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="gerarNota(${venda.id})">
                    Gerar Nota
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function gerarNota(vendaId) {
    const venda = currentVendas.find(v => v.id === vendaId);
    if (!venda) return;

    let itensHtml = '';
    if (venda.itens && venda.itens.length > 0) {
        venda.itens.forEach(item => {
            const subtotal = item.quantidade * item.valor_unitario;
            itensHtml += `
                <div class="nota-item">
                    <span>${item.quantidade}x ${item.produto_nome}</span>
                    <span>${formatCurrency(subtotal)}</span>
                </div>
            `;
        });
    }

    const dataEmissao = new Date(venda.data).toLocaleString('pt-BR');
    
    const htmlCupom = `
        <div class="nota-fiscal-container">
            <h3 style="text-align: center;">AIMSYNC SGC</h3>
            <p style="text-align: center;">Rua Fictícia, 123 - Centro</p>
            <p style="text-align: center;">CNPJ: 00.000.000/0001-00</p>
            <hr>
            <p><strong>CUPOM FISCAL FICTÍCIO</strong></p>
            <p>Data: ${dataEmissao}</p>
            <p>Venda #${venda.id}</p>
            <p>Cliente: ${venda.cliente_nome || 'Consumidor Final'}</p>
            <p>Vendedor: ${venda.usuario_nome || venda.usuario}</p>
            <hr>
            <p><strong>ITENS DA COMPRA:</strong></p>
            ${itensHtml}
            <hr>
            <div class="nota-item">
                <strong>TOTAL:</strong>
                <strong>${formatCurrency(venda.valor_total)}</strong>
            </div>
            <div class="nota-item">
                <span>Forma de Pagamento:</span>
                <span>${venda.forma_pagamento || '-'}</span>
            </div>
            <hr>
            <p style="text-align: center;">Obrigado pela preferência!</p>
            <p style="text-align: center; font-size: 10px;">Sistema AimSync - Sem valor fiscal real</p>
        </div>
    `;

    Swal.fire({
        html: htmlCupom,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: '🖨️ Imprimir',
        cancelButtonText: 'Fechar',
        confirmButtonColor: '#a855f7',
        cancelButtonColor: '#64748b',
        customClass: {
            popup: 'swal-wide'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Imprime apenas o conteúdo do cupom
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = htmlCupom;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Recarrega a página para restaurar os eventos e estado
        }
    });
}

filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadVendas();
});
