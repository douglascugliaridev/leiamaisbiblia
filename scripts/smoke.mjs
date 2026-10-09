/**
 * Teste de integração contra o servidor em execução (pnpm start).
 * Cria dois usuários, valida isolamento de dados, regra de dia e sessão.
 */
const BASE = process.env.BASE ?? "http://localhost:3111";
const SEG = process.env.SESSION_SECRET;
import { mkdirSync } from "node:fs";
import { SignJWT } from "jose";
import { DatabaseSync } from "node:sqlite";
const bcrypt = (await import("bcryptjs")).default;

const DB_PATH = "./data/leia-mais.db";
mkdirSync("./data", { recursive: true });

let falhas = 0;
function check(nome, ok, detalhe = "") {
  console.log(`${ok ? "ok  " : "FALHA"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!ok) falhas++;
}

/** Emite um token e registra a sessão na tabela, como o login real faria. */
async function token(userId) {
  const jti = crypto.randomUUID();
  const expiraEm = Math.floor(Date.now() / 1000) + 3600;

  const db = new DatabaseSync(DB_PATH);
  try {
    db.prepare(
      "INSERT INTO sessoes (jti, user_id, expira_em) VALUES (?, ?, ?)",
    ).run(jti, userId, expiraEm);
  } finally {
    db.close();
  }

  return new SignJWT({ sub: String(userId), jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(SEG));
}

/** O app grava a data de início no fuso local; usar UTC aqui desalinharia. */
function hojeLocal() {
  const a = new Date();
  return `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}

function criarNoBanco(nome, email) {
  const db = new DatabaseSync(DB_PATH);
  const hoje = hojeLocal();
  try {
    const info = db
      .prepare(
        "INSERT INTO users (email, nome, senha_hash, inicio_em, criado_em) VALUES (?,?,?,?,?)",
      )
      .run(email, nome, bcrypt.hashSync("senha123", 12), hoje, new Date().toISOString());
    return Number(info.lastInsertRowid);
  } finally {
    db.close();
  }
}

function marcar(userId, dias) {
  const db = new DatabaseSync(DB_PATH);
  try {
    for (const d of dias) {
      db.prepare("INSERT OR IGNORE INTO leituras (user_id, dia, lido_em) VALUES (?,?,?)").run(
        userId,
        d,
        new Date().toISOString(),
      );
    }
  } finally {
    db.close();
  }
}

function lerMarcados(userId) {
  const db = new DatabaseSync(DB_PATH);
  try {
    return db
      .prepare("SELECT dia FROM leituras WHERE user_id = ? ORDER BY dia")
      .all(userId)
      .map((r) => r.dia);
  } finally {
    db.close();
  }
}

// --- Isolamento entre usuários ---
const ana = criarNoBanco("Ana Silva", `ana-${Date.now()}@teste.com`);
const bruno = criarNoBanco("Bruno Costa", `bruno-${Date.now()}@teste.com`);

marcar(ana, [1, 2, 3]);
marcar(bruno, [5]);

check("usuários Recebem ids distintos", ana !== bruno, `${ana} vs ${bruno}`);
check(
  "Ana tem só os dias 1-3",
  JSON.stringify(lerMarcados(ana)) === "[1,2,3]",
  JSON.stringify(lerMarcados(ana)),
);
check(
  "Bruno tem só o dia 5",
  JSON.stringify(lerMarcados(bruno)) === "[5]",
  JSON.stringify(lerMarcados(bruno)),
);

// --- Página autenticada ---
const htmlAna = await (
  await fetch(`${BASE}/plano`, { headers: { cookie: `sessao=${await token(ana)}` } })
).text();
const htmlBruno = await (
  await fetch(`${BASE}/plano`, { headers: { cookie: `sessao=${await token(bruno)}` } })
).text();

check("Ana vê o próprio nome", htmlAna.includes("Ana"), "");
check("Bruno vê o próprio nome", htmlBruno.includes("Bruno"), "");
check("Ana NÃO vê dados do Bruno", !htmlAna.includes("Bruno"), "");
check("Bruno NÃO vê dados da Ana", !htmlBruno.includes("Ana"), "");
// o React separa nós de texto com <!-- -->, então comparamos sem depender do HTML cru
const texto = (html) => html.replace(/<!--.*?-->/g, "").replace(/<[^>]+>/g, " ");
const txtAna = texto(htmlAna);
const txtBruno = texto(htmlBruno);

check("Ana vê 3/67 e 4%", /3\s*\/\s*67/.test(txtAna) && txtAna.includes("4%"), "");
check("Bruno vê 1/67", /1\s*\/\s*67/.test(txtBruno), "");
check(
  "streak de Ana = 1 dia (terminar em hoje, dia 1)",
  /Sequência:\s*1\s*dia/.test(txtAna),
  "",
);
check(
  "streak de Bruno = 0 (dia 5 marcado, hoje é dia 1)",
  /Sequência:\s*0\s*dias/.test(txtBruno),
  "",
);

// --- Conteúdo do plano ---
const htmlLimpo = (h) => h.replace(/<!--.*?-->/g, "");
// Ana tem o dia 1 liberado; dias futuros ficam sem link, só com o texto
const bloco = (html, faixa) => {
  const limpo = htmlLimpo(html);
  const ini = limpo.indexOf(faixa);
  const fim = limpo.indexOf("</section>", ini);
  return limpo.slice(ini, fim);
};

for (const marca of [
  "Salmos 1",
  "Apocalipse 19",
  "A eternidade com Cristo",
  "O Sermão da Montanha",
]) {
  check(`plano contém "${marca}"`, htmlAna.includes(marca), "");
}

check(
  "dia liberado tem link bible.com",
  bloco(htmlAna, "dias 1–7").includes("bible.com/pt/salmos/1"),
  "",
);
check(
  "dia futuro mostra a passagem sem link",
  bloco(htmlAna, "dias 58–67").includes("Apocalipse 19") &&
    !bloco(htmlAna, "dias 58–67").includes("bible.com/pt/apocalipse"),
  "",
);
const blocos = (htmlLimpo(htmlAna).match(/dias (\d+)–(\d+)/g) ?? []).map((b) =>
  b.replace("dias ", ""),
);
check(
  "6 blocos de tema (o PDF repete Israel em duas tabelas)",
  blocos.length === 6,
  blocos.join(", "),
);
check(
  "blocos cobrem 1-67 sem buraco",
  blocos[0] === "1–7" &&
    blocos[blocos.length - 1] === "58–67" &&
    blocos.includes("16–49"),
  blocos.join(", "),
);
check("dia 2 bloqueado (só dia 1 liberado)", htmlAna.includes("Disponível em 1 dia"), "");

// --- Cookie inválido ---
const ruim = await fetch(`${BASE}/plano`, {
  headers: { cookie: "sessao=token.forjado.invalido" },
  redirect: "manual",
});
check("cookie inválido é rejeitado", ruim.status === 307, `status ${ruim.status}`);

console.log(falhas === 0 ? "\nTUDO OK" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);