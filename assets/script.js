const PAGE_TITLE = {
  home: 'Upcoming Concerts',
  wishlist: 'My Wishlist',
  orders: 'My Orders',
  settings: 'Settings',
};

// Objek untuk menyimpan pengaturan pengguna
let userSettings = {
  firstName: 'Kelompok',
  lastName: '7',
  emailNotifications: true,
  smsNotifications: false,
};

// Array untuk menyimpan notifikasi
let notifications = [];

// Fungsi untuk memuat notifikasi dari localStorage
function loadNotificationsFromStorage() {
  const savedNotifications = localStorage.getItem('concertHubNotifications');
  if (savedNotifications) {
    notifications = JSON.parse(savedNotifications);
  }
}

// Fungsi untuk menyimpan notifikasi ke localStorage
function saveNotificationsToStorage() {
  localStorage.setItem('concertHubNotifications', JSON.stringify(notifications));
}

// Fungsi untuk menambahkan notifikasi baru
function addNotification(type, message, concertTitle = '') {
  const notification = {
    id: Date.now() + Math.random(), // ID unik
    type: type, // Jenis notifikasi: 'wishlist_add', 'wishlist_remove', 'checkout_success', 'checkout_error'
    message: message, // Pesan notifikasi
    concertTitle: concertTitle, // Judul konser terkait
    timestamp: new Date().toLocaleString(), // Waktu notifikasi
    read: false, // Status baca
  };

  notifications.unshift(notification); // Tambahkan ke awal array

  // Simpan hanya 50 notifikasi terbaru
  if (notifications.length > 50) {
    notifications = notifications.slice(0, 50);
  }

  saveNotificationsToStorage();
  updateNotificationBadge();
}

// Fungsi untuk menandai notifikasi sebagai sudah dibaca
function markNotificationAsRead(notificationId) {
  const notification = notifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.read = true;
    saveNotificationsToStorage();
    updateNotificationBadge();
  }
}

// Fungsi untuk menandai semua notifikasi sebagai sudah dibaca
function markAllNotificationsAsRead() {
  notifications.forEach((n) => (n.read = true));
  saveNotificationsToStorage();
  updateNotificationBadge();
}

// Fungsi untuk menghapus notifikasi
function deleteNotification(notificationId) {
  notifications = notifications.filter((n) => n.id !== notificationId);
  saveNotificationsToStorage();
  updateNotificationBadge();
  renderNotifications();
}

// Fungsi untuk menghapus semua notifikasi
function clearAllNotifications() {
  notifications = [];
  saveNotificationsToStorage();
  updateNotificationBadge();
  renderNotifications();
}

// Fungsi untuk memperbarui badge notifikasi (tanda jumlah notifikasi belum dibaca)
function updateNotificationBadge() {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const badge = document.querySelector('.notification-badge');

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Fungsi untuk mendapatkan ikon notifikasi berdasarkan jenisnya
function getNotificationIcon(type) {
  switch (type) {
    case 'wishlist_add':
      return '<i class="fas fa-heart text-red-500"></i>';
    case 'wishlist_remove':
      return '<i class="far fa-heart text-gray-500"></i>';
    case 'checkout_success':
      return '<i class="fas fa-check-circle text-green-500"></i>';
    case 'checkout_error':
      return '<i class="fas fa-exclamation-circle text-red-500"></i>';
    default:
      return '<i class="fas fa-bell text-blue-500"></i>';
  }
}

// Fungsi untuk menampilkan notifikasi di UI
function renderNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  if (notifications.length === 0) {
    container.innerHTML = `
      <div class="p-4 text-center text-gray-500">
        <i class="fas fa-bell-slash text-3xl mb-2"></i>
        <p>No notifications yet</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notifications
    .map(
      (notification) => `
    <div class="notification-item p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}" 
         data-notification-id="${notification.id}">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0 mt-1">
          ${getNotificationIcon(notification.type)}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}">
            ${notification.message}
          </p>
          ${notification.concertTitle ? `<p class="text-xs text-gray-600 mt-1">${notification.concertTitle}</p>` : ''}
          <p class="text-xs text-gray-500 mt-1">${notification.timestamp}</p>
        </div>
        <div class="flex-shrink-0 flex items-center space-x-1">
          ${!notification.read ? '<span class="w-2 h-2 bg-blue-500 rounded-full"></span>' : ''}
          <button class="delete-notification-btn text-gray-400 hover:text-red-500 text-xs" 
                  data-notification-id="${notification.id}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join('');

  // Menambahkan event listener untuk tombol hapus
  container.querySelectorAll('.delete-notification-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const notificationId = parseFloat(btn.dataset.notificationId);
      deleteNotification(notificationId);
    });
  });

  // Menambahkan event listener untuk item notifikasi (tandai sebagai dibaca saat diklik)
  container.querySelectorAll('.notification-item').forEach((item) => {
    item.addEventListener('click', () => {
      const notificationId = parseFloat(item.dataset.notificationId);
      markNotificationAsRead(notificationId);
    });
  });
}

