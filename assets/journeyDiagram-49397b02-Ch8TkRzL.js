import{a as yt,s as pt,b as ft,c as dt,m as mt,n as gt,g as I,d as xt,p as kt}from"./index-BrRmTK7W.js";import{s as H}from"./transform-Dcc9PTNK.js";import{a as _t,g as rt,f as bt,d as vt}from"./svgDrawCommon-08f97a94-CvCXCXRK.js";import"./Serializer-D7rH9lAB.js";import"./percentages-BXMCSKIN-CzgWiu5L.js";import{a as Q}from"./arc-Bk7cJWDG.js";import"./index-B_ee4N1j.js";import"./step-B77EgrTZ.js";import"./string-CE8GzbCR.js";import"./ProjectSidebarPanel-DV031-1U.js";import"./github-repo-link-B0oKTGq8.js";import"./user-menu-content-Bg9ogyT1.js";import"./index-BLeRyXgT.js";import"./index-DJvFVcbB.js";import"./tooltip-EIWNHpt2.js";import"./index-AHxiBBqD.js";import"./index-CkfYCDiF.js";import"./dropdown-menu-__Vd3-ME.js";import"./index-0JGk8jiv.js";import"./Combination-DwumTZ4F.js";import"./avatar-B1Zhvsm3.js";import"./index-CNGrIyF-.js";import"./use-initials-Bllgs2Wq.js";import"./badge-B1-6lABn.js";import"./button-CsyI3RVj.js";import"./circle-check-big-Cg1YVqpu.js";import"./circle-alert-DPpTDYKI.js";import"./chevron-down-BkbsQfNW.js";import"./clock-jruzlik3.js";import"./circle-Ctq36se_.js";import"./SidebarToggle-C3DKy1F8.js";import"./panel-left-open-Dnsx4NII.js";import"./projectNav-CLn-oUYy.js";import"./house-z270Zr8D.js";import"./lightbulb-CaVtyAMe.js";import"./users-CQ3e-I28.js";import"./file-Wp4XDHAu.js";import"./code-D21cXmuZ.js";import"./layers-B6PvVi8B.js";import"./breadcrumbs-ArklDGyW.js";import"./sheet-DAM-uSPV.js";import"./index-Dp67fzp1.js";import"./use-flash-toasts-BYT87mRG.js";import"./use-theme-detection-DlkcHpij.js";import"./with-selector-DO99Rj4S.js";import"./menu-DFmf-Td_.js";import"./path-CbwjOpE9.js";var X=(function(){var t=function(d,i,n,a){for(n=n||{},a=d.length;a--;n[d[a]]=i);return n},e=[6,8,10,11,12,14,16,17,18],r=[1,9],l=[1,10],s=[1,11],h=[1,12],c=[1,13],p=[1,14],y={trace:function(){},yy:{},symbols_:{error:2,start:3,journey:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NEWLINE:10,title:11,acc_title:12,acc_title_value:13,acc_descr:14,acc_descr_value:15,acc_descr_multiline_value:16,section:17,taskName:18,taskData:19,$accept:0,$end:1},terminals_:{2:"error",4:"journey",6:"EOF",8:"SPACE",10:"NEWLINE",11:"title",12:"acc_title",13:"acc_title_value",14:"acc_descr",15:"acc_descr_value",16:"acc_descr_multiline_value",17:"section",18:"taskName",19:"taskData"},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,2]],performAction:function(i,n,a,u,f,o,w){var k=o.length-1;switch(f){case 1:return o[k-1];case 2:this.$=[];break;case 3:o[k-1].push(o[k]),this.$=o[k-1];break;case 4:case 5:this.$=o[k];break;case 6:case 7:this.$=[];break;case 8:u.setDiagramTitle(o[k].substr(6)),this.$=o[k].substr(6);break;case 9:this.$=o[k].trim(),u.setAccTitle(this.$);break;case 10:case 11:this.$=o[k].trim(),u.setAccDescription(this.$);break;case 12:u.addSection(o[k].substr(8)),this.$=o[k].substr(8);break;case 13:u.addTask(o[k-1],o[k]),this.$="task";break}},table:[{3:1,4:[1,2]},{1:[3]},t(e,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:r,12:l,14:s,16:h,17:c,18:p},t(e,[2,7],{1:[2,1]}),t(e,[2,3]),{9:15,11:r,12:l,14:s,16:h,17:c,18:p},t(e,[2,5]),t(e,[2,6]),t(e,[2,8]),{13:[1,16]},{15:[1,17]},t(e,[2,11]),t(e,[2,12]),{19:[1,18]},t(e,[2,4]),t(e,[2,9]),t(e,[2,10]),t(e,[2,13])],defaultActions:{},parseError:function(i,n){if(n.recoverable)this.trace(i);else{var a=new Error(i);throw a.hash=n,a}},parse:function(i){var n=this,a=[0],u=[],f=[null],o=[],w=this.table,k="",R=0,Z=0,lt=2,J=1,ct=o.slice.call(arguments,1),x=Object.create(this.lexer),S={yy:{}};for(var z in this.yy)Object.prototype.hasOwnProperty.call(this.yy,z)&&(S.yy[z]=this.yy[z]);x.setInput(i,S.yy),S.yy.lexer=x,S.yy.parser=this,typeof x.yylloc>"u"&&(x.yylloc={});var Y=x.yylloc;o.push(Y);var ht=x.options&&x.options.ranges;typeof S.yy.parseError=="function"?this.parseError=S.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function ut(){var T;return T=u.pop()||x.lex()||J,typeof T!="number"&&(T instanceof Array&&(u=T,T=u.pop()),T=n.symbols_[T]||T),T}for(var _,E,b,O,A={},N,$,K,B;;){if(E=a[a.length-1],this.defaultActions[E]?b=this.defaultActions[E]:((_===null||typeof _>"u")&&(_=ut()),b=w[E]&&w[E][_]),typeof b>"u"||!b.length||!b[0]){var q="";B=[];for(N in w[E])this.terminals_[N]&&N>lt&&B.push("'"+this.terminals_[N]+"'");x.showPosition?q="Parse error on line "+(R+1)+`:
`+x.showPosition()+`
Expecting `+B.join(", ")+", got '"+(this.terminals_[_]||_)+"'":q="Parse error on line "+(R+1)+": Unexpected "+(_==J?"end of input":"'"+(this.terminals_[_]||_)+"'"),this.parseError(q,{text:x.match,token:this.terminals_[_]||_,line:x.yylineno,loc:Y,expected:B})}if(b[0]instanceof Array&&b.length>1)throw new Error("Parse Error: multiple actions possible at state: "+E+", token: "+_);switch(b[0]){case 1:a.push(_),f.push(x.yytext),o.push(x.yylloc),a.push(b[1]),_=null,Z=x.yyleng,k=x.yytext,R=x.yylineno,Y=x.yylloc;break;case 2:if($=this.productions_[b[1]][1],A.$=f[f.length-$],A._$={first_line:o[o.length-($||1)].first_line,last_line:o[o.length-1].last_line,first_column:o[o.length-($||1)].first_column,last_column:o[o.length-1].last_column},ht&&(A._$.range=[o[o.length-($||1)].range[0],o[o.length-1].range[1]]),O=this.performAction.apply(A,[k,Z,R,S.yy,b[1],f,o].concat(ct)),typeof O<"u")return O;$&&(a=a.slice(0,-1*$*2),f=f.slice(0,-1*$),o=o.slice(0,-1*$)),a.push(this.productions_[b[1]][0]),f.push(A.$),o.push(A._$),K=w[a[a.length-2]][a[a.length-1]],a.push(K);break;case 3:return!0}}return!0}},g=(function(){var d={EOF:1,parseError:function(n,a){if(this.yy.parser)this.yy.parser.parseError(n,a);else throw new Error(n)},setInput:function(i,n){return this.yy=n||this.yy||{},this._input=i,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var i=this._input[0];this.yytext+=i,this.yyleng++,this.offset++,this.match+=i,this.matched+=i;var n=i.match(/(?:\r\n?|\n).*/g);return n?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),i},unput:function(i){var n=i.length,a=i.split(/(?:\r\n?|\n)/g);this._input=i+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-n),this.offset-=n;var u=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),a.length-1&&(this.yylineno-=a.length-1);var f=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:a?(a.length===u.length?this.yylloc.first_column:0)+u[u.length-a.length].length-a[0].length:this.yylloc.first_column-n},this.options.ranges&&(this.yylloc.range=[f[0],f[0]+this.yyleng-n]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},less:function(i){this.unput(this.match.slice(i))},pastInput:function(){var i=this.matched.substr(0,this.matched.length-this.match.length);return(i.length>20?"...":"")+i.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var i=this.match;return i.length<20&&(i+=this._input.substr(0,20-i.length)),(i.substr(0,20)+(i.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var i=this.pastInput(),n=new Array(i.length+1).join("-");return i+this.upcomingInput()+`
`+n+"^"},test_match:function(i,n){var a,u,f;if(this.options.backtrack_lexer&&(f={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(f.yylloc.range=this.yylloc.range.slice(0))),u=i[0].match(/(?:\r\n?|\n).*/g),u&&(this.yylineno+=u.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:u?u[u.length-1].length-u[u.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+i[0].length},this.yytext+=i[0],this.match+=i[0],this.matches=i,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(i[0].length),this.matched+=i[0],a=this.performAction.call(this,this.yy,this,n,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),a)return a;if(this._backtrack){for(var o in f)this[o]=f[o];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var i,n,a,u;this._more||(this.yytext="",this.match="");for(var f=this._currentRules(),o=0;o<f.length;o++)if(a=this._input.match(this.rules[f[o]]),a&&(!n||a[0].length>n[0].length)){if(n=a,u=o,this.options.backtrack_lexer){if(i=this.test_match(a,f[o]),i!==!1)return i;if(this._backtrack){n=!1;continue}else return!1}else if(!this.options.flex)break}return n?(i=this.test_match(n,f[u]),i!==!1?i:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var n=this.next();return n||this.lex()},begin:function(n){this.conditionStack.push(n)},popState:function(){var n=this.conditionStack.length-1;return n>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(n){return n=this.conditionStack.length-1-Math.abs(n||0),n>=0?this.conditionStack[n]:"INITIAL"},pushState:function(n){this.begin(n)},stateStackSize:function(){return this.conditionStack.length},options:{"case-insensitive":!0},performAction:function(n,a,u,f){switch(u){case 0:break;case 1:break;case 2:return 10;case 3:break;case 4:break;case 5:return 4;case 6:return 11;case 7:return this.begin("acc_title"),12;case 8:return this.popState(),"acc_title_value";case 9:return this.begin("acc_descr"),14;case 10:return this.popState(),"acc_descr_value";case 11:this.begin("acc_descr_multiline");break;case 12:this.popState();break;case 13:return"acc_descr_multiline_value";case 14:return 17;case 15:return 18;case 16:return 19;case 17:return":";case 18:return 6;case 19:return"INVALID"}},rules:[/^(?:%(?!\{)[^\n]*)/i,/^(?:[^\}]%%[^\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:#[^\n]*)/i,/^(?:journey\b)/i,/^(?:title\s[^#\n;]+)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:section\s[^#:\n;]+)/i,/^(?:[^#:\n;]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[12,13],inclusive:!1},acc_descr:{rules:[10],inclusive:!1},acc_title:{rules:[8],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,9,11,14,15,16,17,18,19],inclusive:!0}}};return d})();y.lexer=g;function m(){this.yy={}}return m.prototype=y,y.Parser=m,new m})();X.parser=X;const wt=X;let C="";const G=[],V=[],F=[],$t=function(){G.length=0,V.length=0,C="",F.length=0,kt()},Tt=function(t){C=t,G.push(t)},Mt=function(){return G},St=function(){let t=D();const e=100;let r=0;for(;!t&&r<e;)t=D(),r++;return V.push(...F),V},Et=function(){const t=[];return V.forEach(r=>{r.people&&t.push(...r.people)}),[...new Set(t)].sort()},Pt=function(t,e){const r=e.substr(1).split(":");let l=0,s=[];r.length===1?(l=Number(r[0]),s=[]):(l=Number(r[0]),s=r[1].split(","));const h=s.map(p=>p.trim()),c={section:C,type:C,people:h,task:t,score:l};F.push(c)},It=function(t){const e={section:C,type:C,description:t,task:t,classes:[]};V.push(e)},D=function(){const t=function(r){return F[r].processed};let e=!0;for(const[r,l]of F.entries())t(r),e=e&&l.processed;return e},At=function(){return Et()},tt={getConfig:()=>I().journey,clear:$t,setDiagramTitle:gt,getDiagramTitle:mt,setAccTitle:dt,getAccTitle:ft,setAccDescription:pt,getAccDescription:yt,addSection:Tt,getSections:Mt,getTasks:St,addTask:Pt,addTaskOrg:It,getActors:At},Ct=t=>`.label {
    font-family: 'trebuchet ms', verdana, arial, sans-serif;
    font-family: var(--mermaid-font-family);
    color: ${t.textColor};
  }
  .mouth {
    stroke: #666;
  }

  line {
    stroke: ${t.textColor}
  }

  .legend {
    fill: ${t.textColor};
  }

  .label text {
    fill: #333;
  }
  .label {
    color: ${t.textColor}
  }

  .face {
    ${t.faceColor?`fill: ${t.faceColor}`:"fill: #FFF8DC"};
    stroke: #999;
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${t.mainBkg};
    stroke: ${t.nodeBorder};
    stroke-width: 1px;
  }

  .node .label {
    text-align: center;
  }
  .node.clickable {
    cursor: pointer;
  }

  .arrowheadPath {
    fill: ${t.arrowheadColor};
  }

  .edgePath .path {
    stroke: ${t.lineColor};
    stroke-width: 1.5px;
  }

  .flowchart-link {
    stroke: ${t.lineColor};
    fill: none;
  }

  .edgeLabel {
    background-color: ${t.edgeLabelBackground};
    rect {
      opacity: 0.5;
    }
    text-align: center;
  }

  .cluster rect {
  }

  .cluster text {
    fill: ${t.titleColor};
  }

  div.mermaidTooltip {
    position: absolute;
    text-align: center;
    max-width: 200px;
    padding: 2px;
    font-family: 'trebuchet ms', verdana, arial, sans-serif;
    font-family: var(--mermaid-font-family);
    font-size: 12px;
    background: ${t.tertiaryColor};
    border: 1px solid ${t.border2};
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
  }

  .task-type-0, .section-type-0  {
    ${t.fillType0?`fill: ${t.fillType0}`:""};
  }
  .task-type-1, .section-type-1  {
    ${t.fillType0?`fill: ${t.fillType1}`:""};
  }
  .task-type-2, .section-type-2  {
    ${t.fillType0?`fill: ${t.fillType2}`:""};
  }
  .task-type-3, .section-type-3  {
    ${t.fillType0?`fill: ${t.fillType3}`:""};
  }
  .task-type-4, .section-type-4  {
    ${t.fillType0?`fill: ${t.fillType4}`:""};
  }
  .task-type-5, .section-type-5  {
    ${t.fillType0?`fill: ${t.fillType5}`:""};
  }
  .task-type-6, .section-type-6  {
    ${t.fillType0?`fill: ${t.fillType6}`:""};
  }
  .task-type-7, .section-type-7  {
    ${t.fillType0?`fill: ${t.fillType7}`:""};
  }

  .actor-0 {
    ${t.actor0?`fill: ${t.actor0}`:""};
  }
  .actor-1 {
    ${t.actor1?`fill: ${t.actor1}`:""};
  }
  .actor-2 {
    ${t.actor2?`fill: ${t.actor2}`:""};
  }
  .actor-3 {
    ${t.actor3?`fill: ${t.actor3}`:""};
  }
  .actor-4 {
    ${t.actor4?`fill: ${t.actor4}`:""};
  }
  .actor-5 {
    ${t.actor5?`fill: ${t.actor5}`:""};
  }
`,Vt=Ct,U=function(t,e){return vt(t,e)},Ft=function(t,e){const l=t.append("circle").attr("cx",e.cx).attr("cy",e.cy).attr("class","face").attr("r",15).attr("stroke-width",2).attr("overflow","visible"),s=t.append("g");s.append("circle").attr("cx",e.cx-15/3).attr("cy",e.cy-15/3).attr("r",1.5).attr("stroke-width",2).attr("fill","#666").attr("stroke","#666"),s.append("circle").attr("cx",e.cx+15/3).attr("cy",e.cy-15/3).attr("r",1.5).attr("stroke-width",2).attr("fill","#666").attr("stroke","#666");function h(y){const g=Q().startAngle(Math.PI/2).endAngle(3*(Math.PI/2)).innerRadius(7.5).outerRadius(6.8181818181818175);y.append("path").attr("class","mouth").attr("d",g).attr("transform","translate("+e.cx+","+(e.cy+2)+")")}function c(y){const g=Q().startAngle(3*Math.PI/2).endAngle(5*(Math.PI/2)).innerRadius(7.5).outerRadius(6.8181818181818175);y.append("path").attr("class","mouth").attr("d",g).attr("transform","translate("+e.cx+","+(e.cy+7)+")")}function p(y){y.append("line").attr("class","mouth").attr("stroke",2).attr("x1",e.cx-5).attr("y1",e.cy+7).attr("x2",e.cx+5).attr("y2",e.cy+7).attr("class","mouth").attr("stroke-width","1px").attr("stroke","#666")}return e.score>3?h(s):e.score<3?c(s):p(s),l},nt=function(t,e){const r=t.append("circle");return r.attr("cx",e.cx),r.attr("cy",e.cy),r.attr("class","actor-"+e.pos),r.attr("fill",e.fill),r.attr("stroke",e.stroke),r.attr("r",e.r),r.class!==void 0&&r.attr("class",r.class),e.title!==void 0&&r.append("title").text(e.title),r},at=function(t,e){return bt(t,e)},Lt=function(t,e){function r(s,h,c,p,y){return s+","+h+" "+(s+c)+","+h+" "+(s+c)+","+(h+p-y)+" "+(s+c-y*1.2)+","+(h+p)+" "+s+","+(h+p)}const l=t.append("polygon");l.attr("points",r(e.x,e.y,50,20,7)),l.attr("class","labelBox"),e.y=e.y+e.labelMargin,e.x=e.x+.5*e.labelMargin,at(t,e)},Rt=function(t,e,r){const l=t.append("g"),s=rt();s.x=e.x,s.y=e.y,s.fill=e.fill,s.width=r.width*e.taskCount+r.diagramMarginX*(e.taskCount-1),s.height=r.height,s.class="journey-section section-type-"+e.num,s.rx=3,s.ry=3,U(l,s),ot(r)(e.text,l,s.x,s.y,s.width,s.height,{class:"journey-section section-type-"+e.num},r,e.colour)};let et=-1;const Nt=function(t,e,r){const l=e.x+r.width/2,s=t.append("g");et++,s.append("line").attr("id","task"+et).attr("x1",l).attr("y1",e.y).attr("x2",l).attr("y2",450).attr("class","task-line").attr("stroke-width","1px").attr("stroke-dasharray","4 2").attr("stroke","#666"),Ft(s,{cx:l,cy:300+(5-e.score)*30,score:e.score});const c=rt();c.x=e.x,c.y=e.y,c.fill=e.fill,c.width=r.width,c.height=r.height,c.class="task task-type-"+e.num,c.rx=3,c.ry=3,U(s,c);let p=e.x+14;e.people.forEach(y=>{const g=e.actors[y].color,m={cx:p,cy:e.y,r:7,fill:g,stroke:"#000",title:y,pos:e.actors[y].position};nt(s,m),p+=10}),ot(r)(e.task,s,c.x,c.y,c.width,c.height,{class:"task"},r,e.colour)},Bt=function(t,e){_t(t,e)},ot=(function(){function t(s,h,c,p,y,g,m,d){const i=h.append("text").attr("x",c+y/2).attr("y",p+g/2+5).style("font-color",d).style("text-anchor","middle").text(s);l(i,m)}function e(s,h,c,p,y,g,m,d,i){const{taskFontSize:n,taskFontFamily:a}=d,u=s.split(/<br\s*\/?>/gi);for(let f=0;f<u.length;f++){const o=f*n-n*(u.length-1)/2,w=h.append("text").attr("x",c+y/2).attr("y",p).attr("fill",i).style("text-anchor","middle").style("font-size",n).style("font-family",a);w.append("tspan").attr("x",c+y/2).attr("dy",o).text(u[f]),w.attr("y",p+g/2).attr("dominant-baseline","central").attr("alignment-baseline","central"),l(w,m)}}function r(s,h,c,p,y,g,m,d){const i=h.append("switch"),a=i.append("foreignObject").attr("x",c).attr("y",p).attr("width",y).attr("height",g).attr("position","fixed").append("xhtml:div").style("display","table").style("height","100%").style("width","100%");a.append("div").attr("class","label").style("display","table-cell").style("text-align","center").style("vertical-align","middle").text(s),e(s,i,c,p,y,g,m,d),l(a,m)}function l(s,h){for(const c in h)c in h&&s.attr(c,h[c])}return function(s){return s.textPlacement==="fo"?r:s.textPlacement==="old"?t:e}})(),jt=function(t){t.append("defs").append("marker").attr("id","arrowhead").attr("refX",5).attr("refY",2).attr("markerWidth",6).attr("markerHeight",4).attr("orient","auto").append("path").attr("d","M 0,0 V 4 L6,2 Z")},L={drawRect:U,drawCircle:nt,drawSection:Rt,drawText:at,drawLabel:Lt,drawTask:Nt,drawBackgroundRect:Bt,initGraphics:jt},zt=function(t){Object.keys(t).forEach(function(r){j[r]=t[r]})},M={};function Yt(t){const e=I().journey;let r=60;Object.keys(M).forEach(l=>{const s=M[l].color,h={cx:20,cy:r,r:7,fill:s,stroke:"#000",pos:M[l].position};L.drawCircle(t,h);const c={x:40,y:r+7,fill:"#666",text:l,textMargin:e.boxTextMargin|5};L.drawText(t,c),r+=20})}const j=I().journey,P=j.leftMargin,Ot=function(t,e,r,l){const s=I().journey,h=I().securityLevel;let c;h==="sandbox"&&(c=H("#i"+e));const p=h==="sandbox"?H(c.nodes()[0].contentDocument.body):H("body");v.init();const y=p.select("#"+e);L.initGraphics(y);const g=l.db.getTasks(),m=l.db.getDiagramTitle(),d=l.db.getActors();for(const o in M)delete M[o];let i=0;d.forEach(o=>{M[o]={color:s.actorColours[i%s.actorColours.length],position:i},i++}),Yt(y),v.insert(0,0,P,Object.keys(M).length*50),qt(y,g,0);const n=v.getBounds();m&&y.append("text").text(m).attr("x",P).attr("font-size","4ex").attr("font-weight","bold").attr("y",25);const a=n.stopy-n.starty+2*s.diagramMarginY,u=P+n.stopx+2*s.diagramMarginX;xt(y,a,u,s.useMaxWidth),y.append("line").attr("x1",P).attr("y1",s.height*4).attr("x2",u-P-4).attr("y2",s.height*4).attr("stroke-width",4).attr("stroke","black").attr("marker-end","url(#arrowhead)");const f=m?70:0;y.attr("viewBox",`${n.startx} -25 ${u} ${a+f}`),y.attr("preserveAspectRatio","xMinYMin meet"),y.attr("height",a+f+25)},v={data:{startx:void 0,stopx:void 0,starty:void 0,stopy:void 0},verticalPos:0,sequenceItems:[],init:function(){this.sequenceItems=[],this.data={startx:void 0,stopx:void 0,starty:void 0,stopy:void 0},this.verticalPos=0},updateVal:function(t,e,r,l){t[e]===void 0?t[e]=r:t[e]=l(r,t[e])},updateBounds:function(t,e,r,l){const s=I().journey,h=this;let c=0;function p(y){return function(m){c++;const d=h.sequenceItems.length-c+1;h.updateVal(m,"starty",e-d*s.boxMargin,Math.min),h.updateVal(m,"stopy",l+d*s.boxMargin,Math.max),h.updateVal(v.data,"startx",t-d*s.boxMargin,Math.min),h.updateVal(v.data,"stopx",r+d*s.boxMargin,Math.max),h.updateVal(m,"startx",t-d*s.boxMargin,Math.min),h.updateVal(m,"stopx",r+d*s.boxMargin,Math.max),h.updateVal(v.data,"starty",e-d*s.boxMargin,Math.min),h.updateVal(v.data,"stopy",l+d*s.boxMargin,Math.max)}}this.sequenceItems.forEach(p())},insert:function(t,e,r,l){const s=Math.min(t,r),h=Math.max(t,r),c=Math.min(e,l),p=Math.max(e,l);this.updateVal(v.data,"startx",s,Math.min),this.updateVal(v.data,"starty",c,Math.min),this.updateVal(v.data,"stopx",h,Math.max),this.updateVal(v.data,"stopy",p,Math.max),this.updateBounds(s,c,h,p)},bumpVerticalPos:function(t){this.verticalPos=this.verticalPos+t,this.data.stopy=this.verticalPos},getVerticalPos:function(){return this.verticalPos},getBounds:function(){return this.data}},W=j.sectionFills,it=j.sectionColours,qt=function(t,e,r){const l=I().journey;let s="";const h=l.height*2+l.diagramMarginY,c=r+h;let p=0,y="#CCC",g="black",m=0;for(const[d,i]of e.entries()){if(s!==i.section){y=W[p%W.length],m=p%W.length,g=it[p%it.length];let a=0;const u=i.section;for(let o=d;o<e.length&&e[o].section==u;o++)a=a+1;const f={x:d*l.taskMargin+d*l.width+P,y:50,text:i.section,fill:y,num:m,colour:g,taskCount:a};L.drawSection(t,f,l),s=i.section,p++}const n=i.people.reduce((a,u)=>(M[u]&&(a[u]=M[u]),a),{});i.x=d*l.taskMargin+d*l.width+P,i.y=c,i.width=l.diagramMarginX,i.height=l.diagramMarginY,i.colour=g,i.fill=y,i.num=m,i.actors=n,L.drawTask(t,i,l),v.insert(i.x,i.y,i.x+i.width+l.taskMargin,450)}},st={setConf:zt,draw:Ot},Ne={parser:wt,db:tt,renderer:st,styles:Vt,init:t=>{st.setConf(t.journey),tt.clear()}};export{Ne as diagram};
