export function initHoverGlow() {
  const buttons = document.querySelectorAll('.nav__links');

  buttons.forEach((button) => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      button.style.setProperty('--x', `${x}px`);
      button.style.setProperty('--y', `${y}px`);
    });
  });
}