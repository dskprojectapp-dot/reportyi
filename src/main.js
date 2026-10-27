const root = document.documentElement;

const preloadTheme = () => {
  root.style.setProperty('--bg', '#07111d');
  root.style.setProperty('--text', '#eaf2ff');
};

preloadTheme();
