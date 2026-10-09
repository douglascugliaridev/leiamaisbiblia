# Leia Mais Bíblia

App para acompanhar a leitura da Bíblia em **67 dias**, com cadastro, login e progresso individual por usuário.

Os 67 dias vêm do cronograma *Cronograma_Leitura_Biblica_Com_Titulo.pdf*: 7 temas, cada dia com as passagens para ler, um título do dia e um link para o texto em bible.com.

## Requisitos

- Node 22.5 ou superior (o banco usa o módulo nativo `node:sqlite`)
- pnpm

## Rodando

```bash
pnpm install
cp .env.example .env.local     # e ajuste SESSION_SECRET
pnpm dev
```

Abra http://localhost:3000 e crie sua conta.

O banco `./data/leia-mais.db` é criado sozinho no primeiro acesso, com as tabelas já prontas. Para gerar um segredo:

```bash
openssl rand -base64 32
```

### Sobre os dados

O arquivo `data/leia-mais.db` guarda tudo: contas e progresso. Ele sobrevive a reinícios do serviço — subir e derrubar o app não apaga nada.

O banco roda em modo **WAL** (`synchronous = FULL`). Isso cria dois arquivos ao lado, `leia-mais.db-wal` e `leia-mais.db-shm`, e as escritas mais recentes ficam no `-wal` até o processo encerrar.

Por isso o servidor trata `SIGINT` e `SIGTERM`: ao receber o sinal, ele executa o checkpoint e fecha a conexão, deixando o `.db` completo. Encerre com `Ctrl+C` ou `pkill -TERM`, nunca com `kill -9`.

**Nunca copie só o arquivo `.db` com o servidor no ar** — você vai perder as últimas escritas. Para backup ou migração, use o comando próprio:

```bash
pnpm backup                          # cria backups/leia-mais-<data>.db
pnpm backup /caminho/destino.db       # ou escolha o destino
```

Ele usa `VACUUM INTO` (a API de backup do SQLite), que gera um arquivo único e consistente, com o conteúdo do `-wal` incluído, mesmo com o servidor rodando.

Guarde o `SESSION_SECRET` do `.env.local`. Sem ele o servidor não sobe; com um valor diferente do original, todas as sessões antigas deixam de valer e é preciso entrar de novo — as contas e o progresso continuam intactos.

`DATABASE_PATH` permite mudar o lugar do banco, útil se o diretório do projeto for recriado a cada deploy:

```bash
DATABASE_PATH=/var/lib/leia-mais/leia-mais.db pnpm start
```

## Como funciona

**Sequência.** O dia do cadastro conta como dia 1. Cada dia subsequente libera mais um dia do plano, então no terceiro dia você pode marcar os dias 1, 2 e 3. É possível pular dias — marcar o 3 sem o 2 é permitido — mas a sequência só conta dias seguidos.

**Sequência atual.** Conta a série de dias consecutivos terminando em hoje. Se você ainda não leu hoje mas leu ontem, ela continua valendo até o fim do dia.

**Reiniciar.** Apaga todo o progresso da sua conta e faz o dia 1 ser hoje de novo. Só afeta você.

**Links.** Cada passagem marcada como liberada vira um link para bible.com. Passagens com capítulos não contíguos (ex.: *Gênesis 6, 7, 8, 9.1-17*) abrem um intervalo do primeiro ao último capítulo, porque o site não aceita listas com buracos.

## Estrutura

```
src/
├── lib/
│   ├── plano.ts        os 67 dias — fonte única da verdade
│   ├── db.ts           conexão SQLite e schema
│   ├── auth.ts         hash de senha, sessão, validação
│   ├── leituras.ts     consultas de progresso
│   ├── progresso.ts    regras de sequência e percentual
│   ├── acoes-auth.ts   Server Actions de cadastro/login/logout
│   └── acoes-leitura.ts Server Actions de marcar dia e reiniciar
├── app/
│   ├── login/  cadastro/  plano/
├── components/
└── proxy.ts            porta de entrada: bloqueia rota sem sessão válida
```

Os 67 dias ficam só no código, em `plano.ts`. Não há tabela de dias no banco porque o conteúdo não muda — assim não existe risco do banco e do código divergirem.

## Segurança

- Senhas com bcrypt (custo 12), nunca em texto puro
- Sessão em JWT dentro de cookie `httpOnly` + `SameSite=Lax`
- Toda sessão é registrada na tabela `sessoes` com um `jti`. O logout apaga esse registro, então um token reapresentado depois é recusado — um JWT sozinho sobreviveria à limpeza do cookie
- `proxy.ts` consulta o banco antes de liberar `/plano`, então é ele quem decide
- Toda leitura e escrita filtra por `user_id` vindo da sessão, nunca do corpo da requisição

## Verificação

```bash
pnpm typecheck   # tipos
pnpm lint        # estilo
pnpm test        # regras de sequência (node:test)
```

Os testes de integração rodam contra um servidor já no ar:

```bash
pnpm build && pnpm start -p 3111 &

export SESSION_SECRET=$(grep SESSION_SECRET .env.local | cut -d= -f2-)
node scripts/smoke-auth.mjs   # cadastro, login, logout e revogação de sessão
node scripts/smoke.mjs        # isolamento entre usuários e conteúdo do plano
node scripts/smoke-ui.mjs     # fluxo completo num navegador real
```

Os dois primeiros rodam com `fetch` e abrem o banco direto; o terceiro usa Playwright e salva screenshots em `/tmp/lmb-shots`.

## Nota sobre os dados

O PDF original tem um erro de digitação no bloco "O Messias Prometido": os dias aparecem como 52, 54, 55, 53, 54, 55, com "O Sermão da Montanha" repetido. Aqui os dias foram normalizados para 52 a 56, sem passagem duplicada. Os outros 61 dias seguem o PDF literalmente.