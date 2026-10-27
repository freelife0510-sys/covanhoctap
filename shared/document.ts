import {z} from 'zod';
const allowed=new Set(['doc','paragraph','text','heading','bulletList','orderedList','listItem','blockquote','hardBreak','horizontalRule','codeBlock','table','tableRow','tableCell','tableHeader','image','inlineMath','blockMath','pageBreak']);
export function validateDocument(value:unknown):boolean {
 let nodes=0;
 const visit=(node:any,depth:number):boolean=>{
  if(++nodes>10000||depth>40||!node||typeof node!=='object'||!allowed.has(node.type))return false;
  if(node.text!==undefined&&(typeof node.text!=='string'||node.text.length>100000))return false;
  if(node.attrs){for(const[key,v]of Object.entries(node.attrs)){
    if(!['id','nodeId','level','start','language','colspan','rowspan','colwidth','latex','src','alt','title','width','height','textAlign'].includes(key))return false;
    if(['src'].includes(key)&&!(typeof v==='string'&&/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(v)&&v.length<350000))return false;
    if(key==='latex'&&(typeof v!=='string'||v.length>10000))return false;
  }}
  if(node.marks&&(!Array.isArray(node.marks)||node.marks.some((m:any)=>!['bold','italic','strike','underline','code','link'].includes(m.type)||(m.type==='link'&&!/^https:\/\//.test(m.attrs?.href||'')))))return false;
  return !node.content || (Array.isArray(node.content)&&node.content.every((n:any)=>visit(n,depth+1)));
 };
 return visit(value,0)&&(value as any).type==='doc';
}
export const contentSchema=z.record(z.string(),z.unknown()).refine(validateDocument,'Invalid document structure');
