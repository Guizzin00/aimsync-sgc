document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to dashboard
    if (ApiService.getToken()) {
        window.location.href = 'dashboard.html';
    }

    const loginForm = document.getElementById('loginForm');
    const alertContainer = document.getElementById('alertContainer');

    function showAlert(message, type = 'error') {
        alertContainer.className = `alert alert-${type}`;
        alertContainer.textContent = message;
        alertContainer.classList.remove('hidden');
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Aguarde...';
        alertContainer.classList.add('hidden');

        try {
            const data = await ApiService.post('/auth/login/', { username, password });
            
            // Save tokens
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            
            // Redirect
            window.location.href = 'dashboard.html';
        } catch (error) {
            showAlert('Usuário ou senha incorretos.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar no Sistema';
        }
    });

    // --- Password Reset Logic ---
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('uid');
    const token = urlParams.get('token');

    if (uid && token) {
        // Remove token from URL to clean it up
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Prompt for new password
        Swal.fire({
            title: 'Redefinir Senha',
            text: 'Digite sua nova senha abaixo:',
            input: 'password',
            inputPlaceholder: 'Nova senha',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: false,
            confirmButtonText: 'Redefinir Senha',
            confirmButtonColor: '#a855f7',
            allowOutsideClick: false,
            preConfirm: async (newPassword) => {
                if (!newPassword || newPassword.length < 6) {
                    Swal.showValidationMessage('A senha deve ter pelo menos 6 caracteres!');
                    return false;
                }
                try {
                    const response = await ApiService.post('/auth/password-reset-confirm/', {
                        uid: uid,
                        token: token,
                        new_password: newPassword
                    });
                    return response;
                } catch (error) {
                    Swal.showValidationMessage(
                        `Erro: ${error.message || 'Link inválido ou expirado.'}`
                    );
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Sua senha foi redefinida. Você já pode fazer login.',
                    confirmButtonColor: '#a855f7'
                });
            }
        });
    }

    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: 'Esqueci a Senha',
                text: 'Digite o e-mail cadastrado na sua conta para receber o link de recuperação.',
                input: 'email',
                inputPlaceholder: 'seu_email@exemplo.com',
                showCancelButton: true,
                confirmButtonText: 'Enviar Link',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#a855f7',
                showLoaderOnConfirm: true,
                preConfirm: async (email) => {
                    if (!email) {
                        Swal.showValidationMessage('O e-mail não pode estar vazio!');
                        return false;
                    }
                    try {
                        const response = await ApiService.post('/auth/password-reset/', { email: email });
                        return response;
                    } catch (error) {
                        Swal.showValidationMessage(
                            `Erro: ${error.message || 'Erro ao processar a solicitação.'}`
                        );
                    }
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: 'E-mail Enviado!',
                        text: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação em breve. (Confira no terminal do Django!)',
                        confirmButtonColor: '#a855f7'
                    });
                }
            });
        });
    }
});
