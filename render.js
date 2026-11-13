'use strict';

const { PRODUCTS, CATEGORIES, bySku, byCat, catName } = require('./data');

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------------------------------------------------ assets */

const CSS = String.raw`
:root{
  --paper:#f3f0e8; --card:#fbf9f3; --ink:#17150f; --muted:#6f6959;
  --line:#ded6c3; --accent:#c8452b; --green:#2f5d50;
  --sans:ui-sans-serif,-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  --serif:"Songti SC","Source Han Serif SC","Noto Serif SC",ui-serif,Georgia,serif;
}
*{box-sizing:border-box}
html{background:var(--paper)}
body{margin:0;font-family:var(--sans);font-size:16px;line-height:1.65;color:var(--ink);-webkit-font-smoothing:antialiased}
a{color:inherit}
img{display:block;max-width:100%}
::selection{background:var(--ink);color:var(--paper)}
.wrap{max-width:1180px;margin:0 auto;padding:0 28px}
main{min-height:58vh}

.notice{background:var(--ink);color:#e9e3d3;font-size:11px;letter-spacing:.18em;text-transform:uppercase;
  text-align:center;padding:8px 14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.top{position:sticky;top:0;z-index:30;background:rgba(243,240,232,.88);
  -webkit-backdrop-filter:saturate(1.2) blur(10px);backdrop-filter:saturate(1.2) blur(10px);border-bottom:1px solid var(--line)}
.row{display:flex;align-items:center;gap:26px;height:68px}
.brand{display:flex;align-items:center;gap:11px;text-decoration:none;font-family:var(--serif);
  font-size:21px;letter-spacing:.03em;line-height:1;flex:0 0 auto}
.brand em{display:block;font-style:normal;font-size:9.5px;letter-spacing:.26em;color:var(--muted);margin-top:5px;font-family:var(--sans)}
.mark{width:24px;height:24px;border:2px dashed var(--ink);border-radius:50%;position:relative;flex:0 0 auto}
.mark::after{content:"";position:absolute;inset:5px;background:var(--accent);border-radius:50%}
.nav{display:flex;gap:22px;margin-left:auto;font-size:14px}
.nav a{text-decoration:none;color:var(--muted);padding:5px 0;border-bottom:1px solid transparent;white-space:nowrap;transition:color .15s}
.nav a:hover{color:var(--ink)}
.nav a.on{color:var(--ink);border-bottom-color:var(--ink)}
.bag{text-decoration:none;font-size:13.5px;border:1px solid var(--line);padding:8px 15px;border-radius:999px;white-space:nowrap;transition:.18s}
.bag:hover{border-color:var(--ink)}
.bag b{display:inline-block;min-width:17px;height:17px;line-height:17px;text-align:center;background:var(--accent);
  color:#fff;border-radius:999px;font-size:10px;margin-left:7px;font-weight:600;vertical-align:1px}

.hero{display:grid;grid-template-columns:1.06fr .94fr;gap:56px;align-items:center;padding-top:74px;padding-bottom:66px;border-bottom:1px solid var(--line)}
.eyebrow{display:flex;align-items:center;gap:10px;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;
  color:var(--muted);margin:0 0 18px;font-weight:500}
.dot{width:6px;height:6px;border-radius:50%;background:var(--accent);flex:0 0 auto}
.display{font-family:var(--serif);font-weight:600;font-size:clamp(46px,6.2vw,84px);line-height:1.03;
  letter-spacing:-.012em;margin:0 0 24px}
.lede{font-size:16.5px;line-height:1.72;color:#3d382d;max-width:46ch;margin:0 0 28px}
.actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.tiny{font-size:12px;color:var(--muted);margin:0}
.hero-art img{width:100%;height:auto;border:1px solid var(--line);background:var(--card)}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--ink);color:#f3f0e8;
  text-decoration:none;padding:13px 24px;font-size:14px;letter-spacing:.03em;border:1px solid var(--ink);
  transition:background .18s,color .18s,border-color .18s}
.btn:hover{background:var(--accent);border-color:var(--accent);color:#fff}
.btn.ghost{background:transparent;color:var(--ink)}
.btn.ghost:hover{background:var(--ink);color:var(--paper)}
.btn.wide{display:flex;width:100%;margin:24px 0 10px}

.section{padding-top:58px;padding-bottom:58px}
.section-head{display:flex;align-items:baseline;justify-content:space-between;gap:20px;margin-bottom:28px}
.sec{font-family:var(--serif);font-size:clamp(24px,3vw,31px);font-weight:600;margin:0;letter-spacing:.01em}
.more{font-size:13px;color:var(--muted);text-decoration:none;border-bottom:1px solid var(--line);white-space:nowrap}
.more:hover{color:var(--ink);border-color:var(--ink)}

.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:30px 22px}
.grid.few-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid.few-2{grid-template-columns:repeat(2,minmax(0,1fr));max-width:640px}
.card{text-decoration:none;display:block}
.thumb{border:1px solid var(--line);overflow:hidden;background:var(--card)}
.thumb img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;transition:transform .55s cubic-bezier(.2,.7,.3,1)}
.card:hover .thumb img{transform:scale(1.035)}
.card h3{font-size:14.5px;font-weight:500;margin:13px 0 4px;line-height:1.45}
.card .p{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
.card .p b{color:var(--ink);font-weight:600}

.ribbon{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--card);overflow:hidden;padding:15px 0}
.ribbon .inner{display:flex;gap:40px;white-space:nowrap;font-family:var(--serif);font-size:15px;color:var(--muted);
  justify-content:center;letter-spacing:.06em}
.ribbon .inner span::before{content:"·";margin-right:40px;color:var(--accent)}
.ribbon .inner span:first-child::before{content:none;margin:0}

.cats{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line);border-left:1px solid var(--line)}
.cats a{display:block;text-decoration:none;padding:26px 22px 30px;border-right:1px solid var(--line);
  border-bottom:1px solid var(--line);transition:background .2s}
.cats a:hover{background:var(--card)}
.cats .k{font-size:10.5px;letter-spacing:.22em;color:var(--muted)}
.cats .n{font-family:var(--serif);font-size:26px;margin:9px 0 2px}
.cats .c{font-size:12px;color:var(--muted)}

.quote{font-family:var(--serif);font-size:clamp(22px,3.2vw,36px);line-height:1.45;margin:0;max-width:24ch;letter-spacing:.01em}
.quote cite{display:block;font-family:var(--sans);font-style:normal;font-size:11px;letter-spacing:.18em;
  color:var(--muted);margin-top:20px}

.crumbs{font-size:13px;color:var(--muted);padding:28px 0 0;display:flex;gap:9px;flex-wrap:wrap}
.crumbs a{text-decoration:none;border-bottom:1px solid var(--line)}
.crumbs a:hover{border-color:var(--ink);color:var(--ink)}
.pdp{display:grid;grid-template-columns:1.06fr .94fr;gap:60px;padding:26px 0 64px;align-items:start}
.pdp-media{border:1px solid var(--line);position:sticky;top:104px}
.pdp-media img{width:100%;height:auto}
.pdp h1{font-family:var(--serif);font-size:clamp(30px,4vw,44px);line-height:1.14;margin:8px 0 18px;font-weight:600}
.price{font-size:26px;font-variant-numeric:tabular-nums;margin:0 0 20px;letter-spacing:.01em}
.price span{font-size:13px;color:var(--muted);margin-left:10px;letter-spacing:0}
.specs{border-top:1px solid var(--line);margin:30px 0 0}
.specs div{display:flex;justify-content:space-between;gap:20px;padding:11px 0;border-bottom:1px solid var(--line);font-size:13.5px}
.specs dt{color:var(--muted)}
.specs dd{margin:0;text-align:right}
.note{margin-top:22px;padding:15px 18px;background:var(--card);border:1px dashed var(--line);font-size:12.5px;color:#4a4538;line-height:1.7}

.page-head{padding:46px 0 0}
.page-title{font-family:var(--serif);font-size:clamp(34px,5vw,54px);font-weight:600;margin:6px 0 10px;letter-spacing:-.01em}
.page-sub{color:var(--muted);font-size:14px;margin:0 0 10px}

.cart{border-top:1px solid var(--line);margin-top:34px}
.crow{display:grid;grid-template-columns:92px 1fr auto auto;gap:22px;align-items:center;
  padding:18px 0;border-bottom:1px solid var(--line)}
.crow img{width:92px;aspect-ratio:4/3;object-fit:cover;border:1px solid var(--line)}
.crow .t{font-size:15px}
.crow .m{font-size:12px;color:var(--muted);margin-top:3px}
.crow .num{font-variant-numeric:tabular-nums;font-size:14px}
.crow .rm{font-size:12px;color:var(--muted);text-decoration:none;border-bottom:1px solid var(--line);white-space:nowrap}
.crow .rm:hover{color:var(--accent);border-color:var(--accent)}
.sum{display:flex;justify-content:space-between;align-items:baseline;padding:26px 0 6px;font-size:14px;color:var(--muted)}
.sum b{font-family:var(--serif);font-size:32px;color:var(--ink);font-weight:600;letter-spacing:.01em}
.cart-actions{display:flex;justify-content:flex-end;padding-bottom:20px}

.empty{padding:70px 0 90px;border-top:1px solid var(--line);margin-top:34px}
.empty p{color:var(--muted);margin:0 0 26px;max-width:40ch}

.err{padding-top:80px;padding-bottom:110px}
.err-code{font-family:var(--serif);font-size:clamp(96px,17vw,176px);line-height:.86;margin:0 0 26px;letter-spacing:-.04em;font-weight:600}
.err-msg{font-family:var(--serif);font-size:clamp(24px,3.4vw,34px);margin:0 0 14px;line-height:1.35}
.err .lede{margin-bottom:30px}

footer{border-top:1px solid var(--line);padding:46px 0 64px;font-size:13px;color:var(--muted)}
.fgrid{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:34px}
.fgrid h4{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink);margin:0 0 14px;font-weight:600}
.fgrid a{display:block;text-decoration:none;color:var(--muted);margin-bottom:9px}
.fgrid a:hover{color:var(--ink)}
.fbrand{font-family:var(--serif);font-size:19px;color:var(--ink);margin:0 0 10px}
.fnote{max-width:34ch;line-height:1.8}
.legal{margin-top:34px;padding-top:18px;border-top:1px solid var(--line);font-size:11px;letter-spacing:.06em;
  color:#8d8674;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}

.stub{position:fixed;right:18px;bottom:18px;z-index:40;display:flex;align-items:center;gap:12px;
  background:rgba(251,249,243,.95);border:1px solid var(--line);padding:9px 14px;font-size:10.5px;
  letter-spacing:.13em;text-transform:uppercase;color:var(--muted);
  box-shadow:0 12px 34px rgba(23,21,15,.09);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.stub b{color:var(--ink);font-weight:600;letter-spacing:.05em}
.stub i{width:1px;height:13px;background:var(--line);flex:0 0 auto}
.stub .tk{font-variant-numeric:tabular-nums;letter-spacing:.1em;color:#8d8674}

html.hop::after{content:"";position:fixed;top:0;left:0;height:2px;width:100%;background:var(--accent);
  z-index:999;transform-origin:left;animation:hopbar .85s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes hopbar{0%{transform:scaleX(0);opacity:1}75%{transform:scaleX(.9);opacity:1}100%{transform:scaleX(1);opacity:0}}

@media (max-width:980px){
  .hero{grid-template-columns:1fr;gap:34px;padding-top:50px;padding-bottom:46px}
  .hero-art{order:-1;max-width:520px}
  .grid,.grid.few-3,.grid.few-2{grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 18px;max-width:none}
  .pdp{grid-template-columns:1fr;gap:30px;padding-bottom:48px}
  .pdp-media{position:static}
  .cats{grid-template-columns:repeat(2,1fr)}
  .fgrid{grid-template-columns:1fr 1fr}
  .err{padding-top:56px;padding-bottom:80px}
}
@media print{.stub{display:none}}
@media (max-width:660px){
  .wrap{padding:0 18px}
  .nav{display:none}
  .notice{font-size:9.5px;letter-spacing:.1em}
  .hero{padding-top:36px;padding-bottom:40px}
  .hero-art{max-width:290px;margin:0 auto}
  .lede{font-size:15.5px}
  .crow{grid-template-columns:74px 1fr auto;gap:14px}
  .crow img{width:74px}
  .crow .rm{grid-column:2;justify-self:start}
  .stub{left:auto;right:14px;bottom:14px;padding:8px 12px}
  .stub i,.stub .tk{display:none}
  .bag{margin-left:auto}
  .ribbon .inner{gap:0 22px;font-size:13px;flex-wrap:wrap;justify-content:center;padding:0 18px;white-space:normal;text-align:center}
  .ribbon .inner span::before{margin-right:22px}
  .fgrid{grid-template-columns:1fr;gap:26px}
}
`;

