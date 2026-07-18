import { BaseRepository } from './BaseRepository';
import { Product } from './entities';
export class ProductRepository extends BaseRepository<Product> {
  constructor() { super('products'); }
  findBySku(companyId: number, sku: string): Product | undefined { return this.queryOne<Product>('SELECT * FROM products WHERE company_id = ? AND sku = ?', [companyId, sku]); }
}
