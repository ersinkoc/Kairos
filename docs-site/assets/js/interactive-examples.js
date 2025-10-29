// Kairos Documentation - Interactive Examples

class InteractiveExampleManager {
  constructor() {
    this.examples = new Map();
    this.initializeExamples();
  }

  initializeExamples() {
    const exampleContainers = document.querySelectorAll('.interactive-example');

    exampleContainers.forEach(container => {
      const exampleId = container.getAttribute('data-example');
      if (exampleId) {
        this.examples.set(exampleId, container);
        this.setupExample(container);
      }
    });
  }

  setupExample(container) {
    const runButton = container.querySelector('.run-example');
    const codeInput = container.querySelector('.code-input');

    if (runButton && codeInput) {
      runButton.addEventListener('click', () => {
        this.runExample(container);
      });

      // Enable Ctrl+Enter to run
      codeInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          this.runExample(container);
        }
      });
    }
  }

  async runExample(container) {
    const codeInput = container.querySelector('.code-input');
    const outputDiv = container.querySelector('.example-output');
    const runButton = container.querySelector('.run-example');

    if (!codeInput || !outputDiv || !runButton) return;

    const code = codeInput.value;

    // Show loading state
    runButton.textContent = 'Running...';
    runButton.disabled = true;
    outputDiv.innerHTML = '<div class="loading">Running example...</div>';

    try {
      // Create a sandboxed execution environment
      const result = await this.executeInSandbox(code);
      this.displayOutput(outputDiv, result);
    } catch (error) {
      this.displayError(outputDiv, error);
    } finally {
      runButton.textContent = 'Run Example';
      runButton.disabled = false;
    }
  }

  async executeInSandbox(code) {
    // In a real implementation, this would use a proper sandbox
    // For demonstration, we'll parse console.log statements

    const consoleOutput = [];
    const mockConsole = {
      log: (...args) => {
        consoleOutput.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
      }
    };

    // Create a function that executes the code with the mock console
    const executeCode = new Function('console', code);
    executeCode(mockConsole);

    return {
      output: consoleOutput.join('\n'),
      success: true
    };
  }

  displayOutput(container, result) {
    if (result.output) {
      container.innerHTML = '<pre><code>' + this.escapeHtml(result.output) + '</code></pre>';
    } else {
      container.innerHTML = '<div class="no-output">No output</div>';
    }
  }

  displayError(container, error) {
    container.innerHTML = '<div class="error"><strong>Error:</strong> ' + this.escapeHtml(error.message) + '</div>';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.interactiveExamples = new InteractiveExampleManager();
});