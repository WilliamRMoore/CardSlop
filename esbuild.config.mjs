import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'public/index.js',
  logLevel: 'info',
}).catch(() => process.exit(1));