// Fungsi untuk mengatur dropdown notifikasi
function setupNotificationDropdown() {
  const bellButton = document.getElementById('notification-bell');
  const dropdown = document.getElementById('notification-dropdown');

  if (!bellButton || !dropdown) return;

  bellButton.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
    if (!dropdown.classList.contains('hidden')) {
      renderNotifications();
    }
  });

  // Menutup dropdown saat klik di luar
  document.addEventListener('click', (e) => {
    if (!bellButton.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  // Mengatur tombol hapus semua
  const clearAllBtn = document.getElementById('clear-all-notifications');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all notifications?')) {
        clearAllNotifications();
      }
    });
  }

  // Mengatur tombol tandai semua sebagai dibaca
  const markAllReadBtn = document.getElementById('mark-all-read');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      markAllNotificationsAsRead();
      renderNotifications();
    });
  }
}

// Fungsi untuk memuat pengaturan pengguna dari localStorage
function loadUserSettings() {
  const savedSettings = localStorage.getItem('concertHubUserSettings');
  if (savedSettings) {
    userSettings = { ...userSettings, ...JSON.parse(savedSettings) };
  }
}

// Fungsi untuk menyimpan pengaturan pengguna ke localStorage
function saveUserSettingsToStorage() {
  localStorage.setItem('concertHubUserSettings', JSON.stringify(userSettings));
}

// Event listener saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  loadNotificationsFromStorage(); // Memuat notifikasi pertama
  loadUserSettings();
  loadWishlistFromStorage();
  loadOrdersFromStorage();
  loadComponents();
  loadSection('home');

  // Memperbarui jumlah wishlist dan badge notifikasi setelah semua dimuat
  setTimeout(() => {
    forceUpdateWishlistCount();
    updateNotificationBadge();
  }, 200);

  setupSidebar();
});

// Fungsi untuk memuat komponen HTML
function loadComponents() {
  loadHTML('components/sidebar.html', 'sidebar-container');
  loadHTML('components/header.html', 'header-container');
}

// Fungsi untuk memuat file HTML ke dalam elemen tertentu
function loadHTML(url, elementId) {
  fetch(url)
    .then((response) => response.text())
    .then((html) => {
      document.getElementById(elementId).innerHTML = html;
      if (elementId === 'sidebar-container') {
        setupSidebar();
        updateSidebarUserName();
        setTimeout(() => {
          updateWishlistCount();
        }, 50);
      } else if (elementId === 'header-container') {
        setupHeader();
        // Mengatur sistem notifikasi setelah header dimuat
        setTimeout(() => {
          setupNotificationDropdown();
          updateNotificationBadge();
        }, 100);
      }
    });
}

// Fungsi untuk menampilkan/menyembunyikan bilah pencarian berdasarkan section
function toggleSearchBar(section) {
  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    if (section === 'settings') {
      searchContainer.style.display = 'none';
    } else {
      searchContainer.style.display = 'block';
    }
  }
}

// Fungsi untuk memuat section tertentu
function loadSection(section) {
  fetch(`section/${section}.html`)
    .then((response) => response.text())
    .then((html) => {
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = html;
      mainContent.dataset.section = section;

      updateActiveMenu(section);
      updatePageTitle(section);

      // Menyembunyikan/menampilkan bilah pencarian berdasarkan section
      toggleSearchBar(section);

      if (section === 'home') {
        renderConcerts(section);
      } else if (section === 'wishlist') {
        renderWishlist();
      } else if (section === 'orders') {
        renderOrders();
      } else if (section === 'settings') {
        setupSettings();
      }
    });
}

// Fungsi untuk memperbarui menu aktif
function updateActiveMenu(section) {
  document.querySelectorAll('[data-section]').forEach((item) => {
    item.classList.toggle('active-menu', item.dataset.section === section);
  });
}

