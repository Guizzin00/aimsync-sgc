document.addEventListener('DOMContentLoaded', () => {
    if (!ApiService.getToken()) window.location.href = 'index.html';
    
    // Proteção Front-end Extra
    if (localStorage.getItem('perfil') !== 'DONO') {
        window.location.replace('dashboard.html');
    }

    loadUsuarios();
});

const modalOverlay = document.getElementById('modalOverlay');
const usuarioForm = document.getElementById('usuarioForm');
const usuariosTableBody = document.getElementById('usuariosTableBody');
const modalTitle = document.getElementById('modalTitle');

let usuarios = [];

async function loadUsuarios() {
    try {
        const data = await ApiService.get('/usuarios/');
        usuarios = data;
        renderTable();
    } catch (error) {
        if (error.message === 'SILENT_ERROR') return;
        Swal.fire('Erro', 'Não foi possível carregar a equipe: ' + error.message, 'error');
    }
}

function renderTable() {
    usuariosTableBody.innerHTML = '';
    
    usuarios.forEach(u => {
        const tr = document.createElement('tr');
        
        const badgeClass = u.is_active ? 'bg-success' : 'bg-danger';
        const badgeText = u.is_active ? 'Ativo' : 'Inativo';
        
        tr.innerHTML = `
            <td>${u.id}</td>
            <td><strong>${u.username}</strong></td>
            <td>${u.email}</td>
            <td>${u.perfil === 'DONO' ? '👑 Dono' : 'Atendente'}</td>
            <td><span style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; background: var(--${u.is_active ? 'success' : 'danger'}-color); color: white;">${badgeText}</span></td>
            <td>
                <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;" onclick="editUsuario(${u.id})">✏️ Editar</button>
            </td>
        `;
        usuariosTableBody.appendChild(tr);
    });
}

function openModal() {
    usuarioForm.reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('password').required = true;
    modalTitle.textContent = 'Novo Usuário';
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
}

function editUsuario(id) {
    const u = usuarios.find(x => x.id === id);
    if (!u) return;

    document.getElementById('usuarioId').value = u.id;
    document.getElementById('username').value = u.username;
    document.getElementById('email').value = u.email;
    document.getElementById('perfil').value = u.perfil;
    document.getElementById('isActive').checked = u.is_active;
    
    document.getElementById('password').required = false; // Senha não é obrigatória na edição
    
    modalTitle.textContent = 'Editar Usuário';
    modalOverlay.classList.add('active');
}

usuarioForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('usuarioId').value;
    const pwd = document.getElementById('password').value;
    
    const payload = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        perfil: document.getElementById('perfil').value,
        is_active: document.getElementById('isActive').checked
    };

    if (pwd) {
        payload.password = pwd;
    }

    try {
        if (id) {
            // Update
            await ApiService.put(`/usuarios/${id}/`, payload);
            Swal.fire('Sucesso!', 'Usuário atualizado.', 'success');
        } else {
            // Create
            await ApiService.post('/usuarios/', payload);
            Swal.fire('Sucesso!', 'Novo usuário cadastrado.', 'success');
        }
        closeModal();
        loadUsuarios();
    } catch (error) {
        if (error.message === 'SILENT_ERROR') return;
        Swal.fire('Erro', error.message || 'Erro ao salvar usuário.', 'error');
    }
});
