import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: './', // Ensures relative paths for local file:// protocol compatibility
  plugins: [
    {
      name: 'bundle-scripts',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          // List of scripts to concatenate in order (sequential dependency order)
          const scripts = [
            'js/utils.js',
            'js/config.js',
            'js/store.js',
            'js/ui.js',
            'js/auth.js',
            'js/kesifler.js',
            'js/taseronlar.js',
            'js/reports.js',
            'js/charts.js',
            'js/pdf.js',
            'js/logs.js',
            'js/main.js'
          ];

          // Concatenate contents of all JS modules
          const concatenated = scripts
            .map(file => {
              const filePath = path.resolve(__dirname, file);
              if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, 'utf-8');
              }
              return '';
            })
            .join('\n\n');

          // Find all top-level function declarations to expose them on the window object
          // so that legacy inline HTML event handlers (e.g. onclick) can access them.
          const functionRegex = /^(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/gm;
          let match;
          const globalExposed = [];
          while ((match = functionRegex.exec(concatenated)) !== null) {
            const funcName = match[1];
            globalExposed.push(`window.${funcName} = ${funcName};`);
          }
          
          const finalBundleContent = concatenated + '\n\n/* Global Exports for HTML inline event handlers */\n' + globalExposed.join('\n');

          // Write to a temporary file that Vite will bundle
          const bundleDir = path.resolve(__dirname, 'js');
          if (!fs.existsSync(bundleDir)) {
            fs.mkdirSync(bundleDir, { recursive: true });
          }
          fs.writeFileSync(path.resolve(__dirname, 'js/app-bundle.js'), finalBundleContent);

          // Replace the sequential script tags in HTML with a single module script tag
          const startTag = '<script src="js/utils.js?v=1.0.3"></script>';
          const endTag = '<script src="js/main.js?v=1.0.3"></script>';
          
          const startIndex = html.indexOf(startTag);
          const endIndex = html.indexOf(endTag) + endTag.length;

          if (startIndex !== -1 && endIndex !== -1) {
            const before = html.substring(0, startIndex);
            const after = html.substring(endIndex);
            return before + '<script type="module" src="js/app-bundle.js"></script>' + after;
          }
          return html;
        }
      },
      // After build completes, clean up the temporary app-bundle.js file and build dist/service-worker.js
      closeBundle() {
        // 1. Clean up temporary app-bundle.js
        const bundlePath = path.resolve(__dirname, 'js/app-bundle.js');
        if (fs.existsSync(bundlePath)) {
          fs.unlinkSync(bundlePath);
        }

        // 2. Generate production service-worker.js inside dist/ with correct hashed filenames
        const distDir = path.resolve(__dirname, 'dist');
        const assetsDir = path.resolve(distDir, 'assets');
        
        if (fs.existsSync(distDir)) {
          // Read service-worker.js template from root
          const swTemplatePath = path.resolve(__dirname, 'service-worker.js');
          if (fs.existsSync(swTemplatePath)) {
            let swContent = fs.readFileSync(swTemplatePath, 'utf-8');
            
            // Find all files in dist/assets
            let assetsFiles = [];
            if (fs.existsSync(assetsDir)) {
              assetsFiles = fs.readdirSync(assetsDir)
                .map(file => `./assets/${file}`);
            }

            // Define assets to cache in production
            const prodAssets = [
              './',
              './index.html',
              ...assetsFiles,
              './manifest.json',
              'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
              'https://cdn.jsdelivr.net/npm/chart.js',
              'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
              'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
              'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
              'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
              'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js',
              'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
              'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
            ];

            // Replace the ASSETS array in the swContent
            const assetsStart = swContent.indexOf('const ASSETS = [');
            const assetsEnd = swContent.indexOf('];', assetsStart) + 2;
            
            if (assetsStart !== -1 && assetsEnd !== -1) {
              const newAssetsStr = `const ASSETS = ${JSON.stringify(prodAssets, null, 2)};`;
              swContent = swContent.substring(0, assetsStart) + newAssetsStr + swContent.substring(assetsEnd);
            }
            
            // Write to dist/service-worker.js
            fs.writeFileSync(path.resolve(distDir, 'service-worker.js'), swContent);
          }
        }
      }
    }
  ]
});
