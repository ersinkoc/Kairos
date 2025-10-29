// Kairos Documentation - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize navigation
  initializeNavigation();

  // Initialize search
  initializeSearch();

  // Initialize theme
  initializeTheme();

  // Initialize interactive examples
  initializeInteractiveExamples();

  // Initialize smooth scrolling
  initializeSmoothScrolling();
});

// Navigation functionality
function initializeNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      navToggle.setAttribute('aria-expanded', isExpanded);
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav')) {
      const navMenu = document.querySelector('.nav-menu');
      const navToggle = document.querySelector('.nav-toggle');
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Highlight active navigation
  highlightActiveNavigation();
}

function highlightActiveNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .sidebar-link, .api-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || href === currentPath.split('/').pop()) {
      link.classList.add('active');
    }
  });
}

// Search functionality
function initializeSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchButton = document.querySelector('.search-button');

  if (searchInput && searchButton) {
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
}

function performSearch() {
  const searchInput = document.querySelector('.search-input');
  const query = searchInput.value.trim();

  if (query) {
    // In a real implementation, this would search the documentation
    console.log('Searching for:', query);
    // For now, just navigate to a search results page
    window.location.href = 'search.html?q=' + encodeURIComponent(query);
  }
}

// Theme functionality
function initializeTheme() {
  const themeToggle = document.querySelector('.theme-toggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Load saved theme or system preference
  loadSavedTheme();
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  updateThemeIcon(newTheme);
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = savedTheme || systemTheme;

  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');

  if (theme === 'dark') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
}

// Interactive examples
function initializeInteractiveExamples() {
  const runButtons = document.querySelectorAll('.run-example');

  runButtons.forEach(button => {
    button.addEventListener('click', function() {
      const exampleContainer = this.parentElement;
      runExample(exampleContainer);
    });
  });
}

function runExample(container) {
  const codeInput = container.querySelector('.code-input');
  const outputDiv = container.querySelector('.example-output');
  const button = container.querySelector('.run-example');

  if (!codeInput || !outputDiv) return;

  // Show loading state
  button.textContent = 'Running...';
  button.disabled = true;
  outputDiv.innerHTML = '<div class="loading">Running example...</div>';

  try {
    // In a real implementation, this would execute the code in a sandbox
    // For now, just show the code output
    const code = codeInput.value;

    // Simulate code execution with a timeout
    setTimeout(() => {
      const mockOutput = generateMockOutput(code);
      outputDiv.innerHTML = '<pre><code>' + mockOutput + '</code></pre>';
      button.textContent = 'Run Example';
      button.disabled = false;
    }, 500);

  } catch (error) {
    outputDiv.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
    button.textContent = 'Run Example';
    button.disabled = false;
  }
}

function generateMockOutput(code) {
  // Generate mock output based on code patterns
  if (code.includes('format')) {
    return '2024-06-15\nJune 15th, 2024';
  } else if (code.includes('add')) {
    return '2024-06-16';
  } else if (code.includes('isBusinessDay')) {
    return 'Is business day: true\nNext 5 business days: 2024-06-21';
  } else {
    return 'Example output:\n' + code.split('\n').slice(-2).join('\n');
  }
}

// Smooth scrolling
function initializeSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export functions for global access
window.KairosDocs = {
  toggleTheme,
  performSearch,
  runExample
};