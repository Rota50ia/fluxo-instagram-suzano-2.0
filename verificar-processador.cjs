'use strict';
const assert=require('node:assert/strict');
const {DatabaseSync}=require('node:sqlite');
const {criarProcessador,enviarMeta}=require('./processador.cjs');
const db=new DatabaseSync(':memory:');
db.exec('CREATE TABLE entregas (hash TEXT PRIMARY KEY, recebida_em TEXT NOT NULL, corpo TEXT NOT NULL, processada INTEGER NOT NULL DEFAULT 0)');
const config={regraAtiva:false,envioAtivo:false,conta:'100',publicacao:'200',mensagem:'Olá!',token:'teste',ativacaoApos:'2026-01-01T00:00:00.000Z'};
let calls=0,behavior='success';
const transport=async arg=>{calls++;assert.equal(arg.conta,'100');assert.equal(arg.comentario,'300');if(behavior==='uncertain')throw Error('timeout');return {status:200,messageId:'id-teste'}};
const worker=criarProcessador(db,config,transport);
function insert(hash,id,post,when='2026-11-11T00:00:00.000Z'){
 const payload={object:'instagram',entry:[{id:'100',changes:[{field:'comments',value:{id,text:'Eu quero!',from:{id:'900'},media:{id:post}}}]}]};
 db.prepare('INSERT INTO entregas(hash,recebida_em,corpo) VALUES(?,?,?)').run(hash,when,JSON.stringify(payload));
}
function actions(){return db.prepare('SELECT comentario,estado FROM acoes ORDER BY comentario').all()}
(async()=>{
 insert('old','301','200','2025-11-11T00:00:00.000Z');insert('one','300','200');insert('other','302','201');insert('duplicate','300','200');
 assert.equal(worker.planejarPendentes(),0);assert.equal(actions().length,0);
 config.regraAtiva=true;assert.equal(worker.planejarPendentes(),1);assert.equal(actions().length,1);assert.equal(actions()[0].comentario,'300');
 assert.equal(await worker.enviarPendente(),null);assert.equal(calls,0);
 config.envioAtivo=true;assert.equal(await worker.enviarPendente(),'enviada');assert.equal(actions()[0].estado,'enviada');assert.equal(await worker.enviarPendente(),null);assert.equal(calls,1);
 insert('timeout','303','200');worker.planejarPendentes();behavior='uncertain';
 const w2=criarProcessador(db,config,async()=>{calls++;throw Error('conexão encerrada')});
 assert.equal(await w2.enviarPendente(),'incerta');assert.equal(actions().find(x=>x.comentario==='303').estado,'incerta');assert.equal(await w2.enviarPendente(),null);
 assert.equal(calls,2);
 for(const id of ['400','500'])db.prepare('INSERT INTO acoes(conta,comentario,mensagem,estado,criado_em,atualizado_em) VALUES(?,?,?,?,?,?)').run('100',id,'Teste','pendente','2026-01-01','2026-01-01');
 config.regraAtiva=false;config.envioAtivo=false;config.testeAtivo=true;config.comentarioTeste='500';
 const tested=[];const targeted=criarProcessador(db,config,async action=>{tested.push(action.comentario);return {status:200,messageId:'ok'}});
 assert.equal(await targeted.enviarPendente(),'enviada');assert.deepEqual(tested,['500']);
 assert.equal(await targeted.enviarPendente(),null);assert.equal(actions().find(x=>x.comentario==='400').estado,'pendente');
 config.comentarioTeste='inválido';assert.equal(await targeted.enviarPendente(),null);
 const originalFetch=global.fetch;
 try {
  global.fetch=async(url,options)=>{assert.equal(url,'https://graph.instagram.com/v25.0/100/messages');assert.equal(options.headers.authorization,'Bearer token-ficticio');assert.deepEqual(JSON.parse(options.body),{recipient:{comment_id:'300'},message:{text:'Olá!'}});return {status:200,json:async()=>({message_id:'m-ficticio'})}};
  const resposta=await enviarMeta({conta:'100',comentario:'300',mensagem:'Olá!',token:'token-ficticio'});assert.equal(resposta.messageId,'m-ficticio');
  await assert.rejects(()=>enviarMeta({conta:'../',comentario:'300',mensagem:'Olá!',token:'token-ficticio'}));
 } finally {global.fetch=originalFetch}
 db.close();console.log('Processador: ativação, publicação, duplicatas, envio desativado, falha incerta e teste direcionado verificados com API simulada.');
})().catch(e=>{console.error(e);process.exitCode=1});
