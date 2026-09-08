import {
  ACCIDENT_STATUS_LABELS,
  ACCIDENT_TYPE_LABELS,
  AccidentStatus,
  AccidentType,
  SEX_LABELS,
  Sex,
  acronymLabel,
} from '@sost/shared';

export type Accident = {
  _id: string;
  reportNumber?: number;
  company?: string;
  catNumber?: string;
  victimName?: string;
  sex?: Sex;
  role?: string;
  accidentMonth?: string;
  sector?: string;
  employeeAllocation?: string;
  accidentDate?: string;
  emissionYear?: number;
  emissionDate?: string;
  accidentTime?: string;
  bodyPart?: string;
  causingAgent?: string;
  accidentType?: AccidentType;
  cid?: string;
  daysOff?: number;
  destinationSector?: string;
  subject?: string;
  seiReference?: string;
  responseDeadline?: string;
  remainingDeadline?: string;
  status?: AccidentStatus;
  notes?: string;
};

export type AccidentFormValues = {
  reportNumber: string;
  company: string;
  catNumber: string;
  victimName: string;
  sex: string;
  role: string;
  accidentMonth: string;
  sector: string;
  employeeAllocation: string;
  accidentDate: string;
  emissionYear: string;
  emissionDate: string;
  accidentTime: string;
  bodyPart: string;
  causingAgent: string;
  accidentType: string;
  cid: string;
  daysOff: string;
  destinationSector: string;
  subject: string;
  seiReference: string;
  responseDeadline: string;
  remainingDeadline: string;
  status: string;
  notes: string;
};

export const emptyForm = (): AccidentFormValues => ({
  reportNumber: '',
  company: 'EBSERH',
  catNumber: '',
  victimName: '',
  sex: '',
  role: '',
  accidentMonth: '',
  sector: '',
  employeeAllocation: '',
  accidentDate: '',
  emissionYear: String(new Date().getFullYear()),
  emissionDate: '',
  accidentTime: '',
  bodyPart: '',
  causingAgent: '',
  accidentType: '',
  cid: '',
  daysOff: '',
  destinationSector: '',
  subject: '',
  seiReference: '',
  responseDeadline: '',
  remainingDeadline: '',
  status: AccidentStatus.Unknown,
  notes: '',
});

function toDateInput(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function accidentToForm(accident: Accident): AccidentFormValues {
  return {
    reportNumber: accident.reportNumber?.toString() ?? '',
    company: accident.company ?? '',
    catNumber: accident.catNumber ?? '',
    victimName: accident.victimName ?? '',
    sex: accident.sex ?? '',
    role: accident.role ?? '',
    accidentMonth: accident.accidentMonth ?? '',
    sector: accident.sector ?? '',
    employeeAllocation: accident.employeeAllocation ?? '',
    accidentDate: toDateInput(accident.accidentDate),
    emissionYear: accident.emissionYear?.toString() ?? '',
    emissionDate: toDateInput(accident.emissionDate),
    accidentTime: accident.accidentTime ?? '',
    bodyPart: accident.bodyPart ?? '',
    causingAgent: accident.causingAgent ?? '',
    accidentType: accident.accidentType ?? '',
    cid: accident.cid ?? '',
    daysOff: accident.daysOff?.toString() ?? '',
    destinationSector: accident.destinationSector ?? '',
    subject: accident.subject ?? '',
    seiReference: accident.seiReference ?? '',
    responseDeadline: toDateInput(accident.responseDeadline),
    remainingDeadline: accident.remainingDeadline ?? '',
    status: accident.status ?? AccidentStatus.Unknown,
    notes: accident.notes ?? '',
  };
}

export function formToPayload(form: AccidentFormValues) {
  const num = (v: string) => (v.trim() === '' ? undefined : Number(v));
  const str = (v: string) => (v.trim() === '' ? undefined : v.trim());
  return {
    reportNumber: num(form.reportNumber),
    company: str(form.company),
    catNumber: str(form.catNumber),
    victimName: str(form.victimName),
    sex: str(form.sex) as Sex | undefined,
    role: str(form.role),
    accidentMonth: str(form.accidentMonth),
    sector: str(form.sector),
    employeeAllocation: str(form.employeeAllocation),
    accidentDate: str(form.accidentDate),
    emissionYear: num(form.emissionYear),
    emissionDate: str(form.emissionDate),
    accidentTime: str(form.accidentTime),
    bodyPart: str(form.bodyPart),
    causingAgent: str(form.causingAgent),
    accidentType: str(form.accidentType) as AccidentType | undefined,
    cid: str(form.cid),
    daysOff: num(form.daysOff),
    destinationSector: str(form.destinationSector),
    subject: str(form.subject),
    seiReference: str(form.seiReference),
    responseDeadline: str(form.responseDeadline),
    remainingDeadline: str(form.remainingDeadline),
    status: str(form.status) as AccidentStatus | undefined,
    notes: str(form.notes),
  };
}

export function typeLabel(type?: AccidentType) {
  return type ? ACCIDENT_TYPE_LABELS[type] : '—';
}

export function statusLabel(status?: AccidentStatus) {
  return status ? ACCIDENT_STATUS_LABELS[status] : '—';
}

export function sexLabel(sex?: Sex) {
  return sex ? SEX_LABELS[sex] : '—';
}

export const formFieldMeta = {
  catNumber: acronymLabel('CAT'),
  cid: acronymLabel('CID'),
  seiReference: `CI atrelada / ${acronymLabel('SEI')}`,
} as const;

export const accidentTypeOptions = Object.values(AccidentType);
export const sexOptions = Object.values(Sex);
export const statusOptions = Object.values(AccidentStatus);
