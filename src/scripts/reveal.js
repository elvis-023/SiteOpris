/* ============================================================
   REVEAL POR SCROLL — coreografia compartilhada pelas seções
   ============================================================

   Cada seção virou componente e leva a própria animação junto.
   O que não muda de uma para a outra — a guarda de movimento
   reduzido, o par de breakpoints e a entrada padrão de cabeçalho —
   mora aqui, para as quatro dobras não saírem do lugar uma da outra
   com o tempo.

   O GSAP e o ScrollTrigger vêm do pacote npm, importados aqui. Como
   um módulo só é avaliado uma vez por página — por mais componentes
   que o importem —, o registro do plugin e o bundle do GSAP são
   compartilhados por todas as dobras. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* limitCallbacks corta as chamadas de callback fora das bordas do
   gatilho; ignoreMobileResize evita o refresh (e o reflow forçado que
   vem junto) quando a barra de endereço do navegador móvel some ou
   reaparece e muda a altura da viewport sem nada ter mudado de fato. */
ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });

/* Uma instância de matchMedia para o site inteiro. Cada revelarSecao()
   criava a sua, e cada uma registra os próprios listeners de media query
   e entra na conta do ScrollTrigger.refresh() — cinco vezes o mesmo
   trabalho de medição. */
const mm = gsap.matchMedia();

/* will-change só enquanto a animação roda.

   Deixar a dica ligada o tempo todo nos 40 elementos revelados manteria
   40 camadas de composição vivas na memória desde o load, que é o
   contrário do que se quer — a recomendação do MDN é justamente não
   espalhar will-change. Ligar na entrada e desligar no fim dá a dica ao
   compositor no momento em que ela vale e devolve a memória depois.
   (O GSAP já promove a camada sozinho via force3D:"auto" enquanto o
   tween corre; isto é o cinto de segurança em cima disso.) */
function dica(trigger, ligar) {
  document.querySelectorAll(trigger).forEach((raiz) => {
    const alvos = raiz.hasAttribute('data-reveal') ? [raiz] : [];
    alvos.push(...raiz.querySelectorAll('[data-reveal]'));
    alvos.forEach((el) => {
      el.style.willChange = ligar ? 'transform, opacity' : '';
    });
  });
}

/* Revela sem animar. Usado quando não dá para animar
   (prefers-reduced-motion): o anti-FOUC do layout
   (.js [data-reveal]{opacity:0}) deixaria a seção invisível
   para sempre se ninguém acendesse a luz. */
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
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduzido) {
    mostrarTudo(trigger);
    return;
  }

  /* Mesma coreografia nos dois breakpoints, com uma diferença:
     no mobile nada se move na horizontal e o blur sai de cena.
     Um translate em X dentro de um container de largura cheia
     empurra o conteúdo para fora da viewport e liga a barra de
     rolagem lateral no meio da animação; blur em tela inteira
     derruba o frame rate em aparelho intermediário.

     O matchMedia cuida do ciclo de vida — ao cruzar o breakpoint
     ele reverte o contexto anterior e monta o outro. */
  mm.add(
    { desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' },
    (ctx) => {
      const desk = !!ctx.conditions.desktop;
      const blur = desk ? 'blur(8px)' : 'blur(0px)';

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: opts.start || 'top 80%',
          once: true,
          onEnter: () => dica(trigger, true)
        },
        defaults: { ease: 'power3.out' },
        onComplete: () => dica(trigger, false)
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

/* Um refresh, e só quando as fontes assentam.

   Antes era no evento `load`, para cobrir dois suspeitos de mudar a
   altura da página depois do primeiro cálculo: a troca dos ícones e o
   swap das fontes. Os dois foram medidos e nenhum mexe mais no layout —
   os <i data-lucide> vivem todos em containers flex, onde as classes de
   tamanho já valem antes da troca (0 elementos deslocados), e as fontes
   agora têm fallback métrico (0 elementos deslocados).

   Sobra um caso: máquina sem Arial nem Liberation Sans, em que o
   fallback métrico não resolve e a troca realmente mexe no layout.
   Por isso o refresh continua existindo — mas preso a document.fonts.ready,
   que resolve bem antes do `load` (este espera todo subrecurso) e é o
   único momento em que ainda resta layout para recalcular. É esse
   recálculo que aparece no relatório como "forced reflow" lendo
   offsetWidth; agora acontece uma vez, mais cedo e sobre menos coisa. */
document.fonts.ready.then(() => ScrollTrigger.refresh());
