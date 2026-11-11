'use strict';
// Mostra apenas contagens; não revela credenciais, textos ou dados de pessoas.
const {DatabaseSync}=require('node:sqlite');
const path=require('node:path');
const db=new DatabaseSync(process.env.FLUXO_WEBHOOK_DB||path.join(__dirname,'dados','eventos.sqlite'),{readOnly:true});
try{
 const entregas=db.prepare('SELECT COUNT(*) AS total, SUM(CASE WHEN processada=0 THEN 1 ELSE 0 END) AS pendentes FROM entregas').get();
 const acoes=db.prepare('SELECT estado,COUNT(*) AS total FROM acoes GROUP BY estado').all();
 console.log(JSON.stringify({entregas:{total:entregas.total,pendentes:entregas.pendentes||0},acoes},null,2));
}finally{db.close()}
