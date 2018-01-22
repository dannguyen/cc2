import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;

export default [
  { // Rollup the Svelte client
    input: 'client/main.js',
    output: {
      sourcemap: true,
      format: 'iife',
      file: 'public/bundle.js',
      name: 'app',
    },
    plugins: [
      svelte({
        dev: !production,
        css: (css) => {
          css.write('public/bundle.css');
        },
        store: true,
        cascade: false,
      }),
      resolve(),
      commonjs(),
      production && buble({ exclude: 'node_modules/**' }),
      production && uglify(),
    ],
  },
  { // Rollup the Express server
    input: './server/main.js',
    output: {
      sourcemap: true,
      format: 'cjs',
      file: 'server.js',
    },
    plugins: [
      resolve(),
      commonjs(),
    ],
    external: id => id in pkg.dependencies,
  },
];
