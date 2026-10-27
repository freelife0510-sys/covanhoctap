import { HttpError } from './http.ts';
export function validateFileBytes(bytes: Uint8Array, mime: string, expected: number) {
  if (bytes.length !== expected || bytes.length > 10485760) throw new HttpError(422, 'FILE_SIZE_MISMATCH', 'Kích thước tệp không khớp.');
  const b = Buffer.from(bytes);
  const valid = mime === 'application/pdf' ? b.subarray(0,5).toString() === '%PDF-'
    : mime === 'image/png' ? b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : mime === 'image/jpeg' ? b[0] === 255 && b[1] === 216 && b[2] === 255
    : mime === 'image/webp' ? b.subarray(0,4).toString() === 'RIFF' && b.subarray(8,12).toString() === 'WEBP'
    : mime.includes('wordprocessingml') ? b[0] === 80 && b[1] === 75 : false;
  if (!valid) throw new HttpError(422, 'FILE_MIME_MISMATCH', 'Nội dung tệp không khớp định dạng được chọn.');
}
export async function inspectFile(bytes: Uint8Array,mime:string,expected:number){
 validateFileBytes(bytes,mime,expected);
 if(mime==='application/pdf'){
  try{const {PDFDocument}=await import('pdf-lib');const pdf=await PDFDocument.load(bytes,{ignoreEncryption:false});if(pdf.getPageCount()>20)throw new HttpError(422,'PDF_TOO_MANY_PAGES','PDF vượt 20 trang. Vui lòng tách tệp.');}
  catch(e){if(e instanceof HttpError)throw e;throw new HttpError(422,'PDF_UNREADABLE','PDF hỏng, mã hóa hoặc có mật khẩu.');}
 }else if(mime.startsWith('image/')){
  try{const sharp=(await import('sharp')).default;const meta=await sharp(bytes,{limitInputPixels:40_000_000}).metadata();if(!meta.width||!meta.height||meta.width*meta.height>40_000_000)throw new Error('dimensions');}
  catch{throw new HttpError(422,'IMAGE_UNREADABLE','Ảnh hỏng hoặc độ phân giải vượt giới hạn.');}
 }else throw new HttpError(422,'UNSUPPORTED_FILE','Chưa hỗ trợ định dạng tệp này. Vui lòng dùng PDF hoặc ảnh.');
}
