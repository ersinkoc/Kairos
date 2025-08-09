import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const banner = `/*!
 * Kairos v1.0.0
 * (c) ${new Date().getFullYear()} Ersin Koc
 * Released under the MIT License
 * https://github.com/ersinkoc/kairos
 */`;

export default [
  // UMD Build (Browser + Node)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/kairos.umd.js',
      format: 'umd',
      name: 'kairos',
      banner,
      sourcemap: true,
      exports: 'named',
      globals: {}
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        module: 'esnext'
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs()
    ]
  },
  
  // UMD Minified Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/kairos.umd.min.js',
      format: 'umd',
      name: 'kairos',
      banner,
      sourcemap: true,
      exports: 'named',
      globals: {}
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        module: 'esnext'
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info']
        },
        format: {
          comments: /^!/
        }
      })
    ]
  },
  
  // ESM Build (Modern Browsers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/kairos.esm.js',
      format: 'es',
      banner,
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        module: 'esnext'
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      })
    ]
  },
  
  // ESM Minified Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/kairos.esm.min.js',
      format: 'es',
      banner,
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        module: 'esnext'
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info']
        },
        format: {
          comments: /^!/
        }
      })
    ]
  },
  
  // IIFE Build (Script Tag)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/kairos.iife.js',
      format: 'iife',
      name: 'kairos',
      banner,
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        module: 'esnext'
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs()
    ]
  },
  
  // IIFE Minified Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/kairos.iife.min.js',
      format: 'iife',
      name: 'kairos',
      banner,
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        module: 'esnext'
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info']
        },
        format: {
          comments: /^!/
        }
      })
    ]
  }
];