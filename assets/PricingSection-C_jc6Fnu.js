import{a as i,j as t}from"./index-B_ee4N1j.js";import{B as E}from"./bento-pricing-DJj-bJyy.js";import{u as A}from"./use-mobile-DbJjGFij.js";import{h as Y,i as F,p as S}from"./proxy-wYHUi9OM.js";function P(){!Y.current&&F();const[s]=i.useState(S.current);return s}function q(){const s=i.useRef(null),g=i.useRef(null),[M,_]=i.useState(!1),N=A(),k=P(),o=M&&!N&&!k;return i.useEffect(()=>{_(!0)},[]),i.useEffect(()=>{if(!o)return;const n=g.current,v=s.current,l=n?.getContext("2d");if(!n||!l||!v)return;let a=0,r=!1,c=null,d=null,m=0;const R=1e3/40,x=()=>{const e=n.parentElement;e?(n.width=e.clientWidth,n.height=e.clientHeight):(n.width=window.innerWidth,n.height=window.innerHeight)};x();let f=[];const z=()=>({x:Math.random()*n.width,y:Math.random()*n.height,v:Math.random()*.25+.05,o:Math.random()*.35+.15}),y=()=>{f=[];const e=Math.floor(n.width*n.height/12e3);for(let j=0;j<e;j++)f.push(z())},u=()=>{l.clearRect(0,0,n.width,n.height),f.forEach(e=>{e.y-=e.v,e.y<0&&(e.x=Math.random()*n.width,e.y=n.height+Math.random()*40,e.v=Math.random()*.25+.05,e.o=Math.random()*.35+.15),l.fillStyle=`rgba(150,150,150,${e.o})`,l.fillRect(e.x,e.y,.7,2.2)})},h=()=>{a&&(cancelAnimationFrame(a),a=0)},p=e=>{if(!r||document.hidden){h();return}if(m&&e-m<R){a=requestAnimationFrame(p);return}m=e,u(),a=requestAnimationFrame(p)},b=()=>{a||!r||document.hidden||(m=0,a=requestAnimationFrame(p))};d=new ResizeObserver(()=>{x(),y(),r&&u()}),n.parentElement&&d.observe(n.parentElement),y(),u(),c=new IntersectionObserver(([e])=>{r=e.isIntersecting,r?b():h()},{rootMargin:"200px"}),c.observe(v);const w=()=>{document.hidden?h():b()};return document.addEventListener("visibilitychange",w),()=>{document.removeEventListener("visibilitychange",w),c&&c.disconnect(),d&&d.disconnect(),h()}},[o]),t.jsxs("section",{ref:s,className:"relative w-full overflow-hidden bg-background py-24 text-foreground",children:[t.jsx("style",{children:`
        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .hline,.vline{position:absolute;background:hsl(var(--border));will-change:transform,opacity}
        .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .hline:nth-child(1){top:18%;animation-delay:.12s}
        .hline:nth-child(2){top:50%;animation-delay:.22s}
        .hline:nth-child(3){top:82%;animation-delay:.32s}
        .vline:nth-child(4){left:22%;animation-delay:.42s}
        .vline:nth-child(5){left:50%;animation-delay:.54s}
        .vline:nth-child(6){left:78%;animation-delay:.66s}
        .hline::after,.vline::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(150,150,150,.24),transparent);opacity:0;animation:shimmer .9s ease-out forwards}
        .hline:nth-child(1)::after{animation-delay:.12s}
        .hline:nth-child(2)::after{animation-delay:.22s}
        .hline:nth-child(3)::after{animation-delay:.32s}
        .vline:nth-child(4)::after{animation-delay:.42s}
        .vline:nth-child(5)::after{animation-delay:.54s}
        .vline:nth-child(6)::after{animation-delay:.66s}
        @keyframes drawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes drawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
        @keyframes shimmer{0%{opacity:0}35%{opacity:.25}100%{opacity:0}}

        /* === Card minimal fade-up animation === */
        .card-animate {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards;
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}),t.jsx("div",{className:"pointer-events-none absolute inset-0 [background:radial-gradient(80%_60%_at_50%_30%,rgba(0,0,0,0.02),transparent_60%)] dark:[background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]"}),o&&t.jsxs("div",{className:"accent-lines",children:[t.jsx("div",{className:"hline"}),t.jsx("div",{className:"hline"}),t.jsx("div",{className:"hline"}),t.jsx("div",{className:"vline"}),t.jsx("div",{className:"vline"}),t.jsx("div",{className:"vline"})]}),o&&t.jsx("canvas",{ref:g,className:"pointer-events-none absolute inset-0 z-0 h-full w-full opacity-50 mix-blend-screen"}),t.jsx("div",{className:"pointer-events-none absolute inset-0 z-0",children:t.jsx("div",{className:"absolute inset-0 bg-gradient-to-b from-transparent to-background/80 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]",children:t.jsx("div",{"aria-hidden":"true",className:"absolute inset-0 size-full bg-[linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.03] mix-blend-overlay"})})}),t.jsxs("div",{className:"relative z-10 w-full px-4 md:px-6",children:[t.jsxs("div",{className:"mb-16 space-y-4 text-center",children:[t.jsx("h2",{className:"text-3xl font-bold tracking-tight md:text-5xl",children:"Simple, transparent pricing"}),t.jsx("p",{className:"mx-auto max-w-2xl text-lg text-muted-foreground",children:"Choose the perfect plan for your team's needs."})]}),t.jsx(E,{})]})]})}export{q as P,P as u};