const JS = String.raw`
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="/go/"]') : null;
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.getAttribute('data-burned')) { e.preventDefault(); return; }
    a.setAttribute('data-burned', '1');
    document.documentElement.classList.add('hop');
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { location.reload(); }
    document.documentElement.classList.remove('hop');
  });
})();
`;

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="#17150f"/>
<circle cx="32" cy="32" r="17" fill="none" stroke="#f3f0e8" stroke-width="2" stroke-dasharray="4 4.5"/>
<circle cx="32" cy="32" r="6" fill="#c8452b"/>
</svg>`;

const HERO_ART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 440">
<rect width="420" height="440" fill="#eee7d6"/>
<circle cx="210" cy="200" r="152" fill="#e3d9c0"/>
<g transform="rotate(-8 210 210)">
  <rect x="88" y="134" width="246" height="152" fill="#fbf9f3" stroke="#17150f" stroke-width="1.5"/>
  <line x1="152" y1="134" x2="152" y2="286" stroke="#17150f" stroke-width="1" stroke-dasharray="5 5" opacity=".4"/>
  <text x="176" y="200" font-family="Georgia,'Times New Roman',serif" font-size="36" letter-spacing="1" fill="#17150f">ONCE</text>
  <text x="177" y="226" font-family="Helvetica,Arial,sans-serif" font-size="9.5" letter-spacing="4" fill="#6f6959">SINGLE USE</text>
  <text x="177" y="262" font-family="Georgia,serif" font-size="12" fill="#6f6959">NO. 000001</text>
  <circle cx="118" cy="210" r="10" fill="none" stroke="#c8452b" stroke-width="1.5"/>
  <text x="113" y="214" font-family="Helvetica,Arial,sans-serif" font-size="8" fill="#c8452b">1</text>
</g>
<path d="M44 372h332" stroke="#17150f" opacity=".16"/>
<text x="44" y="398" font-family="Helvetica,Arial,sans-serif" font-size="9.5" letter-spacing="3.2" fill="#6f6959">EVERY PAGE EXPIRES</text>
<text x="44" y="416" font-family="Helvetica,Arial,sans-serif" font-size="9.5" letter-spacing="3.2" fill="#8d8674">ONCE.STORE / 2026</text>
</svg>`;

