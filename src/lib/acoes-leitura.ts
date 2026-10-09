"use server";

import { revalidatePath } from "next/cache";
import { usuarioObrigatorio, hojeISO } from "./auth";
import { alternarLeitura, diasMarcados, reiniciarPlano } from "./leituras";
import { TOTAL_DIAS } from "./plano";
import { diaDisponivel } from "./progresso";

export type EstadoLeitura =
  | { ok: true; dia: number; lido: boolean; erro?: undefined }
  | { ok: false; dia: number; lido: boolean; erro: string };

export async function alternarDia(dia: number): Promise<EstadoLeitura> {
  const usuario = await usuarioObrigatorio();

  if (!Number.isInteger(dia) || dia < 1 || dia > TOTAL_DIAS) {
    const marcados = diasMarcados(usuario.id);
    return {
      ok: false,
      dia,
      lido: marcados.includes(dia),
      erro: "Dia inválido.",
    };
  }

  const hoje = diaDisponivel(usuario.inicio_em, hojeISO());
  const marcados = diasMarcados(usuario.id);

  if (dia > hoje) {
    return {
      ok: false,
      dia,
      lido: marcados.includes(dia),
      erro: `Este dia abre em ${
        dia === hoje + 1
          ? "amanhã"
          : `daqui a ${dia - hoje} dias`
      }.`,
    };
  }

  const lido = alternarLeitura(usuario.id, dia);
  revalidatePath("/plano");
  return { ok: true, dia, lido };
}

export async function reiniciar(): Promise<void> {
  const usuario = await usuarioObrigatorio();
  reiniciarPlano(usuario.id, hojeISO());
  revalidatePath("/plano");
}

