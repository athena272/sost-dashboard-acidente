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

export enum UserRole {
  Viewer = "viewer",
  Editor = "editor",
  Admin = "admin",
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Viewer]: "Visualizador",
  [UserRole.Editor]: "Editor de registros",
  [UserRole.Admin]: "Administrador",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.Viewer]:
    "Pode consultar o dashboard, listar, filtrar, buscar e abrir detalhes dos acidentes. Não cadastra, não edita e não exclui registros.",
  [UserRole.Editor]:
    "Além de consultar (como o Visualizador), pode cadastrar, editar e excluir acidentes (CATs).",
  [UserRole.Admin]:
    "Tudo do Editor de registros, e ainda gerencia usuários, aprova pedidos de edição e vê o histórico de atividades.",
};

export function canWriteAccidents(role: UserRole): boolean {
  return role === UserRole.Editor || role === UserRole.Admin;
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.Admin;
}

export enum EditorRequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Cancelled = "cancelled",
}

export const EDITOR_REQUEST_STATUS_LABELS: Record<EditorRequestStatus, string> = {
  [EditorRequestStatus.Pending]: "Pendente",
  [EditorRequestStatus.Approved]: "Aprovado",
  [EditorRequestStatus.Rejected]: "Rejeitado",
  [EditorRequestStatus.Cancelled]: "Cancelado",
};

export enum ActivityAction {
  AuthLogin = "auth.login",
  AuthRegister = "auth.register",
  AccidentCreate = "accident.create",
  AccidentUpdate = "accident.update",
  AccidentDelete = "accident.delete",
  UserRoleChange = "user.role_change",
  EditorRequestCreate = "editor_request.create",
  EditorRequestApprove = "editor_request.approve",
  EditorRequestReject = "editor_request.reject",
  EditorRequestCancel = "editor_request.cancel",
}

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  [ActivityAction.AuthLogin]: "Login",
  [ActivityAction.AuthRegister]: "Cadastro de usuário",
  [ActivityAction.AccidentCreate]: "Criação de acidente",
  [ActivityAction.AccidentUpdate]: "Edição de acidente",
  [ActivityAction.AccidentDelete]: "Exclusão de acidente",
  [ActivityAction.UserRoleChange]: "Alteração de perfil",
  [ActivityAction.EditorRequestCreate]: "Solicitação de editor",
  [ActivityAction.EditorRequestApprove]: "Aprovação de solicitação",
  [ActivityAction.EditorRequestReject]: "Rejeição de solicitação",
  [ActivityAction.EditorRequestCancel]: "Cancelamento de solicitação",
};

export type StatsContributorDimension =
  | "total"
  | "role"
  | "cid"
  | "accidentType"
  | "sector"
  | "bodyPart"
  | "sex"
  | "month";

const MONTH_KEY_PATTERN = /^(\d{4})-(\d{2})$/;

/** Evita misturar chave de uma dimensão com outra (ex.: "typical" em month). */
export function isContributorKeyCompatible(
  dimension: StatsContributorDimension,
  key: string | undefined | null,
): boolean {
  if (dimension === "total") return true;
  const value = key?.trim() ?? "";
  if (!value) return false;
  if (dimension === "month") {
    const match = MONTH_KEY_PATTERN.exec(value);
    if (!match) return false;
    const month = Number(match[2]);
    return month >= 1 && month <= 12;
  }
  return true;
}

export function parseMonthContributorKey(key: string): {
  year: number;
  month: number;
} {
  const value = key.trim();
  const match = MONTH_KEY_PATTERN.exec(value);
  if (!match) {
    throw new Error(
      'Para consultar por mês, use o formato AAAA-MM (ex.: "2025-03")',
    );
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    throw new Error("Mês inválido: use um valor entre 01 e 12");
  }
  return { year, month };
}