const ART = {
  chopsticks: () => `
    <g fill="#2b2419">
      <polygon points="156,64 166,62 214,238 204,240"/>
      <polygon points="190,60 200,58 242,236 232,238"/>
    </g>
    <rect x="146" y="238" width="108" height="12" rx="6" fill="#c8452b"/>
    <circle cx="298" cy="84" r="30" fill="none" stroke="#2b2419" stroke-width="1.5" opacity=".22"/>`,
  cup: () => `
    <path d="M152 92h96l-13 146h-70z" fill="#fbf9f3" stroke="#2b2419" stroke-width="2"/>
    <path d="M152 92h96l-4 34h-88z" fill="#ded2b6"/>
    <rect x="168" y="164" width="64" height="30" fill="#c8452b" opacity=".9"/>
    <ellipse cx="200" cy="92" rx="48" ry="7" fill="#f3ede0" stroke="#2b2419" stroke-width="2"/>`,
  camera: () => `
    <rect x="110" y="98" width="180" height="112" rx="12" fill="#2b2419"/>
    <rect x="110" y="98" width="180" height="26" rx="12" fill="#453f31"/>
    <circle cx="200" cy="156" r="42" fill="#12110d"/>
    <circle cx="200" cy="156" r="27" fill="#4c6b62"/>
    <circle cx="200" cy="156" r="11" fill="#9dc0b3"/>
    <circle cx="213" cy="143" r="4" fill="#dfe8e2" opacity=".85"/>
    <rect x="248" y="108" width="24" height="9" rx="4" fill="#c8452b"/>
    <rect x="126" y="107" width="20" height="13" rx="3" fill="#d8d3c4"/>`,
  raincoat: () => `
    <path d="M200 70c20 0 33 12 37 27l31 22-14 27-15-9v93c0 10-8 16-18 16h-42c-10 0-18-6-18-16v-93l-15 9-14-27 31-22c4-15 17-27 37-27z"
      fill="#ffffff" opacity=".8" stroke="#2b2419" stroke-width="2"/>
    <path d="M200 78v152" stroke="#2b2419" stroke-width="1.5" opacity=".2"/>
    <path d="M180 92c8-8 32-8 40 0" fill="none" stroke="#2b2419" stroke-width="2" opacity=".45"/>
    <circle cx="200" cy="142" r="3" fill="#c8452b"/>`,
  slippers: () => `
    <ellipse cx="148" cy="172" rx="44" ry="66" fill="#fbf9f3" stroke="#2b2419" stroke-width="2"/>
    <ellipse cx="252" cy="172" rx="44" ry="66" fill="#fbf9f3" stroke="#2b2419" stroke-width="2"/>
    <path d="M114 142c15-13 53-13 68 0" fill="none" stroke="#c8452b" stroke-width="7" stroke-linecap="round"/>
    <path d="M218 142c15-13 53-13 68 0" fill="none" stroke="#c8452b" stroke-width="7" stroke-linecap="round"/>`,
  razor: () => `
    <g transform="rotate(-12 200 165)">
      <rect x="190" y="98" width="24" height="114" rx="9" fill="#2b2419"/>
      <rect x="150" y="76" width="104" height="30" rx="8" fill="#3b362b"/>
      <rect x="158" y="82" width="88" height="5" rx="2.5" fill="#c8452b"/>
      <rect x="158" y="92" width="88" height="4" rx="2" fill="#9dc0b3"/>
    </g>`,
  towel: () => `
    <rect x="138" y="118" width="118" height="100" rx="6" fill="#fbf9f3" stroke="#2b2419" stroke-width="2"/>
    <circle cx="266" cy="168" r="25" fill="#fbf9f3" stroke="#2b2419" stroke-width="2"/>
    <circle cx="266" cy="168" r="9" fill="#ded2b6"/>
    <path d="M266 143v50" stroke="#2b2419" stroke-width="1" opacity=".15"/>
    <line x1="154" y1="140" x2="238" y2="140" stroke="#c8452b" stroke-width="4" opacity=".75"/>
    <line x1="154" y1="154" x2="238" y2="154" stroke="#2b2419" stroke-width="1" opacity=".18"/>
    <line x1="154" y1="166" x2="238" y2="166" stroke="#2b2419" stroke-width="1" opacity=".18"/>`,
  lighter: () => `
    <rect x="168" y="128" width="64" height="114" rx="7" fill="#c8452b"/>
    <rect x="176" y="138" width="48" height="54" rx="3" fill="#f3ede0" opacity=".3"/>
    <rect x="168" y="112" width="64" height="18" rx="4" fill="#2b2419"/>
    <rect x="214" y="116" width="12" height="10" rx="2" fill="#8a8271"/>
    <path d="M200 58c11 13 17 21 17 30a17 17 0 0 1-34 0c0-9 6-17 17-30z" fill="#e8a33d"/>
    <path d="M200 76c5.5 7 8 11 8 15a8 8 0 0 1-16 0c0-4 2.5-8 8-15z" fill="#c8452b"/>`,
};

