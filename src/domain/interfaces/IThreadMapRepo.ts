export default interface IThreadMapRepo {
  set(key: string, value: string): void;
  get(key: string): string | null;
}
