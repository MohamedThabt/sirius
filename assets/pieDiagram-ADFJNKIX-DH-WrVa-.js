import{_ as o,g as U,s as q,a as H,b as K,t as V,q as Z,l as w,c as j,D as J,H as Q,K as X,d as Y,z as ee,F as te}from"./mermaid.core-D4DXaewE.js";import{p as ae}from"./chunk-4BX2VUAB-Cve4fzIs.js";import{p as re}from"./treemap-75Q7IDZK-UbjPBR1r.js";import"./transform-Dcc9PTNK.js";import{a as G}from"./arc-Bk7cJWDG.js";import{o as ie}from"./ordinal-DILIJJjt.js";import{p as oe}from"./pie-DmgoBDrd.js";import"./index-B_ee4N1j.js";import"./Serializer-D7rH9lAB.js";import"./step-B77EgrTZ.js";import"./purify.es-aGzT-_H7.js";import"./line-rCFnZqt6.js";import"./array-BKyUJesY.js";import"./path-CbwjOpE9.js";import"./_baseUniq-Bz2lBFai.js";import"./_basePickBy-8hBV0qU2.js";import"./clone-Dd5dM16f.js";import"./string-CE8GzbCR.js";import"./init-Dmth1JHB.js";var se=te.pie,D={sections:new Map,showData:!1},g=D.sections,C=D.showData,le=structuredClone(se),ne=o(()=>structuredClone(le),"getConfig"),ce=o(()=>{g=new Map,C=D.showData,ee()},"clear"),pe=o(({label:e,value:a})=>{if(a<0)throw new Error(`"${e}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);g.has(e)||(g.set(e,a),w.debug(`added new section: ${e}, with value: ${a}`))},"addSection"),de=o(()=>g,"getSections"),ge=o(e=>{C=e},"setShowData"),me=o(()=>C,"getShowData"),W={getConfig:ne,clear:ce,setDiagramTitle:Z,getDiagramTitle:V,setAccTitle:K,getAccTitle:H,setAccDescription:q,getAccDescription:U,addSection:pe,getSections:de,setShowData:ge,getShowData:me},ue=o((e,a)=>{ae(e,a),a.setShowData(e.showData),e.sections.map(a.addSection)},"populateDb"),fe={parse:o(async e=>{const a=await re("pie",e);w.debug(a),ue(a,W)},"parse")},he=o(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),ve=he,Se=o(e=>{const a=[...e.values()].reduce((r,s)=>r+s,0),$=[...e.entries()].map(([r,s])=>({label:r,value:s})).filter(r=>r.value/a*100>=1).sort((r,s)=>s.value-r.value);return oe().value(r=>r.value)($)},"createPieArcs"),xe=o((e,a,$,y)=>{w.debug(`rendering pie chart
`+e);const r=y.db,s=j(),T=J(r.getConfig(),s.pie),A=40,l=18,p=4,c=450,m=c,u=Q(a),n=u.append("g");n.attr("transform","translate("+m/2+","+c/2+")");const{themeVariables:i}=s;let[b]=X(i.pieOuterStrokeWidth);b??=2;const _=T.textPosition,d=Math.min(m,c)/2-A,M=G().innerRadius(0).outerRadius(d),O=G().innerRadius(d*_).outerRadius(d*_);n.append("circle").attr("cx",0).attr("cy",0).attr("r",d+b/2).attr("class","pieOuterCircle");const f=r.getSections(),P=Se(f),R=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let h=0;f.forEach(t=>{h+=t});const E=P.filter(t=>(t.data.value/h*100).toFixed(0)!=="0"),v=ie(R);n.selectAll("mySlices").data(E).enter().append("path").attr("d",M).attr("fill",t=>v(t.data.label)).attr("class","pieCircle"),n.selectAll("mySlices").data(E).enter().append("text").text(t=>(t.data.value/h*100).toFixed(0)+"%").attr("transform",t=>"translate("+O.centroid(t)+")").style("text-anchor","middle").attr("class","slice"),n.append("text").text(r.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText");const k=[...f.entries()].map(([t,x])=>({label:t,value:x})),S=n.selectAll(".legend").data(k).enter().append("g").attr("class","legend").attr("transform",(t,x)=>{const F=l+p,L=F*k.length/2,N=12*l,B=x*F-L;return"translate("+N+","+B+")"});S.append("rect").attr("width",l).attr("height",l).style("fill",t=>v(t.label)).style("stroke",t=>v(t.label)),S.append("text").attr("x",l+p).attr("y",l-p).text(t=>r.getShowData()?`${t.label} [${t.value}]`:t.label);const I=Math.max(...S.selectAll("text").nodes().map(t=>t?.getBoundingClientRect().width??0)),z=m+A+l+p+I;u.attr("viewBox",`0 0 ${z} ${c}`),Y(u,c,z,T.useMaxWidth)},"draw"),we={draw:xe},Le={parser:fe,db:W,renderer:we,styles:ve};export{Le as diagram};
