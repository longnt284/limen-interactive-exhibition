import {defineConfig} from 'vite';
export default defineConfig({optimizeDeps:{entries:['index.html']},server:{watch:{ignored:['**/references/**']}},build:{chunkSizeWarningLimit:1200}});
