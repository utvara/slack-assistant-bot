import { Container } from 'inversify';
import { LocalStorage } from 'node-localstorage';
import { KeyValueStore } from './KeyValueStore';

jest.mock('node-localstorage');

const container = new Container();
const localStorageMock = jest.mocked(LocalStorage);

beforeAll(() => {
  container.bind('Newable<LocalStorage>').toConstantValue(LocalStorage);
  container.bind(KeyValueStore).toSelf();
});

describe('KeyValueStore', () => {
  let keyValueStore: KeyValueStore;

  beforeEach(() => {
    keyValueStore = container.get(KeyValueStore);
  });

  it('should set item in local storage', () => {
    keyValueStore.set('key', 'value');

    expect(localStorageMock.prototype.setItem).toHaveBeenCalledWith(
      'key',
      'value',
    );
  });

  it('should get item from local storage', () => {
    localStorageMock.prototype.getItem.mockReturnValue('value');

    const result = keyValueStore.get('key');

    expect(localStorageMock.prototype.getItem).toHaveBeenCalledWith('key');
    expect(result).toEqual('value');
  });
});
