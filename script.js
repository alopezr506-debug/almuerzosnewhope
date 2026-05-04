const USERS = [
  { studentCode: 'ADM-0001', username: 'admin', password: 'admin123', role: 'principal' },
  { studentCode: 'EST-0001', username: 'ana', password: 'ana123', role: 'student' },
  { studentCode: 'EST-0002', username: 'luis', password: 'luis123', role: 'student' },
];

const LOCATIONS = ['Kiosko de secundaria', 'Kiosko de primaria', 'Soda principal'];

const MENU = {
  lunches: ['Casado con pollo', 'Arroz con carne', 'Pasta', 'Opción vegetariana'],
  extras: ['Jugo natural', 'Empanada', 'Galletas', 'Fruta picada'],
};

const PROMO_KEY = 'app_promotions';
const FILTERS_KEY = 'app_enabled_locations';
const ORDER_COUNTER_KEY = 'app_order_counter';

const authMessage = document.querySelector('#authMessage');
const adminMessage = document.querySelector('#adminMessage');
const orderMessage = document.querySelector('#orderMessage');
const loginForm = document.querySelector('#login-form');
const promoForm = document.querySelector('#promo-form');
const filtersForm = document.querySelector('#filters-form');
const orderForm = document.querySelector('#order-form');
const adminSection = document.querySelector('#admin-section');
const orderSection = document.querySelector('#order-section');
const promotionsList = document.querySelector('#promotionsList');
const promoLocation = document.querySelector('#promoLocation');
const locationSelect = document.querySelector('#location');
const lunchSelect = document.querySelector('#lunch');
const extrasList = document.querySelector('#extrasList');
const locationToggles = document.querySelector('#locationToggles');

let currentUser = null;

const getPromotions = () => JSON.parse(localStorage.getItem(PROMO_KEY) ?? '[]');
const savePromotions = (promos) => localStorage.setItem(PROMO_KEY, JSON.stringify(promos));

const getEnabledLocations = () => {
  const defaultValue = LOCATIONS;
  const parsed = JSON.parse(localStorage.getItem(FILTERS_KEY) ?? 'null');
  if (!Array.isArray(parsed) || parsed.length === 0) return defaultValue;
  return parsed;
};
const saveEnabledLocations = (locations) => localStorage.setItem(FILTERS_KEY, JSON.stringify(locations));

const getNextOrderNumber = () => {
  const current = Number(localStorage.getItem(ORDER_COUNTER_KEY) ?? '1000') + 1;
  localStorage.setItem(ORDER_COUNTER_KEY, String(current));
  return current;
};

const renderStaticOptions = () => {
  promoLocation.innerHTML = '<option value="">Selecciona sede</option>';
  LOCATIONS.forEach((location) => {
    promoLocation.innerHTML += `<option value="${location}">${location}</option>`;
  });

  lunchSelect.innerHTML = '<option value="">Selecciona almuerzo</option>';
  MENU.lunches.forEach((item) => {
    lunchSelect.innerHTML += `<option value="${item}">${item}</option>`;
  });

  extrasList.innerHTML = '';
  MENU.extras.forEach((item) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'option-item';
    wrapper.innerHTML = `<input type="checkbox" name="extras" value="${item}" /> ${item}`;
    extrasList.appendChild(wrapper);
  });
};

const renderFilters = () => {
  const enabled = getEnabledLocations();
  locationToggles.innerHTML = '';
  LOCATIONS.forEach((location) => {
    const checked = enabled.includes(location) ? 'checked' : '';
    locationToggles.innerHTML += `
      <label class="option-item">
        <input type="checkbox" name="enabledLocations" value="${location}" ${checked} />
        ${location}
      </label>
    `;
  });

  locationSelect.innerHTML = '<option value="">Selecciona sede</option>';
  enabled.forEach((location) => {
    locationSelect.innerHTML += `<option value="${location}">${location}</option>`;
  });
};

const renderPromotions = () => {
  promotionsList.innerHTML = '';
  const promotions = getPromotions();
  if (promotions.length === 0) {
    promotionsList.innerHTML = '<li class="option-item">Sin promociones activas.</li>';
    return;
  }

  promotions.forEach((promo) => {
    const li = document.createElement('li');
    li.className = 'option-item';
    li.innerHTML = `<span>${promo.name} (${promo.discount}% en ${promo.location})</span>`;
    promotionsList.appendChild(li);
  });
};

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const studentCode = formData.get('studentCode')?.toString().trim();
  const username = formData.get('username')?.toString().trim();
  const password = formData.get('password')?.toString().trim();

  const found = USERS.find(
    (user) =>
      user.studentCode === studentCode && user.username === username && user.password === password,
  );

  if (!found) {
    authMessage.textContent = 'Credenciales inválidas. Revisa código, usuario y contraseña.';
    return;
  }

  currentUser = found;
  authMessage.textContent = `Bienvenido/a ${found.username}.`;
  orderSection.classList.remove('hidden');
  if (found.role === 'principal') {
    adminSection.classList.remove('hidden');
  }
});

promoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(promoForm);
  const name = data.get('promoName')?.toString().trim();
  const discount = Number(data.get('promoDiscount'));
  const location = data.get('promoLocation')?.toString();

  const promos = getPromotions();
  promos.push({ id: crypto.randomUUID(), name, discount, location });
  savePromotions(promos);
  renderPromotions();
  promoForm.reset();
  adminMessage.textContent = 'Promoción guardada correctamente.';
});

filtersForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const selected = Array.from(document.querySelectorAll('input[name="enabledLocations"]:checked')).map(
    (checkbox) => checkbox.value,
  );

  if (selected.length === 0) {
    adminMessage.textContent = 'Debes dejar habilitada al menos una opción de kiosko/soda.';
    return;
  }

  saveEnabledLocations(selected);
  renderFilters();
  adminMessage.textContent = 'Filtros actualizados.';
});

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!currentUser) {
    orderMessage.textContent = 'Primero debes iniciar sesión.';
    return;
  }

  const data = new FormData(orderForm);
  const location = data.get('location')?.toString();
  const lunch = data.get('lunch')?.toString();
  const paymentBox = data.get('paymentBox')?.toString();

  const extras = Array.from(document.querySelectorAll('input[name="extras"]:checked')).map(
    (checkbox) => checkbox.value,
  );

  const promo = getPromotions().find((item) => item.location === location);
  const orderNumber = getNextOrderNumber();

  orderMessage.textContent = `Completado ✅ Orden #${orderNumber}. Retira en ${location} y paga en ${paymentBox}. ${promo ? `Promoción aplicada: ${promo.name} (-${promo.discount}%).` : 'Sin promoción aplicada.'}`;
  orderForm.reset();
});

renderStaticOptions();
renderFilters();
renderPromotions();
