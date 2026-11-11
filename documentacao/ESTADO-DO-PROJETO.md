# Fluxo para Instagram — estado do projeto

**Atualizado em:** 11 de novembro de 2026, após a verificação da conta na Meta

## Objetivo

Criar uma ferramenta própria de automação para os perfis de Instagram do Edilson. O objetivo futuro inclui responder a comentários e directs por meio da integração oficial da Meta.

## O que já funciona no computador

- Cadastrar e remover perfis.
- Criar e excluir regras por perfil, tipo de interação e palavra.
- Ativar e pausar regras para simulações.
- Identificar a palavra em frases, ignorando maiúsculas, minúsculas, acentos, espaços e pontuação. Ex.: `QUERO` identifica `Quero!` e `eu quero`, mas não `euquero`. Outras palavras ou conjugações, como `queria`, não são reconhecidas automaticamente.
- Simular comentários e directs e consultar as 20 simulações mais recentes.
- Guardar manualmente um token por perfil no Chaves do macOS, sem validação automática nem conexão à Meta.
- Salvar perfis, regras e simulações em SQLite, no arquivo `dados/fluxo.sqlite`, criado pelo servidor local. O banco não deve ser incluído em repositórios públicos.

O formulário de token armazena a credencial no Chaves. Uma consulta separada de leitura confirmou acesso básico à conta @suzanoexpress; o painel ainda não usa o token para automações. As respostas acima são apenas simulações. **As automações reais ainda não estão implementadas**; o aplicativo não recebe eventos reais nem envia mensagens.

## Como iniciar

1. Abra um terminal na pasta `instagram-automacoes`.
2. Execute `node servidor.cjs` com Node.js 24 instalado.
3. Acesse <http://127.0.0.1:8765> enquanto o servidor estiver ligado.
4. Para parar, pressione `Ctrl+C` no terminal.

O utilitário local de armazenamento do token é compilado com `swiftc chaves.swift -o dados/fluxo-chaves`, caso seja necessário recriá-lo. O servidor foi pensado para acesso apenas no próprio computador. Não exponha essa interface diretamente à internet. Os dados ficam na pasta `dados`; preserve essa pasta em backups privados. O arquivo `previa-original.html` preserva a versão inicial da interface, mas os dados guardados no armazenamento do navegador não são migrados automaticamente para o banco. O acesso a esses dados antigos depende do navegador e da forma como o arquivo foi aberto.

## Integração com a Meta: pendências

- Confirmar qual perfil profissional será conectado primeiro e se já existe um aplicativo Meta apropriado.
- Escolher e configurar o método de login conforme o aplicativo e as permissões disponíveis.
- Definir a primeira automação real, seu gatilho e mensagem.
- Concluir a conexão do painel com a API, publicar e configurar o webhook, processar eventos e implementar o envio pela API oficial. O receptor experimental já verifica assinatura e registra entregas em ambiente local, mas não processa eventos; a deduplicação atual é apenas por corpo de entrega idêntico.
- Disponibilizar um endpoint HTTPS adequado para webhooks, sem expor o painel local.
- Testar com contas autorizadas e validar as regras e limitações vigentes da Meta.

Para o caminho com Instagram Login, a [documentação oficial da Meta](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api) lista permissões específicas para mensagens e comentários. Os requisitos variam conforme o método de login e os recursos usados; devem ser confirmados antes de configurar o aplicativo. Não inserir senhas, tokens ou segredos em documentos ou no código.

## Verificação

A verificação automatizada `node verificar.cjs` usa um banco temporário separado para testar cadastro, duplicação, simulação, pausa, restrição de origem, persistência após reinicialização e exclusão em cascata. O acesso básico à conta na Meta foi verificado; o webhook foi testado com eventos fictícios. Ainda faltam testes visuais da interface e testes reais de eventos e mensagens com a Meta.
