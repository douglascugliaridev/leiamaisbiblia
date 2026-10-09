export type Passagem = {
  ref: string;
  url: string;
};

export type Dia = {
  dia: number;
  tema: string;
  temaDia?: string;
  passagens: Passagem[];
};

export const TOTAL_DIAS = 67;

function p(ref: string, url: string): Passagem {
  return { ref, url };
}

export const PLANO: Dia[] = [
  {
    dia: 1,
    tema: "Seguindo o conselho de Deus",
    passagens: [p("Salmos 1", "salmos/1"), p("Isaías 52", "isaias/52")],
  },
  {
    dia: 2,
    tema: "Seguindo o conselho de Deus",
    passagens: [p("Isaías 53", "isaias/53"), p("Lucas 15", "lucas/15")],
  },
  {
    dia: 3,
    tema: "Seguindo o conselho de Deus",
    passagens: [p("João 3", "joao/3"), p("João 10", "joao/10")],
  },
  {
    dia: 4,
    tema: "Seguindo o conselho de Deus",
    passagens: [p("Atos 8", "atos/8"), p("Atos 26", "atos/26")],
  },
  {
    dia: 5,
    tema: "Seguindo o conselho de Deus",
    passagens: [p("Romanos 3", "romanos/3"), p("Romanos 5", "romanos/5")],
  },
  {
    dia: 6,
    tema: "Seguindo o conselho de Deus",
    passagens: [p("Gálatas 3", "galatas/3"), p("Efésios 2", "efesios/2")],
  },
  {
    dia: 7,
    tema: "Seguindo o conselho de Deus",
    passagens: [p("1 Pedro 1", "1-pedro/1"), p("2 Pedro 1", "2-pedro/1")],
  },
  {
    dia: 8,
    tema: "Criação",
    passagens: [p("Gênesis 1 e 2", "genesis/1-2")],
  },
  {
    dia: 9,
    tema: "Criação",
    passagens: [p("Salmos 8", "salmos/8")],
  },
  {
    dia: 10,
    tema: "Criação",
    passagens: [p("Salmos 104", "salmos/104")],
  },
  {
    dia: 11,
    tema: "Criação",
    passagens: [p("Salmos 139", "salmos/139")],
  },
  {
    dia: 12,
    tema: "A queda do gênero humano",
    passagens: [p("Gênesis 3", "genesis/3")],
  },
  {
    dia: 13,
    tema: "A queda do gênero humano",
    passagens: [p("Gênesis 6, 7, 8, 9.1-17", "genesis/6-9")],
  },
  {
    dia: 14,
    tema: "A queda do gênero humano",
    passagens: [p("Salmos 51", "salmos/51")],
  },
  {
    dia: 15,
    tema: "A queda do gênero humano",
    passagens: [p("Romanos 3:9-26", "romanos/3:9-26")],
  },
  {
    dia: 16,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Abraão",
    passagens: [p("Gênesis 12:1-9; 15:1-21; 22:1-19", "genesis/12-22")],
  },
  {
    dia: 17,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Isaque",
    passagens: [p("Gênesis 26 e 27", "genesis/26-27")],
  },
  {
    dia: 18,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Jacó",
    passagens: [p("Gênesis 28, 29 e 30", "genesis/28-30")],
  },
  {
    dia: 19,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Jacó para Israel",
    passagens: [p("Gênesis 31; 32 e 35", "genesis/31-35")],
  },
  {
    dia: 20,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "José",
    passagens: [p("Gênesis 37; 39 e 40", "genesis/37-40")],
  },
  {
    dia: 21,
    tema: "Israel – o povo escolhido por Deus",
    passagens: [p("Gênesis 41; 42 e 43", "genesis/41-43")],
  },
  {
    dia: 22,
    tema: "Israel – o povo escolhido por Deus",
    passagens: [p("Gênesis 44; 45 e 46", "genesis/44-46")],
  },
  {
    dia: 23,
    tema: "Israel – o povo escolhido por Deus",
    passagens: [p("Gênesis 48; 49 e 50", "genesis/48-50")],
  },
  {
    dia: 24,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Escravidão a Moisés",
    passagens: [p("Êxodo 1; 2 e 3", "exodo/1-3")],
  },
  {
    dia: 25,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Promessa de Deus",
    passagens: [p("Êxodo 4; 5 e 6", "exodo/4-6")],
  },
  {
    dia: 26,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Moisés e as pragas",
    passagens: [p("Êxodo 7; 8 e 9", "exodo/7-9")],
  },
  {
    dia: 27,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Libertação e Páscoa",
    passagens: [p("Êxodo 10; 11 e 12", "exodo/10-12")],
  },
  {
    dia: 28,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Ida para o deserto",
    passagens: [p("Êxodo 13; 14 e 15", "exodo/13-15")],
  },
  {
    dia: 29,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Maná e Mandamentos",
    passagens: [p("Êxodo 16; 19 e 20", "exodo/16")],
  },
  {
    dia: 30,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Promessas para a obediência",
    passagens: [p("Deuteronômio 6; 7 e 11", "deuteronomio/6")],
  },
  {
    dia: 31,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Josué",
    passagens: [p("Josué 1; 2 e 3", "josue/1-3")],
  },
  {
    dia: 32,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Conquista da Terra",
    passagens: [p("Josué 4; 5 e 6", "josue/4-6")],
  },
  {
    dia: 33,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Pecado em Israel",
    passagens: [p("Josué 7 e 8", "josue/7-8")],
  },
  {
    dia: 34,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Chamado à obediência",
    passagens: [p("Josué 23; 24", "josue/23-24")],
  },
  {
    dia: 35,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Ciclos de desobediência",
    passagens: [p("Juízes 1; 2 e 3", "juizes/1-3")],
  },
  {
    dia: 36,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Chamado de um profeta",
    passagens: [p("1 Samuel 1; 2 e 3", "1-samuel/1-3")],
  },
  {
    dia: 37,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "O povo escolhe um rei",
    passagens: [p("1 Samuel 8; 9 e 10", "1-samuel/8-10")],
  },
  {
    dia: 38,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Deus rejeita o rei",
    passagens: [p("1 Samuel 15", "1-samuel/15")],
  },
  {
    dia: 39,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Deus escolhe o rei",
    passagens: [p("1 Samuel 16; 17", "1-samuel/16-17")],
  },
  {
    dia: 40,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Davi é ungido rei",
    passagens: [p("2 Samuel 5:1-5; 6 e 7", "2-samuel/5-7")],
  },
  {
    dia: 41,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Pecado de Davi",
    passagens: [p("2 Samuel 11 e 12", "2-samuel/11-12")],
  },
  {
    dia: 42,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Confissão e perdão",
    passagens: [p("Salmos 32 e 51", "salmos/32")],
  },
  {
    dia: 43,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Salomão",
    passagens: [p("1 Reis 1; 2 e 3", "1-reis/1-3")],
  },
  {
    dia: 44,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Edificação do templo",
    passagens: [p("1 Reis 4; 5 e 6", "1-reis/4-6")],
  },
  {
    dia: 45,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Reinado de Salomão",
    passagens: [p("1 Reis 8; 9 e 11", "1-reis/8")],
  },
  {
    dia: 46,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Divisão das tribos",
    passagens: [p("2 Crônicas 10 e 11", "2-cronicas/10-11")],
  },
  {
    dia: 47,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Cativeiro de Israel",
    passagens: [p("2 Reis 17 e 25", "2-reis/17")],
  },
  {
    dia: 48,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Pecado de Israel",
    passagens: [p("Ezequiel 18; 20; 21 e 22", "ezequiel/18")],
  },
  {
    dia: 49,
    tema: "Israel – o povo escolhido por Deus",
    temaDia: "Promessa do Messias",
    passagens: [
      p("Jeremias 23", "jeremias/23"),
      p("Isaías 9 e 53", "isaias/9-53"),
      p("Zacarias 9", "zacarias/9"),
    ],
  },
  {
    dia: 50,
    tema: "Jesus Cristo – o Messias prometido",
    temaDia: "Nascimento do Messias",
    passagens: [
      p("Mateus 1", "mateus/1"),
      p("Lucas 2", "lucas/2"),
      p("João 1", "joao/1"),
    ],
  },
  {
    dia: 51,
    tema: "Jesus Cristo – o Messias prometido",
    temaDia: "Tentação e milagres de Jesus",
    passagens: [
      p("Mateus 4", "mateus/4"),
      p("João 2", "joao/2"),
      p("Mateus 8; 9", "mateus/8-9"),
    ],
  },
  {
    dia: 52,
    tema: "Jesus Cristo – o Messias prometido",
    temaDia: "O Sermão da Montanha",
    passagens: [p("Mateus 5; 6 e 7", "mateus/5-7")],
  },
  {
    dia: 53,
    tema: "Jesus Cristo – o Messias prometido",
    temaDia: "Oração e entrega de Jesus",
    passagens: [p("João 17, 18 e 19", "joao/17-19")],
  },
  {
    dia: 54,
    tema: "Jesus Cristo – o Messias prometido",
    temaDia: "Morte e ressurreição de Jesus",
    passagens: [p("Mateus 26; 27 e 28", "mateus/26-28")],
  },
  {
    dia: 55,
    tema: "Jesus Cristo – o Messias prometido",
    temaDia: "Jesus, o sacrifício final",
    passagens: [p("Hebreus 3, 4, 8, 9 e 10", "hebreus/3-10")],
  },
  {
    dia: 56,
    tema: "Jesus Cristo – o Messias prometido",
    temaDia: "O estabelecimento da Igreja",
    passagens: [p("Atos 1, 2 e 4", "atos/1-4")],
  },
  {
    dia: 57,
    tema: "Jesus Cristo – o Messias prometido",
    temaDia: "Apóstolo Paulo",
    passagens: [p("Atos 9; 25 e 26", "atos/9-26")],
  },
  {
    dia: 58,
    tema: "A vida dos salvos em Cristo",
    temaDia: "Pecaminosidade do homem",
    passagens: [p("Romanos 1; 2 e 3", "romanos/1-3")],
  },
  {
    dia: 59,
    tema: "A vida dos salvos em Cristo",
    temaDia: "A graça de Deus em Cristo",
    passagens: [p("Romanos 4; 5 e 6", "romanos/4-6")],
  },
  {
    dia: 60,
    tema: "A vida dos salvos em Cristo",
    temaDia: "Batalha contra o pecado",
    passagens: [
      p("Romanos 7; 8", "romanos/7-8"),
      p("Gálatas 5", "galatas/5"),
    ],
  },
  {
    dia: 61,
    tema: "A vida dos salvos em Cristo",
    temaDia: "Vivendo em adoração",
    passagens: [p("Romanos 12; 13 e 14", "romanos/12-14")],
  },
  {
    dia: 62,
    tema: "A vida dos salvos em Cristo",
    temaDia: "Nova vida em Cristo",
    passagens: [p("Efésios 2; 3 e 5", "efesios/2-5")],
  },
  {
    dia: 63,
    tema: "A vida dos salvos em Cristo",
    temaDia: "Uma vida de fé",
    passagens: [p("Hebreus 11", "hebreus/11"), p("Tiago 1 e 3", "tiago/1-3")],
  },
  {
    dia: 64,
    tema: "A vida dos salvos em Cristo",
    temaDia: "Confiança em Jesus",
    passagens: [p("1 Pedro 1; 2 e 4", "1-pedro/1-4")],
  },
  {
    dia: 65,
    tema: "A vida dos salvos em Cristo",
    temaDia: "Andar na verdade de Deus",
    passagens: [p("1 João 1; 2 e 5", "1-joao/1-5")],
  },
  {
    dia: 66,
    tema: "A vida dos salvos em Cristo",
    temaDia: "Jesus voltará",
    passagens: [
      p("2 Pedro 3", "2-pedro/3"),
      p("1 Tessalonicenses 4", "1-tessalonicenses/4"),
    ],
  },
  {
    dia: 67,
    tema: "A vida dos salvos em Cristo",
    temaDia: "A eternidade com Cristo",
    passagens: [p("Apocalipse 19; 20; 21 e 22", "apocalipse/19-22")],
  },
];

export function linkDaPassagem(caminho: string): string {
  return `https://www.bible.com/pt/${caminho}`;
}

export type BlocoTema = {
  tema: string;
  dias: Dia[];
};

export function blocosPorTema(): BlocoTema[] {
  const blocos: BlocoTema[] = [];
  for (const dia of PLANO) {
    const ultimo = blocos[blocos.length - 1];
    if (ultimo && ultimo.tema === dia.tema) {
      ultimo.dias.push(dia);
    } else {
      blocos.push({ tema: dia.tema, dias: [dia] });
    }
  }
  return blocos;
}