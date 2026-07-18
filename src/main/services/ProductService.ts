import { ProductRepository } from '../repositories/ProductRepository';
import { Product } from '../repositories/entities';
import { BaseService } from './BaseService';
export class ProductService extends BaseService<Product> { constructor(repository = new ProductRepository()) { super(repository); } }
