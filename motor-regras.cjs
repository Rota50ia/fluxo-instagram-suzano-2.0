'use strict';
// Planejamento puro: este módulo não recebe rede, grava dados ou envia mensagens.
function normalizar(texto){return texto.normalize('NFD').replace(/\p{M}+/gu,'').toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ')}
function corresponde(texto,palavra){if(typeof texto!=='string'||typeof palavra!=='string')return false;const buscada=normalizar(palavra);return Boolean(buscada)&&(` ${normalizar(texto)} `).includes(` ${buscada} `)}
function textoSeguro(value){return typeof value==='string'&&value.trim()?value.trim():null}
function identificarEventos(payload,contasPermitidas){
 if(!payload||payload.object!=='instagram'||!Array.isArray(payload.entry)||!Array.isArray(contasPermitidas))return [];
 const autorizadas=new Set(contasPermitidas.map(String)), eventos=[];
 for(const entry of payload.entry){
  if(!entry||!autorizadas.has(String(entry.id)))continue;
  const conta=String(entry.id);
  for(const change of Array.isArray(entry.changes)?entry.changes:[]){
   const value=change?.value;if(change?.field!=='comments'||!value)continue;
   const id=textoSeguro(value.id),texto=textoSeguro(value.text),autor=textoSeguro(value.from?.id);
   if(!id||!texto||!autor||autor===conta)continue;
   const publicacao=textoSeguro(value.media?.id)||textoSeguro(value.media_id);
   eventos.push({id,tipo:'comentário',conta,autor,texto,publicacao});
  }
  for(const msg of Array.isArray(entry.messaging)?entry.messaging:[]){
   if(msg?.message?.is_echo||msg?.message?.is_deleted)continue;
   const id=textoSeguro(msg?.message?.mid),texto=textoSeguro(msg?.message?.text),autor=textoSeguro(msg?.sender?.id),destinatario=textoSeguro(msg?.recipient?.id);
   if(!id||!texto||!autor||autor===conta||destinatario!==conta)continue;
   eventos.push({id,tipo:'direct',conta,autor,texto});
  }
 }
 return eventos;
}
function planejar(eventos,regras){
 if(!Array.isArray(eventos)||!Array.isArray(regras))return [];
 const result=[];
 for(const ev of eventos){
  const regra=regras.find(r=>r&&r.ativa===true&&r.conta===ev.conta&&r.tipo===ev.tipo&&(!r.publicacao || (ev.tipo==='comentário' && ev.publicacao===r.publicacao))&&corresponde(ev.texto,r.palavra)&&textoSeguro(r.mensagem));
  if(regra)result.push({eventoId:ev.id,tipo:ev.tipo,conta:ev.conta,autor:ev.autor,mensagem:regra.mensagem.trim()});
 }
 return result;
}
module.exports={normalizar,corresponde,identificarEventos,planejar};
