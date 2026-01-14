import esbuild from 'esbuild';
import * as fs from 'fs/promises';
import path from 'path';

const copyAssetsPlugin = {
  name: 'copy-assets',
  setup(build) {
    build.onEnd(async () => {
      try {
        const assetsDir = 'src/assets';
        const outDir = 'public/decks';
        const deckNames = [];

        await fs.mkdir(outDir, { recursive: true });

        const decks = await fs.readdir(assetsDir, { withFileTypes: true });

        for (const deck of decks) {
          if (deck.isDirectory()) {
            deckNames.push(deck.name);
            const sourceDeckDir = path.join(assetsDir, deck.name);
            const destDeckDir = path.join(outDir, deck.name);

            await fs.mkdir(destDeckDir, { recursive: true });

            const files = await fs.readdir(sourceDeckDir);

            for (const file of files) {
              const sourceFile = path.join(sourceDeckDir, file);
              const destFile = path.join(destDeckDir, file);
              await fs.copyFile(sourceFile, destFile);
            }
            console.log(`Copied deck: ${deck.name}`);
          }
        }
        await fs.copyFile('src/index.html', 'public/index.html');
        console.log('Copied index.html');
        console.log('Asset copying complete.');

        const tsContent = `export const deckNames: string[] = ${JSON.stringify(deckNames)};\n`;
        const tsFileDir = 'src/data';
        const tsFilePath = path.join(tsFileDir, 'deckNames.ts');

        await fs.mkdir(tsFileDir, { recursive: true });
        await fs.writeFile(tsFilePath, tsContent);
        console.log(`Generated deck names file at ${tsFilePath}`);

      } catch (e) {
        console.error('Failed to copy assets or generate deck names file:', e);
        process.exit(1);
      }
    });
  },
};

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'public/index.js',
  logLevel: 'info',
  plugins: [copyAssetsPlugin],
}).catch(() => process.exit(1));
