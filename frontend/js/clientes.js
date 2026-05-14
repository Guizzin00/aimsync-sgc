document.addEventListener('DOMContentLoaded', () => {
    if (!ApiService.getToken()) window.location.href = 'index.html';
    loadClientes();
});

const tableBody = document.getElementById('tableBody');
const modal = document.getElementById('clienteModal');
const form = document.getElementById('clienteForm');
const alertContainer = document.getElementById('alertContainer');
const modalTitle = document.getElementById('modalTitle');

let currentClientes = [];

// Máscara CPF
document.getElementById('cpf').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3}).*/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d{3}).*/, '$1.$2');
    }
    e.target.value = value;
});

// Máscara Telefone
document.getElementById('telefone').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    }
    e.target.value = value;
});

// Validação de CPF
function isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '' || cpf.length != 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(9))) return false;

    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(10))) return false;

    return true;
}

function showAlert(message, type = 'success') {
    return Swal.fire({
        title: type === 'success' ? 'Sucesso!' : 'Atenção!',
        text: message,
        icon: type,
        confirmButtonColor: '#a855f7'
    });
}

async function loadClientes() {
    try {
        const clientes = await ApiService.get('/clientes/');
        currentClientes = clientes;
        renderTable();
    } catch (error) {
        showAlert(error.message, 'error');
        tableBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Erro ao carregar clientes.</td></tr>`;
    }
}

function renderTable() {
    tableBody.innerHTML = '';
    
    if (currentClientes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">Nenhum cliente cadastrado.</td></tr>`;
        return;
    }

    currentClientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.cpf}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefone || '-'}</td>
            <td>${cliente.endereco || '-'}</td>
            <td>
                <div class="flex gap-2">
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;" onclick="editCliente(${cliente.id})">Editar</button>
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteCliente(${cliente.id})">Excluir</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function openModal(cliente = null) {
    form.reset();
    document.getElementById('clienteId').value = '';
    
    if (cliente) {
        modalTitle.textContent = 'Editar Cliente';
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('nome').value = cliente.nome;
        document.getElementById('cpf').value = cliente.cpf;
        document.getElementById('email').value = cliente.email;
        document.getElementById('telefone').value = cliente.telefone || '';
        document.getElementById('endereco').value = cliente.endereco || '';
    } else {
        modalTitle.textContent = 'Cadastrar Cliente';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

function editCliente(id) {
    const cliente = currentClientes.find(c => c.id === id);
    if (cliente) openModal(cliente);
}

async function deleteCliente(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    try {
        await ApiService.delete(`/clientes/${id}/`);
        showAlert('Cliente excluído com sucesso.');
        loadClientes();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const id = document.getElementById('clienteId').value;
    const clienteData = {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        endereco: document.getElementById('endereco').value
    };

    if (!isValidCPF(clienteData.cpf)) {
        showAlert('O CPF informado é inválido!', 'error');
        submitBtn.disabled = false;
        return;
    }

    try {
        if (id) {
            await ApiService.put(`/clientes/${id}/`, clienteData);
            showAlert('Cliente atualizado com sucesso.');
        } else {
            await ApiService.post('/clientes/', clienteData);
            showAlert('Cliente cadastrado com sucesso.');
        }
        closeModal();
        loadClientes();
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
    }
});
