/**
 * build.js — Script de compilación con esbuild
 * Genera dist/index.js y dist/index.css
 *
 * Uso:
 *   npm run build          → producción (minificado)
 *   npm run dev            → watch mode (desarrollo)
 */

const esbuild = require('esbuild');
const path    = require('path');
const fs      = require('fs');

const isWatch = process.argv.includes('--watch');

// Asegurar que existe la carpeta dist/
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

const buildOptions = {
  entryPoints: ['src/index.js'],
  bundle:      true,
  outfile:     'dist/index.js',
  // dscc lo inyecta Looker Studio como global — no lo bundleamos
  external:    ['@google/dscc'],
  // Reemplaza el require('@google/dscc') por la variable global 'dscc'
  banner: {
    js: "/* DataStudio Calendario — TALSA */\nvar require = require || function(m){ if(m==='@google/dscc') return window.dscc; };",
  },
  minify:      !isWatch,
  sourcemap:   isWatch ? 'inline' : false,
  target:      ['es2017'],
  logLevel:    'info',
};

if (isWatch) {
  esbuild.context(buildOptions).then(ctx => {
    ctx.watch();
    console.log('👀  Watching for changes...');
  });
} else {
  esbuild.build(buildOptions).then(() => {
    console.log('✅  dist/index.js generado');
    buildCss();
  }).catch(() => process.exit(1));
}

function buildCss() {
  // esbuild también puede procesar CSS con @import, pero aquí lo copiamos
  // directo ya que no usamos preprocesadores
  const src  = path.join(__dirname, 'src', 'index.css');
  const dest = path.join(__dirname, 'dist', 'index.css');
  fs.copyFileSync(src, dest);
  console.log('✅  dist/index.css generado');
}
