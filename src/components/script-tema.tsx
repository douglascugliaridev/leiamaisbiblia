/**
 * Script injetado antes da hidratação. Aplica o tema salvo (ou a preferência do
 * sistema) na raiz do documento para não haver flash de tela branca ao abrir.
 */
const CODIGO = `
(function () {
  try {
    var salvo = localStorage.getItem("tema");
    var escuro = salvo === "escuro" ||
      (salvo !== "claro" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", escuro);
  } catch (e) {}
})();
`;

export function ScriptTema() {
  return <script dangerouslySetInnerHTML={{ __html: CODIGO }} />;
}