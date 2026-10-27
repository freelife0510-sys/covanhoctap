import { Document, Packer, Paragraph, TextRun, Math as Equation, Table, TableRow, TableCell, HeadingLevel, PageBreak, ImageRun, type FileChild, type ParagraphChild } from 'docx';
import type { JSONContent } from '@tiptap/core';
import {latexToOmml} from './mathDocx.ts';
function inline(node:JSONContent):ParagraphChild[]{
 if(node.type==='text')return [new TextRun({text:node.text||'',bold:node.marks?.some(m=>m.type==='bold'),italics:node.marks?.some(m=>m.type==='italic')})];
 if(node.type==='inlineMath'||node.type==='blockMath')return [new Equation({children:latexToOmml(String(node.attrs?.latex||''))})];
 if(node.type==='hardBreak')return [new TextRun({break:1})];
 return (node.content||[]).flatMap(inline);
}
function blocks(nodes:JSONContent[]):(Paragraph|Table)[]{return nodes.flatMap(node=>{
 if(node.type==='paragraph'||node.type==='heading'||node.type==='blockMath')return [new Paragraph({heading:node.type==='heading'?HeadingLevel.HEADING_2:undefined,children:node.type==='blockMath'?inline(node):(node.content||[]).flatMap(inline)})];
 if(node.type==='pageBreak')return [new Paragraph({children:[new PageBreak()]})];
 if(node.type==='bulletList'||node.type==='orderedList'||node.type==='listItem'||node.type==='blockquote')return blocks(node.content||[]);
 if(node.type==='table')return [new Table({rows:(node.content||[]).map((row,i)=>new TableRow({tableHeader:i===0,children:(row.content||[]).map(cell=>new TableCell({children:blocks(cell.content||[])}))}))})];
 if(node.type==='image'){
  const src=String(node.attrs?.src||'');const m=/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(src);
  if(!m)throw new Error('Ảnh xuất Word phải là PNG/JPEG được nhúng trong tài liệu.');
  const data=Uint8Array.from(atob(m[2]),c=>c.charCodeAt(0));
  return [new Paragraph({children:[new ImageRun({type:m[1]==='png'?'png':'jpg',data,transformation:{width:Number(node.attrs?.width)||400,height:Number(node.attrs?.height)||250},altText:{title:'Hình minh họa',description:String(node.attrs?.alt||''),name:'figure'}})]})];
 }
 throw new Error(`Chưa hỗ trợ node ${node.type} trong DOCX. Không xuất mất nội dung âm thầm.`);
});}
export async function buildDocx(content:JSONContent,title='Tài liệu học tập'):Promise<Uint8Array>{
 const doc=new Document({title,creator:'Cố Vấn Học Tập',styles:{default:{document:{run:{font:'Times New Roman',size:24}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},children:blocks(content.content||[])}]});
 return new Uint8Array(await Packer.toArrayBuffer(doc));
}
export async function downloadDocx(content:JSONContent,title:string){const bytes=await buildDocx(content,title);const blob=new Blob([bytes as BlobPart],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${title.replace(/[^\p{L}\p{N} -]/gu,'').slice(0,80)||'Tai-lieu'}.docx`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
