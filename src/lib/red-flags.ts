// Red Flag Engine — regras determinísticas que avaliam o texto do relato
// do usuário e/ou os sintomas estruturados extraídos. Quando qualquer regra
// dispara, a recomendação é elevada para SAMU 192.

export type RedFlag = {
  id: string;
  label: string;
  reason: string;
};

const NORMALIZE = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const matchAny = (haystack: string, needles: string[]) =>
  needles.some((n) => haystack.includes(NORMALIZE(n)));

const matchAll = (haystack: string, needles: string[]) =>
  needles.every((n) => haystack.includes(NORMALIZE(n)));

export function detectRedFlags(text: string): RedFlag[] {
  const t = NORMALIZE(text);
  const flags: RedFlag[] = [];

  // Cardiovascular
  if (
    matchAny(t, ["dor no peito", "dor toracica", "aperto no peito", "peito apertando"]) &&
    matchAny(t, ["sudorese", "suor frio", "falta de ar", "irradia", "braco esquerdo", "mandibula", "nausea"])
  ) {
    flags.push({
      id: "chest_pain_acs",
      label: "Possível síndrome coronariana",
      reason: "Dor torácica associada a sintomas de alarme.",
    });
  }

  // AVC
  if (
    matchAny(t, [
      "perda de forca",
      "fraqueza de um lado",
      "boca torta",
      "rosto torto",
      "fala enrolada",
      "nao consigo falar",
      "perda de visao subita",
      "dormencia subita",
    ])
  ) {
    flags.push({
      id: "stroke",
      label: "Sinais de AVC",
      reason: "Déficit neurológico súbito.",
    });
  }

  // Respiratório grave
  if (
    matchAny(t, ["nao consigo respirar", "falta de ar grave", "sufocando", "labios roxos", "cianose"])
  ) {
    flags.push({
      id: "severe_dyspnea",
      label: "Dispneia grave",
      reason: "Insuficiência respiratória aguda.",
    });
  }

  // Sangramento
  if (matchAny(t, ["sangramento intenso", "hemorragia", "vomitando sangue", "sangue nas fezes", "sangue na urina abundante"])) {
    flags.push({
      id: "active_bleeding",
      label: "Sangramento ativo",
      reason: "Hemorragia significativa relatada.",
    });
  }

  // Gestante com sangramento
  if (matchAny(t, ["gravida", "gestante", "gestacao"]) && matchAny(t, ["sangramento", "sangue", "perda de liquido"])) {
    flags.push({
      id: "pregnancy_bleeding",
      label: "Sangramento na gestação",
      reason: "Sangramento ou perda de líquido em gestante.",
    });
  }

  // Bebê com febre
  if (
    matchAny(t, ["bebe", "recem nascido", "menos de 3 meses"]) &&
    matchAny(t, ["febre", "temperatura alta", "38", "39"])
  ) {
    flags.push({
      id: "infant_fever",
      label: "Febre em lactente <3m",
      reason: "Febre em bebê com menos de 3 meses exige avaliação imediata.",
    });
  }

  // Consciência
  if (matchAny(t, ["desmaiou", "perdeu a consciencia", "nao responde", "convulsao", "convulsionando"])) {
    flags.push({
      id: "altered_consciousness",
      label: "Alteração de consciência",
      reason: "Síncope, convulsão ou rebaixamento.",
    });
  }

  // Trauma grave
  if (matchAny(t, ["acidente grave", "atropelamento", "queda de altura", "ferimento por arma"])) {
    flags.push({
      id: "major_trauma",
      label: "Trauma grave",
      reason: "Mecanismo de alta energia.",
    });
  }

  // Suicídio
  if (matchAny(t, ["me matar", "suicidio", "tirar minha vida", "acabar com tudo"])) {
    flags.push({
      id: "suicidal_ideation",
      label: "Ideação suicida",
      reason: "Risco autoinfligido.",
    });
  }

  // Anafilaxia
  if (matchAny(t, ["lingua inchada", "garganta fechando", "anafilaxia", "reacao alergica grave"])) {
    flags.push({
      id: "anaphylaxis",
      label: "Possível anafilaxia",
      reason: "Reação alérgica com sinais de via aérea.",
    });
  }

  return flags;
}

export function hasEmergencyFlag(flags: RedFlag[]): boolean {
  return flags.length > 0;
}
