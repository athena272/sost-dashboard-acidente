import * as path from 'path';
import * as ExcelJS from 'exceljs';
import { AccidentSource } from '@sost/shared';
import { Accident } from '../accidents/accident.schema';
import {
  isLikelyGarbageRow,
  normalizeAccidentType,
  normalizeSex,
  normalizeStatus,
  normalizeText,
  toOptionalDate,
  toOptionalNumber,
} from '../accidents/normalization';

const SHEET_NAME = 'Relatórios_CAT';

const HEADERS = {
  reportNumber: 'Nº do Relatório',
  company: 'Empresa',
  catNumber: 'Nº da CAT',
  victimName: 'Vitima(s) do Acidente',
  sex: 'Sexo',
  role: 'Função',
  accidentMonth: 'Mês',
  sector: 'Setor',
  employeeAllocation: 'Lotação do Funcionário',
  accidentDate: 'Data do Acidente',
  emissionYear: 'Ano de Emissão',
  emissionDate: 'Data de emissão',
  accidentTime: 'Hora do Acidente',
  bodyPart: 'Parte do Corpo Atingida',
  causingAgent: 'Agente Causador',
  accidentType: 'Tipo do Acidente',
  cid: 'CID',
  daysOff: 'Dias Afastado',
  destinationSector: 'Setor destinatário',
  subject: 'Assunto',
  seiReference: 'CI Atrelada/ SEI',
  responseDeadline: 'Prazo Para Resposta',
  remainingDeadline: 'Prazo Restante',
  status: 'Situação',
  notes: 'Observações',
} as const;

function cellText(value: ExcelJS.CellValue): unknown {
  if (value && typeof value === 'object' && 'text' in value) {
    return (value as { text: string }).text;
  }
  if (value && typeof value === 'object' && 'result' in value) {
    return (value as { result: unknown }).result;
  }
  return value;
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function buildHeaderIndex(row: ExcelJS.Row): Map<string, number> {
  const map = new Map<string, number>();
  row.eachCell({ includeEmpty: false }, (cell, col) => {
    map.set(normalizeHeader(cellText(cell.value)), col);
  });
  return map;
}

function findCol(index: Map<string, number>, label: string): number | undefined {
  return index.get(normalizeHeader(label));
}

export type ParseResult = {
  docs: Partial<Accident>[];
  skipped: number;
  errors: string[];
};

export async function parseCatSpreadsheet(filePath: string): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet =
    workbook.getWorksheet(SHEET_NAME) ??
    workbook.worksheets.find((ws) =>
      normalizeHeader(ws.name).includes('relatorios_cat'),
    ) ??
    workbook.worksheets[0];

  if (!sheet) {
    throw new Error('Planilha sem abas');
  }

  const headerRow = sheet.getRow(1);
  const headerIndex = buildHeaderIndex(headerRow);
  const docs: Partial<Accident>[] = [];
  let skipped = 0;
  const errors: string[] = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    try {
      const get = (label: string) => {
        const col = findCol(headerIndex, label);
        if (!col) return undefined;
        return cellText(row.getCell(col).value);
      };

      const company = normalizeText(get(HEADERS.company));
      const catNumber = normalizeText(get(HEADERS.catNumber));
      const victimName = normalizeText(get(HEADERS.victimName));
      const accidentType = normalizeAccidentType(get(HEADERS.accidentType));

      const candidate = { company, catNumber, victimName, accidentType };
      if (isLikelyGarbageRow(candidate)) {
        skipped += 1;
        return;
      }

      docs.push({
        reportNumber: toOptionalNumber(get(HEADERS.reportNumber)),
        company,
        catNumber: catNumber || undefined,
        victimName,
        sex: normalizeSex(get(HEADERS.sex)),
        role: normalizeText(get(HEADERS.role)),
        accidentMonth: normalizeText(get(HEADERS.accidentMonth)),
        sector: normalizeText(get(HEADERS.sector)),
        employeeAllocation: normalizeText(get(HEADERS.employeeAllocation)),
        accidentDate: toOptionalDate(get(HEADERS.accidentDate)),
        emissionYear: toOptionalNumber(get(HEADERS.emissionYear)),
        emissionDate: toOptionalDate(get(HEADERS.emissionDate)),
        accidentTime: normalizeText(get(HEADERS.accidentTime)),
        bodyPart: normalizeText(get(HEADERS.bodyPart)),
        causingAgent: normalizeText(get(HEADERS.causingAgent)),
        accidentType,
        cid: normalizeText(get(HEADERS.cid)),
        daysOff: toOptionalNumber(get(HEADERS.daysOff)),
        destinationSector: normalizeText(get(HEADERS.destinationSector)),
        subject: normalizeText(get(HEADERS.subject)),
        seiReference: normalizeText(get(HEADERS.seiReference)),
        responseDeadline: toOptionalDate(get(HEADERS.responseDeadline)),
        remainingDeadline: normalizeText(get(HEADERS.remainingDeadline)),
        status: normalizeStatus(get(HEADERS.status)),
        notes: normalizeText(get(HEADERS.notes)),
        source: AccidentSource.Seed,
      });
    } catch (error) {
      skipped += 1;
      errors.push(
        `Linha ${rowNumber}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });

  return { docs, skipped, errors };
}

export function defaultSpreadsheetPath(): string {
  return path.resolve(
    __dirname,
    '../../../spreadsheet/Controle dos documentos do SOST - SEGURANÇA 2 (version 1).xlsb.xlsx',
  );
}
