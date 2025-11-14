// ============================================
// DELIVERY.JS - DELIVERY TRACKING MODULE
// ============================================

let deliveries = storage.get('deliveries', []);

window.loadDeliveryPage = function() {
  const content = `
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Delivery Tracking</h2>
      <button onclick="syncDeliveriesFromSales()" class="bg-primary hover:bg-secondary text-white px-4 py-2 rounded transition-colors">
        🔄 Sync from Sales
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
        <p class="text-gray-500 dark:text-gray-400 text-sm">Pending</p>
        <p class="text-2xl font-bold text-yellow-600">${deliveries.filter(d => d.status === 'pending').length}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
        <p class="text-gray-500 dark:text-gray-400 text-sm">In Transit</p>
        <p class="text-2xl font-bold text-blue-600">${deliveries.filter(d => d.status === 'shipped').length}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
        <p class="text-gray-500 dark:text-gray-400 text-sm">Delivered</p>
        <p class="text-2xl font-bold text-green-600">${deliveries.filter(d => d.status === 'delivered').length}</p>
      </div>
    </div>

    <div class="mb-4">
      <input 
        type="text" 
        id="delivery-search" 
        placeholder="Search by customer or order..." 
        class="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
      >
    </div>

    <div class="table-container bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Courier</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody id="delivery-table-body" class="divide-y divide-gray-200 dark:divide-gray-700">
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('page-content').innerHTML = content;
  renderDeliveries();
  
  const searchInput = document.getElementById('delivery-search');
  searchInput.addEventListener('input', debounce(renderDeliveries, 300));
  
  setActiveLink('delivery');
}

function renderDeliveries() {
  const searchTerm = document.getElementById('delivery-search')?.value || '';
  let filtered = filterData(deliveries, searchTerm, ['customer', 'order']);
  
  const tbody = document.getElementById('delivery-table-body');
  
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          No deliveries found. Click "Sync from Sales" to create deliveries from sales orders.
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filtered.map(d => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    
    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <td class="px-4 py-3 font-mono text-sm">#${d.id}</td>
        <td class="px-4 py-3 font-medium">${sanitizeInput(d.customer)}</td>
        <td class="px-4 py-3">${sanitizeInput(d.order)}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded text-xs font-medium ${statusColors[d.status]}">
            ${d.status}
          </span>
        </td>
        <td class="px-4 py-3">${sanitizeInput(d.courier || '-')}</td>
        <td class="px-4 py-3">
          ${d.status === 'pending' ? `
            <button 
              onclick="updateDeliveryStatus(${d.id}, 'shipped')" 
              class="text-blue-600 hover:text-blue-800 mr-2 font-medium"
            >
              🚚 Ship
            </button>
          ` : ''}
          ${d.status === 'shipped' ? `
            <button 
              onclick="updateDeliveryStatus(${d.id}, 'delivered')" 
              class="text-green-600 hover:text-green-800 font-medium"
            >
              ✅ Deliver
            </button>
          ` : ''}
          ${d.status === 'delivered' ? `
            <span class="text-gray-400">Complete</span>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

function syncDeliveriesFromSales() {
  const sales = storage.get('sales', []);
  
  if (sales.length === 0) {
    showNotification('No sales to sync', 'error');
    return;
  }
  
  let newDeliveries = 0;
  
  sales.forEach(s => {
    // Check if delivery already exists
    const exists = deliveries.find(d => d.saleId === s.id);
    if (!exists) {
      deliveries.push({
        id: Date.now() + Math.random(),
        saleId: s.id,
        customer: s.customer,
        order: s.product,
        status: 'pending',
        courier: '',
        createdAt: new Date().toISOString()
      });
      newDeliveries++;
    }
  });
  
  if (newDeliveries > 0) {
    storage.set('deliveries', deliveries);
    renderDeliveries();
    showNotification(`Synced ${newDeliveries} new deliveries`, 'success');
  } else {
    showNotification('All deliveries are already synced', 'info');
  }
}

function updateDeliveryStatus(id, status) {
  const delivery = deliveries.find(d => d.id === id);
  if (!delivery) return;
  
  if (status === 'shipped' && !delivery.courier) {
    const courier = prompt("Enter courier/driver name:");
    if (!courier) {
      showNotification('Courier name is required', 'error');
      return;
    }
    delivery.courier = courier;
  }
  
  delivery.status = status;
  delivery.updatedAt = new Date().toISOString();
  
  storage.set('deliveries', deliveries);
  
  // Update customer status if delivered
  if (status === 'delivered') {
    const customers = storage.get('customers', []);
    const customer = customers.find(c => c.name === delivery.customer);
    if (customer) {
      customer.status = 'delivered';
      storage.set('customers', customers);
    }
  }
  
  renderDeliveries();
  showNotification(`Order marked as ${status}!`, 'success');
}

// Make functions globally available
window.syncDeliveriesFromSales = syncDeliveriesFromSales;
window.updateDeliveryStatus = updateDeliveryStatus;

// ============================================
// DASHBOARD.JS - DASHBOARD MODULE
// ============================================

