document.addEventListener('DOMContentLoaded', () => {
    if (!ApiService.getToken()) window.location.href = 'index.html';
    loadProdutos();
});

const tableBody = document.getElementById('tableBody');
const modal = document.getElementById('produtoModal');
const form = document.getElementById('produtoForm');
const alertContainer = document.getElementById('alertContainer');
const modalTitle = document.getElementById('modalTitle');

let currentProdutos = [];

// Máscara de Preço (R$ 0,00)
document.getElementById('preco').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove everything except digits
    if (!value) {
        e.target.value = '';
        return;
    }
    value = (parseInt(value, 10) / 100).toFixed(2); // Convert to float with 2 decimal places
    
    // Format as Brazillian currency without R$ symbol (e.target.value should just be visually friendly or we can keep it standard)
    // Actually, simple standard number input masking:
    e.target.value = value.replace('.', ',');
});

function showAlert(message, type = 'success') {
    return Swal.fire({
        title: type === 'success' ? 'Sucesso!' : 'Atenção!',
        text: message,
        icon: type,
        confirmButtonColor: '#a855f7'
    });
}

async function loadProdutos() {
    try {
        const produtos = await ApiService.get('/produtos/');
        currentProdutos = produtos;
        renderTable();
    } catch (error) {
        showAlert(error.message, 'error');
        tableBody.innerHTML = `<tr><td colspan="4" class="text-danger text-center">Erro ao carregar produtos.</td></tr>`;
    }
}

function renderTable() {
    tableBody.innerHTML = '';
    
    if (currentProdutos.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">Nenhum produto cadastrado no estoque.</td></tr>`;
        return;
    }

    currentProdutos.forEach(produto => {
        // Highlight low stock
        const stockStyle = produto.quantidade_estoque < 5 ? 'color: var(--danger-color); font-weight: bold;' : '';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div>${produto.nome}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${produto.descricao || ''}</div>
            </td>
            <td>${formatCurrency(produto.preco)}</td>
            <td style="${stockStyle}">${produto.quantidade_estoque} unid.</td>
            <td>
                <div class="flex gap-2">
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;" onclick="editProduto(${produto.id})">Editar</button>
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" data-admin-only onclick="deleteProduto(${produto.id})">Excluir</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function openModal(produto = null) {
    form.reset();
    document.getElementById('produtoId').value = '';
    
    if (produto) {
        modalTitle.textContent = 'Editar Produto';
        document.getElementById('produtoId').value = produto.id;
        document.getElementById('nome').value = produto.nome;
        document.getElementById('descricao').value = produto.descricao || '';
        document.getElementById('preco').value = parseFloat(produto.preco).toFixed(2).replace('.', ',');
        document.getElementById('quantidade_estoque').value = produto.quantidade_estoque;
    } else {
        modalTitle.textContent = 'Cadastrar Produto';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

function editProduto(id) {
    const produto = currentProdutos.find(p => p.id === id);
    if (produto) openModal(produto);
}

async function deleteProduto(id) {
    const result = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Deseja realmente excluir este produto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#a855f7',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;
    
    try {
        await ApiService.delete(`/produtos/${id}/`);
        showAlert('Produto excluído com sucesso.');
        loadProdutos();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const id = document.getElementById('produtoId').value;
    const rawPreco = document.getElementById('preco').value.replace(',', '.');
    
    const formData = new FormData();
    formData.append('nome', document.getElementById('nome').value);
    formData.append('descricao', document.getElementById('descricao').value);
    formData.append('preco', parseFloat(rawPreco) || 0);
    formData.append('quantidade_estoque', parseInt(document.getElementById('quantidade_estoque').value, 10));
    
    const imagemInput = document.getElementById('imagem');
    if (imagemInput.files.length > 0) {
        formData.append('imagem', imagemInput.files[0]);
    }

    try {
        if (id) {
            await ApiService.putFormData(`/produtos/${id}/`, formData);
            showAlert('Produto atualizado com sucesso.');
        } else {
            await ApiService.postFormData('/produtos/', formData);
            showAlert('Produto cadastrado com sucesso.');
        }
        closeModal();
        loadProdutos();
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
    }
});
