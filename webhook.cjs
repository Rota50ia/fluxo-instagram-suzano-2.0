'use strict';
// Receptor separado do painel. Apenas loopback; uma publicação segura precisa encaminhar exclusivamente /webhook.
const http=require('node:http');
const {createHmac,createHash,timingSafeEqual}=require('node:crypto');
const {DatabaseSync}=require('node:sqlite');
const {criarProcessador,enviarMeta}=require('./processador.cjs');
const fs=require('node:fs');
const path=require('node:path');
const verifyToken=process.env.FLUXO_WEBHOOK_VERIFY_TOKEN;
const secret=process.env.FLUXO_WEBHOOK_APP_SECRET;
if(!verifyToken || !secret){console.error('Configure o token de verificação e o segredo correto do aplicativo antes de iniciar.');process.exit(1)}
const port=Number(process.env.FLUXO_WEBHOOK_PORT||8766);
const host=process.env.FLUXO_WEBHOOK_HOST||'127.0.0.1';
const file=process.env.FLUXO_WEBHOOK_DB||path.join(__dirname,'dados','eventos.sqlite');
fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});
const db=new DatabaseSync(file);fs.chmodSync(file,0o600);
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS entregas (hash TEXT PRIMARY KEY, recebida_em TEXT NOT NULL, corpo TEXT NOT NULL, processada INTEGER NOT NULL DEFAULT 0)');
const cfg={
 regraAtiva:process.env.FLUXO_REGRA_ATIVA==='sim',envioAtivo:process.env.FLUXO_ENVIO_ATIVO==='sim',
 conta:process.env.FLUXO_INSTAGRAM_ID||'',publicacao:process.env.FLUXO_PUBLICACAO_ID||'',
 mensagem:process.env.FLUXO_MENSAGEM||'',token:process.env.FLUXO_INSTAGRAM_TOKEN||'',ativacaoApos:process.env.FLUXO_ATIVACAO_APOS||''
};
if(cfg.regraAtiva && (!/^\d{1,40}$/.test(cfg.conta)||!/^\d{1,40}$/.test(cfg.publicacao)||!cfg.mensagem||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(cfg.ativacaoApos)||Number.isNaN(Date.parse(cfg.ativacaoApos)))){
 console.error('A regra está desativada: a configuração é incompleta.');cfg.regraAtiva=false;
}
if(cfg.envioAtivo && (!cfg.regraAtiva||!cfg.token)){console.error('O envio está desativado: a configuração é incompleta.');cfg.envioAtivo=false}
const processador=criarProcessador(db,cfg,enviarMeta);
let busy=false;
setInterval(async()=>{if(busy)return;busy=true;try{processador.planejarPendentes();await processador.enviarPendente()}catch{console.error('Falha ao processar evento.')}finally{busy=false}},2000).unref();
function same(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length && timingSafeEqual(x,y)}
function send(res,status,text){res.writeHead(status,{'content-type':'text/plain; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(text)}
http.createServer((req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1');
 if(u.pathname!=='/webhook')return send(res,404,'Não encontrado');
 if(req.method==='GET'){
  if(u.searchParams.get('hub.mode')==='subscribe' && same(u.searchParams.get('hub.verify_token')||'',verifyToken) && u.searchParams.has('hub.challenge')) return send(res,200,u.searchParams.get('hub.challenge'));
  return send(res,403,'Não autorizado');
 }
 if(req.method!=='POST')return send(res,405,'Método não permitido');
 let bytes=0,chunks=[],tooLarge=false;
 req.on('data',chunk=>{bytes+=chunk.length;if(bytes>262144){tooLarge=true;chunks=[]}else if(!tooLarge)chunks.push(chunk)});
 req.on('end',()=>{
  if(tooLarge)return send(res,413,'Dados muito grandes');
  const raw=Buffer.concat(chunks), signature=req.headers['x-hub-signature-256']||'';
  const expected='sha256='+createHmac('sha256',secret).update(raw).digest('hex');
  if(!same(signature,expected))return send(res,403,'Não autorizado');
  let payload;try{payload=JSON.parse(raw.toString('utf8'))}catch{return send(res,400,'JSON inválido')}
  if(payload.object!=='instagram' || !Array.isArray(payload.entry))return send(res,400,'Evento inválido');
  try{
   const hash=createHash('sha256').update(raw).digest('hex');
   db.prepare('INSERT OR IGNORE INTO entregas(hash,recebida_em,corpo) VALUES(?,?,?)').run(hash,new Date().toISOString(),raw.toString('utf8'));
   return send(res,200,'EVENT_RECEIVED');
  }catch{console.error('Não foi possível registrar o evento.');return send(res,500,'Erro interno')}
 });
 req.on('error',()=>{if(!res.headersSent)send(res,400,'Requisição inválida')});
}).listen(port,host,()=>console.log(`Receptor de webhook iniciado na porta ${port}.`));
