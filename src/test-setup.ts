/**
 * Browser APIs that jsdom does not provide, but Ionic components use.
 */
class IntersectionObserverStub implements IntersectionObserver {
  public readonly root: Element | Document | null = null;
  public readonly rootMargin: string = '';
  public readonly scrollMargin: string = '';
  public readonly thresholds: ReadonlyArray<number> = [];

  public observe(): void {}
  public unobserve(): void {}
  public disconnect(): void {}
  public takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver ??= IntersectionObserverStub;
