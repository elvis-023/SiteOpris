// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  vite: {
    // Tailwind nativo: o plugin varre os arquivos do projeto no build e
    // emite só o CSS das classes usadas, minificado e com hash no nome.
    // (Antes vinha do cdn.tailwindcss.com, um script bloqueante no <head>
    // que compilava o CSS no navegador a cada visita.)
    plugins: [tailwindcss()],
  },
  build: {
    // Uma folha só, com <link> no head: menos requisições e nada de
    // <style> gigante inflando o HTML da primeira dobra.
    inlineStylesheets: 'never',
  },
});
