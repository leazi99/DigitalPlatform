import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import reactComponentName from 'react-scan/react-component-name/vite'

/**
 * React Scan is loaded in `npm run dev` only, as a script tag ahead of the app
 * so it can instrument React before the first render. It is never bundled into
 * a production build.
 */
function reactScanDevOnly() {
  return {
    name: 'react-scan-dev-only',
    apply: 'serve',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { src: '/node_modules/react-scan/dist/auto.global.js' },
          injectTo: 'head-prepend',
        },
      ]
    },
  }
}

// Adds real component names to the scan output. Dev only, so the production
// bundle stays byte-identical to a build without React Scan installed.
const componentNamesDevOnly = { ...reactComponentName(), apply: 'serve' }

export default defineConfig({
  plugins: [componentNamesDevOnly, reactScanDevOnly(), react(), tailwindcss()],
})
