"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { EstadoFormulario } from "@/lib/acoes-auth";

export function Campo({
  name,
  label,
  type = "text",
  autoComplete,
  required = true,
  minLength,
  erro,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  erro?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const controlado = value !== undefined;

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-tinta">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={controlado ? value : undefined}
        onChange={controlado ? (e) => onChange?.(e.target.value) : undefined}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${name}-erro` : undefined}
        className="w-full rounded-lg border border-linha bg-fundo px-3 py-2 text-sm outline-none focus:border-marca focus:ring-2 focus:ring-marca/20"
      />
      {erro ? (
        <span id={`${name}-erro`} className="mt-1 block text-xs text-red-600">
          {erro}
        </span>
      ) : null}
    </label>
  );
}

function EnviarInterno({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-lg bg-marca py-2.5 text-sm font-semibold text-white transition hover:bg-marca/90 disabled:opacity-60"
    >
      {pending ? "Aguarde…" : rotulo}
    </button>
  );
}

export function BotaoEnviar({ rotulo }: { rotulo: string }) {
  return <EnviarInterno rotulo={rotulo} />;
}

export function MensagemGeral({ estado }: { estado: EstadoFormulario }) {
  if (!estado || estado.erro.campo !== "formulario") return null;
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {estado.erro.mensagem}
    </p>
  );
}

/**
 * O React reseta campos não controlados depois de uma Server Action, o que
 * apagaria o e-mail digitado quando o login falha. Nome e e-mail ficam sob
 * controle do componente para sobreviver ao erro.
 */
export function useFormularioAcesso(
  acao: (
    estado: EstadoFormulario,
    dados: FormData,
  ) => Promise<EstadoFormulario>,
) {
  const [estado, dispatch] = useActionState(acao, null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  return {
    estado,
    dispatch,
    nome,
    email,
    setNome,
    setEmail,
    erroDe: (campo: string) =>
      estado?.erro.campo === campo ? estado.erro.mensagem : undefined,
  };
}