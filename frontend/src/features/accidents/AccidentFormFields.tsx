import {
  ACCIDENT_STATUS_LABELS,
  ACCIDENT_TYPE_LABELS,
  SEX_LABELS,
} from '@sost/shared';
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
};

export function AccidentFormFields({ value, onChange }: Props) {
  function set<K extends keyof AccidentFormValues>(key: K, next: string) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="stack">
      <div className="grid-3">
        <div className="field">
          <label>Nº do relatório</label>
          <input
            value={value.reportNumber}
            onChange={(e) => set('reportNumber', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Empresa</label>
          <input
            value={value.company}
            onChange={(e) => set('company', e.target.value)}
          />
        </div>
        <div className="field">
          <label>{formFieldMeta.catNumber}</label>
          <input
            value={value.catNumber}
            onChange={(e) => set('catNumber', e.target.value)}
          />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Vítima</label>
          <input
            value={value.victimName}
            onChange={(e) => set('victimName', e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Sexo</label>
          <select value={value.sex} onChange={(e) => set('sex', e.target.value)}>
            <option value="">—</option>
            {sexOptions.map((option) => (
              <option key={option} value={option}>
                {SEX_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Função</label>
          <input value={value.role} onChange={(e) => set('role', e.target.value)} />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Mês</label>
          <input
            value={value.accidentMonth}
            onChange={(e) => set('accidentMonth', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Setor</label>
          <input
            value={value.sector}
            onChange={(e) => set('sector', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Lotação</label>
          <input
            value={value.employeeAllocation}
            onChange={(e) => set('employeeAllocation', e.target.value)}
          />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Data do acidente</label>
          <input
            type="date"
            value={value.accidentDate}
            onChange={(e) => set('accidentDate', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Ano de emissão</label>
          <input
            value={value.emissionYear}
            onChange={(e) => set('emissionYear', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Data de emissão</label>
          <input
            type="date"
            value={value.emissionDate}
            onChange={(e) => set('emissionDate', e.target.value)}
          />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Hora do acidente</label>
          <input
            value={value.accidentTime}
            onChange={(e) => set('accidentTime', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Parte do corpo atingida</label>
          <input
            value={value.bodyPart}
            onChange={(e) => set('bodyPart', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Agente causador</label>
          <input
            value={value.causingAgent}
            onChange={(e) => set('causingAgent', e.target.value)}
          />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Tipo do acidente</label>
          <select
            value={value.accidentType}
            onChange={(e) => set('accidentType', e.target.value)}
          >
            <option value="">—</option>
            {accidentTypeOptions.map((option) => (
              <option key={option} value={option}>
                {ACCIDENT_TYPE_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>{formFieldMeta.cid}</label>
          <input value={value.cid} onChange={(e) => set('cid', e.target.value)} />
        </div>
        <div className="field">
          <label>Dias afastado</label>
          <input
            value={value.daysOff}
            onChange={(e) => set('daysOff', e.target.value)}
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Setor destinatário</label>
          <input
            value={value.destinationSector}
            onChange={(e) => set('destinationSector', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Assunto</label>
          <input
            value={value.subject}
            onChange={(e) => set('subject', e.target.value)}
          />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>{formFieldMeta.seiReference}</label>
          <input
            value={value.seiReference}
            onChange={(e) => set('seiReference', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Prazo para resposta</label>
          <input
            type="date"
            value={value.responseDeadline}
            onChange={(e) => set('responseDeadline', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Prazo restante</label>
          <input
            value={value.remainingDeadline}
            onChange={(e) => set('remainingDeadline', e.target.value)}
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Situação</label>
          <select
            value={value.status}
            onChange={(e) => set('status', e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {ACCIDENT_STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Observações</label>
          <textarea
            rows={3}
            value={value.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
