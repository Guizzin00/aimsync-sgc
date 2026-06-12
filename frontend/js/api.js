const API_BASE_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') 
    ? 'http://127.0.0.1:8000/api' 
    : '/api';

class ApiService {
  static getToken() {
    return localStorage.getItem('access_token');
  }

  static getHeaders() {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  static async handleResponse(response) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      if (typeof Swal !== 'undefined') {
          Swal.fire({
              title: 'Sessão Expirada',
              text: 'Sua sessão expirou por segurança. Faça login novamente.',
              icon: 'warning',
              confirmButtonColor: '#a855f7'
          }).then(() => {
              window.location.href = 'index.html';
          });
      } else {
          alert('Sessão expirada. Faça login novamente.');
          window.location.href = 'index.html';
      }
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMsg = data.detail || data.non_field_errors?.[0];
      
      if (!errorMsg) {
        // Se não houver detail, pode ser erro de validação em campos específicos (ex: username já existe)
        const fieldErrors = Object.entries(data)
          .filter(([key, val]) => Array.isArray(val))
          .map(([key, val]) => `${key}: ${val.join(' ')}`);
        
        if (fieldErrors.length > 0) {
          errorMsg = fieldErrors.join(' | ');
        } else {
          errorMsg = 'Ocorreu um erro na requisição.';
        }
      }
      
      throw new Error(errorMsg);
    }

    return data;
  }

  static async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async post(endpoint, body) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  static async put(endpoint, body) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  static async postFormData(endpoint, formData) {
    const token = this.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    return this.handleResponse(response);
  }

  static async putFormData(endpoint, formData) {
    const token = this.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers,
      body: formData,
    });
    return this.handleResponse(response);
  }

  static async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (response.status === 204) return null;
    return this.handleResponse(response);
  }
}

function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = 'index.html';
}

// Formatters
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
}

// --- Controle de Acesso (RBAC) ---
document.addEventListener('DOMContentLoaded', () => {
  const perfil = localStorage.getItem('perfil');
  
  // Bloqueio de URL (Redirecionamento)
  if (window.location.pathname.includes('relatorios.html') && perfil !== 'ADMIN') {
    window.location.replace('dashboard.html');
  }
});

// --- Controle de Tema ---
window.toggleTheme = function() {
  const currentTheme = localStorage.getItem('theme') || 'dark'; // Padrão é dark agora
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  if (newTheme === 'light') {
    document.documentElement.classList.add('light-theme');
  } else {
    document.documentElement.classList.remove('light-theme');
  }
  
  localStorage.setItem('theme', newTheme);
};
