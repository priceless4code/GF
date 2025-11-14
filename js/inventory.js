// ============================================
// INVENTORY MANAGEMENT MODULE
// ============================================

let inventory = storage.get('inventory', [
  { id: 1, name: "Solar Panel 300W", category: "panels", stock: 15, minStock: 5, price: 85000, supplier: "SolarTech Ltd" },
  { id: 2, name: "Inverter 2kW", category: "inverters", stock: 3, minStock: 4, price: 120000, supplier: "PowerMax Nigeria" }
]);

const categories = [
  { value: "panels", label: "Solar Panels", icon: "☀️" },
  { value: "inverters", label: "Inverters", icon: "⚡" },
  { value: "batteries", label: "Batteries", icon: "🔋" },
  { value: "fans", label: "Solar Fans", icon: "💨" },
  { value: "street lights", label: "Street Lights", icon: "💡" },
  { value: "flood lights", label: "Flood Lights", icon: "🔦" },
  { value: "accessories", label: "Accessories", icon: "🔧" }
];

// ============================================
// LOAD INVENTORY PAGE
// ============================================
function loadInventoryPage() {
  const lowStock = inventory.filter(item => item.stock <= item.minStock && item.stock > 0);
  const outOfStock = inventory.filter(item => item.stock === 0);
  const totalValue = inventory.reduce((sum, i) => sum + (i.stock * (i.price || 0)), 0);
  
  if (lowStock.length > 0) {
    showNotification(`⚠️ ${lowStock.length} item(s) are low on stock!`, 'warning');
  }
  
  if (outOfStock.length > 0) {
    showNotification(`🚨 ${outOfStock.length} item(s) are out of stock!`, 'error');
  }

  const content = `
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h2 class="text-2xl font-bold">Inventory Management</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Total Inventory Value: <span class="font-bold text-primary text-lg">${formatNaira(totalValue)}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <button onclick="openInventoryModal()" class="bg-primary hover:bg-secondary text-white px-4 py-2 rounded transition-colors flex items-center gap-2">
          <span>➕</span> Add Product
        </button>
        <button onclick="openBulkStockModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2">
          <span>📦</span> Bulk Update
        </button>
      </div>
    </div>

    <!-- Category Overview Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      ${categories.map(cat => {
        const items = inventory.filter(i => i.category === cat.value);
        const totalStock = items.reduce((sum, i) => sum + i.stock, 0);
        const totalValue = items.reduce((sum, i) => sum + (i.stock * (i.price || 0)), 0);
        const hasLowStock = items.some(i => i.stock <= i.minStock);
        
        return `
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${hasLowStock ? 'ring-2 ring-red-400' : ''}"
               onclick="filterByCategory('${cat.value}')">
            <div class="text-center">
              <div class="text-3xl mb-2">${cat.icon}</div>
              <p class="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">${cat.label}</p>
              <p class="text-xl font-bold text-primary">${totalStock}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${formatNaira(totalValue)}</p>
              ${hasLowStock ? '<p class="text-xs text-red-600 font-bold mt-1">⚠️ Low</p>' : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Alerts Section -->
    ${outOfStock.length > 0 ? `
      <div class="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 rounded p-4 mb-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="text-2xl">🚨</span>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="font-bold text-red-800 dark:text-red-200 mb-2">Out of Stock (${outOfStock.length} items)</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              ${outOfStock.map(item => `
                <div class="flex justify-between items-center bg-white dark:bg-red-800 p-2 rounded text-sm">
                  <span class="text-red-700 dark:text-red-200 font-medium">${item.name}</span>
                  <button onclick="quickRestock(${item.id})" class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">
                    Restock
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    ` : ''}

    ${lowStock.length > 0 ? `
      <div class="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 rounded p-4 mb-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="text-2xl">⚠️</span>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Low Stock Alert (${lowStock.length} items)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              ${lowStock.map(item => `
                <div class="bg-white dark:bg-yellow-800 p-2 rounded text-sm">
                  <p class="text-yellow-700 dark:text-yellow-200 font-medium">${item.name}</p>
                  <p class="text-yellow-600 dark:text-yellow-300 text-xs">
                    Stock: <strong>${item.stock}</strong> (Min: ${item.minStock})
                  </p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Filters -->
    <div class="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <input 
        type="text" 
        id="inventory-search" 
        placeholder="🔍 Search products, supplier..." 
        class="md:col-span-2 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
      >
      <select 
        id="category-filter" 
        class="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        onchange="renderInventory()"
      >
        <option value="all">📂 All Categories</option>
        ${categories.map(cat => `<option value="${cat.value}">${cat.icon} ${cat.label}</option>`).join('')}
      </select>
      <select 
        id="stock-filter" 
        class="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        onchange="renderInventory()"
      >
        <option value="all">📊 All Stock Levels</option>
        <option value="low">⚠️ Low Stock</option>
        <option value="out">🚨 Out of Stock</option>
        <option value="available">✅ In Stock</option>
      </select>
    </div>

    <!-- Inventory Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supplier</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Price</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Min Stock</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Value</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="inventory-table-body" class="divide-y divide-gray-200 dark:divide-gray-700">
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="mt-6 flex flex-wrap gap-3">
      <button onclick="exportInventory()" class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded transition-colors flex items-center gap-2">
        <span>📥</span> Export CSV
      </button>
      <button onclick="printInventory()" class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded transition-colors flex items-center gap-2">
        <span>🖨️</span> Print Report
      </button>
      <button onclick="generateLowStockReport()" class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded transition-colors flex items-center gap-2">
        <span>📋</span> Low Stock Report
      </button>
    </div>
  `;
  
  document.getElementById('page-content').innerHTML = content;
  renderInventory();
  
  const searchInput = document.getElementById('inventory-search');
  searchInput.addEventListener('input', debounce(renderInventory, 300));
  
  setActiveLink('inventory');
}

// ============================================
// RENDER INVENTORY TABLE
// ============================================
function renderInventory() {
  const searchTerm = document.getElementById('inventory-search')?.value || '';
  const categoryFilter = document.getElementById('category-filter')?.value || 'all';
  const stockFilter = document.getElementById('stock-filter')?.value || 'all';
  
  let filtered = filterData(inventory, searchTerm, ['name', 'category', 'supplier']);
  
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(i => i.category === categoryFilter);
  }
  
  if (stockFilter !== 'all') {
    if (stockFilter === 'low') {
      filtered = filtered.filter(i => i.stock <= i.minStock && i.stock > 0);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(i => i.stock === 0);
    } else if (stockFilter === 'available') {
      filtered = filtered.filter(i => i.stock > i.minStock);
    }
  }
  
  const tbody = document.getElementById('inventory-table-body');
  
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-2">📦</div>
          <p>No products found</p>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filtered.map(item => {
    const stockStatus = item.stock === 0 ? 'text-red-600 font-bold bg-red-50 dark:bg-red-900' : 
                        item.stock <= item.minStock ? 'text-orange-600 font-bold bg-orange-50 dark:bg-orange-900' : 
                        'text-green-600 bg-green-50 dark:bg-green-900';
    const totalValue = item.stock * (item.price || 0);
    const catInfo = categories.find(c => c.value === item.category);
    
    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <td class="px-4 py-3">
          <div class="font-medium text-gray-900 dark:text-gray-100">${sanitizeInput(item.name)}</div>
          ${item.supplier ? `<div class="text-xs text-gray-500 dark:text-gray-400">Supplier: ${sanitizeInput(item.supplier)}</div>` : ''}
        </td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            ${catInfo ? catInfo.icon : ''} ${item.category}
          </span>
        </td>
        <td class="px-4 py-3 text-sm">${sanitizeInput(item.supplier || '-')}</td>
        <td class="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">
          ${formatNaira(item.price || 0)}
        </td>
        <td class="px-4 py-3 text-center">
          <span class="inline-block px-3 py-1 rounded-full text-sm font-bold ${stockStatus}">
            ${item.stock}
          </span>
        </td>
        <td class="px-4 py-3 text-center text-gray-600 dark:text-gray-400 text-sm">${item.minStock}</td>
        <td class="px-4 py-3 text-right font-bold text-primary text-lg">
          ${formatNaira(totalValue)}
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center justify-center gap-1">
            <button 
              onclick="adjustStock(${item.id}, 'in')" 
              class="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
              title="Add Stock"
            >
              <span class="text-lg">➕</span>
            </button>
            <button 
              onclick="adjustStock(${item.id}, 'out')" 
              class="p-1.5 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 rounded transition-colors"
              title="Remove Stock"
            >
              <span class="text-lg">➖</span>
            </button>
            <button 
              onclick="editInventoryItem(${item.id})" 
              class="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
              title="Edit"
            >
              <span class="text-lg">✏️</span>
            </button>
            <button 
              onclick="deleteInventoryItem(${item.id})" 
              class="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
              title="Delete"
            >
              <span class="text-lg">🗑️</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ============================================
// FILTER BY CATEGORY (Quick Filter)
// ============================================
function filterByCategory(category) {
  document.getElementById('category-filter').value = category;
  renderInventory();
}

// ============================================
// OPEN INVENTORY MODAL (Add or Edit)
// ============================================
function openInventoryModal(itemId = null) {
  const isEdit = itemId !== null;
  const item = isEdit ? inventory.find(i => i.id === itemId) : null;
  
  const modal = `
    <div id="inventory-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style="opacity: 1; transition: opacity 0.2s;">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span>${isEdit ? '✏️' : '➕'}</span>
          ${isEdit ? 'Edit Product' : 'Add New Product'}
        </h3>
        <form id="inventory-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Product Name *</label>
            <input 
              type="text" 
              id="prod-name" 
              value="${isEdit ? item.name : ''}"
              placeholder="e.g., Solar Panel 300W" 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
              required
            >
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Category *</label>
              <select 
                id="prod-category" 
                class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                required
              >
                ${categories.map(cat => `
                  <option value="${cat.value}" ${isEdit && item.category === cat.value ? 'selected' : ''}>
                    ${cat.icon} ${cat.label}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Supplier</label>
              <input 
                type="text" 
                id="prod-supplier" 
                value="${isEdit && item.supplier ? item.supplier : ''}"
                placeholder="Supplier name" 
                class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Unit Price (₦) *</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500 dark:text-gray-400 font-bold">₦</span>
              <input 
                type="number" 
                id="prod-price" 
                value="${isEdit ? item.price : ''}"
                placeholder="0.00" 
                step="0.01"
                min="0"
                class="w-full pl-8 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                required
              >
            </div>
            <p class="text-xs text-gray-500 mt-1">Enter price per unit</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Current Stock *</label>
              <input 
                type="number" 
                id="prod-stock" 
                value="${isEdit ? item.stock : ''}"
                placeholder="0" 
                min="0"
                class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Min Stock Alert *</label>
              <input 
                type="number" 
                id="prod-min" 
                value="${isEdit ? item.minStock : ''}"
                placeholder="5" 
                min="0"
                class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                required
              >
            </div>
          </div>
          <p class="text-xs text-gray-500">You'll be alerted when stock falls to or below the minimum level</p>
          
          ${isEdit && item.price && item.stock ? `
            <div class="bg-blue-50 dark:bg-blue-900 p-3 rounded">
              <p class="text-sm text-blue-800 dark:text-blue-200">
                💰 <strong>Total Value:</strong> ${formatNaira(item.price * item.stock)}
              </p>
            </div>
          ` : ''}
          
          <div class="flex justify-end space-x-2 pt-4 border-t">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors"
            >
              ${isEdit ? '💾 Update' : '➕ Add'} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.getElementById('modal-root').innerHTML = modal;
  
  const form = document.getElementById('inventory-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveInventoryItem(itemId);
  });
}

// ============================================
// SAVE INVENTORY ITEM
// ============================================
function saveInventoryItem(itemId = null) {
  const name = document.getElementById('prod-name').value.trim();
  const category = document.getElementById('prod-category').value;
  const supplier = document.getElementById('prod-supplier').value.trim();
  const price = parseFloat(document.getElementById('prod-price').value);
  const stock = parseInt(document.getElementById('prod-stock').value);
  const minStock = parseInt(document.getElementById('prod-min').value);
  
  if (!name || isNaN(price) || isNaN(stock) || isNaN(minStock)) {
    showNotification('Please fill in all required fields correctly', 'error');
    return;
  }
  
  if (price < 0 || stock < 0 || minStock < 0) {
    showNotification('Values cannot be negative', 'error');
    return;
  }
  
  const isEdit = itemId !== null;
  
  if (isEdit) {
    const index = inventory.findIndex(i => i.id === itemId);
    if (index !== -1) {
      inventory[index] = {
        ...inventory[index],
        name,
        category,
        supplier,
        price,
        stock,
        minStock,
        updatedAt: new Date().toISOString()
      };
    }
  } else {
    const newItem = {
      id: Date.now(),
      name,
      category,
      supplier,
      price,
      stock,
      minStock,
      createdAt: new Date().toISOString()
    };
    inventory.push(newItem);
  }
  
  if (storage.set('inventory', inventory)) {
    closeModal();
    loadInventoryPage(); // Reload entire page to update statistics
    showNotification(
      isEdit ? '✅ Product updated successfully!' : '✅ Product added successfully!', 
      'success'
    );
    
    // Check if newly added/updated item is low on stock
    if (stock <= minStock && stock > 0) {
      setTimeout(() => {
        showNotification(`⚠️ ${name} is low on stock!`, 'warning');
      }, 1000);
    } else if (stock === 0) {
      setTimeout(() => {
        showNotification(`🚨 ${name} is out of stock!`, 'error');
      }, 1000);
    }
  }
}

// ============================================
// ADJUST STOCK (Quick Add/Remove)
// ============================================
function adjustStock(id, type) {
  const item = inventory.find(i => i.id === id);
  if (!item) return;
  
  const actionText = type === 'in' ? 'Add' : 'Remove';
  const amount = prompt(
    `${actionText} how many units of "${item.name}"?\n\nCurrent Stock: ${item.stock} units\nUnit Price: ${formatNaira(item.price)}`,
    '1'
  );
  
  if (amount === null) return;
  
  const qty = parseInt(amount);
  if (isNaN(qty) || qty <= 0) {
    showNotification('Please enter a valid quantity', 'error');
    return;
  }
  
  if (type === 'in') {
    item.stock += qty;
    const totalCost = qty * (item.price || 0);
    showNotification(
      `✅ Added ${qty} units to ${item.name}\n💰 Value: ${formatNaira(totalCost)}`, 
      'success'
    );
  } else if (type === 'out') {
    if (item.stock < qty) {
      showNotification(`❌ Cannot remove ${qty} units. Only ${item.stock} available.`, 'error');
      return;
    }
    item.stock -= qty;
    const totalValue = qty * (item.price || 0);
    showNotification(
      `✅ Removed ${qty} units from ${item.name}\n💰 Value: ${formatNaira(totalValue)}`, 
      'info'
    );
  }
  
  item.updatedAt = new Date().toISOString();
  storage.set('inventory', inventory);
  loadInventoryPage(); // Reload to update all statistics
  
  // Alert if now low on stock or out of stock
  if (item.stock === 0) {
    setTimeout(() => {
      showNotification(`🚨 ${item.name} is now out of stock!`, 'error');
    }, 1000);
  } else if (item.stock <= item.minStock) {
    setTimeout(() => {
      showNotification(`⚠️ ${item.name} is now low on stock!`, 'warning');
    }, 1000);
  }
}

// ============================================
// QUICK RESTOCK
// ============================================
function quickRestock(id) {
  adjustStock(id, 'in');
}

// ============================================
// BULK STOCK UPDATE MODAL
// ============================================
function openBulkStockModal() {
  const modal = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style="opacity: 1; transition: opacity 0.2s;">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">📦 Bulk Stock Update</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Update stock levels for multiple products at once
        </p>
        
        <div class="space-y-3 max-h-96 overflow-y-auto mb-4">
          ${inventory.map(item => `
            <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div class="flex-1">
                <p class="font-medium">${item.name}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Current: ${item.stock} units</p>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  onclick="bulkAdjust(${item.id}, -10)" 
                  class="px-2 py-1 bg-red-200 text-red-800 rounded text-sm hover:bg-red-300"
                >-10</button>
                <button 
                  onclick="bulkAdjust(${item.id}, -1)" 
                  class="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >-1</button>
                <input
                  id="bulk-qty-${item.id}"
                  type="number"
                  value="1"
                  min="1"
                  class="w-16 px-2 py-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
                />
                <button 
                  onclick="bulkAdjust(${item.id}, 1, document.getElementById('bulk-qty-${item.id}').value)" 
                  class="px-2 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                >+1</button>
                <button 
                  onclick="bulkAdjust(${item.id}, 10)" 
                  class="px-2 py-1 bg-green-200 text-green-800 rounded text-sm hover:bg-green-300"
                >+10</button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t">
          <button 
            type="button" 
            onclick="closeModal()" 
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button 
            type="button" 
            onclick="showNotification('Bulk updates applied', 'success'); closeModal(); loadInventoryPage();" 
            class="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('modal-root').innerHTML = modal;
}