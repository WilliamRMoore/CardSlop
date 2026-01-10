import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  plugins: [
    copy({
      // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
      // if not specified, this plugin uses ESBuild's `outdir` path as base path.
      resolveFrom: 'cwd',
      assets: {
        from: ['./public/*'],
        to: ['./dist']
      },
      watch: true,
    }),
  ],
  logLevel: 'info',
}).catch(() => process.exit(1));
