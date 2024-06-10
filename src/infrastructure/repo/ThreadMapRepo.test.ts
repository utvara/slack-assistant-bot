import { Container } from 'inversify';
import { mock } from 'jest-mock-extended';
import { KeyValueStore } from '../KeyValueStore';
import { ThreadMapRepo } from './ThreadMapRepo';

const container = new Container();
const keyValueStoreMock = mock<KeyValueStore>();

beforeAll(() => {
  container.bind(KeyValueStore).toConstantValue(keyValueStoreMock);
  container.bind('IThreadMapRepo').to(ThreadMapRepo);
});

describe('ThreadMapRepo', () => {
  let threadMapRepo: ThreadMapRepo;

  beforeEach(() => {
    threadMapRepo = container.get('IThreadMapRepo');
  });

  it('should set a value in the key value store', () => {
    const key = 'testKey';
    const value = 'testValue';

    threadMapRepo.set(key, value);

    expect(keyValueStoreMock.set).toHaveBeenCalledWith(key, value);
  });

  it('should get a value from the key value store', () => {
    const key = 'testKey';
    const value = 'testValue';

    keyValueStoreMock.get.mockReturnValue(value);

    expect(threadMapRepo.get(key)).toBe(value);
    expect(keyValueStoreMock.get).toHaveBeenCalledWith(key);
  });
});
