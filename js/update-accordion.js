(() => {
  const modal = document.getElementById('update-modal');
  if (!modal) return;

  const items = Array.from(modal.querySelectorAll('.changelog-item'));

  const collapse = (item) => {
    const trigger = item.querySelector('.changelog-trigger');
    const panel = item.querySelector('.changelog-panel');
    if (!trigger || !panel) return;
    trigger.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  };

  const collapseAll = (except = null) => {
    items.forEach((item) => {
      if (item !== except) collapse(item);
    });
  };

  modal.addEventListener('click', (event) => {
    const closeControl = event.target.closest('[data-modal-close]');
    if (closeControl) {
      collapseAll();
      return;
    }

    const trigger = event.target.closest('.changelog-trigger');
    if (!trigger || !modal.contains(trigger)) return;

    const item = trigger.closest('.changelog-item');
    const panel = item?.querySelector('.changelog-panel');
    if (!item || !panel) return;

    const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';
    collapseAll(item);
    trigger.setAttribute('aria-expanded', String(shouldOpen));
    panel.hidden = !shouldOpen;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') collapseAll();
  });
})();
