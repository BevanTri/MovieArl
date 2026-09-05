document.addEventListener('contextmenu', function(e) {
  const t = e.target;
  if (t && t.closest && t.closest('img,video')) { e.preventDefault(); return false; }
  if (!t || !t.closest || !t.closest('input,textarea')) { /* allow context on inputs */ }
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I','J','C','Q'].includes(e.key.toUpperCase())) ||
      (e.ctrlKey && e.key.toUpperCase() === 'U')
  ) {
      e.preventDefault();
      return false;
  }
});