function productArt(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="${esc(p.name)}">
<rect width="400" height="300" fill="${p.tint}"/>
<g transform="translate(200 150) scale(1.08) translate(-200 -150)">${ART[p.art] ? ART[p.art]() : ''}</g>
</svg>`;
}

const icon = () => ICON;
const heroArt = () => HERO_ART;

/* -------------------------------------------------------------- chrome */

function header(ctx, active) {
  const cats = CATEGORIES.map(
    (c) => `<a class="${active === 'cat:' + c.id ? 'on' : ''}" href="${ctx.go('cat:' + c.id)}">${c.name}</a>`
  ).join('');
  const n = ctx.cart.length;
  return `<header class="top"><div class="wrap row">
  <a class="brand" href="${ctx.go('home')}"><span class="mark"></span><span>ONCE<em>一次性商店</em></span></a>
  <nav class="nav">${cats}<a class="${active === 'about' ? 'on' : ''}" href="${ctx.go('about')}">关于</a></nav>
  <a class="bag" href="${ctx.go('cart')}">购物袋${n ? `<b>${n}</b>` : ''}</a>
</div></header>`;
}

function footer(ctx) {
  return `<footer><div class="wrap">
  <div class="fgrid">
    <div>
      <p class="fbrand">ONCE</p>
      <p class="fnote">一次性商店。我们相信所有东西都只能用一次：筷子、相机、雨衣，以及这个网页。</p>
    </div>
    <div>
      <h4>货架</h4>
      ${CATEGORIES.map((c) => `<a href="${ctx.go('cat:' + c.id)}">${c.name}</a>`).join('')}
      <a href="${ctx.go('cat:all')}">全部商品</a>
    </div>
    <div>
      <h4>本店</h4>
      <a href="${ctx.go('about')}">关于 ONCE</a>
      <a href="${ctx.go('cart')}">购物袋</a>
      <a href="/">再撕一张票</a>
    </div>
  </div>
  <div class="legal"><span>© 2026 ONCE 一次性商店</span><span>本页地址在生成时即已作废</span></div>
</div></footer>`;
}

function stub(ctx) {
  return `<div class="stub" title="每张票只能使用一次">
  <span><b>第 ${ctx.hops} 跳</b></span><i></i><span class="tk">${ctx.token ? esc(ctx.token) : 'VOID'}</span>
</div>`;
}

function layout({ title, ctx, body, active }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · ONCE 一次性商店</title>
<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="theme-color" content="#17150f">
<link rel="icon" href="${ctx.asset('icon')}" type="image/svg+xml">
<link rel="stylesheet" href="${ctx.asset('css')}">
<style>html{background:#f3f0e8}body{margin:0;color:#17150f;font-family:ui-sans-serif,-apple-system,"PingFang SC",sans-serif}</style>
</head>
<body>
<div class="notice">本店每个地址只能访问一次 · 刷新 · 后退 · 收藏，都会让它失效</div>
${header(ctx, active)}
${body}
${footer(ctx)}
${stub(ctx)}
<script src="${ctx.asset('js')}" defer></script>
</body>
</html>`;
}

