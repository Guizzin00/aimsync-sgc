document.addEventListener('DOMContentLoaded', () => {
    if (!ApiService.getToken()) window.location.href = 'index.html';
    loadDependencies();
});

const clienteSelect = document.getElementById('clienteSelect');
const productsGrid = document.getElementById('productsGrid');
const cartItemsContainer = document.getElementById('cartItems');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const searchInput = document.getElementById('searchProduct');

const totalItemsEl = document.getElementById('totalItems');
const totalValueEl = document.getElementById('totalValue');
const btnFinalizar = document.getElementById('btnFinalizar');
const alertContainer = document.getElementById('alertContainer');
const pagamentoSelect = document.getElementById('pagamentoSelect');

let clientes = [];
let produtos = [];
let carrinho = [];

function showAlert(message, type = 'success') {
    return Swal.fire({
        title: type === 'success' ? 'Sucesso!' : 'Atenção!',
        text: message,
        icon: type,
        confirmButtonColor: '#a855f7'
    });
}

async function loadDependencies() {
    try {
        const [clientesData, produtosData] = await Promise.all([
            ApiService.get('/clientes/'),
            ApiService.get('/produtos/')
        ]);
        
        clientes = clientesData;
        produtos = produtosData;

        populateClientes();
        initProductsGrid();
        renderProducts();
    } catch (error) {
        if (error.message === 'SILENT_ERROR') return;
        showAlert('Erro ao carregar dados: ' + error.message, 'error');
    }
}

function populateClientes() {
    clientes.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = `${c.nome} (${c.cpf})`;
        clienteSelect.appendChild(option);
    });
}

let productCardsCache = {}; // produto_id -> HTMLElement

function initProductsGrid() {
    productsGrid.innerHTML = '';
    productCardsCache = {};
    
    produtos.forEach(p => {
        const card = document.createElement('div');
        card.style.position = 'relative';
        
        let imageHTML = '';
        if (p.imagem) {
            const imgUrl = p.imagem.startsWith('http') || p.imagem.startsWith('data:image') 
                ? p.imagem 
                : `http://127.0.0.1:8000${p.imagem}`;
            imageHTML = `<div class="product-image" style="height: 100px; width: 100%; background-image: url('${imgUrl}'); background-size: cover; background-position: center; border-radius: 8px 8px 0 0;"></div>`;
        } else {
            const colors = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
            const colorIndex = p.nome.length % colors.length;
            const bgColor = colors[colorIndex];
            imageHTML = `
                <div class="product-image-placeholder" style="background: linear-gradient(135deg, ${bgColor}, #1e293b);">
                    ${p.nome.charAt(0).toUpperCase()}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="product-stock" id="stock-${p.id}">${p.quantidade_estoque} unid.</div>
            ${imageHTML}
            <div class="product-info">
                <div class="product-name" title="${p.nome}">${p.nome}</div>
                <div class="product-price">${formatCurrency(p.preco)}</div>
            </div>
        `;
        
        productCardsCache[p.id] = card;
        productsGrid.appendChild(card);
    });
}

function renderProducts(filterText = '') {
    const filterLower = filterText.toLowerCase();

    produtos.forEach(p => {
        const card = productCardsCache[p.id];
        if (!card) return;

        // Visibilidade
        if (p.nome.toLowerCase().includes(filterLower)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }

        // Atualizar estoque e classe disabled
        const cartItem = carrinho.find(c => c.produto_id === p.id);
        const qtyInCart = cartItem ? cartItem.quantidade : 0;
        const availableStock = p.quantidade_estoque - qtyInCart;

        card.className = `product-card ${availableStock <= 0 ? 'disabled' : ''}`;
        
        const stockEl = document.getElementById(`stock-${p.id}`);
        if (stockEl) stockEl.textContent = `${availableStock} unid.`;

        // Atualizar evento de click
        if (availableStock > 0) {
            card.onclick = () => addProductToCart(p.id);
        } else {
            card.onclick = null;
        }
    });
}

searchInput.addEventListener('input', (e) => {
    renderProducts(e.target.value);
});

// Comportamento de Leitor de Código de Barras
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const filterText = e.target.value.toLowerCase();
        if (!filterText) return;
        
        const filteredProdutos = produtos.filter(p => 
            p.nome.toLowerCase().includes(filterText) || 
            (p.codigo_barras && p.codigo_barras === filterText) // caso adicione depois
        );

        if (filteredProdutos.length === 1) {
            // Se encontrou exatamente 1 produto, bipa e adiciona ao carrinho
            const p = filteredProdutos[0];
            const cartItem = carrinho.find(c => c.produto_id === p.id);
            const qtyInCart = cartItem ? cartItem.quantidade : 0;
            const availableStock = p.quantidade_estoque - qtyInCart;
            
            if (availableStock > 0) {
                addProductToCart(p.id);
                searchInput.value = '';
                renderProducts('');
            } else {
                showAlert('Estoque insuficiente para este item!', 'error');
            }
        }
    }
});

