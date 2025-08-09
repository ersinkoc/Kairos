#!/usr/bin/env node

/**
 * Kairos Plugin Builder
 * Scaffolds new plugins and validates existing ones
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class PluginBuilder {
  constructor() {
    this.pluginTypes = {
      'parse': 'Parse Plugin - Handles date parsing from strings',
      'format': 'Format Plugin - Handles date formatting to strings',
      'locale': 'Locale Plugin - Provides locale-specific data and holidays',
      'holiday': 'Holiday Plugin - Calculates holidays and observances',
      'business': 'Business Plugin - Business day and fiscal calculations',
      'utility': 'Utility Plugin - General utility functions',
      'extension': 'Extension Plugin - Adds new methods to Kairos instances'
    };
  }

  async askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  async createPlugin() {
    console.log('🚀 Kairos Plugin Builder\n');
    
    // Get plugin details
    const pluginName = await this.askQuestion('Plugin name (e.g., my-custom-plugin): ');
    const pluginDescription = await this.askQuestion('Plugin description: ');
    
    // Show plugin types
    console.log('\nAvailable plugin types:');
    Object.entries(this.pluginTypes).forEach(([key, desc], index) => {
      console.log(`${index + 1}. ${key} - ${desc}`);
    });
    
    const typeChoice = await this.askQuestion('\nSelect plugin type (1-7): ');
    const pluginType = Object.keys(this.pluginTypes)[parseInt(typeChoice) - 1];
    
    if (!pluginType) {
      console.log('❌ Invalid plugin type selected');
      process.exit(1);
    }
    
    const author = await this.askQuestion('Author name: ');
    const dependencies = await this.askQuestion('Dependencies (comma-separated, optional): ');
    
    // Create plugin directory
    const pluginDir = path.join(process.cwd(), 'src', 'plugins', pluginType, pluginName);
    
    if (fs.existsSync(pluginDir)) {
      console.log(`❌ Plugin directory already exists: ${pluginDir}`);
      process.exit(1);
    }
    
    fs.mkdirSync(pluginDir, { recursive: true });
    
    // Generate plugin files
    await this.generatePluginFiles(pluginDir, {
      name: pluginName,
      description: pluginDescription,
      type: pluginType,
      author,
      dependencies: dependencies.split(',').map(d => d.trim()).filter(d => d)
    });
    
    console.log(`✅ Plugin created successfully at ${pluginDir}`);
    console.log('\nNext steps:');
    console.log('1. Implement your plugin logic in the generated files');
    console.log('2. Add tests in the tests directory');
    console.log('3. Update the main index.ts to export your plugin');
    console.log('4. Run tests to validate your plugin');
    
    rl.close();
  }

  async generatePluginFiles(pluginDir, config) {
    // Generate main plugin file
    const mainFile = this.generateMainFile(config);
    fs.writeFileSync(path.join(pluginDir, 'index.ts'), mainFile);
    
    // Generate test file
    const testFile = this.generateTestFile(config);
    const testDir = path.join(pluginDir, '__tests__');
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'index.test.ts'), testFile);
    
    // Generate README
    const readmeFile = this.generateReadme(config);
    fs.writeFileSync(path.join(pluginDir, 'README.md'), readmeFile);
    
    // Generate type definitions if needed
    if (config.type === 'locale') {
      const typesFile = this.generateLocaleTypes(config);
      fs.writeFileSync(path.join(pluginDir, 'types.ts'), typesFile);
    }
  }

  generateMainFile(config) {
    const { name, description, type, author, dependencies } = config;
    
    const template = `import type { KairosPlugin } from '../../../core/types/plugin.js';

/**
 * ${description}
 * @author ${author}
 */

export default {
  name: '${name}',
  version: '1.0.0',
  size: 512, // Estimated size in bytes
  ${dependencies.length > 0 ? `dependencies: ${JSON.stringify(dependencies)},` : ''}
  install(kairos, utils) {
    // Add instance methods
    kairos.extend({
      // Add your instance methods here
      ${this.generateSampleMethod(type)}
    });
    
    // Add static methods
    kairos.addStatic?.({
      // Add your static methods here
      ${this.generateSampleStaticMethod(type)}
    });
  }
} as KairosPlugin;`;

    return template;
  }

  generateSampleMethod(type) {
    switch (type) {
      case 'parse':
        return `parse${type.charAt(0).toUpperCase() + type.slice(1)}(format: string): any {
        // Implement your parsing logic here
        return this;
      }`;
      
      case 'format':
        return `format${type.charAt(0).toUpperCase() + type.slice(1)}(template: string): string {
        // Implement your formatting logic here
        return this.format(template);
      }`;
      
      case 'locale':
        return `getLocaleData(): any {
        // Return locale-specific data
        return {};
      }`;
      
      case 'holiday':
        return `isCustomHoliday(): boolean {
        // Check if date is a custom holiday
        return false;
      }`;
      
      case 'business':
        return `isCustomBusinessDay(): boolean {
        // Check if date is a business day according to custom rules
        return this.isBusinessDay();
      }`;
      
      default:
        return `customMethod(): any {
        // Implement your custom method here
        return this;
      }`;
    }
  }

  generateSampleStaticMethod(type) {
    switch (type) {
      case 'parse':
        return `parseCustomFormat(input: string): any {
        // Static parsing method
        return kairos(input);
      }`;
      
      case 'format':
        return `formatCustom(date: any, template: string): string {
        // Static formatting method
        return kairos(date).format(template);
      }`;
      
      default:
        return `staticMethod(): any {
        // Static method implementation
        return null;
      }`;
    }
  }

  generateTestFile(config) {
    const { name, description } = config;
    
    return `import kairos from '../../../../core/plugin-system.js';
