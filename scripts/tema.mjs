import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const B = "http://localhost:3000";
mkdirSync("/tmp/lmb-shots", { recursive: true });
let falhas = 0;
const check = (n, ok, d = "") => { console.log(`${ok ? "ok  " : "FALHA"} ${n}${d ? ` — ${d}` : ""}`); if (!ok) falhas++; };

const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 820, height: 900 }, deviceScaleFactor: 2 });
const p = await c.newPage();

await p.goto(`${B}/cadastro`, { waitUntil: "networkidle" });
const grupo = p.getByRole("radiogroup", { name: "Tema da interface" });
check("seletor de tema existe", await grupo.isVisible());

const escuroAtivo = async () => grupo.locator('[aria-checked="true"]').getAttribute("title");
check("começa em 'Seguir o sistema'", (await escuroAtivo()) === "Seguir o sistema", await escuroAtivo());

// tema escuro
await grupo.getByRole("radio", { name: "Escuro" }).click();
await p.waitForTimeout(500);
check("classe 'dark' aplicada", await p.evaluate(() => document.documentElement.classList.contains("dark")));
const logoEscuro = await p.locator('img[src*="logo"]').first().getAttribute("src");
check("logo troca para variante escura", logoEscuro.includes("dark-ui"), logoEscuro);
const fundoEscuro = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
check("fundo escuro aplicado", fundoEscuro !== "rgb(248, 246, 241)", fundoEscuro);
check("tema salvo no localStorage", (await p.evaluate(() => localStorage.getItem("tema"))) === "escuro");
await p.screenshot({ path: "/tmp/lmb-shots/t1-escuro-cadastro.png" });

// persistência após reload
await p.reload({ waitUntil: "networkidle" });
check("mantém escuro após reload", await p.evaluate(() => document.documentElement.classList.contains("dark")));

// tema claro
await grupo.getByRole("radio", { name: "Claro" }).click();
await p.waitForTimeout(500);
check("volta para claro", !(await p.evaluate(() => document.documentElement.classList.contains("dark"))));
const logoClaro = await p.locator('img[src*="logo"]').first().getAttribute("src");
check("logo volta para variante clara", !logoClaro.includes("dark-ui"), logoClaro);

// segue o sistema
await p.emulateMedia({ colorScheme: "dark" });
await grupo.getByRole("radio", { name: "Seguir o sistema" }).click();
await p.waitForTimeout(500);
check("segue o sistema quando ele é escuro", await p.evaluate(() => document.documentElement.classList.contains("dark")));
await p.emulateMedia({ colorScheme: "light" });
await p.waitForTimeout(500);
check("acompanha mudança do sistema para claro", !(await p.evaluate(() => document.documentElement.classList.contains("dark"))));

// tela do plano
await grupo.getByRole("radio", { name: "Escuro" }).click();
const email = `tema-${Date.now()}@teste.com`;
await p.goto(`${B}/cadastro`, { waitUntil: "networkidle" });
await p.getByLabel("Nome").fill("Josué");
await p.getByLabel("E-mail").fill(email);
await p.getByLabel("Senha").fill("senhaforte");
await p.getByRole("button", { name: "Criar conta" }).click();
await p.waitForURL("**/plano");
await p.locator("li", { hasText: "Salmos 1" }).getByRole("button").first().click();
await p.waitForTimeout(1200);
check("plano abre já em escuro", await p.evaluate(() => document.documentElement.classList.contains("dark")));
check("plano tem seletor de tema", await p.getByRole("radiogroup", { name: "Tema da interface" }).isVisible());
await p.screenshot({ path: "/tmp/lmb-shots/t2-escuro-plano.png" });

await b.close();
console.log(falhas === 0 ? "\nTUDO OK" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);
