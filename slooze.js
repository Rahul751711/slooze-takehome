// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const loginPage = $('login-page');
  const dashboardPage = $('dashboard-page');
  const loginForm = $('login-form');
  const loginError = $('login-error');
  const navMenu = $('nav-menu');
  const userInfo = $('user-info');
  const mainContent = $('main-content');
  const dashboardView = $('dashboard-view');
  const productsView = $('products-view');
  const productsList = $('products-list');
  const addProductBtn = $('add-product-btn');
  const productModal = $('product-modal');
  const modalTitle = $('modal-title');
  const productForm = $('product-form');
  const cancelModal = $('cancel-modal');
  const themeToggle = $('theme-toggle');
  const logoutBtn = $('logout-btn');

  // State
  const state = {
    user: null,
    products: JSON.parse(localStorage.getItem('slooze_products')) || [
      { id: 1, name: "Basmati Rice", category: "Rice", quantity: 500, price: 45.99 },
      { id: 2, name: "Refined Oil", category: "Oil", quantity: 8, price: 12.50 },
    ],
  };

  // Save products
  const saveProducts = () => localStorage.setItem('slooze_products', JSON.stringify(state.products));

  // Mock Users
  const users = {
    'manager@slooze.com': { password: 'manager123', role: 'Manager' },
    'keeper@slooze.com':  { password: 'keeper123',  role: 'Store Keeper' },
  };

  // Login
  loginForm.onsubmit = (e) => {
    e.preventDefault();
    const email = $('email').value.trim();
    const password = $('password').value;
    loginError.textContent = '';

    setTimeout(() => {
      const user = users[email];
      if (user && user.password === password) {
        state.user = { email, role: user.role };
        localStorage.setItem('slooze_user', JSON.stringify(state.user));
        showDashboard();
      } else {
        loginError.textContent = 'Invalid email or password';
      }
    }, 600);
  };

  // Show Dashboard
  const showDashboard = () => {
    loginPage.classList.remove('active');
    dashboardPage.classList.add('active');
    renderNav();
    renderUserInfo();
    renderProducts();
    showView('dashboard-view');
    loadTheme();
  };

  // Render Nav
  const renderNav = () => {
    navMenu.innerHTML = '';
    const items = [
      { label: 'Dashboard', id: 'dashboard-view', roles: ['Manager'] },
      { label: 'Products', id: 'products-view', roles: ['Manager', 'Store Keeper'] },
    ];
    items.forEach(item => {
      if (item.roles.includes(state.user.role)) {
        const a = document.createElement('a');
        a.href = '#'; a.textContent = item.label;
        a.onclick = () => showView(item.id);
        navMenu.appendChild(a);
      }
    });
  };

  const renderUserInfo = () => {
    userInfo.textContent = `${state.user.email} (${state.user.role})`;
  };

  const showView = (viewId) => {
    [dashboardView, productsView].forEach(v => v.classList.add('hidden'));
    $(viewId).classList.remove('hidden');
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    const link = Array.from(document.querySelectorAll('nav a')).find(a => a.textContent.includes(viewId === 'dashboard-view' ? 'Dashboard' : 'Products'));
    if (link) link.classList.add('active');
  };

  // Products
  const renderProducts = () => {
    productsList.innerHTML = '';
    state.products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-info">
          <h3>${p.name}</h3>
          <p>${p.category} • ${p.quantity} units • $${p.price}/unit</p>
        </div>
        <div class="product-actions">
          <button class="edit-btn" onclick="editProduct(${p.id})">Edit</button>
          <button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      `;
      productsList.appendChild(card);
    });
  };

  window.editProduct = (id) => openModal(state.products.find(p => p.id === id));
  window.deleteProduct = (id) => {
    if (confirm('Delete this product?')) {
      state.products = state.products.filter(p => p.id !== id);
      saveProducts();
      renderProducts();
    }
  };

  addProductBtn.onclick = () => openModal();
  cancelModal.onclick = () => productModal.classList.add('hidden');

  const openModal = (product = null) => {
    $('edit-id').value = product ? product.id : '';
    modalTitle.textContent = product ? 'Edit Product' : 'Add Product';
    $('product-name').value = product ? product.name : '';
    $('product-category').value = product ? product.category : '';
    $('product-quantity').value = product ? product.quantity : '';
    $('product-price').value = product ? product.price : '';
    productModal.classList.remove('hidden');
  };

  productForm.onsubmit = (e) => {
    e.preventDefault();
    const id = $('edit-id').value;
    const product = {
      id: id ? parseInt(id) : Date.now(),
      name: $('product-name').value,
      category: $('product-category').value,
      quantity: parseInt($('product-quantity').value),
      price: parseFloat($('product-price').value),
    };
    if (id) {
      const idx = state.products.findIndex(p => p.id === parseInt(id));
      state.products[idx] = product;
    } else {
      state.products.push(product);
    }
    saveProducts();
    productModal.classList.add('hidden');
    renderProducts();
  };

  // Theme
  const loadTheme = () => {
    const saved = localStorage.getItem('slooze_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = saved === 'dark' || (!saved && prefersDark);
    if (useDark) {
      document.documentElement.classList.add('dark');
      themeToggle.textContent = 'Light Mode';
    }
  };

  themeToggle.onclick = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('slooze_theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  };

  logoutBtn.onclick = () => {
    localStorage.removeItem('slooze_user');
    location.reload();
  };

  // Auto-login
  const savedUser = localStorage.getItem('slooze_user');
  if (savedUser) {
    state.user = JSON.parse(savedUser);
    showDashboard();
  }
});