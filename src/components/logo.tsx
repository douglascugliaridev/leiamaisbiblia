"use client";

import Image from "next/image";
import { useTemaEscuro } from "@/lib/tema";

const VARIANTES = {
  horizontal: { arquivo: "horizontal", largura: 222, altura: 64, alt: "Leia Mais Bíblia" },
  vertical: { arquivo: "vertical", largura: 220, altura: 170, alt: "Leia Mais Bíblia" },
  icone: { arquivo: "icon", largura: 64, altura: 64, alt: "" },
} as const;

export type VarianteLogo = keyof typeof VARIANTES;

/**
 * O kit traz versões clara e escura do logo: na escura o texto fica branco.
 * Trocar só por CSS exigiria mascarar as duas cópias, então observamos o tema
 * e escolhemos o arquivo certo.
 */
export function Logo({
  variante = "horizontal",
  tamanho,
  prioridade = false,
  className,
}: {
  variante?: VarianteLogo;
  /** Largura em pixels; a altura acompanha a proporção do arquivo. */
  tamanho?: number;
  prioridade?: boolean;
  className?: string;
}) {
  const escuro = useTemaEscuro();
  const v = VARIANTES[variante];
  const largura = tamanho ?? v.largura;
  const altura = Math.round((largura * v.altura) / v.largura);

  // o ícone é o mesmo nos dois temas: o miolo navy fica legível em ambos
  const sufixo = variante === "icone" ? "" : escuro ? "-dark-ui" : "-ui";

  return (
    <Image
      src={`/marca/logo-${v.arquivo}${sufixo}.svg`}
      alt={v.alt}
      width={largura}
      height={altura}
      priority={prioridade}
      className={className}
      unoptimized
    />
  );
}