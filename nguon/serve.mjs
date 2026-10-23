import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const goc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kieu = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.md':'text/plain; charset=utf-8','.css':'text/css'};
http.createServer((q,r)=>{ let u=decodeURIComponent(q.url.split('?')[0]); if(u==='/') u='/ego3d.html'; const f=path.join(goc,u); if(!f.startsWith(goc)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('khong thay');}
 r.writeHead(200,{'Content-Type':kieu[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'}); fs.createReadStream(f).pipe(r); }).listen(5612,()=>console.log('http://localhost:5612'));