/* -------------------------------------------------------------- pieces */

function card(ctx, p) {
  return `<a class="card" href="${ctx.go('product:' + p.sku)}">
  <div class="thumb"><img src="${ctx.asset('img:' + p.sku)}" alt="${esc(p.name)}" width="400" height="300"></div>
  <h3>${esc(p.name)}</h3>
  <div class="p"><b>¥${p.price}</b> / ${esc(p.unit)}</div>
</a>`;
}

/* -------------------------------------------------------------- pages */

function home(ctx) {
  const feat = PRODUCTS.filter((p) => p.feature).slice(0, 4);
  const cats = CATEGORIES.map((c) => {
    const n = byCat(c.id).length;
    return `<a href="${ctx.go('cat:' + c.id)}">
      <div class="k">${c.en}</div>
      <div class="n">${c.name}</div>
      <div class="c">${n} 件商品</div>
    </a>`;
  }).join('');

  const body = `<main>
<section class="wrap hero">
  <div class="hero-copy">
    <p class="eyebrow"><span class="dot"></span>第 ${ctx.hops} 跳 · 单次有效</p>
    <h1 class="display">用完，<br>就没了。</h1>
    <p class="lede">我们只卖一次性用品：筷子、相机、雨衣，还有你正在看的这个网页。在你读到这句话的时候，它已经作废了。</p>
    <div class="actions">
      <a class="btn" href="${ctx.go('cat:all')}">逛逛货架</a>
      <a class="btn ghost" href="${ctx.go('about')}">这是什么店</a>
    </div>
    <p class="tiny">每个链接只可使用一次。点第二次是 404，刷新也是。</p>
  </div>
  <div class="hero-art"><img src="${ctx.asset('hero')}" alt="ONCE 票根" width="420" height="440"></div>
</section>

<section class="wrap section">
  <div class="section-head">
    <h2 class="sec">本季主推</h2>
    <a class="more" href="${ctx.go('cat:all')}">全部商品 →</a>
  </div>
  <div class="grid">${feat.map((p) => card(ctx, p)).join('')}</div>
</section>

<div class="ribbon"><div class="inner"><span>一次性</span><span>用完即弃</span><span>一次有效</span><span>不补货</span><span>不退款</span></div></div>

<section class="wrap section">
  <div class="section-head"><h2 class="sec">按类别</h2><span class="more">${PRODUCTS.length} 件在售</span></div>
  <div class="cats">${cats}</div>
</section>

<section class="wrap section" style="padding-bottom:86px">
  <blockquote class="quote">“第二次打开同一件东西，<br>那是另一件东西。”<cite>— 店主</cite></blockquote>
</section>
</main>`;

  return layout({ title: '一次性商店', ctx, body, active: 'home' });
}

