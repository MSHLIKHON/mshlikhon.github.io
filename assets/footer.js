(() => {
  const clock = document.querySelector('#dhaka-time');
  if (!clock) return;
  const format = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: false
  });
  function updateClock() {
    if (document.hidden) return;
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = `${format.format(now)} BST`;
  }
  updateClock();
  setInterval(updateClock, 60000);
  document.addEventListener('visibilitychange', updateClock);
})();
