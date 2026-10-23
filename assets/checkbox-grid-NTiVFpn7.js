import{d as t,j as a}from"./index-B_ee4N1j.js";import{C as n}from"./checkbox-DlWt32yb.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["path",{d:"M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8",key:"10dyio"}],["path",{d:"M10 19v-3.96 3.15",key:"1irgej"}],["path",{d:"M7 19h5",key:"qswx4l"}],["rect",{width:"6",height:"10",x:"16",y:"12",rx:"2",key:"1egngj"}]],x=t("MonitorSmartphone",h);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["path",{d:"M12 22v-5",key:"1ega77"}],["path",{d:"M9 8V2",key:"14iosj"}],["path",{d:"M15 8V2",key:"18g5xt"}],["path",{d:"M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z",key:"osxo6l"}]],g=t("Plug",i);function p({options:c,selected:o,onToggle:d,idPrefix:s=""}){return a.jsx("div",{className:"grid grid-cols-1 gap-3 sm:grid-cols-2",children:c.map(e=>{const r=s?`${s}_${e.value}`:e.value;return a.jsxs("div",{className:"flex items-center space-x-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent",children:[a.jsx(n,{id:r,checked:o.includes(e.value),onCheckedChange:l=>d(e.value,l)}),a.jsx("label",{htmlFor:r,className:"flex-1 cursor-pointer text-sm font-medium",children:e.label})]},e.value)})})}export{p as C,x as M,g as P};
