/* ============================================================
   REVEAL POR SCROLL — IntersectionObserver + CSS
   ============================================================

   Este módulo já foi GSAP + ScrollTrigger: 44 KB gzip para animar
   opacidade e transform, e um refresh que lia offsetWidth de todos os
   gatilhos. O relatório do PageSpeed no mobile apontava os dois — JS
   não usado e 62 ms de forced reflow.

   O trabalho aqui agora é só este: avisar quando a seção entra na tela.
   Quem anima é o CSS (ver "REVEAL POR SCROLL" em styles/global.css),
   que já anima o hero do mesmo jeito. O IntersectionObserver não lê
   geometria na thread principal — o cálculo acontece fora dela e chega
   pronto no callback —, então não há reflow para forçar.

   A coreografia de cada dobra vive em variáveis CSS por grupo
   (--rv-y, --rv-dur, --rv-base, --rv-step) e o escalonamento no --i que
   cada elemento carrega no markup, que é o antigo `stagger`. */

const REDUZIDO = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SUPORTA = 'IntersectionObserver' in window;

/**
 * Marca a seção com .is-visible quando ela cruza a viewport.
 *
 * @param {string} seletor Elemento que dispara (ex.: '#arquitetura').
 * @param {number} [margem=20] Quanto da viewport o elemento precisa
 *   cruzar, em %. Equivale ao antigo start:'top 80%' do ScrollTrigger:
 *   20 dispara quando o topo passa de 80% da altura da tela.
 */
export function revelarSecao(seletor, margem = 20) {
  const alvos = document.querySelectorAll(seletor);
  if (!alvos.length) return;

  /* Sem suporte ou com movimento reduzido, revela na hora: o
     .js [data-reveal]{opacity:0} do layout deixaria a dobra invisível
     para sempre se ninguém acendesse a luz. (Com movimento reduzido a
     media query do CSS zera duração e atraso, então a classe não
     anima nada — só entrega o estado final.) */
  if (!SUPORTA || REDUZIDO) {
    alvos.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('is-visible');
        /* Uma vez só, como o once:true de antes: para de observar e o
           observer se desliga sozinho quando o último alvo sai. */
        observer.unobserve(entrada.target);
      }
    },
    { rootMargin: `0px 0px -${margem}% 0px` },
  );

  alvos.forEach((el) => observer.observe(el));
}
