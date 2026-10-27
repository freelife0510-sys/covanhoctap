import JSZip from 'jszip';import type {JSONContent} from '@tiptap/core';
function children(element:Element,name?:string):Element[]{return Array.from(element.children).filter(e=>!name||e.localName===name);}
function one(element:Element,name:string):Element|undefined{return children(element,name)[0];}
function text(element:Element,name:string){return Array.from(element.getElementsByTagNameNS('*',name)).map(e=>e.textContent||'').join('');}
function math(element:Element):string{
 const args=(name:string)=>{const e=one(element,name);if(!e)throw new Error(`Công thức thiếu ${name}`);return math(e);};
 switch(element.localName){
 case 'oMath':case 'oMathPara':case 'e':case 'num':case 'den':case 'sub':case 'sup':case 'deg':case 'mr':return children(element).map(math).join('');
 case 'r':return text(element,'t');
 case 't':return element.textContent||'';
 case 'f':return `\\frac{${args('num')}}{${args('den')}}`;
 case 'rad':{const degree=one(element,'deg');return `\\sqrt${degree&&math(degree)?`[${math(degree)}]`:''}{${args('e')}}`;}
 case 'sSup':return `{${args('e')}}^{${args('sup')}}`;
 case 'sSub':return `{${args('e')}}_{${args('sub')}}`;
 case 'sSubSup':return `{${args('e')}}_{${args('sub')}}^{${args('sup')}}`;
 case 'd':{const pr=one(element,'dPr');const attr=(tag:string,fallback:string)=>pr?.getElementsByTagNameNS('*',tag)[0]?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/math','val')||fallback;const begin=attr('begChr','(');const end=attr('endChr',')');return `\\left${begin==='{'?'\\{':begin}${children(element,'e').map(math).join(',')}\\right${end==='}'?'\\}':end}`;}
 case 'nary':{const pr=one(element,'naryPr');const chr=pr?.getElementsByTagNameNS('*','chr')[0]?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/math','val')||'∫';if(!['∫','∑'].includes(chr))throw new Error('Toán tử OMML chưa hỗ trợ.');return `${chr==='∑'?'\\sum':'\\int'}${one(element,'sub')?`_{${args('sub')}}`:''}${one(element,'sup')?`^{${args('sup')}}`:''} ${args('e')}`;}
 case 'acc':{const pr=one(element,'accPr');const chr=pr?.getElementsByTagNameNS('*','chr')[0]?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/math','val');if(chr&&!['⃗','→'].includes(chr))throw new Error('Dấu trên công thức chưa hỗ trợ.');return `\\vec{${args('e')}}`;}
 case 'm':return `\\begin{matrix}${children(element,'mr').map(row=>children(row,'e').map(math).join('&')).join('\\\\')}\\end{matrix}`;
 default:if(element.localName.endsWith('Pr'))return '';throw new Error(`Công thức OMML chưa hỗ trợ: ${element.localName}. Hãy cung cấp PDF để giữ nguyên cấu trúc.`);
 }
}
export async function importDocx(buffer:ArrayBuffer):Promise<JSONContent>{
 if(buffer.byteLength>10485760)throw new Error('DOCX vượt 10 MB.');const zip=await JSZip.loadAsync(buffer);
 let expanded=0;for(const file of Object.values(zip.files)){const size=(file as unknown as {_data?:{uncompressedSize:number}})._data?.uncompressedSize||0;expanded+=size;if(expanded>20_000_000)throw new Error('Tệp nén giải nén vượt giới hạn an toàn.');}
 const raw=await zip.file('word/document.xml')?.async('string');if(!raw||/<!DOCTYPE|<!ENTITY/i.test(raw))throw new Error('DOCX không hợp lệ hoặc chứa DTD.');
 const xml=new DOMParser().parseFromString(raw,'application/xml');if(xml.getElementsByTagName('parsererror').length)throw new Error('XML DOCX không hợp lệ.');
 if(['object','altChunk','OLEObject'].some(tag=>xml.getElementsByTagNameNS('*',tag).length))throw new Error('Tệp có đối tượng OLE/MathType hoặc nội dung chưa hỗ trợ. Vui lòng dùng PDF.');
 const relationships=await zip.file('word/_rels/document.xml.rels')?.async('string');const rels=new Map<string,string>();
 if(relationships){const parsed=new DOMParser().parseFromString(relationships,'application/xml');for(const rel of Array.from(parsed.getElementsByTagNameNS('*','Relationship'))){if(rel.getAttribute('TargetMode')==='External')continue;rels.set(rel.getAttribute('Id')||'',rel.getAttribute('Target')||'');}}
 const image=async(node:Element):Promise<JSONContent>=>{const blip=node.getElementsByTagNameNS('*','blip')[0];const rid=blip?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','embed');const target=rels.get(rid||'');if(!target||target.includes('..')||target.startsWith('/'))throw new Error('Ảnh DOCX không hỗ trợ.');const extension=target.split('.').pop()?.toLowerCase();if(!['png','jpg','jpeg'].includes(extension||''))throw new Error('Ảnh trong DOCX phải là PNG/JPEG.');const bytes=await zip.file(`word/${target}`)?.async('base64');if(!bytes||bytes.length>350000)throw new Error('Ảnh DOCX vượt giới hạn 256 KB.');return{type:'image',attrs:{src:`data:image/${extension==='png'?'png':'jpeg'};base64,${bytes}`,alt:'Hình nhập từ DOCX'}};};
 const inline=async(node:Element):Promise<JSONContent[]>=>{if(node.localName==='oMath'||node.localName==='oMathPara')return[{type:'inlineMath',attrs:{latex:math(node)}}];if(node.localName==='t')return node.textContent?[{type:'text',text:node.textContent}]:[];if(node.localName==='br')return[{type:'hardBreak'}];if(node.localName==='tab')return[{type:'text',text:'\t'}];if(node.localName==='drawing')throw new Error('Ảnh nội dòng cần chuyển sang đoạn ảnh riêng trước khi nhập.');const results=await Promise.all(children(node).filter(e=>!e.localName.endsWith('Pr')).map(inline));return results.flat();};
 const block=async(node:Element):Promise<JSONContent[]>=>{if(node.localName==='p'){const drawings=Array.from(node.getElementsByTagNameNS('*','drawing'));if(drawings.length){if(text(node,'t').trim())throw new Error('Đoạn vừa có ảnh vừa có chữ chưa hỗ trợ nhập không mất bố cục. Vui lòng dùng PDF.');return Promise.all(drawings.map(image));}return[{type:'paragraph',content:await inline(node)}];}if(node.localName==='tbl')return[{type:'table',content:await Promise.all(children(node,'tr').map(async row=>({type:'tableRow',content:await Promise.all(children(row,'tc').map(async cell=>({type:'tableCell',content:(await Promise.all(children(cell).filter(e=>e.localName==='p'||e.localName==='tbl').map(block))).flat()})))})))}];if(node.localName==='sectPr')return[];throw new Error(`Khối DOCX chưa hỗ trợ: ${node.localName}. Vui lòng dùng PDF.`);};
 const body=xml.getElementsByTagNameNS('*','body')[0];if(!body)throw new Error('Thiếu nội dung DOCX.');return{type:'doc',content:(await Promise.all(children(body).map(block))).flat()};
}
