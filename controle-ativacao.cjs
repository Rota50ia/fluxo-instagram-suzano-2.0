'use strict';
// Persiste a transição de ativação para que reinícios não alterem o marco inicial.
function configurarAtivacao(db,{ativo,conta,agora=()=>new Date().toISOString()}){
 db.exec('CREATE TABLE IF NOT EXISTS controle_ativacao (conta TEXT PRIMARY KEY, ativo INTEGER NOT NULL, inicio TEXT)');
 if(!/^\d{1,40}$/.test(conta||'')) return null;
 db.exec('BEGIN IMMEDIATE');
 try{
  const atual=db.prepare('SELECT ativo,inicio FROM controle_ativacao WHERE conta=?').get(conta);
  if(!ativo){
   db.prepare('INSERT INTO controle_ativacao(conta,ativo,inicio) VALUES(?,0,NULL) ON CONFLICT(conta) DO UPDATE SET ativo=0').run(conta);
   db.exec('COMMIT');return null;
  }
  if(atual?.ativo===1 && atual.inicio){db.exec('COMMIT');return atual.inicio}
  const inicio=agora();
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(inicio)||Number.isNaN(Date.parse(inicio)))throw Error('Data inválida');
  db.prepare('INSERT INTO controle_ativacao(conta,ativo,inicio) VALUES(?,1,?) ON CONFLICT(conta) DO UPDATE SET ativo=1,inicio=excluded.inicio').run(conta,inicio);
  db.prepare("UPDATE acoes SET estado='ignorada_antes_ativacao',atualizado_em=? WHERE conta=? AND estado='pendente'").run(inicio,conta);
  db.exec('COMMIT');return inicio;
 }catch(e){db.exec('ROLLBACK');throw e}
}
module.exports={configurarAtivacao};
