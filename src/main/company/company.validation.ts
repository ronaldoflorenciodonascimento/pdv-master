import { AuthError } from '../shared/errors/AuthError';
import { SaveCompanyInput } from './company.types';

const fields = ['legalName', 'tradeName', 'document', 'stateRegistration', 'municipalRegistration', 'phone', 'email', 'postalCode', 'street', 'streetNumber', 'complement', 'district', 'city', 'state', 'country', 'currency', 'timezone', 'backupPath'];
const clean = (value: unknown): string | undefined => typeof value === 'string' ? value.trim() || undefined : undefined;
const digits = (value: unknown): string | undefined => { const text = clean(value); return text ? text.replace(/\D/g, '') || undefined : undefined; };

export function validateCompanyInput(input: unknown): SaveCompanyInput {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AuthError('Dados da empresa inválidos.', 'INVALID_INPUT');
  const record = input as Record<string, unknown>;
  if (Object.keys(record).some((key) => !fields.includes(key))) throw new AuthError('Campos não permitidos.', 'INVALID_INPUT');
  const legalName = clean(record.legalName); const tradeName = clean(record.tradeName);
  if (!legalName) throw new AuthError('Razão social é obrigatória.', 'INVALID_LEGAL_NAME');
  if (!tradeName) throw new AuthError('Nome fantasia é obrigatório.', 'INVALID_TRADE_NAME');
  const email = clean(record.email)?.toLowerCase();
  if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new AuthError('E-mail inválido.', 'INVALID_EMAIL');
  const state = clean(record.state)?.toUpperCase();
  if (state && !/^[A-Z]{2}$/.test(state)) throw new AuthError('Estado deve conter duas letras.', 'INVALID_STATE');
  const backupPath = clean(record.backupPath);
  if (backupPath && (/^[a-z]:/i.test(backupPath) || backupPath.startsWith('\\') || backupPath.includes('..'))) throw new AuthError('Pasta de backup inválida.', 'INVALID_BACKUP_PATH');
  return { legalName, tradeName, document: digits(record.document), stateRegistration: clean(record.stateRegistration), municipalRegistration: clean(record.municipalRegistration), phone: digits(record.phone), email, postalCode: digits(record.postalCode), street: clean(record.street), streetNumber: clean(record.streetNumber), complement: clean(record.complement), district: clean(record.district), city: clean(record.city), state, country: clean(record.country)?.toUpperCase() ?? 'BR', currency: clean(record.currency)?.toUpperCase() ?? 'BRL', timezone: clean(record.timezone) ?? 'America/Sao_Paulo', backupPath };
}
