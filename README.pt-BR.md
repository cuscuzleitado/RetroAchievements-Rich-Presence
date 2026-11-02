# RA Discord Presence

Mostra no Discord o jogo que você está jogando no [RetroAchievements](https://retroachievements.org): título do jogo, ícone, console, tempo de jogo e o texto de Rich Presence do próprio RA (fase, vidas, modo, etc.).

Funciona com **qualquer emulador ou frontend que se conecte ao RetroAchievements, no PC ou no celular** (RetroArch, PPSSPP, DuckStation e outros). O script não conversa com o emulador: o RA já sabe o que você está jogando, então ele só lê isso pela API web do RA.

> Projeto sem ligação com o RetroAchievements nem com o Discord.

## Por que

Emuladores de PC costumam ter integração própria com o Discord, mas os de celular não têm, e o Discord do celular não aceita Rich Presence de apps de terceiros. Este script roda num PC e espelha sua atividade do RA no Discord, mesmo que você esteja jogando no celular.

## Como funciona

1. A cada 30 segundos ele consulta `API_GetUserSummary` e lê sua última mensagem de Rich Presence, o horário dela e o ID do último jogo.
2. Se a mensagem é recente, busca título, console e ícone do jogo com `API_GetGame` (guardado em cache por jogo).
3. Define o Rich Presence pelo cliente local do Discord (IPC).
4. Se o RA ficar alguns minutos sem receber atualização (você fechou o jogo), a presença é removida.

## Requisitos

- Um PC com o **Discord desktop** aberto (a versão do navegador não funciona)
- [Node.js](https://nodejs.org) 18 ou mais novo
- Conta no RetroAchievements, com login e conquistas ativos no emulador
- Sua **chave da Web API** do RA (retroachievements.org > Configurações > Keys)
- Um aplicativo seu no Discord (veja abaixo)

## Instalação

1. **Crie um aplicativo no Discord** em https://discord.com/developers/applications. O nome dele é o que aparece em "Jogando ...", então pode ser `RetroAchievements`. Copie o **Application ID**.
2. Clone o repositório e instale as dependências:
   ```
   npm install
   ```
3. Edite o `config.json` e preencha:

   | Campo | Descrição |
   | --- | --- |
   | `raUser` | Seu usuário no RetroAchievements |
   | `raApiKey` | Sua chave da Web API do RA |
   | `discordClientId` | O Application ID do passo 1 |
   | `pollSeconds` | De quanto em quanto tempo consultar o RA (padrão `30`) |
   | `activeWindowMinutes` | Minutos sem atualização do RA até limpar a presença (padrão `6`) |

4. Abra o Discord e rode:
   ```
   npm start
   ```
   Abra um jogo no emulador. A presença aparece na próxima atualização do RA, geralmente em 2 a 3 minutos.

**Nunca publique sua chave.** Se você pretende enviar alterações para o Git, guarde seus dados reais num `config.local.json` (mesmo formato). O script lê esse arquivo primeiro e ele já está no `.gitignore`, então nunca é commitado. Se a chave vazar, gere uma nova nas configurações do RA.

## Rodando sem terminal (Windows)

- `start.bat`: abre o script numa janela, útil para ver as mensagens.
- `start-hidden.vbs`: roda em segundo plano, sem janela. Para abrir com o Windows, aperte `Win + R`, digite `shell:startup` e coloque um atalho desse arquivo na pasta. Para parar, encerre a tarefa *Node.js JavaScript Runtime* no Gerenciador de Tarefas.

O PowerShell pode bloquear o `npm` ("execução de scripts desabilitada"). Use `npm.cmd install` e `npm.cmd start`, ou rode uma vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## Observações e limitações

- O RA atualiza seu status a cada poucos minutos, então há um pequeno atraso ao abrir, trocar ou fechar um jogo.
- O jogo precisa ter conquistas/Rich Presence no RA, e o emulador precisa estar logado.
- O Discord do celular não recebe essa presença. O script precisa rodar num PC com o Discord desktop aberto.
- O título vai em `details` com `statusDisplayType: 2`, então versões recentes do Discord mostram o nome do jogo na lista de membros. Se a sua não mostrar, o título continua no cartão do perfil.
- Definir o status pelo token de usuário num celular violaria os termos do Discord e não é suportado aqui.

## Problemas comuns

| Problema | Solução |
| --- | --- |
| `Could not connect to Discord` | Abra o Discord desktop antes e rode os dois com o mesmo usuário (um não pode estar como administrador) |
| Conecta mas nada aparece | Discord > Configurações > Privacidade de atividade > ative "Compartilhar atividade detectada" |
| Nada é detectado | Abra `https://retroachievements.org/API/API_GetUserSummary.php?z=USUARIO&y=CHAVE&u=USUARIO&g=0&a=0` (com seus dados) enquanto joga e veja se `RichPresenceMsg` e `RichPresenceMsgDate` estão preenchidos |
| A presença some e volta | Aumente `activeWindowMinutes` (mantenha 4 ou mais) |

## Licença

MIT
