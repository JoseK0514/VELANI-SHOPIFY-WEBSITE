document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-mobile-menu]').forEach((button) => {
    button.addEventListener('click', () => {
      const nav = document.querySelector('[data-mobile-nav]');
      if (!nav) return;
      const open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
    });
  });

  document.querySelectorAll('[data-variant-select]').forEach((select) => {
    select.addEventListener('change', (event) => {
      const option = event.target.options[event.target.selectedIndex];
      const form = event.target.closest('[data-product-form]');
      if (!form) return;
      const id = form.querySelector('input[name="id"]');
      const price = form.querySelector('[data-product-price]');
      const button = form.querySelector('[name="add"]');
      if (id) id.value = option.value;
      if (price) price.textContent = option.dataset.price || '';
      if (button) {
        button.disabled = option.dataset.available !== 'true';
        button.textContent = option.dataset.available === 'true' ? 'Add to bag' : 'Sold out';
      }
    });
  });
});
