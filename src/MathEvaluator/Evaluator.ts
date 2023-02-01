import tokenizer from './Tokenizer';
import parseTokensToTerms from './TokensParser';

/*
Operators are INFIX     POSTFIX
(4 + 2) * 3             4 2 + 3 *
4 + (2 * 3)             4 2 3 * +

POSTFIX is also called "Reverse Polish Notation (RPN)"

1. Find the tokens
2. Convert them to RPN
3. Execute the expression

// evaluate('4 + 3'); // '7'
// evaluate('4 + 2 * 3'); // '10'
// evaluate('(4 + 2) * 3'); // '18'
// evaluate('false && true'); // 'false'
// evaluate('sqrt(2)'); // '1.41'
*/

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
      token: string;
      fn: (a: number) => number;
    };

export class Term {
  private constructor(private readonly data: TermType) {}

  static MakeNumber(value: number): Term {
    return new Term({ tag: 'number', value });
  }

  static MakeBinaryOperator(
    token: OperatorToken,
    fn: (a: number, b: number) => number
  ): Term {
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
      throw new Error('Should have been a number but found: ' + this.data.tag);
    }
    return this.data.value;
  }

  GetBinaryFn(): BinaryFn {
    if (this.data.tag !== 'binaryFunction') {
      throw new Error('Should have been a number but found: ' + this.data.tag);
    }
    return this.data.fn;
  }

  toString() {
    return JSON.stringify(this.data);
  }
}

export type Expression = Term[];

export function evaluate(contents: string): string {
  return evaluateExpression(parseTokensToTerms(tokenizer(contents))).token;
}

export function evaluateExpression(expression: Expression): Term {
  const stack: Term[] = [];

  for (const term of expression) {
    if (term.tag === 'number') {
      stack.push(term);
    } else if (term.tag === 'binaryFunction') {
      const b = stack.pop();
      const a = stack.pop();
      if (a && b) {
        const result = term.GetBinaryFn()(a.GetNumber(), b.GetNumber());
        stack.push(Term.MakeNumber(result));
      } else {
        throw new Error(
          `Unable to evaluate b/c binary function was expecting two terms. Got: ${a}, ${b}`
        );
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Stack was: ' + JSON.stringify(stack));
  }

  return stack[stack.length - 1];
}
