'use strict';
const {spawnSync}=require('node:child_process');
const {randomUUID}=require('node:crypto');
const path=require('node:path');
const conta='teste-'+randomUUID();
const service='br.com.fluxo.instagram.token';
try {
 const result=spawnSync(path.join(__dirname,'dados','fluxo-chaves'),[],{input:JSON.stringify({conta,token:'token-de-teste-local'}),encoding:'utf8',timeout:30000});
 if(result.status!==0) throw Error('Falha ao guardar credencial temporária: '+(result.stderr||result.error||result.status));
 const lookup=spawnSync('/usr/bin/security',['find-generic-password','-s',service,'-a',conta],{encoding:'utf8',timeout:30000});
 if(lookup.status!==0)throw Error('Credencial temporária não encontrada no Chaves.');
 console.log('O Chaves salvou e localizou a credencial temporária.');
} finally {
 const deleted=spawnSync('/usr/bin/security',['delete-generic-password','-s',service,'-a',conta],{encoding:'utf8',timeout:30000});
 if(deleted.status!==0)console.error('Aviso: não foi possível remover o item temporário '+conta);
}
