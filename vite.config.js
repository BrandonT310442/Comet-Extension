import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { resolve } from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),
    // Copy manifest.json and background.js to build output
    {
      name: 'copy-extension-files',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: fs.readFileSync('manifest.json', 'utf-8')
        })
        this.emitFile({
          type: 'asset',
          fileName: 'background.js',
          source: fs.readFileSync('background.js', 'utf-8')
        })
        
        // Copy icon files
        const iconDir = 'icons';
        if (!fs.existsSync(path.join('public', iconDir))) {
          fs.mkdirSync(path.join('extension', iconDir), { recursive: true });
        }
        
        // Copy icon16.png
        if (fs.existsSync(path.join('public', iconDir, 'icon16.png'))) {
          this.emitFile({
            type: 'asset',
            fileName: path.join(iconDir, 'icon16.png'),
            source: fs.readFileSync(path.join('public', iconDir, 'icon16.png'))
          });
        }
        
        // Copy icon48.png
        if (fs.existsSync(path.join('public', iconDir, 'icon48.png'))) {
          this.emitFile({
            type: 'asset',
            fileName: path.join(iconDir, 'icon48.png'),
            source: fs.readFileSync(path.join('public', iconDir, 'icon48.png'))
          });
        }
        
        // Copy icon128.png
        if (fs.existsSync(path.join('public', iconDir, 'icon128.png'))) {
          this.emitFile({
            type: 'asset',
            fileName: path.join(iconDir, 'icon128.png'),
            source: fs.readFileSync(path.join('public', iconDir, 'icon128.png'))
          });
        }
      }
    }
  ],
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  build: {
    outDir: 'extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  // Add cacheDir to avoid permission issues in Windows
  cacheDir: './node_modules/.vite_cache'
}) 