// Fungsi untuk memperbarui judul halaman
function updatePageTitle(section) {
  const titleElement = document.getElementById('page-title');
  if (titleElement) {
    titleElement.textContent = PAGE_TITLE[section] || 'ConcertHub';
  }
}

// Fungsi untuk mengatur halaman pengaturan
function setupSettings() {
  const firstNameInput = document.getElementById('first-name-input');
  const lastNameInput = document.getElementById('last-name-input');
  const emailCheckbox = document.getElementById('email-notifications');
  const smsCheckbox = document.getElementById('sms-notifications');
  const saveButton = document.getElementById('save-settings-btn');

  if (firstNameInput) firstNameInput.value = userSettings.firstName;
  if (lastNameInput) lastNameInput.value = userSettings.lastName;
  if (emailCheckbox) emailCheckbox.checked = userSettings.emailNotifications;
  if (smsCheckbox) smsCheckbox.checked = userSettings.smsNotifications;

  if (saveButton) {
    saveButton.addEventListener('click', saveSettings);
  }
}

// Fungsi untuk menyimpan pengaturan
function saveSettings() {
  const firstNameInput = document.getElementById('first-name-input');
  const lastNameInput = document.getElementById('last-name-input');
  const emailCheckbox = document.getElementById('email-notifications');
  const smsCheckbox = document.getElementById('sms-notifications');

  if (firstNameInput) userSettings.firstName = firstNameInput.value;
  if (lastNameInput) userSettings.lastName = lastNameInput.value;
  if (emailCheckbox) userSettings.emailNotifications = emailCheckbox.checked;
  if (smsCheckbox) userSettings.smsNotifications = smsCheckbox.checked;

  saveUserSettingsToStorage();
  updateSidebarUserName();
  showSuccessMessage();
}

// Fungsi untuk memuat pesanan dari memori
function loadOrders() {
  return concertData.orders;
}

// Fungsi untuk menyimpan pesanan
function saveOrder(orderData) {
  // Membuat ID pesanan unik
  const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  const order = {
    id: orderId,
    concertId: orderData.concertId,
    concertTitle: orderData.concertTitle,
    concertDate: orderData.concertDate,
    concertLocation: orderData.concertLocation,
    quantity: orderData.quantity,
    totalPrice: orderData.totalPrice,
    customerName: orderData.customerName,
    customerEmail: orderData.customerEmail,
    orderDate: new Date().toLocaleDateString(),
    status: 'Confirmed',
  };

  concertData.orders.push(order);
  saveOrdersToStorage();
  return orderId;
}

// Fungsi untuk memperbarui nama pengguna di sidebar
function updateSidebarUserName() {
  const sidebarNameElement = document.getElementById('sidebar-user-name');
  if (sidebarNameElement) {
    sidebarNameElement.textContent = `${userSettings.firstName} ${userSettings.lastName}`;
  }
}

// Fungsi untuk menampilkan pesan sukses
function showSuccessMessage() {
  const successDiv = document.createElement('div');
  successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
  successDiv.textContent = 'Settings saved successfully!';

  document.body.appendChild(successDiv);

  setTimeout(() => {
    document.body.removeChild(successDiv);
  }, 3000);
}

