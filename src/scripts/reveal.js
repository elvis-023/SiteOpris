/* ============================================================
   REVEAL POR SCROLL — coreografia compartilhada pelas seções
   ============================================================

   Cada seção virou componente e leva a própria animação junto.
   O que não muda de uma para a outra — a guarda de movimento
   reduzido, o par de breakpoints e a entrada padrão de cabeçalho —
   mora aqui, para as quatro dobras não saírem do lugar uma da outra
   com o tempo.

   O GSAP e o ScrollTrigger vêm do CDN no <head> do Layout, então
   este módulo lê os dois de `window` em vez de importá-los. */

/* Revela sem animar. Usado quando não dá para animar (sem GSAP,
   sem ScrollTrigger ou com prefers-reduced-motion): o anti-FOUC
   do layout (.js [data-reveal]{opacity:0}) deixaria a seção
   invisível para sempre se ninguém acendesse a luz. */
function mostrarTudo(trigger) {
  document.querySelectorAll(trigger).forEach((raiz) => {
    if (raiz.hasAttribute('data-reveal')) raiz.style.opacity = '1';
    raiz.querySelectorAll('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
    });
  });
}

/**
 * Monta a timeline de entrada de uma seção, presa ao scroll.
 *
 * @param {string} trigger  Seletor do elemento que dispara (ex.: '#arquitetura').
 * @param {Function} montar Recebe (tl, ctx) e encadeia os tweens da seção.
 *                          ctx traz { desk, blur, headFrom, headTo }.
 * @param {{ start?: string }} [opts] Ponto de disparo (padrão: 'top 80%').
 */
export function revelarSecao(trigger, montar, opts = {}) {
  const gsap = window.gsap;
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!gsap || reduzido || !window.ScrollTrigger) {
    mostrarTudo(trigger);
    return;
  }

  gsap.registerPlugin(window.ScrollTrigger);

  /* Mesma coreografia nos dois breakpoints, com uma diferença:
     no mobile nada se move na horizontal e o blur sai de cena.
     Um translate em X dentro de um container de largura cheia
     empurra o conteúdo para fora da viewport e liga a barra de
     rolagem lateral no meio da animação; blur em tela inteira
     derruba o frame rate em aparelho intermediário.

     O matchMedia cuida do ciclo de vida — ao cruzar o breakpoint
     ele reverte o contexto anterior e monta o outro. */
  gsap.matchMedia().add(
    { desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' },
    (ctx) => {
      const desk = !!ctx.conditions.desktop;
      const blur = desk ? 'blur(8px)' : 'blur(0px)';

      const tl = gsap.timeline({
        scrollTrigger: { trigger, start: opts.start || 'top 80%', once: true },
        defaults: { ease: 'power3.out' }
      });

      montar(tl, {
        desk,
        blur,
        /* Entrada padrão de cabeçalho de seção */
        headFrom: { opacity: 0, y: desk ? 28 : 20, filter: blur },
        headTo: { opacity: 1, y: 0, filter: 'blur(0px)', duration: .8, stagger: .12 }
      });
    }
  );
}

/* Fontes e ícones mudam a altura da página depois do primeiro cálculo,
   e aí todo gatilho preso a uma posição sai do lugar. Como este módulo
   é o único que cria ScrollTriggers no site — e um módulo só é avaliado
   uma vez, por mais componentes que o importem — o recálculo mora aqui. */
if (window.ScrollTrigger) {
  window.addEventListener('load', () => window.ScrollTrigger.refresh());
}
