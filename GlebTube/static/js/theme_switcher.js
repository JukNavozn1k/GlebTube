function setTheme (mode = 'auto') {
    const userMode = localStorage.getItem('mdb-theme');
    const sysMode = window.matchMedia('(prefers-color-scheme: light)').matches;
    const useSystem = mode === 'system' || (!userMode && mode === 'auto');
    const modeChosen = useSystem ? 'system' : mode === 'dark' || mode === 'light' ? mode : userMode;
  
    if (useSystem) {
      localStorage.removeItem('mdb-theme');
    } else {
      localStorage.setItem('mdb-theme', modeChosen);
    }
  
    document.documentElement.setAttribute('data-mdb-theme', useSystem ? (sysMode ? 'light' : 'dark') : modeChosen);
    // document.querySelectorAll('.mode-switch .dropdown-item').forEach(e => e.classList.remove('text-body'));
    // document.getElementById(modeChosen).classList.add('text-body');
  }
  
  setTheme();
  document.querySelectorAll('.mode-switch .dropdown-item').forEach(e => e.addEventListener('click', () => setTheme(e.id)));
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => setTheme());
  

  