import mathTokenizer from '../ParserCombinator/Tokenizer';
import Term from './Term';
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

export type Expression = Term[];

export function evaluate(contents: string): number {
  return evaluateExpression(
    parseTokensToTerms(mathTokenizer(contents))
  ).GetNumber();
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
