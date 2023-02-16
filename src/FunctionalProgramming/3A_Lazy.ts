const UNEVALUATED = Symbol('unevaluated');

export class Lazy<T> {
  private expr?: () => T;
  private cachedResult: T | typeof UNEVALUATED = UNEVALUATED;

  constructor(expression: () => T) {
    this.expr = expression;
  }

  public force() {
    if (this.cachedResult === UNEVALUATED) {
      this.cachedResult = this.expr!();
      this.expr = undefined; // Free up stack.
    }
    return this.cachedResult;
  }
}

// Modified from https://github.com/DCtheTall/purely-functional-data-structures
export const $ = <T>(expr: () => T) => new Lazy(expr);
