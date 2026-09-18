import {defineConfig} from 'vite';
// Font của @fontsource nằm trong chunk CSS, nên trình duyệt chỉ bắt đầu tải chúng sau khi parse xong CSS.
// Với chữ Việt thì đó là một nhịp chờ thấy được. Tên file có hash nên không hardcode được:
// lấy thẳng từ bundle lúc build và chèn preload cho đúng bốn tập con thật sự vẽ màn hình đầu.
function preloadCriticalFonts(){
 const critical=[/manrope-vietnamese-400/,/manrope-latin-400/,/archivo-vietnamese-wght/,/archivo-latin-wght/];
 return {
  name:'limen-preload-fonts',enforce:'post',apply:'build',
  transformIndexHtml(_html,ctx){
   const files=Object.keys(ctx.bundle||{}).filter(f=>f.endsWith('.woff2')&&critical.some(r=>r.test(f)));
   return files.map(href=>({tag:'link',injectTo:'head',
    attrs:{rel:'preload',as:'font',type:'font/woff2',crossorigin:'',href:'/'+href}}));
  },
 };
}
export default defineConfig({
 plugins:[preloadCriticalFonts()],
 optimizeDeps:{entries:['index.html']},
 server:{watch:{ignored:['**/references/**']}},
 build:{chunkSizeWarningLimit:1200},
});
