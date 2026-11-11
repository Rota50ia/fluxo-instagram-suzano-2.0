'use strict';
// Processamento experimental: o envio real exige habilitação explícita e dados completos.
const {identificarEventos,planejar}=require('./motor-regras.cjs');
function criarProcessador(db,config,transport){
 db.exec(`CREATE TABLE IF NOT EXISTS acoes (
  conta TEXT NOT NULL, comentario TEXT NOT NULL, mensagem TEXT NOT NULL,
  estado TEXT NOT NULL, criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL,
  codigo_http INTEGER, codigo_meta INTEGER,
  PRIMARY KEY(conta, comentario)
 );`);
 function planejarPendentes(){
  if(!config.regraAtiva || !config.conta || !config.publicacao || !config.mensagem || !config.ativacaoApos)return 0;
  const rows=db.prepare('SELECT hash,corpo,recebida_em FROM entregas WHERE processada=0 ORDER BY recebida_em LIMIT 100').all();
  let total=0;
  for(const row of rows){
   const data=JSON.parse(row.corpo);
   db.exec('BEGIN IMMEDIATE');
   try{
    if(row.recebida_em>=config.ativacaoApos){
     const ev=identificarEventos(data,[config.conta]);
     const plans=planejar(ev,[{ativa:true,conta:config.conta,tipo:'comentário',palavra:'QUERO',publicacao:config.publicacao,mensagem:config.mensagem}]);
     for(const action of plans){
      const now=new Date().toISOString();
      const result=db.prepare('INSERT OR IGNORE INTO acoes(conta,comentario,mensagem,estado,criado_em,atualizado_em) VALUES(?,?,?,?,?,?)').run(action.conta,action.eventoId,action.mensagem,'pendente',now,now);
      total+=Number(result.changes);
     }
    }
    db.prepare('UPDATE entregas SET processada=1 WHERE hash=?').run(row.hash);
    db.exec('COMMIT');
   }catch(err){db.exec('ROLLBACK');throw err}
  }
  return total;
 }
 async function enviarPendente(){
  if(!config.envioAtivo || !config.token)return null;
  const job=db.prepare("SELECT conta,comentario,mensagem FROM acoes WHERE estado='pendente' ORDER BY criado_em LIMIT 1").get();
  if(!job)return null;
  const now=new Date().toISOString();
  const claimed=db.prepare("UPDATE acoes SET estado='enviando',atualizado_em=? WHERE conta=? AND comentario=? AND estado='pendente'").run(now,job.conta,job.comentario);
  if(!claimed.changes)return null;
  try{
   const result=await transport({conta:job.conta,comentario:job.comentario,mensagem:job.mensagem,token:config.token});
   const ok=result.status>=200&&result.status<300&&Boolean(result.messageId);
   db.prepare('UPDATE acoes SET estado=?,atualizado_em=?,codigo_http=?,codigo_meta=? WHERE conta=? AND comentario=?').run(ok?'enviada':'falhou',new Date().toISOString(),result.status||null,result.codigo||null,job.conta,job.comentario);
   return ok?'enviada':'falhou';
  }catch{
   // Uma resposta perdida pode significar envio já concluído. Não repetir automaticamente.
   db.prepare("UPDATE acoes SET estado='incerta',atualizado_em=? WHERE conta=? AND comentario=?").run(new Date().toISOString(),job.conta,job.comentario);
   return 'incerta';
  }
 }
 return {planejarPendentes,enviarPendente};
}
async function enviarMeta({conta,comentario,mensagem,token}){
 if(!/^\d{1,40}$/.test(conta)||!/^\d{1,40}$/.test(comentario))throw Error('Identificador inválido');
 const response=await fetch(`https://graph.instagram.com/v25.0/${conta}/messages`,{
  method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),
  headers:{'content-type':'application/json',authorization:'Bearer '+token},
  body:JSON.stringify({recipient:{comment_id:comentario},message:{text:mensagem}})
 });
 let data={};try{data=await response.json()}catch{}
 return {status:response.status,codigo:Number.isInteger(data?.error?.code)?data.error.code:null,messageId:typeof data.message_id==='string'?data.message_id:null};
}
module.exports={criarProcessador,enviarMeta};
