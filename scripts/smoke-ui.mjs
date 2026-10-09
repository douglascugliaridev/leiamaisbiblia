/**
 * Percorre o app num navegador de verdade: cadastro, marcação de dias,
 * desbloqueio visual e reinício. Também salva screenshots.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3111";
const DIR = "/tmp/lmb-shots";
mkdirSync(DIR, { recursive: true });

let falhas = 0;
function check(nome, ok, detalhe = "") {
  console.log(`${ok ? "ok  " : "FALHA"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!ok) falhas++;
}

const navegador = await chromium.launch();
const contexto = await navegador.newContext({ viewport: { width: 900, height: 1000 } });
const pagina = await contexto.newPage();

const email = `browser-${Date.now()}@teste.com`;

// --- Cadastro pela UI ---
await pagina.goto(`${BASE}/cadastro`, { waitUntil: "networkidle" });
await pagina.screenshot({ path: `${DIR}/1-cadastro.png`, fullPage: true });

await pagina.getByLabel("Nome").fill("Débora Ribeiro");
await pagina.getByLabel("E-mail").fill(email);
await pagina.getByLabel("Senha").fill("senhaforte");
await pagina.getByRole("button", { name: "Criar conta" }).click();
await pagina.waitForURL("**/plano", { timeout: 15000 });

check("cadastro redireciona para /plano", pagina.url().endsWith("/plano"), pagina.url());
check("saudação usa o primeiro nome", await pagina.getByText("Olá, Débora").isVisible(), "");
await pagina.screenshot({ path: `${DIR}/2-plano-novo.png`, fullPage: true });

// --- Estado inicial ---
check("progresso começa em 0/67", await pagina.getByText("0/67").isVisible(), "");
const dia2 = pagina.locator("li", { hasText: "Isaías 53" });
check(
  "dia 2 aparece bloqueado",
  (await dia2.locator("button").count()) === 1 &&
    (await dia2.locator("button").isDisabled()) &&
    (await dia2.locator("button[title]").count()) === 1,
  `title=${await dia2.locator("button[title]").getAttribute("title")}`,
);

// --- Marcar dia 1 pelo checkbox ---
const dia1 = pagina.locator("li", { hasText: "Salmos 1" });
await dia1.getByRole("button").first().click();
await pagina.waitForTimeout(1200);

check("dia 1 fica marcado (aria-pressed)", (await dia1.getByRole("button").first().getAttribute("aria-pressed")) === "true", "");
check("contador sobe para 1/67", await pagina.getByText("1/67").isVisible(), "");
check("percentual vira 1%", await pagina.getByText("1%").first().isVisible(), "");
check("streak vira 1 dia", await pagina.getByText("1 dia").first().isVisible(), "");
await pagina.screenshot({ path: `${DIR}/3-dia1-marcado.png`, fullPage: true });

// --- Desmarcar ---
await dia1.getByRole("button").first().click();
await pagina.waitForTimeout(1200);
check("desmarcar volta para 0/67", await pagina.getByText("0/67").isVisible(), "");

// --- Remarcar e recarregar para testar persistência ---
await dia1.getByRole("button").first().click();
await pagina.waitForTimeout(1200);
await pagina.reload({ waitUntil: "networkidle" });
check("progresso persiste após reload", await pagina.getByText("1/67").isVisible(), "");
await pagina.screenshot({ path: `${DIR}/4-persiste.png`, fullPage: true });

// --- Reiniciar plano ---
await pagina.getByRole("button", { name: "Reiniciar plano" }).click();
check(
  "confirmação de reinício aparece",
  await pagina.getByText("Apagar todo o progresso").isVisible(),
  "",
);
await pagina.getByRole("button", { name: "Sim, reiniciar" }).click();
await pagina.waitForTimeout(1500);
check("reinício zera o progresso", await pagina.getByText("0/67").isVisible(), "");
check("reinício zera o streak", await pagina.getByText("Sequência:").isVisible(), "");
await pagina.screenshot({ path: `${DIR}/5-reiniciado.png`, fullPage: true });

// --- Logout e login ---
await pagina.getByRole("button", { name: "Sair" }).click();
await pagina.waitForURL("**/login", { timeout: 15000 });
check("logout vai para /login", pagina.url().includes("/login"), pagina.url());
await pagina.screenshot({ path: `${DIR}/6-login.png`, fullPage: true });

// acesso direto a /plano sem sessão
const anon = await contexto.newPage();
await anon.goto(`${BASE}/plano`);
check("rota protegida redireciona anonimo", anon.url().includes("/login"), anon.url());
await anon.close();

// login com senha errada
await pagina.getByLabel("E-mail").fill(email);
await pagina.getByLabel("Senha").fill("errada");
await pagina.getByRole("button", { name: "Entrar" }).click();
await pagina.waitForTimeout(1500);
check(
  "senha errada mostra erro",
  await pagina.getByText("E-mail ou senha incorretos").isVisible(),
  "",
);
check(
  "e-mail digitado é preservado após o erro",
  (await pagina.getByLabel("E-mail").inputValue()) === email,
  await pagina.getByLabel("E-mail").inputValue(),
);
await pagina.screenshot({ path: `${DIR}/7-login-erro.png`, fullPage: true });

// login correto
await pagina.getByLabel("Senha").fill("senhaforte");
await pagina.getByRole("button", { name: "Entrar" }).click();
await pagina.waitForURL("**/plano", { timeout: 15000 });
check("login correto volta ao plano", pagina.url().endsWith("/plano"), "");
// o plano foi reiniciado antes do logout, então o progresso esperado é zero
check(
  "Débora reencontra o plano reiniciado",
  await pagina.getByText("0/67").isVisible(),
  "",
);

// --- Links da Bíblia ---
// dia 67 está bloqueado para quem acabou de criar conta: sem link clicável
const dia67 = pagina.locator("li", { hasText: "Apocalipse 19" });
check(
  "dia bloqueado não expõe link de leitura",
  (await dia67.locator("a").count()) === 0 &&
    (await dia67.getByText("Apocalipse 19").isVisible()),
  "",
);

const dia1Links = pagina.locator("li", { hasText: "Salmos 1" }).locator("a");
check(
  "dia liberado liga cada passagem",
  (await dia1Links.count()) === 2,
  `${await dia1Links.count()} links`,
);
const primeiro = await dia1Links.first().getAttribute("href");
check("primeiro link é Salmos 1", primeiro === "https://www.bible.com/pt/salmos/1", primeiro);

await navegador.close();
console.log(`\nscreenshots em ${DIR}`);
console.log(falhas === 0 ? "TUDO OK" : `${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);