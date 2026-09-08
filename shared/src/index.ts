export const ACRONYMS = {
  SOST: {
    abbr: "SOST",
    meaning: "Saúde Ocupacional e Segurança do Trabalho",
  },
  CAT: {
    abbr: "CAT",
    meaning: "Comunicação de Acidente de Trabalho",
  },
  CID: {
    abbr: "CID",
    meaning: "Classificação Internacional de Doenças",
  },
  SEI: {
    abbr: "SEI",
    meaning: "Sistema Eletrônico de Informações",
  },
} as const;

export type AcronymKey = keyof typeof ACRONYMS;

/** Ex.: "CAT (Comunicação de Acidente de Trabalho)" */
export function acronymLabel(key: AcronymKey): string {
  const item = ACRONYMS[key];
  return `${item.abbr} (${item.meaning})`;
}

export enum AccidentType {
  Typical = "typical",
  Commute = "commute",
  OccupationalDisease = "occupational_disease",
}

export const ACCIDENT_TYPE_LABELS: Record<AccidentType, string> = {
  [AccidentType.Typical]: "Típico",
  [AccidentType.Commute]: "De trajeto",
  [AccidentType.OccupationalDisease]: "Doença ocupacional",
};

export enum Sex {
  Male = "male",
  Female = "female",
  Other = "other",
}

export const SEX_LABELS: Record<Sex, string> = {
  [Sex.Male]: "Masculino",
  [Sex.Female]: "Feminino",
  [Sex.Other]: "Outro",
};

export enum AccidentSource {
  Seed = "seed",
  Manual = "manual",
}

export enum AccidentStatus {
  Archive = "archive",
  FollowUp = "follow_up",
  Attended = "attended",
  PartiallyAttended = "partially_attended",
  Unknown = "unknown",
}

export const ACCIDENT_STATUS_LABELS: Record<AccidentStatus, string> = {
  [AccidentStatus.Archive]: "Arquivar",
  [AccidentStatus.FollowUp]: "Acompanhar",
  [AccidentStatus.Attended]: "Atendida",
  [AccidentStatus.PartiallyAttended]: "Atendida em parte",
  [AccidentStatus.Unknown]: "Não informado",
};
