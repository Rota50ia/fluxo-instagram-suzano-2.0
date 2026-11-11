'use strict';
// Painel exclusivamente local. Não exponha este servidor diretamente à internet.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { randomUUID } = require('node:crypto');
const { spawn } = require('node:child_process');
const root = __dirname;
const port = Number(process.env.FLUXO_PORT || 8765);
const dbPath = process.env.FLUXO_DB || path.join(root, 'dados', 'fluxo.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true, mode: 0o700 });
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS perfis (nome TEXT PRIMARY KEY, criado_em TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS regras (id TEXT PRIMARY KEY, perfil TEXT NOT NULL REFERENCES perfis(nome) ON DELETE CASCADE, gatilho TEXT NOT NULL, palavra TEXT NOT NULL, mensagem TEXT NOT NULL, ativa INTEGER NOT NULL DEFAULT 1, criado_em TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS simulacoes (id TEXT PRIMARY KEY, perfil TEXT NOT NULL, gatilho TEXT NOT NULL, texto TEXT NOT NULL, respostas TEXT NOT NULL, criado_em TEXT NOT NULL);`);
const json = (res, status, body) => { res.writeHead(status, {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}); res.end(JSON.stringify(body)); };
const fail = (status, message) => Object.assign(new Error(message), {status});
function clean(value, max, label) { if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw fail(400, `${label} inválido.`); return value.trim(); }
function profile(value) { const name=clean(value,31,'Perfil').replace(/^@/,'').toLowerCase(); if(!/^[a-z0-9._]{1,30}$/.test(name)) throw fail(400,'Perfil inválido.'); return name; }
function trigger(value) { if(!['comentário','direct'].includes(value)) throw fail(400,'Tipo de interação inválido.'); return value; }
function body(req) { return new Promise((resolve,reject)=>{ let text=''; req.setEncoding('utf8'); req.on('data',chunk=>{text+=chunk; if(text.length>20000) {reject(fail(413,'Dados muito grandes.')); req.destroy();}}); req.on('end',()=>{try {resolve(JSON.parse(text));} catch {reject(fail(400,'JSON inválido.'));}}); req.on('error',reject); }); }
// Ignora diferenças de caixa, acentos e pontuação, preservando limites de palavras.
function normalizeWords(value) {
 return value.normalize('NFD').replace(/\p{M}+/gu,'').toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
}
function matchesKeyword(text, keyword) {
 const target=normalizeWords(keyword);
 return Boolean(target) && (` ${normalizeWords(text)} `).includes(` ${target} `);
}
function saveToken(conta, token) {
 return new Promise((resolve,reject)=>{
  const child=spawn(path.join(root,'dados','fluxo-chaves'),[],{stdio:['pipe','pipe','pipe']});
  let errors=''; child.stderr.on('data',chunk=>{errors+=chunk.toString().slice(0,500)});
  child.once('error',()=>reject(fail(500,'Não foi possível abrir o Chaves do macOS.')));
  child.once('close',code=>code===0?resolve():reject(fail(500,errors.trim()||'Não foi possível salvar o token no Chaves do macOS.')));
  child.stdin.on('error',()=>{});
  child.stdin.end(JSON.stringify({conta,token}));
 });
}
const now = () => new Date().toISOString();
const rules = () => db.prepare('SELECT id, perfil, gatilho, palavra, mensagem, ativa FROM regras ORDER BY criado_em DESC').all().map(r=>({...r, ativa:!!r.ativa}));
const list = () => ({perfis:db.prepare('SELECT nome FROM perfis ORDER BY nome').all().map(x=>x.nome), regras:rules(), simulacoes:db.prepare('SELECT perfil,gatilho,texto,respostas,criado_em FROM simulacoes ORDER BY criado_em DESC LIMIT 20').all().map(x=>({...x,respostas:JSON.parse(x.respostas)}))});
const allowedHost = h => h === `127.0.0.1:${port}` || h === `localhost:${port}`;
const server = http.createServer(async (req,res)=>{
 try {
  if (!allowedHost(req.headers.host)) throw fail(403,'Acesso permitido apenas ao endereço local.');
  const origin=req.headers.origin;
  if (origin && origin !== `http://${req.headers.host}`) throw fail(403,'Origem não autorizada.');
  const url=new URL(req.url, `http://${req.headers.host}`);
  if(req.method==='GET' && (url.pathname==='/' || url.pathname==='/index.html')) {const file=fs.readFileSync(path.join(root,'index.html'));res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'"}); return res.end(file);}
  if(req.method==='GET' && url.pathname==='/app.js') {res.writeHead(200,{'content-type':'text/javascript; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});return res.end(fs.readFileSync(path.join(root,'app.js')));}
  if(req.method==='GET' && url.pathname==='/api/estado') return json(res,200,list());
  if(req.method!=='POST' || !url.pathname.startsWith('/api/')) throw fail(404,'Página não encontrada.');
  if(!origin || !/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) throw fail(403,'Requisição não autorizada.');
  const data=await body(req);
  if(url.pathname==='/api/token/salvar') {
   const conta=profile(data.perfil), token=clean(data.token,4096,'Token');
   if(!/^[A-Za-z0-9._-]{10,4096}$/.test(token)) throw fail(400,'Formato de token inválido. Confira o valor copiado.');
   await saveToken(conta,token);
   return json(res,200,{salvo:true});
  } else if(url.pathname==='/api/perfis/adicionar') {
   const nome=profile(data.nome); if(db.prepare('SELECT 1 FROM perfis WHERE nome=?').get(nome)) throw fail(409,'Este perfil já foi adicionado.'); db.prepare('INSERT INTO perfis VALUES (?,?)').run(nome,now());
  } else if(url.pathname==='/api/perfis/remover') {
   const nome=profile(data.nome); db.prepare('DELETE FROM perfis WHERE nome=?').run(nome);
  } else if(url.pathname==='/api/regras/adicionar') {
   const nome=profile(data.perfil), tipo=trigger(data.gatilho), palavra=clean(data.palavra,80,'Palavra'), mensagem=clean(data.mensagem,1000,'Mensagem');
   if(!normalizeWords(palavra)) throw fail(400,'A palavra precisa conter letras ou números.');
   if(!db.prepare('SELECT 1 FROM perfis WHERE nome=?').get(nome)) throw fail(400,'Adicione o perfil primeiro.');
   db.prepare('INSERT INTO regras VALUES (?,?,?,?,?,?,?)').run(randomUUID(),nome,tipo,palavra,mensagem,1,now());
  } else if(url.pathname==='/api/regras/alternar') {
   const id=clean(data.id,100,'Regra'); const result=db.prepare('UPDATE regras SET ativa=1-ativa WHERE id=?').run(id); if(!result.changes) throw fail(404,'Regra não encontrada.');
  } else if(url.pathname==='/api/regras/remover') {
   db.prepare('DELETE FROM regras WHERE id=?').run(clean(data.id,100,'Regra'));
  } else if(url.pathname==='/api/simular') {
   const nome=profile(data.perfil),tipo=trigger(data.gatilho),texto=clean(data.texto,1000,'Texto'); if(!db.prepare('SELECT 1 FROM perfis WHERE nome=?').get(nome)) throw fail(400,'Perfil não encontrado.');
   const respostas=rules().filter(r=>r.ativa && r.perfil===nome && r.gatilho===tipo && matchesKeyword(texto,r.palavra)).map(r=>r.mensagem);
   db.prepare('INSERT INTO simulacoes VALUES (?,?,?,?,?,?)').run(randomUUID(),nome,tipo,texto,JSON.stringify(respostas),now()); return json(res,200,{respostas});
  } else throw fail(404,'Operação não encontrada.');
  return json(res,200,list());
 } catch(err) { console.error(err.status ? err.message : 'Erro interno:', err.status ? '' : err); if(!res.headersSent) json(res,err.status||500,{erro:err.status ? err.message : 'Erro interno do servidor.'}); }
});
server.listen(port,'127.0.0.1',()=>console.log(`Fluxo disponível em http://127.0.0.1:${port}`));
