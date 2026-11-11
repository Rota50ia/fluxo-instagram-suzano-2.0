'use strict';
const { spawn } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const base='http://127.0.0.1:18765';
const dir=mkdtempSync(path.join(tmpdir(),'fluxo-teste-'));
let server;
function start(){return new Promise((resolve,reject)=>{server=spawn(process.execPath,['servidor.cjs'],{cwd:__dirname,env:{...process.env,FLUXO_PORT:'18765',FLUXO_DB:path.join(dir,'teste.sqlite')},stdio:['ignore','pipe','pipe']});server.stdout.once('data',resolve);server.once('exit',code=>reject(new Error('Servidor encerrou: '+code)));setTimeout(()=>reject(new Error('Tempo esgotado ao iniciar servidor')),5000).unref();})}
function stop(){return new Promise(resolve=>{server.once('exit',resolve);server.kill()})}
async function get(){const r=await fetch(base+'/api/estado');assert.equal(r.status,200);return r.json()}
async function post(url,data,origin=base){const r=await fetch(base+'/api/'+url,{method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify(data)});return {status:r.status,data:await r.json()}}
(async()=>{try{
 await start();
 assert.equal((await fetch(base+'/')).status,200);
 assert.equal((await post('perfis/adicionar',{nome:'@teste_fluxo'})).status,200);
 assert.equal((await post('perfis/adicionar',{nome:'@teste_fluxo'})).status,409);
 let r=await post('regras/adicionar',{perfil:'teste_fluxo',gatilho:'comentário',palavra:'QUERO',mensagem:'Olá!'});assert.equal(r.status,200);const id=r.data.regras[0].id;
 for(const texto of ['QUERO','quero','Quero','eu quero','Eu QUERO!','Quero saber mais','💚 quero, por favor']) {
  r=await post('simular',{perfil:'teste_fluxo',gatilho:'comentário',texto});assert.deepEqual(r.data.respostas,['Olá!'],texto);
 }
 for(const texto of ['euquero','quero123','queria','não estou interessado']) {
  r=await post('simular',{perfil:'teste_fluxo',gatilho:'comentário',texto});assert.deepEqual(r.data.respostas,[],texto);
 }
 r=await post('regras/adicionar',{perfil:'teste_fluxo',gatilho:'direct',palavra:'MÚSICA',mensagem:'Aula de música'});assert.equal(r.status,200);
 r=await post('simular',{perfil:'teste_fluxo',gatilho:'direct',texto:'Gosto de musica!'});assert.deepEqual(r.data.respostas,['Aula de música']);
 r=await post('regras/adicionar',{perfil:'teste_fluxo',gatilho:'direct',palavra:'!!!',mensagem:'Olá'});assert.equal(r.status,400);
 r=await post('regras/adicionar',{perfil:'teste_fluxo',gatilho:'comentário',palavra:'ACESSO',mensagem:'Post certo',publicacao:'123456'});assert.equal(r.status,200);
 for(const [pub,expected] of [['123456',['Post certo']],['999',[]],['',[]]]){
  r=await post('simular',{perfil:'teste_fluxo',gatilho:'comentário',texto:'Quero acesso',publicacao:pub});
  assert.deepEqual(r.data.respostas.filter(x=>x==='Post certo'),expected);
 }
 r=await post('regras/adicionar',{perfil:'teste_fluxo',gatilho:'direct',palavra:'ACESSO',mensagem:'Não deve criar',publicacao:'123456'});assert.equal(r.status,400);
 await post('regras/alternar',{id});r=await post('simular',{perfil:'teste_fluxo',gatilho:'comentário',texto:'quero'});assert.deepEqual(r.data.respostas,[]);
 assert.equal((await post('perfis/adicionar',{nome:'fora'},'https://example.com')).status,403);
 await stop();await start();const s=await get();assert.equal(s.perfis[0],'teste_fluxo');assert.equal(s.regras.find(regra=>regra.id===id).ativa,false);assert.equal(s.simulacoes.length,16);
 await post('perfis/remover',{nome:'teste_fluxo'});assert.equal((await get()).regras.length,0);
 console.log('Verificações aprovadas: páginas, cadastro, variações, publicação específica, pausa, origem, persistência e remoção.');
 }finally{if(server && server.exitCode===null)await stop();rmSync(dir,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exitCode=1});