function category(ctx, id) {
  const list = id === 'all' ? PRODUCTS : byCat(id);
  const title = id === 'all' ? '全部商品' : catName(id);
  const en = (CATEGORIES.find((c) => c.id === id) || { en: 'ALL GOODS' }).en;

  const few = list.length === 3 ? ' few-3' : list.length === 2 ? ' few-2' : '';
  const body = `<main><div class="wrap">
  <div class="page-head">
    <p class="eyebrow"><span class="dot"></span>${en} · ${list.length} 件</p>
    <h1 class="page-title">${title}</h1>
    <p class="page-sub">每一件都只能用一次。这也是它们唯一共同的地方。</p>
  </div>
  <section class="section" style="padding-top:34px">
    <div class="grid${few}">${list.map((p) => card(ctx, p)).join('')}</div>
  </section>
</div></main>`;

  return layout({ title, ctx, body, active: id === 'all' ? 'cat:all' : 'cat:' + id });
}

function product(ctx, sku) {
  const p = bySku[sku];
  if (!p) return notFound(ctx, 'unknown');

  const related = PRODUCTS.filter((x) => x.sku !== p.sku && x.cat === p.cat)
    .concat(PRODUCTS.filter((x) => x.sku !== p.sku && x.cat !== p.cat))
    .slice(0, 4);

  const body = `<main><div class="wrap">
  <nav class="crumbs"><a href="${ctx.go('cat:' + p.cat)}">${catName(p.cat)}</a><span>/</span><span>${esc(p.name)}</span></nav>
  <div class="pdp">
    <div class="pdp-media"><img src="${ctx.asset('img:' + p.sku)}" alt="${esc(p.name)}" width="400" height="300"></div>
    <div class="pdp-info">
      <p class="eyebrow" style="margin-bottom:8px">${p.en}</p>
      <h1>${esc(p.name)}</h1>
      <p class="price">¥${p.price}<span>/ ${esc(p.unit)}</span></p>
      <p class="lede" style="font-size:15.5px;margin-bottom:0">${esc(p.blurb)}</p>
      <a class="btn wide" href="${ctx.link('add', p.sku)}">加入购物袋</a>
      <p class="tiny">点击后会跳到一个新的购物袋地址，当前这张票立刻作废。</p>
      <dl class="specs">
        ${p.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
      <div class="note">${esc(p.desc)}</div>
    </div>
  </div>
  <section class="section" style="padding-top:0">
    <div class="section-head"><h2 class="sec">你可能也只需要一次</h2><a class="more" href="${ctx.go('cat:all')}">全部商品 →</a></div>
    <div class="grid">${related.map((x) => card(ctx, x)).join('')}</div>
  </section>
</div></main>`;

  return layout({ title: p.name, ctx, body, active: 'cat:' + p.cat });
}

