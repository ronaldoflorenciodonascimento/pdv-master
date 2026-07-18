import { BaseRepository, EntityRecord, CreateData, UpdateData } from '../repositories/BaseRepository';

/** Serviço reutilizável para orquestrar persistência; regras de módulos ficam em serviços especializados futuros. */
export abstract class BaseService<T extends EntityRecord> {
  protected constructor(protected readonly repository: BaseRepository<T>) {}

  findById(id: number): T | undefined { return this.repository.findById(id); }
  findAll(limit?: number, offset?: number): T[] { return this.repository.findAll(limit, offset); }
  create(data: CreateData<T>): number { return this.repository.create(data); }
  update(id: number, data: UpdateData<T>): boolean { return this.repository.update(id, data); }
  delete(id: number): boolean { return this.repository.delete(id); }
}
