type OperatorToken = '+' | '-' | '*' | '/';
type BinaryFn = (a: number, b: number) => number;
type TermType =
  | { tag: 'number'; value: number }
  | {
      tag: 'binaryFunction';
      token: OperatorToken;
      fn: BinaryFn;
    }
  | {
      tag: 'unaryFunction';
      token: TermToken;
      fn: (a: number) => number;
    };

export type TermToken = string;

export default class Term {
  private constructor(private readonly data: TermType) {}

  static MakeNumber(value: number): Term {
    return new Term({ tag: 'number', value });
  }

  static MakeBinaryOperator(token: OperatorToken, fn: BinaryFn): Term {
    return new Term({ tag: 'binaryFunction', token: token, fn });
  }

  get tag() {
    return this.data.tag;
  }

  get token() {
    switch (this.data.tag) {
      case 'number':
        return this.data.value.toString();
      case 'binaryFunction':
        return this.data.token;
      case 'unaryFunction':
        return this.data.token;
    }
  }

  GetNumber(): number {
    if (this.data.tag !== 'number') {
      throw new Error('Expected a number but found: ' + this.data.tag);
    }
    return this.data.value;
  }

  GetBinaryFn(): BinaryFn {
    if (this.data.tag !== 'binaryFunction') {
      throw new Error('Expected a binaryFunction but found: ' + this.data.tag);
    }
    return this.data.fn;
  }

  toString() {
    return JSON.stringify(this.data);
  }
}
