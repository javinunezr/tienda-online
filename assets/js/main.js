// Variables globales
let products = [];
let cart = [];
let filteredProducts = [];

// URLs de la API
const API_URL = 'https://fakestoreapi.com/products';

// Elementos del DOM
const productsContainer = document.getElementById('productsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicación iniciada');
    loadProducts();
    setupEventListeners();
});

/**
 * Cargar productos desde la Fake Store API
 */
async function loadProducts() {
    try {
        showLoading(true);
        hideError();
        
        console.log('Cargando productos desde la API...');
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        products = await response.json();
        filteredProducts = [...products];
        
        console.log(`Se cargaron ${products.length} productos`);
        displayProducts(filteredProducts);
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        showError();
    } finally {
        showLoading(false);
    }
}

/**
 * Mostrar productos en el contenedor
 */
function displayProducts(productsToShow) {
    productsContainer.innerHTML = '';
    
    if (productsToShow.length === 0) {
        productsContainer.innerHTML = '<div class="col-12"><p class="text-center text-muted">No se encontraron productos.</p></div>';
        return;
    }
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

/**
 * Crear tarjeta de producto
 */
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    // Truncar título si es muy largo
    const shortTitle = product.title.length > 50 ? 
        product.title.substring(0, 50) + '...' : 
        product.title;
    
    col.innerHTML = `
        <div class="card h-100 shadow-sm">
            <img src="${product.image}" class="card-img-top product-image" alt="${product.title}">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${shortTitle}</h5>
                <p class="card-text text-muted small flex-grow-1">${product.description.substring(0, 100)}...</p>
                <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-secondary">${product.category}</span>
                        <small class="text-muted">⭐ ${product.rating.rate} (${product.rating.count})</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="text-primary mb-0">$${product.price}</h5>
                        <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">
                            🛒 Agregar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Evento submit del formulario de búsqueda
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSearch();
    });
    
    // Evento input para búsqueda en tiempo real
    searchInput.addEventListener('input', function() {
        handleSearch();
    });
    
    // Eventos de categorías
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });
    
    // Evento del botón de checkout
    checkoutBtn.addEventListener('click', handleCheckout);
}

/**
 * Manejar búsqueda de productos
 */
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    console.log('Buscando:', searchTerm);
    
    if (searchTerm === '') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    displayProducts(filteredProducts);
}

/**
 * Filtrar productos por categoría
 */
function filterByCategory(category) {
    console.log('Filtrando por categoría:', category);
    
    if (category === 'clothing') {
        filteredProducts = products.filter(product => 
            product.category.includes('clothing')
        );
    } else {
        filteredProducts = products.filter(product => 
            product.category === category
        );
    }
    
    displayProducts(filteredProducts);
    
    // Limpiar búsqueda
    searchInput.value = '';
}

/**
 * Agregar producto al carrito
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        console.error('Producto no encontrado:', productId);
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    console.log('Producto agregado al carrito:', product.title);
    updateCartDisplay();
    
    // Mostrar feedback visual
    showAddToCartFeedback();
}

/**
 * Actualizar visualización del carrito
 */
function updateCartDisplay() {
    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Actualizar contenido del carrito
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-muted">Tu carrito está vacío</p>';
        cartTotal.textContent = '0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item mb-3 p-2 border rounded';
        cartItem.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover;" class="me-2">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.title.substring(0, 30)}...</h6>
                    <small class="text-muted">$${item.price} x ${item.quantity}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">
                    🗑️
                </button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toFixed(2);
    checkoutBtn.disabled = false;
}

/**
 * Remover producto del carrito
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    console.log('Producto removido del carrito');
}

/**
 * Manejar proceso de checkout
 */
function handleCheckout() {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    alert(`¡Gracias por tu compra!\nTotal: $${total.toFixed(2)}\nSerás redirigido al proceso de pago.`);
    
    // Limpiar carrito
    cart = [];
    updateCartDisplay();
    
    // Cerrar offcanvas
    const cartOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas'));
    if (cartOffcanvas) {
        cartOffcanvas.hide();
    }
}

/**
 * Mostrar feedback de agregar al carrito
 */
function showAddToCartFeedback() {
    // Crear toast notification
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    
    toastContainer.innerHTML = `
        <div class="toast show" role="alert">
            <div class="toast-header bg-success text-white">
                <strong class="me-auto">✅ Producto agregado</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                El producto se agregó correctamente al carrito.
            </div>
        </div>
    `;
    
    document.body.appendChild(toastContainer);
    
    // Remover toast después de 3 segundos
    setTimeout(() => {
        toastContainer.remove();
    }, 3000);
}

/**
 * Mostrar/ocultar spinner de carga
 */
function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

/**
 * Mostrar mensaje de error
 */
function showError() {
    errorMessage.classList.remove('d-none');
}

/**
 * Ocultar mensaje de error
 */
function hideError() {
    errorMessage.classList.add('d-none');
}