// Fungsi untuk menampilkan pesanan
function renderOrders() {
  const ordersContainer = document.getElementById('orders-tbody');
  const emptyState = document.getElementById('orders-empty');

  if (!ordersContainer) return;

  const orders = concertData.orders;

  if (orders.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (ordersContainer) ordersContainer.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  ordersContainer.innerHTML = orders
    .map(
      (order) => `
    <tr>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${order.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.concertTitle}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.concertDate}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.quantity}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalPrice}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">${order.status}</span>
      </td>
    </tr>
  `
    )
    .join('');
}

// Fungsi untuk membuat kartu konser
function createConcertCard(concert, index) {
  const card = document.createElement('div');
  card.className = 'concert-card bg-white rounded-xl shadow-md overflow-hidden';
  card.dataset.id = concert.id;
  card.style.setProperty('--order', index);
  card.innerHTML = `
        <div class="relative">
            <div class="concert-images h-48 overflow-hidden relative">
                ${concert.images.map((src) => `<img src="${src}" class="absolute w-full h-full object-cover">`).join('')}
            </div>
            <div class="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                <i class="fas fa-music mr-1"></i> <span class="genre">${concert.genre}</span>
            </div>
            <button class="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md wishlist-btn">
                ${concert.wishlist ? '<i class="fas fa-heart text-red-500"></i>' : '<i class="far fa-heart"></i>'}
            </button>
            <div class="absolute bottom-2 left-0 right-0 flex justify-center space-x-1 image-dots">
                ${concert.images.map((_, i) => `<button class="image-dot w-3 h-3 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-400'}"></button>`).join('')}
            </div>
        </div>
        <div class="p-4">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg concert-title">${concert.title}</h3>
                <span class="badge ${concert.badgeClass} text-xs font-medium px-2 py-0.5 rounded">${concert.badge}</span>
            </div>
            <p class="text-gray-600 text-sm mb-3 concert-description">${concert.description}</p>
            <div class="flex items-center text-sm text-gray-500 mb-4">
                <div class="flex items-center mr-4">
                    <i class="fas fa-calendar-day mr-1"></i>
                    <span class="concert-date">${concert.date}</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    <span class="concert-location">${concert.location}</span>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <div>
                    <span class="text-sm text-gray-500">From</span>
                    <span class="font-bold text-lg concert-price">${concert.price}</span>
                </div>
                <button class="book-now-btn bg-purple-600 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-700 transition">
                    Book Now
                </button>
            </div>
        </div>
    `;

  const wishlistBtn = card.querySelector('.wishlist-btn');
  wishlistBtn.addEventListener('click', () => toggleWishlist(concert.id, wishlistBtn));

  const bookNowBtn = card.querySelector('.book-now-btn');
  bookNowBtn.addEventListener('click', () => {
    // Menyimpan data konser di session untuk checkout
    sessionStorage.setItem('selectedConcert', JSON.stringify(concert));
    // Navigasi ke halaman checkout
    loadCheckout();
  });

  setupImageSlider(card);
  return card;
}

// Fungsi untuk memuat halaman checkout
function loadCheckout() {
  fetch('section/checkout.html')
    .then((response) => response.text())
    .then((html) => {
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = html;
      mainContent.dataset.section = 'checkout';

      updatePageTitle('checkout');
      setupCheckout();
    });
}
// Fungsi untuk mengatur fungsionalitas checkout
function setupCheckout() {
  const selectedConcert = JSON.parse(sessionStorage.getItem('selectedConcert'));

  if (!selectedConcert) {
    document.getElementById('checkout-concert-info').innerHTML = '<p class="text-red-500">No concert selected.</p>';
    return;
  }

  const concertInfo = document.getElementById('checkout-concert-info');
  // Ekstrak angka dari harga (misal: "Rp 700000" menjadi 700000)
  const priceValue = parseInt(selectedConcert.price.replace(/[^\d]/g, ''), 10);

  concertInfo.innerHTML = `
    <div class="flex items-center mb-6">
        <img src="${selectedConcert.images[0]}" alt="${selectedConcert.title}" class="w-32 h-32 object-cover rounded-lg mr-6">
        <div>
            <h4 class="text-xl font-bold text-gray-900">${selectedConcert.title}</h4>
            <p class="text-gray-600 mt-1"><i class="fas fa-calendar-day mr-2"></i>${selectedConcert.date}</p>
            <p class="text-gray-600 mt-1"><i class="fas fa-map-marker-alt mr-2"></i>${selectedConcert.location}</p>
            <p class="text-gray-600 mt-2">${selectedConcert.description}</p>
        </div>
    </div>
    <div class="border-t border-gray-200 pt-4">
        <div class="flex justify-between items-center mb-3">
            <span class="text-gray-700">Ticket Price:</span>
            <span class="font-semibold">${selectedConcert.price}</span>
        </div>
        <div class="flex justify-between items-center mb-4">
            <span class="text-gray-700">Quantity:</span>
            <select id="ticket-quantity" class="form-select max-w-[80px] text-sm border border-gray-300 rounded-md px-2 py-1">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => `<option value="${q}">${q}</option>`).join('')}
            </select>
        </div>
        <div class="flex justify-between items-center font-bold border-t border-gray-200 pt-4">
            <span class="text-gray-900">Total:</span>
            <span id="checkout-total-price" class="text-xl text-indigo-600">${selectedConcert.price}</span>
        </div>
    </div>
  `;

  // Dapatkan elemen yang diperlukan
  const completePurchaseBtn = document.getElementById('complete-purchase-btn');
  const totalPriceElement = document.getElementById('checkout-total-price');
  const quantitySelect = document.getElementById('ticket-quantity');

  // Fungsi untuk memperbarui total harga
  function updateTotalPrice() {
    const quantity = parseInt(quantitySelect.value, 10);
    const total = quantity * priceValue;

    // Format ke Rupiah (Rp 2.800.000)
    const formattedTotal = 'Rp ' + total.toLocaleString('id-ID');

    // Perbarui tampilan
    totalPriceElement.textContent = formattedTotal;
    if (completePurchaseBtn) {
      completePurchaseBtn.innerHTML = `Complete Purchase (${formattedTotal})`;
    }
  }

  // Set event listener untuk perubahan quantity
  if (quantitySelect) {
    quantitySelect.addEventListener('change', updateTotalPrice);

    // Trigger perhitungan awal
    updateTotalPrice();
  }

  // Handle form submission...
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', function (e) {
      e.preventDefault();

      try {
        // Mendapatkan data formulir
        const formData = new FormData(paymentForm);
        const quantity = parseInt(quantitySelect.value, 12);
        const total = quantity * priceValue;
        const totalPrice = 'Rp ' + total.toLocaleString('id-ID');

        // Validasi field yang wajib diisi
        const fullName = formData.get('full-name');
        const email = formData.get('email');
        const cardNumber = formData.get('card-number');

        if (!fullName || !email || !cardNumber) {
          throw new Error('Please fill in all required fields');
        }

        // Proses pembayaran...
        alert(`Payment successful! Total: ${totalPrice}`);
      } catch (error) {
        alert(`Payment failed: ${error.message}`);
      }
    });
  }
}

