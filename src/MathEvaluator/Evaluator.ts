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

type NumberTerm = { tag: 'number'; value: number; token: string };

type OperatorToken = '+' | '-' | '*' | '/';

export type TermType =
  | NumberTerm
  | {
      tag: 'binaryFunction';
      token: OperatorToken;
      fn: (a: number, b: number) => number;
    }
  | { tag: 'unaryFunction'; token: string; fn: (a: number) => number };

export const TermHelpers = {
  NumberTerm(value: number): TermType {
    return { tag: 'number', value, token: value.toString() };
  },
  BinaryOperator(
    token: OperatorToken,
    fn: (a: number, b: number) => number
  ): TermType {
    return { tag: 'binaryFunction', token, fn };
  },
  GetNumber(term: TermType): number {
    if (term.tag !== 'number') {
      throw new Error('Should have been a number but found: ' + term.tag);
    }
    return term.value;
  },
};

export type Expression = TermType[];

export function evaluate(contents: string): string {
  return evaluateExpression(parseTokensToTerms(tokenizer(contents))).token;
}

export function evaluateExpression(expression: Expression): TermType {
  const stack: TermType[] = [];

  for (const term of expression) {
    if (term.tag === 'number') {
      stack.push(term);
    } else if (term.tag === 'binaryFunction') {
      const b = stack.pop();
      const a = stack.pop();
      if (a && b) {
        const result = term.fn(
          TermHelpers.GetNumber(a),
          TermHelpers.GetNumber(b)
        );
        stack.push(TermHelpers.NumberTerm(result));
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
