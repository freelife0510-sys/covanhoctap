// Measured browser layout; math nodes and table rows are indivisible. Oversized
// objects fail explicitly rather than being clipped or causing a layout loop.
function tokens(node:Node):Node[]{
 if(node.nodeType===Node.TEXT_NODE)return (node.textContent?.match(/\S+\s*|\s+/g)||[]).map(t=>document.createTextNode(t));
 if(!(node instanceof HTMLElement))return[node.cloneNode(true)];
 if(node.matches('[data-type="inline-math"], [data-latex], .katex, .tiptap-mathematics-render, br, img'))return[node.cloneNode(true)];
 return Array.from(node.childNodes).flatMap(tokens).map(child=>{const copy=node.cloneNode(false);copy.appendChild(child);return copy;});
}
export function paginateDocument(source:HTMLElement,maxPages=100):HTMLElement[]{
 const stage=document.createElement('div');stage.style.cssText='position:absolute;left:-10000px;top:0;visibility:hidden;width:210mm;';document.body.appendChild(stage);
 const pages:HTMLElement[]=[];let current:HTMLElement;
 const limit=257*96/25.4-2;
 const next=()=>{if(pages.length>=maxPages)throw new Error('Tài liệu vượt giới hạn phân trang an toàn.');const page=document.createElement('div');page.className='a4-preview-page';current=document.createElement('div');current.className='a4-editor';current.style.cssText='width:170mm;min-height:0;padding:0;display:flow-root;';page.appendChild(current);stage.appendChild(page);pages.push(page);};
 const fits=()=>current.scrollHeight<=limit;
 const addParagraph=(block:HTMLElement)=>{
  let part=block.cloneNode(false) as HTMLElement;current.appendChild(part);const pieces=Array.from(block.childNodes).flatMap(tokens);
  for(const piece of pieces){part.appendChild(piece);if(!fits()){part.removeChild(piece);if(!part.childNodes.length){part.remove();if(!current.childNodes.length)throw new Error('Công thức hoặc khối nội dòng cao hơn trang A4; cần tách hoặc thu nhỏ.');}next();part=block.cloneNode(false) as HTMLElement;part.appendChild(piece);current.appendChild(part);if(!fits())throw new Error('Công thức hoặc từ không thể đặt trong trang A4.');}}
 };
 const addTable=(table:HTMLTableElement)=>{
  const rows=Array.from(table.rows);const header=rows[0]?.querySelector('th')?rows.shift():undefined;
  let part:HTMLTableElement;
  const start=()=>{part=table.cloneNode(false) as HTMLTableElement;if(header){const head=document.createElement('thead');head.appendChild(header.cloneNode(true));part.appendChild(head);}part.appendChild(document.createElement('tbody'));current.appendChild(part);};
  start();let count=0;
  for(const row of rows){const copy=row.cloneNode(true);part!.tBodies[0].appendChild(copy);if(!fits()){copy.parentNode!.removeChild(copy);if(!count)part!.remove();if(!count&&!current.childNodes.length)throw new Error('Một dòng bảng cao hơn trang A4. Hãy chia dòng hoặc thu nhỏ nội dung.');next();start();part!.tBodies[0].appendChild(copy);count=0;if(!fits())throw new Error('Một dòng bảng cao hơn trang A4.');}count++;}
 };
 try{
  next();for(const original of Array.from(source.children)){
   if(!(original instanceof HTMLElement))continue;
   if(original.matches('[data-page-break]')){if(current!.childNodes.length)next();continue;}
   const block=original.cloneNode(true) as HTMLElement;
   for(const image of block.matches('img')?[block as HTMLImageElement]:Array.from(block.querySelectorAll('img'))){image.style.maxHeight='240mm';image.style.maxWidth='170mm';image.style.objectFit='contain';}
   current!.appendChild(block);if(fits())continue;block.remove();
   const table=(original.matches('table')?original:original.querySelector('table')) as HTMLTableElement|null;
   if(table){addTable(table);continue;}
   if(original.matches('p,h1,h2,h3,h4,h5,h6')){addParagraph(original);continue;}
   if(current!.childNodes.length)next();current!.appendChild(block);if(!fits())throw new Error('Khối danh sách, hình hoặc công thức cao hơn trang A4. Hãy tách khối trước khi in.');
  }
  if(pages.some(p=>p.firstElementChild!.scrollWidth>p.firstElementChild!.clientWidth+2))throw new Error('Nội dung rộng hơn khổ A4. Hãy tách công thức hoặc giảm kích thước bảng.');
  return pages;
 }finally{stage.remove();}
}
