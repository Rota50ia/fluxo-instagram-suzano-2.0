'use strict';
const {spawn}=require('node:child_process');
const {mkdtempSync,rmSync}=require('node:fs');
const {tmpdir}=require('node:os');
const path=require('node:path');
const {createHmac}=require('node:crypto');
const {DatabaseSync}=require('node:sqlite');
const assert=require('node:assert/strict');
const dir=mkdtempSync(path.join(tmpdir(),'fluxo-webhook-'));
const file=path.join(dir,'teste.sqlite');
const url='http://127.0.0.1:18766/webhook';
const secret='segredo-de-teste',verify='verificacao-de-teste';
const child=spawn(process.execPath,['webhook.cjs'],{cwd:__dirname,env:{...process.env,FLUXO_WEBHOOK_PORT:'18766',FLUXO_WEBHOOK_DB:file,FLUXO_WEBHOOK_APP_SECRET:secret,FLUXO_WEBHOOK_VERIFY_TOKEN:verify},stdio:['ignore','pipe','pipe']});
async function wait(){return new Promise((ok,fail)=>{child.stdout.once('data',ok);child.once('exit',code=>fail(Error('Servidor encerrou: '+code)));setTimeout(()=>fail(Error('Tempo esgotado')),5000).unref()})}
(async()=>{try{
 await wait();
 let r=await fetch(url+'?hub.mode=subscribe&hub.verify_token='+verify+'&hub.challenge=12345');assert.equal(r.status,200);assert.equal(await r.text(),'12345');
 r=await fetch(url+'?hub.mode=subscribe&hub.verify_token=errado&hub.challenge=12345');assert.equal(r.status,403);
 const body=JSON.stringify({object:'instagram',entry:[{id:'teste',changes:[]}]});
 const signed='sha256='+createHmac('sha256',secret).update(body).digest('hex');
 r=await fetch(url,{method:'POST',headers:{'x-hub-signature-256':'sha256=errado'},body});assert.equal(r.status,403);
 for(let i=0;i<2;i++){r=await fetch(url,{method:'POST',headers:{'x-hub-signature-256':signed},body});assert.equal(r.status,200)}
 const db=new DatabaseSync(file);assert.equal(db.prepare('SELECT count(*) AS n FROM entregas').get().n,1);db.close();
 console.log('Webhook: verificação, assinatura, rejeição e registro de entrega duplicada aprovados.');
 }finally{await new Promise(resolve=>{child.once('exit',resolve);child.kill()});rmSync(dir,{recursive:true,force:true})}})().catch(e=>{console.error(e.message);process.exitCode=1});
