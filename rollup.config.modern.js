import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const banner = `/*!
 * Kairos v1.1.0
 * (c) ${new Date().getFullYear()} Ersin Koc
 * Released under the MIT License
 * https://github.com/ersinkoc/kairos
 */`;

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const commonPlugins = [
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    declarationMap: false,
    module: 'esnext',
    sourceMap: true,
    inlineSources: false
  }),
  resolve({
    browser: true,
    preferBuiltins: false,
    preferBuiltins: false
  }),
  commonjs()
];

const productionPlugins = [
  terser({
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
      passes: 2,
      unsafe: true,
      unsafe_comps: true,
      unsafe_Function: true,
      unsafe_math: true,
      unsafe_proto: true,
      unsafe_regexp: true
    },
    format: {
      comments: /^!/,
      preserve_annotations: false
    },
    mangle: {
      toplevel: false,
      properties: {
        regex: /^_/
      }
    }
  })
];

const developmentPlugins = [];

const getPlugins = (isProd = false) => {
  const base = [...commonPlugins];
  if (isProd) {
    base.push(...productionPlugins);
  } else {
    base.push(...developmentPlugins);
  }

  // Note: Bundle analyzer can be added later if needed
  // if (process.env.ANALYZE) {
  //   base.push(bundleAnalyzer({
  //     summaryOnly: true
  //   }));
  // }

  return base;
};

const createConfig = (format, ext, isProd = false, additionalOptions = {}) => ({
  input: 'src/index.ts',
  output: {
    file: `dist/kairos.${ext}`,
    format,
    name: format === 'umd' || format === 'iife' ? 'kairos' : undefined,
    banner,
    sourcemap: true,
    exports: 'named',
    compact: isProd,
    ...additionalOptions
  },
  plugins: getPlugins(isProd),
  external: ['events'], // Mark Node.js events as external
  onwarn(warning, warn) {
    // Suppress some warnings that are not relevant for this project
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    if (warning.code === 'MISSING_GLOBAL_NAME') return;
    if (warning.code === 'UNRESOLVED_IMPORT') return;
    warn(warning);
  }
});

export default [
  // UMD Development Build
  createConfig('umd', 'umd.js', false),

  // UMD Production Build
  createConfig('umd', 'umd.min.js', true),

  // ESM Development Build
  createConfig('es', 'esm.js', false),

  // ESM Production Build
  createConfig('es', 'esm.min.js', true),

  // IIFE Development Build
  createConfig('iife', 'iife.js', false),

  // IIFE Production Build
  createConfig('iife', 'iife.min.js', true),

  // Modern ES2020 Build (for modern bundlers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/kairos.modern.js',
      format: 'es',
      banner,
      sourcemap: true
    },
    plugins: [
      ...getPlugins(true),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        module: 'es2020',
        target: 'es2020',
        sourceMap: true
      })
    ],
    external: ['events'],
    onwarn(warning, warn) {
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      if (warning.code === 'MISSING_GLOBAL_NAME') return;
      if (warning.code === 'UNRESOLVED_IMPORT') return;
      warn(warning);
    }
  }
];