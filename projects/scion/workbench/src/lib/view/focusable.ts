export abstract class Focusable {
  public abstract focus(): void;
}

export function createFocusable(fn: () => void): Focusable {
  return new class implements Focusable {
    public focus(): void {
      fn();
    }
  }();
}