function cartPage(ctx) {
  const items = ctx.cart.map((sku) => bySku[sku]).filter(Boolean);
  const total = items.reduce((s, p) => s + p.price, 0);

  const body = `<main><div class="wrap">
  <div class="page-head">
    <p class="eyebrow"><span class="dot"></span>${items.length} 件 · 单次有效</p>
    <h1 class="page-title">购物袋</h1>
  </div>
  ${
    items.length
      ? `<div class="cart">
    ${items
      .map(
        (p) => `<div class="crow">
      <img src="${ctx.asset('img:' + p.sku)}" alt="${esc(p.name)}" width="92">
      <div><div class="t">${esc(p.name)}</div><div class="m">${esc(p.unit)} · 一次性</div></div>
      <div class="num">¥${p.price}</div>
      <a class="rm" href="${ctx.link('remove', p.sku)}">移除</a>
    </div>`
      )
      .join('')}
  </div>
  <div class="sum"><span>合计（含 0% 的永恒税）</span><b>¥${total}</b></div>
  <div class="cart-actions"><a class="btn" href="${ctx.link('checkout', '')}">结算并焚毁</a></div>`
      : `<div class="empty"><p>购物袋是空的。它本来就是一次性的，装过一次东西之后，就再也装不下别的了。</p>
    <a class="btn" href="${ctx.go('cat:all')}">去装点东西</a></div>`
  }
</div></main>`;

  return layout({ title: '购物袋', ctx, body, active: 'cart' });
}

