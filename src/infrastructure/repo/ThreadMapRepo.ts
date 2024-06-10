import { inject, injectable } from 'inversify';
import IThreadMapRepo from '../../domain/interfaces/IThreadMapRepo';
import { KeyValueStore } from '../KeyValueStore';

@injectable()
export class ThreadMapRepo implements IThreadMapRepo {
  constructor(@inject(KeyValueStore) private keyValueStore: KeyValueStore) {}

  set(key: string, value: string): void {
    this.keyValueStore.set(key, value);
  }

  get(key: string): string | null {
    return this.keyValueStore.get(key);
  }
}