// Fungsi untuk mengatur slider gambar pada kartu konser
function setupImageSlider(card) {
  const images = card.querySelectorAll('.concert-images img');
  const dots = card.querySelectorAll('.image-dots .image-dot');
  let currentImageIndex = 0;

  images.forEach((img, i) => {
    img.style.transform = `translateX(${i * 100}%)`;
  });

  function updateSlider() {
    images.forEach((img, i) => {
      img.style.transform = `translateX(${(i - currentImageIndex) * 100}%)`;
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('bg-white', i === currentImageIndex);
      dot.classList.toggle('bg-gray-400', i !== currentImageIndex);
    });
  }

  if (dots.length > 0) {
    dots[0].classList.add('bg-white');

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        currentImageIndex = i;
        updateSlider();
      });
    });
  }
}

// Fungsi untuk menampilkan konser
function renderConcerts(section) {
  const container = document.getElementById('concert-container');
  if (!container) return;

  container.innerHTML = '';
  const concerts = concertData[section];

  concerts.forEach((concert, index) => {
    const card = createConcertCard(concert, index);
    container.appendChild(card);
  });
}

// Fungsi untuk menambahkan/menghapus konser dari wishlist
function toggleWishlist(concertId, wishlistBtn) {
  let concert = concertData.home.find((c) => c.id === concertId);
  if (!concert) return;

  concert.wishlist = !concert.wishlist;
  wishlistBtn.innerHTML = concert.wishlist ? '<i class="fas fa-heart text-red-500"></i>' : '<i class="far fa-heart"></i>';

  // Menambahkan notifikasi
  if (concert.wishlist) {
    addNotification('wishlist_add', 'Concert added to wishlist', concert.title);
    if (!concertData.wishlist.some((c) => c.id === concertId)) {
      concertData.wishlist.push({ ...concert });
    }
  } else {
    addNotification('wishlist_remove', 'Concert removed from wishlist', concert.title);
    concertData.wishlist = concertData.wishlist.filter((c) => c.id !== concertId);
  }

  setTimeout(() => {
    updateWishlistCount();
  }, 10);

  saveWishlistToStorage();
}

// Fungsi untuk menampilkan wishlist
function renderWishlist() {
  const container = document.getElementById('wishlist-container');
  if (!container) return;

  container.innerHTML = '';

  if (concertData.wishlist.length === 0) {
    document.getElementById('wishlist-empty').classList.remove('hidden');
    return;
  }

  document.getElementById('wishlist-empty').classList.add('hidden');

  concertData.wishlist.forEach((concert, index) => {
    const card = createConcertCard(concert, index);
    container.appendChild(card);
  });
}