function aboutPage(ctx) {
  const body = `<main><div class="wrap">
  <div class="page-head">
    <p class="eyebrow"><span class="dot"></span>ABOUT · 关于本店</p>
    <h1 class="page-title">一间只开一次的店</h1>
  </div>
  <section class="section" style="padding-top:34px;max-width:720px">
    <p class="lede" style="font-size:18px;max-width:none">ONCE 成立于 2019 年，卖的东西只有一个共同点：它们都只能用一次。筷子、纸杯、相机、雨衣、剃须刀——用完就扔，扔了再买，天经地义。</p>
    <dl class="specs" style="margin-top:34px">
      <div><dt>01 · 我们卖什么</dt><dd>八件日用品，全部一次性</dd></div>
      <div><dt>02 · 为什么不卖耐用品</dt><dd>耐用品需要第二次，第二次需要记住</dd></div>
      <div><dt>03 · 这个网站</dt><dd>本店第四件商品</dd></div>
      <div><dt>04 · 会员体系</dt><dd>没有。会员需要回来</dd></div>
    </dl>
    <div class="note" style="margin-top:30px">
      这个网页和货架上的东西一样，只能用一次。你打开它的时候，它就已经作废了：每个地址只发放一张票，票用过即焚。
      刷新、后退、收藏、把链接发给朋友——都会得到同一个 404。唯一还在的东西是首页那道门，它每次都会撕一张新票给你。
    </div>
    <p class="lede" style="margin-top:34px">所以我们不指望你记住我们。你只需要记住：刚才那一页，已经没了。</p>
    <div class="actions" style="margin-top:6px">
      <a class="btn" href="${ctx.go('cat:all')}">看货</a>
      <a class="btn ghost" href="${ctx.go('home')}">回首页再撕一张</a>
    </div>
  </section>
</div></main>`;

  return layout({ title: '关于', ctx, body, active: 'about' });
}

function donePage(ctx, order) {
  const body = `<main><div class="wrap">
  <div class="err" style="padding-top:64px">
    <p class="eyebrow"><span class="dot"></span>ORDER CLOSED · 已焚毁</p>
    <h1 class="err-msg" style="font-size:clamp(30px,4.4vw,46px)">订单已成立，<br>这张票已经烧掉了。</h1>
    <p class="lede">订单号 ${esc(order)}。我们不会发货，因为这是一间假店；但链接是真的死了，这一点你可以放心。购物袋已经清空。</p>
    <div class="actions"><a class="btn" href="/">再撕一张票</a><a class="btn ghost" href="${ctx.go('cat:all')}">继续逛</a></div>
    <p class="tiny">如果你按了后退，会看到一个 404。它是真的。</p>
  </div>
</div></main>`;

  return layout({ title: '订单已成立', ctx, body, active: 'home' });
}

function notFound(ctx, reason, extra = {}) {
  const msg =
    reason === 'used' ? '这张票已经用过了。' : reason === 'unknown' ? '没有这张票。' : '这里什么都没有。';
  const sub =
    reason === 'used'
      ? '每个地址只发放一张票。刷新、后退、重新打开、把链接发给别人，都会来到这里。'
      : reason === 'unknown'
      ? '地址是随机生成的，并且只存在很短的时间。过期的票，我们不会再补。'
      : '本店没有常设地址，所有页面只通过一次性链接开放。';

  const times = extra.count > 1 ? `<p class="tiny" style="margin:-8px 0 26px">这张票已经被使用 ${extra.count} 次。</p>` : '';

  const body = `<main class="wrap err">
  <p class="eyebrow"><span class="dot"></span>SINGLE USE · 已失效</p>
  <h1 class="err-code">404</h1>
  <p class="err-msg">${msg}</p>
  ${times}
  <p class="lede">${sub}</p>
  <div class="actions"><a class="btn" href="/">再撕一张票</a></div>
  <p class="tiny">首页是唯一不会被烧掉的地址。它每次都会给你一张新票，同样只能用一次。</p>
</main>`;

  return layout({ title: '404', ctx, body, active: '' });
}

module.exports = {
  CSS,
  JS,
  icon,
  heroArt,
  productArt,
  home,
  category,
  product,
  cartPage,
  aboutPage,
  donePage,
  notFound,
};