function addProductToCart(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;

    const existingItem = carrinho.find(item => item.produto_id === produtoId);
    
    if (existingItem) {
        if (existingItem.quantidade + 1 > produto.quantidade_estoque) {
            showAlert('Estoque insuficiente!', 'error');
            return;
        }
        existingItem.quantidade += 1;
    } else {
        carrinho.push({
            produto_id: produto.id,
            nome: produto.nome,
            preco: parseFloat(produto.preco),
            quantidade: 1,
            estoque_max: produto.quantidade_estoque
        });
    }

    updateCartUI();
    renderProducts(searchInput.value);
}

function updateCartQuantity(produtoId, delta) {
    const item = carrinho.find(i => i.produto_id === produtoId);
    if (!item) return;

    const newQty = item.quantidade + delta;
    
    if (newQty <= 0) {
        carrinho = carrinho.filter(i => i.produto_id !== produtoId);
    } else if (newQty > item.estoque_max) {
        showAlert('Limite de estoque atingido', 'error');
        return;
    } else {
        item.quantidade = newQty;
    }

    updateCartUI();
    renderProducts(searchInput.value);
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    
    if (carrinho.length === 0) {
        cartItemsContainer.innerHTML = `
            <div id="emptyCartMessage" style="text-align: center; color: var(--text-secondary); margin-top: 40px;">
                Nenhum produto adicionado.
            </div>
        `;
        btnFinalizar.disabled = true;
        totalItemsEl.textContent = '0';
        totalValueEl.textContent = 'R$ 0,00';
        return;
    }

    let totalQtd = 0;
    let totalValor = 0;

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        totalQtd += item.quantidade;
        totalValor += subtotal;

        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <div class="cart-item-qty">${item.quantidade}</div>
            <div class="cart-item-info">
                <div class="cart-item-title">${item.nome}</div>
                <div class="cart-item-price">${formatCurrency(item.preco)}</div>
            </div>
            <div style="font-weight: 600; margin-right: 12px;">${formatCurrency(subtotal)}</div>
            <button class="cart-item-remove" onclick="removeItemCart(${item.produto_id})" title="Remover item">×</button>
        `;
        cartItemsContainer.appendChild(el);
    });

    totalItemsEl.textContent = totalQtd;
    totalValueEl.textContent = formatCurrency(totalValor);
    btnFinalizar.disabled = false;
}

function clearCart() {
    if (carrinho.length === 0) return;
    
    Swal.fire({
        title: 'Limpar Carrinho?',
        text: 'Todos os itens serão removidos.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sim, limpar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            carrinho = [];
            updateCartUI();
            renderProducts(searchInput.value);
        }
    });
}

function removeItemCart(produtoId) {
    carrinho = carrinho.filter(i => i.produto_id !== produtoId);
    updateCartUI();
    renderProducts(searchInput.value);
}

async function finalizarVenda(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const clienteId = parseInt(clienteSelect.value);
    
    if (!clienteId) {
        showAlert('Por favor, selecione um cliente antes de finalizar.', 'error');
        clienteSelect.focus();
        return;
    }

    if (carrinho.length === 0) return;

    // Ask for payment method using SweetAlert
    const { value: formaPagamento, isConfirmed } = await Swal.fire({
        title: 'Forma de Pagamento',
        text: 'Selecione a forma de pagamento para concluir a venda',
        input: 'select',
        inputOptions: {
            'CREDITO': 'Cartão de Crédito',
            'DEBITO': 'Cartão de Débito',
            'PIX': 'PIX',
            'DINHEIRO': 'Dinheiro'
        },
        inputPlaceholder: 'Selecione...',
        showCancelButton: true,
        confirmButtonText: 'Finalizar Venda',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#64748b',
        inputValidator: (value) => {
            return new Promise((resolve) => {
                if (value) {
                    resolve();
                } else {
                    resolve('Você precisa selecionar uma forma de pagamento!');
                }
            });
        }
    });

    if (!isConfirmed || !formaPagamento) return;

    const payload = {
        cliente_id: clienteId,
        forma_pagamento: formaPagamento,
        itens: carrinho.map(item => ({
            produto_id: item.produto_id,
            quantidade: item.quantidade
        }))
    };

    try {
        btnFinalizar.textContent = 'Processando...';
        btnFinalizar.disabled = true;

        // Simula processamento
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envia venda
        await ApiService.post('/vendas/', payload);

        // Atualiza botão
        btnFinalizar.textContent = 'Aprovado!';

        // Mostra alerta E ESPERA o usuário clicar em "OK"
        Swal.fire({
            title: 'Sucesso!',
            text: 'Venda concluída com sucesso!',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#a855f7',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                carrinho = [];
                clienteSelect.value = '';
                searchInput.value = '';
                updateCartUI();

                try {
                    const produtosData = await ApiService.get('/produtos/');
                    produtos = produtosData;
                    renderProducts();
                } catch (err) {
                    console.error('Erro ao atualizar produtos:', err);
                }

                btnFinalizar.textContent = 'Ir para pagamento >';
                btnFinalizar.disabled = true;
            }
        });

    } catch (error) {
        if (error.message === 'SILENT_ERROR') return;
        showAlert('Erro ao processar venda: ' + error.message, 'error');
        btnFinalizar.textContent = 'Ir para pagamento >';
        btnFinalizar.disabled = false;
    }
}

if (btnFinalizar) {
    btnFinalizar.addEventListener('click', finalizarVenda);
}
