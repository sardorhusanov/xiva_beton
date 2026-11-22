const product = document.querySelector('#product');
const quantity = document.querySelector('#quantity');
const quantityLabel = document.querySelector('#quantity-label');
const address = document.querySelector('#address');
const message = document.querySelector('#message');
const status = document.querySelector('#status');
const copy = document.querySelector('#copy');
const copyFallback = document.querySelector('#copy-fallback');
copy.form.addEventListener('submit', (event) => event.preventDefault());

function updateFields() {
  const isConcrete = product.value === 'Tayyor beton';
  quantity.min = isConcrete ? '0.01' : '1';
  quantity.step = isConcrete ? '0.01' : '1';
  quantityLabel.textContent = isConcrete ? 'Hajm (m³)' : 'Miqdor (dona)';
  copy.disabled = quantity.value === '' || !quantity.validity.valid;
  copyFallback.hidden = true;
  status.textContent = '';
}

for (const field of [product, quantity, address, message]) {
  field.addEventListener('input', updateFields);
}
for (const link of document.querySelectorAll('[data-product]')) {
  link.addEventListener('click', () => {
    product.value = link.dataset.product;
    updateFields();
  });
}

copy.addEventListener('click', async () => {
  const destination = address.value.trim();
  const note = message.value.trim();
  const request = [
    'Assalomu alaykum!',
    product.value === 'Tayyor beton'
      ? `${quantity.value} m³ tayyor betonning narxi va mavjud markalarini bilmoqchiman.`
      : `${quantity.value} dona ${product.value.toLowerCase()} uchun narx va mavjud o‘lchamlarni bilmoqchiman.`,
    destination ? `Yetkazish manzili: ${destination}.` : '',
    note ? `Izoh: ${note}` : '',
  ].filter(Boolean).join('\n');

  try {
    await navigator.clipboard.writeText(request);
    status.textContent = 'So‘rov nusxalandi. Uni Instagram xabariga joylashtiring.';
  } catch {
    copyFallback.value = request;
    copyFallback.hidden = false;
    copyFallback.focus();
    copyFallback.select();
    status.textContent = 'So‘rov belgilandi. Qurilmangizdagi nusxalash buyrug‘idan foydalaning.';
  }
});
updateFields();

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');
const header = menuToggle.closest('header');
header.classList.add('has-mobile-menu');

function setMenuOpen(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
}

menuToggle.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') === 'false');
});

menu.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || menuToggle.getAttribute('aria-expanded') !== 'true') return;
  setMenuOpen(false);
  document.querySelector(link.hash)?.focus({ preventScroll: true });
});

document.addEventListener('click', (event) => {
  if (!header.contains(event.target)) setMenuOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

window.matchMedia('(max-width: 940px)').addEventListener('change', () => setMenuOpen(false));
