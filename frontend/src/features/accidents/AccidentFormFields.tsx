import {
  ACCIDENT_STATUS_LABELS,
  ACCIDENT_TYPE_LABELS,
  SEX_LABELS,
} from '@sost/shared';
import { SelectField } from '../../components/forms/SelectField';
import { TextAreaField } from '../../components/forms/TextAreaField';
import { TextField } from '../../components/forms/TextField';
import {
  AccidentFormValues,
  accidentTypeOptions,
  formFieldMeta,
  sexOptions,
  statusOptions,
} from './types';

type Props = {
  value: AccidentFormValues;
  onChange: (value: AccidentFormValues) => void;
  errors?: Record<string, string>;
};

export function AccidentFormFields({ value, onChange, errors = {} }: Props) {
  function set<K extends keyof AccidentFormValues>(key: K, next: string) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="stack">
      <div className="grid-3">
        <TextField
          label="Nº do relatório"
          value={value.reportNumber}
          onChange={(next) => set('reportNumber', next)}
          placeholder="Digite o número do relatório"
          inputMode="numeric"
          error={errors.reportNumber}
        />
        <TextField
          label="Empresa"
          value={value.company}
          onChange={(next) => set('company', next)}
          placeholder="Digite o nome da empresa"
          required
          error={errors.company}
        />
        <TextField
          label={formFieldMeta.catNumber}
          value={value.catNumber}
          onChange={(next) => set('catNumber', next)}
          placeholder="Digite o número da CAT"
          error={errors.catNumber}
        />
      </div>

      <div className="grid-3">
        <TextField
          label="Vítima"
          value={value.victimName}
          onChange={(next) => set('victimName', next)}
          placeholder="Digite o nome completo da vítima"
          required
          error={errors.victimName}
        />
        <SelectField
          label="Sexo"
          value={value.sex}
          onChange={(next) => set('sex', next)}
          placeholder="Selecione o sexo"
          options={sexOptions.map((option) => ({
            value: option,
            label: SEX_LABELS[option],
          }))}
          error={errors.sex}
        />
        <TextField
          label="Função"
          value={value.role}
          onChange={(next) => set('role', next)}
          placeholder="Digite a função"
          error={errors.role}
        />
      </div>

      <div className="grid-3">
        <TextField
          label="Mês"
          value={value.accidentMonth}
          onChange={(next) => set('accidentMonth', next)}
          placeholder="Digite o mês do acidente"
          error={errors.accidentMonth}
        />
        <TextField
          label="Setor"
          value={value.sector}
          onChange={(next) => set('sector', next)}
          placeholder="Digite o setor"
          error={errors.sector}
        />
        <TextField
          label="Lotação"
          value={value.employeeAllocation}
          onChange={(next) => set('employeeAllocation', next)}
          placeholder="Digite a lotação do servidor"
          error={errors.employeeAllocation}
        />
      </div>

      <div className="grid-3">
        <TextField
          label="Data do acidente"
          type="date"
          value={value.accidentDate}
          onChange={(next) => set('accidentDate', next)}
          required
          error={errors.accidentDate}
        />
        <TextField
          label="Ano de emissão"
          value={value.emissionYear}
          onChange={(next) => set('emissionYear', next)}
          placeholder="Digite o ano de emissão"
          inputMode="numeric"
          required
          error={errors.emissionYear}
        />
        <TextField
          label="Data de emissão"
          type="date"
          value={value.emissionDate}
          onChange={(next) => set('emissionDate', next)}
          error={errors.emissionDate}
        />
      </div>

      <div className="grid-3">
        <TextField
          label="Hora do acidente"
          value={value.accidentTime}
          onChange={(next) => set('accidentTime', next)}
          placeholder="Digite a hora do acidente"
          error={errors.accidentTime}
        />
        <TextField
          label="Parte do corpo atingida"
          value={value.bodyPart}
          onChange={(next) => set('bodyPart', next)}
          placeholder="Digite a parte do corpo atingida"
          error={errors.bodyPart}
        />
        <TextField
          label="Agente causador"
          value={value.causingAgent}
          onChange={(next) => set('causingAgent', next)}
          placeholder="Digite o agente causador"
          error={errors.causingAgent}
        />
      </div>

      <div className="grid-3">
        <SelectField
          label="Tipo do acidente"
          value={value.accidentType}
          onChange={(next) => set('accidentType', next)}
          placeholder="Selecione o tipo do acidente"
          required
          options={accidentTypeOptions.map((option) => ({
            value: option,
            label: ACCIDENT_TYPE_LABELS[option],
          }))}
          error={errors.accidentType}
        />
        <TextField
          label={formFieldMeta.cid}
          value={value.cid}
          onChange={(next) => set('cid', next)}
          placeholder="Digite o código CID"
          error={errors.cid}
        />
        <TextField
          label="Dias afastado"
          value={value.daysOff}
          onChange={(next) => set('daysOff', next)}
          placeholder="Digite o número de dias afastado"
          inputMode="numeric"
          error={errors.daysOff}
        />
      </div>

      <div className="grid-2">
        <TextField
          label="Setor destinatário"
          value={value.destinationSector}
          onChange={(next) => set('destinationSector', next)}
          placeholder="Digite o setor destinatário"
          error={errors.destinationSector}
        />
        <TextField
          label="Assunto"
          value={value.subject}
          onChange={(next) => set('subject', next)}
          placeholder="Digite o assunto"
          error={errors.subject}
        />
      </div>

      <div className="grid-3">
        <TextField
          label={formFieldMeta.seiReference}
          value={value.seiReference}
          onChange={(next) => set('seiReference', next)}
          placeholder="Digite a referência no SEI"
          error={errors.seiReference}
        />
        <TextField
          label="Prazo para resposta"
          type="date"
          value={value.responseDeadline}
          onChange={(next) => set('responseDeadline', next)}
          error={errors.responseDeadline}
        />
        <TextField
          label="Prazo restante"
          value={value.remainingDeadline}
          onChange={(next) => set('remainingDeadline', next)}
          placeholder="Digite o prazo restante"
          error={errors.remainingDeadline}
        />
      </div>

      <div className="grid-2">
        <SelectField
          label="Situação"
          value={value.status}
          onChange={(next) => set('status', next)}
          placeholder="Selecione a situação"
          options={statusOptions.map((option) => ({
            value: option,
            label: ACCIDENT_STATUS_LABELS[option],
          }))}
          error={errors.status}
        />
        <TextAreaField
          label="Observações"
          value={value.notes}
          onChange={(next) => set('notes', next)}
          placeholder="Digite observações adicionais do registro"
          rows={3}
          error={errors.notes}
        />
      </div>
    </div>
  );
}