import ${name.replace(/-/g, '')}Plugin from '../index.js';

describe('${name} Plugin', () => {
  beforeAll(() => {
    kairos.use([${name.replace(/-/g, '')}Plugin]);
  });

  test('should install plugin correctly', () => {
    expect(kairos.plugins.has('${name}')).toBe(true);
  });

  test('should add instance methods', () => {
    const instance = kairos();
    
    // Add your instance method tests here
    expect(typeof instance.customMethod).toBe('function');
  });

  test('should add static methods', () => {
    // Add your static method tests here
    expect(typeof kairos.staticMethod).toBe('function');
  });

  // Add more specific tests for your plugin functionality
  test('should handle edge cases', () => {
    // Test edge cases
    expect(true).toBe(true);
  });
});`;
  }

  generateReadme(config) {
    const { name, description, type, author } = config;
    
    return `# ${name}

${description}

## Type
${type} plugin

## Author
${author}

## Installation

\`\`\`typescript
import kairos from '@oxog/kairos';
import ${name.replace(/-/g, '')}Plugin from '@oxog/kairos/plugins/${type}/${name}';

kairos.use([${name.replace(/-/g, '')}Plugin]);
\`\`\`

## Usage

\`\`\`typescript
const date = kairos();

// Add usage examples here
\`\`\`

## API

### Instance Methods

- \`customMethod()\` - Description of the method

### Static Methods

- \`kairos.staticMethod()\` - Description of the static method

## Testing

\`\`\`bash
npm test -- --testNamePattern="${name}"
\`\`\`

## Contributing

Please read the main contributing guidelines before submitting changes.
`;
  }

  generateLocaleTypes(config) {
    return `export interface ${config.name.replace(/-/g, '')}Locale {
  name: string;
  code: string;
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
  weekdaysMin: string[];
  formats: {
    LT: string;
    LTS: string;
    L: string;
    LL: string;
    LLL: string;
    LLLL: string;
  };
  ordinal: (n: number) => string;
  meridiem?: (hour: number, minute: number, isLower: boolean) => string;
}`;
  }

  async validatePlugin(pluginPath) {
    console.log(`🔍 Validating plugin: ${pluginPath}`);
    
    try {
      const plugin = require(path.resolve(pluginPath));
      
      // Check required fields
      const requiredFields = ['name', 'install'];
      const missingFields = requiredFields.filter(field => !plugin[field]);
      
      if (missingFields.length > 0) {
        console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
        return false;
      }
      
      // Check install function
      if (typeof plugin.install !== 'function') {
        console.log('❌ Install property must be a function');
        return false;
      }
      
      // Check dependencies
      if (plugin.dependencies && !Array.isArray(plugin.dependencies)) {
        console.log('❌ Dependencies must be an array');
        return false;
      }
      
      // Check size
      if (plugin.size && typeof plugin.size !== 'number') {
        console.log('❌ Size must be a number');
        return false;
      }
      
      console.log('✅ Plugin validation passed');
      return true;
      
    } catch (error) {
      console.log(`❌ Plugin validation failed: ${error.message}`);
      return false;
    }
  }

  async listPlugins() {
    console.log('📋 Available Plugins:\n');
    
    const pluginsDir = path.join(process.cwd(), 'src', 'plugins');
    
    if (!fs.existsSync(pluginsDir)) {
      console.log('❌ Plugins directory not found');
      return;
    }
    
    const categories = fs.readdirSync(pluginsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const category of categories) {
      console.log(`\n📁 ${category.toUpperCase()}`);
      
      const categoryPath = path.join(pluginsDir, category);
      const plugins = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      if (plugins.length === 0) {
        console.log('  (no plugins)');
      } else {
        plugins.forEach(plugin => {
          console.log(`  • ${plugin}`);
        });
      }
    }
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'create':
        await this.createPlugin();
        break;
        
      case 'validate':
        const pluginPath = args[1];
        if (!pluginPath) {
          console.log('❌ Please provide plugin path');
          process.exit(1);
        }
        await this.validatePlugin(pluginPath);
        break;
        
      case 'list':
        await this.listPlugins();
        break;
        
      default:
        console.log('Kairos Plugin Builder\n');
        console.log('Usage:');
        console.log('  node plugin-builder.js create     - Create a new plugin');
        console.log('  node plugin-builder.js validate   - Validate a plugin');
        console.log('  node plugin-builder.js list       - List all plugins');
        break;
    }
    
    rl.close();
  }
}

// Run the plugin builder
const builder = new PluginBuilder();
builder.run().catch(console.error);