// Fungsi untuk menghapus konser dari wishlist
function removeFromWishlist(concertId) {
  concertData.wishlist = concertData.wishlist.filter((c) => c.id !== concertId);

  // Memperbarui status di array home
  let concert = concertData.home.find((c) => c.id === concertId);
  if (concert) concert.wishlist = false;

  setTimeout(() => {
    updateWishlistCount();
  }, 10);

  renderWishlist();
  saveWishlistToStorage();

  // Memperbarui ikon hati di home jika terlihat
  const homeCard = document.querySelector(`#home-content .concert-card[data-id="${concertId}"] .wishlist-btn`);
  if (homeCard) homeCard.innerHTML = '<i class="far fa-heart"></i>';
}

// Fungsi untuk memperbarui jumlah wishlist
function updateWishlistCount() {
  const count = concertData.wishlist.length;

  const countElement = document.getElementById('wishlist-count');
  if (countElement) {
    countElement.textContent = count > 0 ? `(${count})` : '';
  }

  // Jika elemen belum ada, tunggu sebentar dan coba lagi
  if (!countElement) {
    setTimeout(() => {
      const delayedCountElement = document.getElementById('wishlist-count');
      if (delayedCountElement) {
        delayedCountElement.textContent = count > 0 ? `(${count})` : '';
      }
    }, 100);
  }
}

// Fungsi untuk memaksa pembaruan jumlah wishlist
function forceUpdateWishlistCount() {
  // Tunggu hingga sidebar benar-benar dimuat
  const checkAndUpdate = () => {
    const countElement = document.getElementById('wishlist-count');
    if (countElement) {
      const count = concertData.wishlist.length;
      countElement.textContent = count > 0 ? `(${count})` : '';
    } else {
      // Jika masih belum ada, coba lagi setelah 100ms
      setTimeout(checkAndUpdate, 100);
    }
  };
  checkAndUpdate();
}

// Fungsi untuk mengatur sidebar
function setupSidebar() {
  document.querySelectorAll('[data-section]').forEach((item) => {
    item.addEventListener('click', function () {
      loadSection(this.dataset.section);
    });
  });

  const mobileMenuButton = document.getElementById('mobile-menu-button');
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', function () {
      document.getElementById('sidebar-container').classList.toggle('active');
    });
  }

  // Memperbarui jumlah wishlist setelah setup sidebar
  updateWishlistCount();
}

// Fungsi untuk mengatur header
function setupHeader() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const searchTerm = this.value.toLowerCase();
      filterAndRenderConcerts(searchTerm);
    });
  }
}

// Fungsi untuk memfilter dan menampilkan konser berdasarkan pencarian
function filterAndRenderConcerts(searchTerm) {
  const activeSection = document.querySelector('main').dataset.section;

  if (activeSection === 'settings') {
    return;
  }

  if (!searchTerm.trim()) {
    if (activeSection === 'home') {
      renderConcerts(activeSection);
    } else if (activeSection === 'wishlist') {
      renderWishlist();
    } else if (activeSection === 'orders') {
      renderOrders();
    }
    return;
  }

  if (activeSection === 'home') {
    const filteredConcerts = concertData.home.filter(
      (concert) => concert.title.toLowerCase().includes(searchTerm) || concert.genre.toLowerCase().includes(searchTerm) || concert.description.toLowerCase().includes(searchTerm) || concert.location.toLowerCase().includes(searchTerm)
    );
    renderConcertCards(filteredConcerts);
  } else if (activeSection === 'wishlist') {
    const filteredWishlist = concertData.wishlist.filter(
      (concert) => concert.title.toLowerCase().includes(searchTerm) || concert.genre.toLowerCase().includes(searchTerm) || concert.description.toLowerCase().includes(searchTerm) || concert.location.toLowerCase().includes(searchTerm)
    );
    renderFilteredWishlist(filteredWishlist);
  } else if (activeSection === 'orders') {
    const filteredOrders = concertData.orders.filter(
      (order) => order.concertTitle.toLowerCase().includes(searchTerm) || order.id.toLowerCase().includes(searchTerm) || order.concertLocation.toLowerCase().includes(searchTerm) || order.status.toLowerCase().includes(searchTerm)
    );
    renderFilteredOrders(filteredOrders);
  }
}

