const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

// Run the actual application handlers with a minimal DOM/storage adapter.
function boot() {
  const elements = new Map();
  function element() {
    const classes = new Set(['hidden']);
    return {
      innerHTML: '', textContent: '', data: {}, handlers: {},
      classList: {
        add: (c) => classes.add(c),
        remove: (c) => classes.delete(c),
        contains: (c) => classes.has(c),
        toggle(c, force) { if (force) classes.add(c); else classes.delete(c); },
      },
      addEventListener(type, handler) { this.handlers[type] = handler; },
      appendChild() {},
      reset() { this.data = {}; },
      submit() { this.handlers.submit({ preventDefault() {} }); },
    };
  }
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  };
  const storage = new Map();
  const context = {
    document: { querySelector: get, createElement: element,
      querySelectorAll: () => [{ value: 'Soda principal' }] },
    localStorage: { getItem: (k) => storage.get(k) ?? null,
      setItem: (k, v) => storage.set(k, v) },
    FormData: class { constructor(form) { this.data = form.data; }
      get(k) { return this.data[k] ?? null; } },
    crypto: { randomUUID: () => 'test-id' },
  };
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8'), context);
  function login(role) {
    get('#login-form').data = role === 'principal'
      ? { studentCode: 'ADM-0001', username: 'admin', password: 'admin123' }
      : role === 'student'
        ? { studentCode: 'EST-0001', username: 'ana', password: 'ana123' }
        : { studentCode: 'invalid', username: 'invalid', password: 'invalid' };
    get('#login-form').submit();
  }
  return { get, storage, login };
}

test('principal -> student hides administration and clears previous messages', () => {
  const { get, login } = boot();
  login('principal');
  assert.equal(get('#admin-section').classList.contains('hidden'), false);
  get('#adminMessage').textContent = 'Previous administrator message';
  get('#orderMessage').textContent = 'Previous order';
  login('student');
  assert.equal(get('#admin-section').classList.contains('hidden'), true);
  assert.equal(get('#order-section').classList.contains('hidden'), false);
  assert.equal(get('#adminMessage').textContent, '');
  assert.equal(get('#orderMessage').textContent, '');
});

for (const role of ['anonymous', 'student', 'principal-then-student', 'failed-login']) {
  test(role + ' cannot mutate promotions or filters through direct submissions', () => {
    const { get, storage, login } = boot();
    if (role === 'principal-then-student' || role === 'failed-login') login('principal');
    if (role === 'student' || role === 'principal-then-student') login('student');
    if (role === 'failed-login') login('invalid');
    const before = [...storage];
    get('#admin-section').classList.remove('hidden'); // Simulate revealing the DOM.
    get('#promo-form').data = { promoName: 'Unauthorized', promoDiscount: '20', promoLocation: 'Soda principal' };
    get('#promo-form').submit();
    get('#filters-form').submit();
    assert.deepEqual([...storage], before);
    assert.equal(get('#admin-section').classList.contains('hidden'), true);
    assert.match(get('#adminMessage').textContent, /Acceso denegado/);
  });
}

test('failed login revokes previous access including orders', () => {
  const { get, storage, login } = boot();
  login('principal');
  login('invalid');
  assert.equal(get('#admin-section').classList.contains('hidden'), true);
  assert.equal(get('#order-section').classList.contains('hidden'), true);
  get('#order-form').submit();
  assert.equal(storage.has('app_order_counter'), false);
});

test('principal can still save promotions and filters', () => {
  const { get, storage, login } = boot();
  login('principal');
  get('#promo-form').data = { promoName: 'Authorized', promoDiscount: '10', promoLocation: 'Soda principal' };
  get('#promo-form').submit();
  get('#filters-form').submit();
  assert.equal(JSON.parse(storage.get('app_promotions'))[0].name, 'Authorized');
  assert.deepEqual(JSON.parse(storage.get('app_enabled_locations')), ['Soda principal']);
});
