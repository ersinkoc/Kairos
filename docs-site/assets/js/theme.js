// Kairos Documentation - Theme Management

class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.watchSystemTheme();
  }

  loadTheme() {
    const saved = localStorage.getItem('kairos-theme');
    if (saved) {
      return saved;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  saveTheme(theme) {
    localStorage.setItem('kairos-theme', theme);
    this.currentTheme = theme;
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.saveTheme(theme);
    this.updateThemeToggle(theme);
  }

  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  updateThemeToggle(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    }
  }

  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('kairos-theme')) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Make available globally
window.themeManager = themeManager;