// Fungsi untuk menampilkan wishlist yang telah difilter
function renderFilteredWishlist(concerts) {
  const container = document.getElementById('wishlist-container');
  const emptyState = document.getElementById('wishlist-empty');

  if (!container) return;

  container.innerHTML = '';

  if (concerts.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  concerts.forEach((concert, index) => {
    const card = createConcertCard(concert, index);
    container.appendChild(card);
  });
}

// Fungsi untuk menampilkan pesanan yang telah difilter
function renderFilteredOrders(orders) {
  const ordersContainer = document.getElementById('orders-tbody');
  const emptyState = document.getElementById('orders-empty');

  if (!ordersContainer) return;

  if (orders.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (ordersContainer) ordersContainer.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  ordersContainer.innerHTML = orders
    .map(
      (order) => `
    <tr>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${order.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.concertTitle}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.concertDate}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.quantity}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalPrice}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">${order.status}</span>
      </td>
    </tr>
  `
    )
    .join('');
}

// Fungsi untuk menampilkan kartu konser yang telah difilter
function renderConcertCards(concerts) {
  const container = document.getElementById('concert-container');
  if (!container) return;

  container.innerHTML = '';

  concerts.forEach((concert, index) => {
    const card = createConcertCard(concert, index);
    container.appendChild(card);
  });
}

// Fungsi untuk menyimpan wishlist ke localStorage
function saveWishlistToStorage() {
  localStorage.setItem('concertHubWishlist', JSON.stringify(concertData.wishlist));
}

// Fungsi untuk memuat wishlist dari localStorage
function loadWishlistFromStorage() {
  const savedWishlist = localStorage.getItem('concertHubWishlist');
  if (savedWishlist) {
    concertData.wishlist = JSON.parse(savedWishlist);

    // Memperbarui status wishlist di array home
    concertData.wishlist.forEach((wishlistItem) => {
      const concert = concertData.home.find((c) => c.id === wishlistItem.id);
      if (concert) {
        concert.wishlist = true;
      }
    });
  }
}

// Fungsi untuk menyimpan pesanan ke localStorage
function saveOrdersToStorage() {
  localStorage.setItem('concertHubOrders', JSON.stringify(concertData.orders));
}

// fungsi untuk load orders dari localStorage
function loadOrdersFromStorage() {
  const savedOrders = localStorage.getItem('concertHubOrders');
  if (savedOrders) {
    concertData.orders = JSON.parse(savedOrders);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Get concert data from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const concertId = urlParams.get('id');

  if (concertId) {
    // Find concert in data
    const concert = concertData.home.find((c) => c.id == concertId);

    if (concert) {
      // Display concert info
      const concertInfo = document.getElementById('checkout-concert-info');
      concertInfo.innerHTML = `
                <div class="flex items-center">
                    <img src="${concert.images[0]}" alt="${concert.title}" class="w-32 h-32 object-cover rounded mr-6">
                    <div>
                        <h4 class="text-xl font-bold text-gray-900">${concert.title}</h4>
                        <p class="text-gray-600">${concert.date} at ${concert.location}</p>
                        <p class="text-gray-600 mt-2">${concert.description}</p>
                    </div>
                </div>
                <div class="mt-4 border-t border-gray-200 py-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-700">Ticket Price:</span>
                        <span class="font-semibold">${concert.price}</span>
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-700">Quantity:</span>
                        <select id="ticket-quantity" class="form-select max-w-[80px] text-sm">
                            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => `<option value="${q}">${q}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex justify-between items-center font-bold border-t border-gray-200 pt-4">
                        <span class="text-gray-900">Total:</span>
                        <span id="total-price" class="text-xl text-indigo-600">${concert.price}</span>
                    </div>
                </div>
            `;

      // Update total price when quantity changes
      document.getElementById('ticket-quantity').addEventListener('change', function () {
        const quantity = parseInt(this.value, 10);
        const price = parseFloat(concert.price.replace('$', ''));
        document.getElementById('total-price').textContent = '$' + (quantity * price).toFixed(2);
      });
    } else {
      // Handle case where concert is not found
      document.getElementById('checkout-concert-info').innerHTML = '<p class="text-red-500">Concert not found.</p>';
    }
  } else {
    // Handle case where no concert ID is provided
    document.getElementById('checkout-concert-info').innerHTML = '<p class="text-red-500">No concert selected.</p>';
  }

  // Handle form submission
  document.getElementById('payment-form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Payment successful! (This is a demo. No actual payment is processed.)');
    // In a real app, you would process payment here
  });
});
