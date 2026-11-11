'use strict';
// Diagnóstico somente de leitura; não imprime nem persiste a credencial.
const {spawnSync}=require('node:child_process');
const https=require('node:https');
const conta=process.argv[2];
if(!conta || !/^[a-z0-9._]{1,30}$/.test(conta)){console.error('Informe um perfil válido.');process.exit(1)}
const r=spawnSync('/usr/bin/security',['find-generic-password','-s','br.com.fluxo.instagram.token','-a',conta,'-w'],{encoding:'utf8',timeout:60000});
if(r.status!==0){console.error('Não foi possível acessar o token no Chaves. Verifique a autorização do macOS e o nome do perfil.');process.exit(1)}
const token=r.stdout.trim();
const req=https.request('https://graph.instagram.com/v25.0/me?fields=id,username',{headers:{Authorization:'Bearer '+token},timeout:15000},res=>{let body='';res.on('data',part=>{body+=part;if(body.length>100000)req.destroy()});res.on('end',()=>{try{const data=JSON.parse(body);if(res.statusCode===200 && data.username && data.id){console.log(JSON.stringify({status:res.statusCode,perfil:data.username,conta_correta:data.username.toLowerCase()===conta,id:data.id}));}else{console.log(JSON.stringify({status:res.statusCode,erro_api:true,codigo:data.error?.code,subcodigo:data.error?.error_subcode}));process.exitCode=1}}catch{console.error('Resposta inesperada da Meta.');process.exitCode=1}})});
req.on('error',e=>{console.error('Não foi possível conectar à Meta: '+e.code);process.exitCode=1});req.on('timeout',()=>req.destroy());req.end();
