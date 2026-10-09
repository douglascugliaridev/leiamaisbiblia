/**
 * Testa o fluxo de cadastro/login de verdade, pela interface HTTP.
 * O Next envia Server Actions como POST de formulário com campos ocultos
 * ($ACTION_*), então reaproveitamos exatamente o que a página renderizou.
 */
const BASE = process.env.BASE ?? "http://localhost:3111";

let falhas = 0;
function check(nome, ok, detalhe = "") {
  console.log(`${ok ? "ok  " : "FALHA"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!ok) falhas++;
}

function decodificar(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Campos ocultos que o Next precisa para identificar a Server Action. */
function camposDaAcao(html) {
  const campos = {};
  for (const m of html.matchAll(
    /<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?\/>/g,
  )) {
    campos[decodificar(m[1])] = decodificar(m[2] ?? "");
  }
  return campos;
}

/**
 * A tela do plano não usa POST progressivo: serializa a action como
 * $ACTION_ID_<hash> no corpo do formulário.
 */
function actionIdDoFormulario(html) {
  const nome = html.match(/name="(\$ACTION_ID_[a-f0-9]+)"/);
  return nome ? nome[1] : null;
}

async function enviar(path, valores, cookie) {
  const corpo = new FormData();
  for (const [k, v] of Object.entries(valores)) corpo.set(k, v);
  return fetch(`${BASE}${path}`, {
    method: "POST",
    body: corpo,
    headers: cookie ? { cookie } : undefined,
    redirect: "manual",
  });
}

const email = `novo-${Date.now()}@teste.com`;

// --- Cadastro ---
const htmlCadastro = await (await fetch(`${BASE}/cadastro`)).text();
check("página de cadastro carrega", htmlCadastro.includes("Criar conta"), "");

const acaoCadastro = camposDaAcao(htmlCadastro);
check(
  "form de cadastro tem campos de action",
  Object.keys(acaoCadastro).some((k) => k.startsWith("$ACTION")),
  Object.keys(acaoCadastro).join(", "),
);

const resCadastro = await enviar("/cadastro", {
  ...acaoCadastro,
  nome: "Carla Dias",
  email,
  senha: "senhaforte",
});
const cookieCadastro = resCadastro.headers.get("set-cookie") ?? "";
const htmlCadastroErro = await resCadastro.text();

check(
  "cadastro cria sessão (cookie httpOnly)",
  cookieCadastro.includes("sessao=") && /HttpOnly/i.test(cookieCadastro),
  cookieCadastro.split(";")[0],
);
check("cookie tem SameSite", /SameSite/i.test(cookieCadastro), "");
check(
  "cookie não marca o e-mail no corpo da resposta",
  !htmlCadastroErro.includes(email),
  "",
);

// --- E-mail duplicado ---
const htmlCad2 = await (await fetch(`${BASE}/cadastro`)).text();
const dup = await enviar("/cadastro", {
  ...camposDaAcao(htmlCad2),
  nome: "Outra Pessoa",
  email,
  senha: "senhaforte",
});
check(
  "e-mail duplicado é rejeitado",
  (await dup.text()).includes("Já existe uma conta"),
  "",
);

// --- Senha curta ---
const htmlCad3 = await (await fetch(`${BASE}/cadastro`)).text();
const curta = await enviar("/cadastro", {
  ...camposDaAcao(htmlCad3),
  nome: "Curta",
  email: `x-${Date.now()}@teste.com`,
  senha: "123",
});
check(
  "senha curta é rejeitada",
  (await curta.text()).includes("pelo menos 6 caracteres"),
  "",
);

// --- Login ---
const htmlLogin = await (await fetch(`${BASE}/login`)).text();
check("página de login carrega", htmlLogin.includes("Entrar"), "");
const acaoLogin = camposDaAcao(htmlLogin);

const errada = await enviar("/login", {
  ...acaoLogin,
  email,
  senha: "errada",
});
const htmlErrada = await errada.text();
check("senha errada é rejeitada", htmlErrada.includes("E-mail ou senha incorretos"), "");
check(
  "senha errada não cria cookie",
  !(errada.headers.get("set-cookie") ?? "").includes("sessao="),
  "",
);

const certa = await enviar("/login", {
  ...acaoLogin,
  email,
  senha: "senhaforte",
});
const cookieLogin = certa.headers.get("set-cookie") ?? "";
check("login correto cria sessão", cookieLogin.includes("sessao="), cookieLogin.split(";")[0]);

// --- Sessão ---
const token = cookieLogin.match(/sessao=([^;]+)/)?.[1];
check("token extraído do cookie", Boolean(token), token ? "" : "sem token");

const plano = await fetch(`${BASE}/plano`, {
  headers: { cookie: `sessao=${token}` },
  redirect: "manual",
});
const htmlPlano = await plano.text();
const limpo = htmlPlano.replace(/<!--.*?-->/g, "");

check("sessão válida acessa /plano", plano.status === 200, `status ${plano.status}`);
check("vê o próprio nome", htmlPlano.includes("Carla"), "");
check("progresso zerado", /0\s*\/\s*67/.test(limpo), "");
check("só o dia 1 liberado", htmlPlano.includes("Disponível em 1 dia"), "");

// --- Logout ---
const htmlPlano2 = await (
  await fetch(`${BASE}/plano`, { headers: { cookie: `sessao=${token}` } })
).text();
const idSair = actionIdDoFormulario(htmlPlano2);
check("form de logout encontrado", idSair !== null, idSair ?? "");

const saiu = await enviar("/plano", { [idSair]: "" }, `sessao=${token}`);
const cookieSaiu = saiu.headers.get("set-cookie") ?? "";
check(
  "logout invalida o cookie",
  cookieSaiu.includes("sessao=") && !cookieSaiu.includes(token),
  cookieSaiu.split(";")[0] || "(sem set-cookie)",
);

const depois = await fetch(`${BASE}/plano`, {
  headers: { cookie: `sessao=${token}` },
  redirect: "manual",
});
check(
  "token reaproveitado após logout é barrado",
  depois.status === 307,
  `status ${depois.status}`,
);

console.log(falhas === 0 ? "\nTUDO OK" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);