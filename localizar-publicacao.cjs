'use strict';
// Consulta somente de leitura, sem expor a credencial no console ou em arquivos.
const {spawnSync}=require('node:child_process');
const https=require('node:https');
const [conta,shortcode]=process.argv.slice(2);
if(!/^[a-z0-9._]{1,30}$/.test(conta||'')||!/^[A-Za-z0-9_-]{4,30}$/.test(shortcode||'')){console.error('Informe o perfil e o identificador da publicação.');process.exit(1)}
const credential=spawnSync('/usr/bin/security',['find-generic-password','-s','br.com.fluxo.instagram.token','-a',conta,'-w'],{encoding:'utf8',timeout:60000});
if(credential.status!==0){console.error('Não foi possível acessar o token no Chaves.');process.exit(1)}
const token=credential.stdout.trim();
function get(url){return new Promise((resolve,reject)=>{const req=https.get(url,{headers:{Authorization:'Bearer '+token},timeout:15000},res=>{let body='';res.on('data',chunk=>{body+=chunk;if(body.length>2000000)req.destroy()});res.on('end',()=>{try{const result=JSON.parse(body);if(res.statusCode!==200)return reject(new Error(`Meta retornou HTTP ${res.statusCode} (código ${result.error?.code||'desconhecido'}).`));resolve(result)}catch{reject(new Error('Não foi possível interpretar a resposta da Meta.'))}})});req.on('error',e=>reject(new Error('Falha na conexão: '+(e.code||'erro de rede'))));req.on('timeout',()=>req.destroy());})}
(async()=>{let after;for(let page=0;page<15;page++){
 const u=new URL('https://graph.instagram.com/v25.0/me/media');u.searchParams.set('fields','id,permalink');u.searchParams.set('limit','100');if(after)u.searchParams.set('after',after);
 const data=await get(u);
 for(const item of data.data||[]){try{const parts=new URL(item.permalink).pathname.split('/').filter(Boolean);if(['p','reel','reels','tv'].includes(parts[0])&&parts[1]===shortcode){console.log(JSON.stringify({encontrada:true,perfil:conta,id:item.id,publicacao:'https://www.instagram.com/p/'+shortcode+'/'}));return}}catch{}}
 if(!data.paging?.next || !data.paging?.cursors?.after){console.log(JSON.stringify({encontrada:false,paginas_verificadas:page+1}));return}after=data.paging.cursors.after;
}console.log(JSON.stringify({encontrada:false,limite_paginas:15}));})().catch(err=>{console.error(err.message);process.exitCode=1});
