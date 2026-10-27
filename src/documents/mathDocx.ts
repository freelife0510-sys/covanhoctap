import { MathRun, MathFraction, MathRadical, MathSuperScript, MathSubScript, MathSubSuperScript, MathIntegral, MathSum, XmlComponent, XmlAttributeComponent, type MathComponent } from 'docx';
class Val extends XmlAttributeComponent<{val:string}> {protected readonly xmlKeys={val:'m:val'};}
class Element extends XmlComponent {constructor(name:string,children:XmlComponent[]=[],value?:string){super(name);if(value!==undefined)this.root.push(new Val({val:value}));this.root.push(...children);}}
const symbols:Record<string,string>={alpha:'α',beta:'β',gamma:'γ',delta:'δ',theta:'θ',pi:'π',sigma:'σ',omega:'ω',infty:'∞',cdot:'·',times:'×',pm:'±',le:'≤',leq:'≤',ge:'≥',geq:'≥',ne:'≠',neq:'≠',in:'∈',notin:'∉',to:'→',Rightarrow:'⇒',Leftrightarrow:'⇔',sin:'sin',cos:'cos',tan:'tan',ln:'ln',log:'log',partial:'∂',nabla:'∇',ldots:'…',dots:'…',cup:'∪',cap:'∩',emptyset:'∅'};
export function latexToOmml(latex:string):MathComponent[]{
 if(latex.length>10000)throw new Error('Công thức quá dài để xuất Word.');
 let pos=0;let depth=0;const boundaries:(string|undefined)[]=[];
 const group=():MathComponent[]=>{while(latex[pos]===' ')pos++;if(latex[pos]==='{'){pos++;return parse('}');}if(pos>=latex.length)throw new Error('Công thức thiếu đối số.');return [atom()];};
 const scripts=()=>{let sub:MathComponent[]|undefined;let sup:MathComponent[]|undefined;while(latex[pos]==='_'||latex[pos]==='^'){const type=latex[pos++];if(type==='_')sub=group();else sup=group();}return{sub,sup};};
 const atom=():MathComponent=>{
  const char=latex[pos++];if(char==='\\'){
   const m=/^[A-Za-z]+/.exec(latex.slice(pos));const command=m?.[0]||latex[pos++];if(m)pos+=command.length;
   if(command==='frac'||command==='dfrac'||command==='tfrac')return new MathFraction({numerator:group(),denominator:group()});
   if(command==='sqrt'){let degree:MathComponent[]|undefined;if(latex[pos]==='['){pos++;degree=parse(']');}return new MathRadical({children:group(),degree});}
   if(command==='int'||command==='sum'){const{sub,sup}=scripts();return command==='int'?new MathIntegral({children:parse(boundaries.at(-1),false),subScript:sub,superScript:sup}):new MathSum({children:parse(boundaries.at(-1),false),subScript:sub,superScript:sup});}
   if(command==='vec'||command==='overrightarrow')return new Element('m:acc',[new Element('m:accPr',[new Element('m:chr',[],'⃗')]),new Element('m:e',group())]) as unknown as MathComponent;
   if(command==='begin'){
    const env=/^\{(p?b?matrix)\}/.exec(latex.slice(pos));if(!env)throw new Error('Môi trường LaTeX chưa hỗ trợ xuất Word.');pos+=env[0].length;
    const end=`\\end{${env[1]}}`;const endPos=latex.indexOf(end,pos);if(endPos<0)throw new Error('Ma trận thiếu end.');
    const rows=latex.slice(pos,endPos).split('\\\\').map(row=>new Element('m:mr',row.split('&').map(cell=>new Element('m:e',latexToOmml(cell)))));pos=endPos+end.length;
    const matrix=new Element('m:m',rows);
    if(env[1]==='matrix')return matrix as unknown as MathComponent;
    return new Element('m:d',[new Element('m:dPr',[new Element('m:begChr',[],env[1]==='bmatrix'?'[':'('),new Element('m:endChr',[],env[1]==='bmatrix'?']':')')]),new Element('m:e',[matrix])]) as unknown as MathComponent;
   }
   if(command==='mathbb'){const m=/^\{([RNZQC])\}/.exec(latex.slice(pos));if(!m)throw new Error('Mathbb chỉ hỗ trợ R,N,Z,Q,C.');pos+=m[0].length;return new MathRun(({R:'ℝ',N:'ℕ',Z:'ℤ',Q:'ℚ',C:'ℂ'} as Record<string,string>)[m[1]]);}
   if(command==='text'||command==='mathrm'||command==='mathbf')return new Element('m:e',group()) as unknown as MathComponent;
   if(command==='left'||command==='right')return atom();
   if(command===','||command===';'||command==='!'||command===' ')return new MathRun(' ');
   if(symbols[command])return new MathRun(symbols[command]);
   if(['{','}','%','_'].includes(command))return new MathRun(command);
   throw new Error(`Chưa hỗ trợ xuất công thức \\${command}. Giữ LaTeX hoặc sửa công thức trước khi xuất.`);
  }
  if(char==='{')return new Element('m:e',parse('}')) as unknown as MathComponent;
  if(char==='}'||char===undefined)throw new Error('Công thức không cân bằng ngoặc.');
  return new MathRun(char);
 };
 const parse=(end?:string,consumeEnd=true):MathComponent[]=>{
  boundaries.push(end);if(++depth>50)throw new Error('Công thức lồng quá sâu.');const result:MathComponent[]=[];
  while(pos<latex.length && (!end||latex[pos]!==end)){
   let base=atom();const {sub,sup}=scripts();if(sub&&sup)base=new MathSubSuperScript({children:[base],subScript:sub,superScript:sup});else if(sub)base=new MathSubScript({children:[base],subScript:sub});else if(sup)base=new MathSuperScript({children:[base],superScript:sup});result.push(base);
  }
  if(end){if(latex[pos]!==end)throw new Error('Công thức thiếu ngoặc đóng.');if(consumeEnd)pos++;}depth--;boundaries.pop();return result;
 };
 return parse();
}
