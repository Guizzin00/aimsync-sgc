document.addEventListener('DOMContentLoaded', () => {
    if (!ApiService.getToken()) window.location.href = 'index.html';
    
    if (localStorage.getItem('perfil') !== 'ADMIN') {
        window.location.replace('dashboard.html');
    }

    loadConfiguracao();
});

const configForm = document.getElementById('configForm');
const btnSaveConfig = document.getElementById('btnSaveConfig');
const saveStatus = document.getElementById('saveStatus');

async function loadConfiguracao() {
    try {
        const data = await ApiService.get('/configuracoes/');
        if (data && data.length > 0) {
            const config = data[0];
            document.getElementById('configId').value = config.id;
            document.getElementById('nome_loja').value = config.nome_loja;
            document.getElementById('cnpj').value = config.cnpj || '';
            document.getElementById('imposto_padrao').value = config.imposto_padrao;
            document.getElementById('mensagem_rodape').value = config.mensagem_rodape || '';
        }
    } catch (error) {
        Swal.fire('Erro', 'Não foi possível carregar as configurações.', 'error');
    }
}

configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('configId').value;
    
    const payload = {
        nome_loja: document.getElementById('nome_loja').value,
        cnpj: document.getElementById('cnpj').value,
        imposto_padrao: document.getElementById('imposto_padrao').value || 0.00,
        mensagem_rodape: document.getElementById('mensagem_rodape').value
    };

    btnSaveConfig.disabled = true;
    btnSaveConfig.textContent = 'Salvando...';
    saveStatus.textContent = '';

    try {
        if (id) {
            await ApiService.put(`/configuracoes/${id}/`, payload);
        } else {
            await ApiService.post('/configuracoes/', payload);
        }
        
        saveStatus.textContent = 'Configurações salvas com sucesso!';
        
        // Atualiza nome visualmente se mudou
        document.getElementById('sidebarLojaName').textContent = payload.nome_loja;
        
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    } catch (error) {
        Swal.fire('Erro', error.message || 'Erro ao salvar configurações.', 'error');
    } finally {
        btnSaveConfig.disabled = false;
        btnSaveConfig.textContent = 'Salvar Alterações';
    }
});
