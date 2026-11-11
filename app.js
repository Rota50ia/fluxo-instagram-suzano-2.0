'use strict';
const el=id=>document.getElementById(id);
let state={perfis:[],regras:[],simulacoes:[]};
function element(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function error(message){const box=el('error');box.hidden=!message;box.textContent=message||''}
async function api(route,data){
 try {
  const response=await fetch('/api/'+route,data===undefined?{}:{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
  const result=await response.json(); if(!response.ok)throw new Error(result.erro||'Não foi possível concluir a operação.'); error(''); return result;
 }catch(e){error(location.protocol==='file:'?'Abra o painel pelo servidor local: http://127.0.0.1:8765':e.message||'Não foi possível acessar o servidor local.');throw e}
}
async function update(route,data){state=await api(route,data);render()}
function render(){
 const profiles=el('profiles');profiles.replaceChildren();
 if(!state.perfis.length)profiles.append(element('div','Nenhum perfil cadastrado ainda.','empty'));
 state.perfis.forEach(name=>{const item=element('div',undefined,'item'),info=element('div');info.append(element('strong','@'+name),element('small','Aguardando conexão com a Meta'));const button=element('button','Remover','remove');button.type='button';button.setAttribute('aria-label','Remover perfil @'+name);button.onclick=async()=>{if(state.regras.some(r=>r.perfil===name)&&!confirm('Remover este perfil também excluirá suas regras. Continuar?'))return;try{await update('perfis/remover',{nome:name})}catch{}};item.append(info,button);profiles.append(item)});
 ['rule-profile','test-profile'].forEach(id=>{const select=el(id),previous=select.value;select.replaceChildren();if(!state.perfis.length){const o=element('option','Adicione um perfil primeiro');o.value='';select.append(o)}else state.perfis.forEach(name=>{const o=element('option','@'+name);o.value=name;select.append(o)});if(state.perfis.includes(previous))select.value=previous});
 const list=el('rules');list.replaceChildren();el('count').textContent=state.regras.length;
 if(!state.regras.length)list.append(element('div','Suas automações aparecerão aqui.','empty'));
 state.regras.forEach(rule=>{const item=element('div',undefined,'item'),info=element('div'),actions=element('div');info.append(element('strong',rule.palavra),element('small','@'+rule.perfil+' · '+rule.gatilho+' · '+(rule.ativa?'Ativa para simulação':'Pausada')+' · '+rule.mensagem));const toggle=element('button',rule.ativa?'Pausar':'Ativar','remove'),remove=element('button','Excluir','remove');toggle.type=remove.type='button';toggle.setAttribute('aria-label',(rule.ativa?'Pausar ':'Ativar ')+rule.palavra);remove.setAttribute('aria-label','Excluir automação '+rule.palavra);toggle.onclick=async()=>{try{await update('regras/alternar',{id:rule.id})}catch{}};remove.onclick=async()=>{if(!confirm('Excluir esta automação?'))return;try{await update('regras/remover',{id:rule.id})}catch{}};actions.append(toggle,remove);item.append(info,actions);list.append(item)});
 const history=el('history');history.replaceChildren();if(!state.simulacoes.length)history.append(element('div','Nenhuma simulação realizada.','empty'));
 state.simulacoes.forEach(x=>{const item=element('div',undefined,'item'),info=element('div');info.append(element('strong','@'+x.perfil+' · '+x.gatilho),element('small',x.texto+' → '+(x.respostas.length?x.respostas.join(' / '):'Nenhuma resposta')));item.append(info);history.append(item)});
}
el('profile-form').onsubmit=async e=>{e.preventDefault();try{await update('perfis/adicionar',{nome:el('profile').value});e.target.reset()}catch{}};
el('rule-form').onsubmit=async e=>{e.preventDefault();try{await update('regras/adicionar',{perfil:el('rule-profile').value,gatilho:el('trigger').value,palavra:el('keyword').value,mensagem:el('message').value});e.target.reset()}catch{}};
el('test-form').onsubmit=async e=>{e.preventDefault();try{const result=await api('simular',{perfil:el('test-profile').value,gatilho:el('test-trigger').value,texto:el('test-text').value});el('result').hidden=false;el('result').textContent=result.respostas.length?'Resposta simulada:\n'+result.respostas.join('\n\n'):'Nenhuma regra ativa encontrada para essa interação.';state=await api('estado');render()}catch{}};
el('token-form').onsubmit=async e=>{e.preventDefault();const input=el('access-token'),button=e.target.querySelector('button');button.disabled=true;el('token-result').hidden=true;try{await api('token/salvar',{perfil:el('token-profile').value,token:input.value});input.value='';el('token-result').hidden=false;el('token-result').textContent='Token guardado no Chaves do macOS. A conexão com o Instagram ainda precisa ser implementada e testada.'}catch{}finally{button.disabled=false}};
api('estado').then(data=>{state=data;render()}).catch(()=>{});
