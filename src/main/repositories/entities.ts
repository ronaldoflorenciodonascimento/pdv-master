import { EntityRecord } from './BaseRepository';

export interface Company extends EntityRecord { legal_name: string; trade_name: string; document_number: string; active: number; }
export interface User extends EntityRecord { company_id: number; name: string; email: string; password_hash: string; active: number; }
export interface Product extends EntityRecord { company_id: number; category_id?: number | null; sku: string; name: string; active: number; }
export interface Customer extends EntityRecord { company_id: number; name: string; person_type: string; active: number; }
export interface Supplier extends EntityRecord { company_id: number; legal_name: string; active: number; }
