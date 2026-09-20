/* ============================================================
   ÍCONES LUCIDE — só os que o site usa
   ============================================================

   Antes vinha do CDN (unpkg lucide.min.js), um <script> bloqueante no
   <head> que baixava as ~1.300 formas do pacote inteiro para desenhar
   26 delas.

   Aqui cada ícone é um import nomeado, então o Rollup faz tree-shaking
   e só as formas listadas abaixo entram no bundle. O módulo é servido
   adiado pelo Astro: não bloqueia o parse nem o primeiro pixel.

   ⚠ Ao usar um <i data-lucide="nome-novo"> em algum componente, o
   ícone correspondente precisa ser importado e registrado aqui — o
   createIcons() só troca o que encontra neste objeto. */
import {
  Activity,
  ArrowRight,
  Asterisk,
  CalendarCheck,
  Check,
  Clock,
  Code2,
  Cog,
  Cpu,
  Database,
  FileText,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  PenTool,
  PlayCircle,
  Plug,
  Search,
  Send,
  ServerCog,
  ShieldCheck,
  Target,
  TrendingUp,
  Webhook,
  X,
  Zap,
  createIcons,
} from 'lucide';

/* As chaves são o nome do ícone em PascalCase: o createIcons converte
   o valor de data-lucide ("server-cog") e procura por aqui ("ServerCog"). */
createIcons({
  icons: {
    Activity,
    ArrowRight,
    Asterisk,
    CalendarCheck,
    Check,
    Clock,
    Code2,
    Cog,
    Cpu,
    Database,
    FileText,
    Linkedin,
    Mail,
    Menu,
    MessageCircle,
    MessageSquare,
    PenTool,
    PlayCircle,
    Plug,
    Search,
    Send,
    ServerCog,
    ShieldCheck,
    Target,
    TrendingUp,
    Webhook,
    X,
    Zap,
  },
});
