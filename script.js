const REQUESTS_STORAGE_KEY = 'lunchRequests';
const MEALS_STORAGE_KEY = 'lunchMealOptions';

const defaultMeals = [
  'Arroz con pollo',
  'Pasta con salsa de tomate',
  'Ensalada con proteína',
  'Opción vegetariana',
];

const form = document.querySelector('#lunch-form');
const adminForm = document.querySelector('#admin-form');
const mealSelect = document.querySelector('#meal');
const mealOptionsList = document.querySelector('#mealOptionsList');
const newMealInput = document.querySelector('#newMeal');
const requestsBody = document.querySelector('#requestsTableBody');
const studentMessage = document.querySelector('#studentMessage');
const adminMessage = document.querySelector('#adminMessage');
const clearAllBtn = document.querySelector('#clearAll');
const dateInput = document.querySelector('#date');

const today = new Date().toISOString().slice(0, 10);
dateInput.value = today;
dateInput.min = today;

const getRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const saveRequests = (requests) => {
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
};

const getMealOptions = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(MEALS_STORAGE_KEY) ?? 'null');
    if (!Array.isArray(stored) || stored.length === 0) {
      return defaultMeals;
    }
    return stored;
  } catch {
    return defaultMeals;
  }
};

const saveMealOptions = (mealOptions) => {
  localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(mealOptions));
};

const formatDate = (isoDate) => {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const renderMealOptions = () => {
  const mealOptions = getMealOptions();

  mealSelect.innerHTML = '<option value="">Selecciona una opción</option>';
  mealOptions.forEach((meal) => {
    const option = document.createElement('option');
    option.value = meal;
    option.textContent = meal;
    mealSelect.appendChild(option);
  });

  mealOptionsList.innerHTML = '';
  mealOptions.forEach((meal) => {
    const item = document.createElement('li');
    item.className = 'option-item';
    item.innerHTML = `
      <span>${meal}</span>
      <button type="button" class="small ghost" data-meal="${meal}">Eliminar</button>
    `;

    const deleteBtn = item.querySelector('button');
    deleteBtn.addEventListener('click', () => {
      const updatedMeals = getMealOptions().filter((option) => option !== meal);
      if (updatedMeals.length === 0) {
        adminMessage.textContent = 'Debe existir al menos una opción de almuerzo.';
        return;
      }
      saveMealOptions(updatedMeals);
      renderMealOptions();
      adminMessage.textContent = 'Opción eliminada correctamente.';
    });

    mealOptionsList.appendChild(item);
  });
};

const renderRequestsTable = () => {
  const requests = getRequests();
  requestsBody.innerHTML = '';

  if (requests.length === 0) {
    requestsBody.innerHTML = `
      <tr>
        <td colspan="6">No hay solicitudes todavía.</td>
      </tr>
    `;
    return;
  }

  requests.forEach((request) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${request.studentName}</td>
      <td>${request.group}</td>
      <td>${request.meal}</td>
      <td>${formatDate(request.date)}</td>
      <td>${request.allergies || '-'}</td>
      <td><button type="button" data-id="${request.id}">Eliminar</button></td>
    `;

    const deleteButton = row.querySelector('button');
    deleteButton.addEventListener('click', () => {
      const updated = getRequests().filter((item) => item.id !== request.id);
      saveRequests(updated);
      renderRequestsTable();
      studentMessage.textContent = 'Solicitud eliminada.';
    });

    requestsBody.appendChild(row);
  });
};

adminForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const newOption = newMealInput.value.trim();
  if (!newOption) {
    adminMessage.textContent = 'Ingresa un nombre válido para la opción.';
    return;
  }

  const currentOptions = getMealOptions();
  const duplicated = currentOptions.some(
    (option) => option.toLowerCase() === newOption.toLowerCase(),
  );

  if (duplicated) {
    adminMessage.textContent = 'Esa opción ya existe.';
    return;
  }

  currentOptions.push(newOption);
  saveMealOptions(currentOptions);
  renderMealOptions();
  adminForm.reset();
  adminMessage.textContent = 'Nueva opción de almuerzo agregada.';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  const newRequest = {
    id: crypto.randomUUID(),
    studentName: formData.get('studentName')?.toString().trim(),
    group: formData.get('group')?.toString().trim(),
    meal: formData.get('meal')?.toString(),
    allergies: formData.get('allergies')?.toString().trim(),
    date: formData.get('date')?.toString(),
  };

  const requests = getRequests();
  requests.push(newRequest);
  saveRequests(requests);

  renderRequestsTable();
  form.reset();
  dateInput.value = today;
  studentMessage.textContent = '¡Solicitud enviada con éxito!';
});

clearAllBtn.addEventListener('click', () => {
  saveRequests([]);
  renderRequestsTable();
  studentMessage.textContent = 'Se eliminaron todas las solicitudes.';
});

if (!localStorage.getItem(MEALS_STORAGE_KEY)) {
  saveMealOptions(defaultMeals);
}

renderMealOptions();
renderRequestsTable();
