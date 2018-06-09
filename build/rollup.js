import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';
import cli from 'rollup-plugin-cli';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import progress from 'rollup-plugin-progress';


const primedResolve = resolve({
  jsnext: true,
  main: true,
  browser: true
});

const primedCjs = commonjs({
  sourceMap: false
});

const primedBabel = babel({
  babelrc: false,
  exclude: 'node_modules/**',
  presets: [
    ['es2015', {
      loose: true,
      modules: false
    }]
  ],
  plugins: ['external-helpers']
});

const cjs = {
  options: {
    input: 'src/index.js',
    plugins: [
      cli(),
      primedBabel,
      progress(),
      filesize()
    ],
    onwarn(warning) {
      if (warning.code === 'UNUSED_EXTERNAL_IMPORT' ||
          warning.code === 'UNRESOLVED_IMPORT') {
        return;
      }

      // eslint-disable-next-line no-console
      console.warn(warning.message);
    },
    legacy: true
  },
  format: 'cjs',
  file: `bin/apidoc-postman.js`
};

function runRollup({options, format, file, banner}) {
  rollup(options)
  .then(function(bundle) {
    bundle.write({
      format,
      file,
      banner,
      sourcemap: false
    });
  }, function(err) {
    // eslint-disable-next-line no-console
    console.error(err);
  });
}

runRollup(cjs);