/*
  Implement Shunting Yard Algorithm
  
  * when popping from op stack, drop commas (and commas super low-prec)

  * If number: push on normal stack
  * If operator:
    while top of op stack is op with higher precedence
      pop op stack to norm stack
    push on operator stack
  * If left parenthesis: push on operator stack
  * If right parenthesis: pops from op stack to norm stack until '('
  * When input empty pop from op stack to norm stack until empty
  * Op stack (bottom to top) is result
   
  4 + 2 * 3  ==> (4 (2 3 *) +) ==> 4 2 3 * +
*/

import { TermType, TermHelpers } from './Evaluator';

export default function parseTokensToTerms(tokens: string[]): TermType[] {
  let result: TermType[] = [];
  let opStack: string[] = [];

  for (const token of tokens) {
    if (token === '(') {
      opStack.push(token);
      continue;
    } else if (token === ')') {
      moveFromOpStack(result, opStack);
      continue;
    }

    const term = toTerm(token);
    if (term.tag === 'number') {
      result.push(term);
    } else if (term.tag === 'binaryFunction') {
      const topOfOpStack = opStack[opStack.length - 1];
      if (topOfOpStack && compareTokenPrecedence(topOfOpStack, token) > 0) {
        moveFromOpStack(result, opStack);
      }
      opStack.push(token);
    } else {
      throw new Error('Unimplemented parsing for term ' + term.token);
    }
  }

  moveFromOpStack(result, opStack);
  return result;
}

// Move all terms AFTER the last '(' parenthesis from opStack to result stack.
function moveFromOpStack(result: TermType[], opStack: string[]) {
  const parensIdx = opStack.lastIndexOf('(');

  const afterParens = opStack.slice(parensIdx + 1);
  result.push(...afterParens.reverse().map((token) => toTerm(token)));

  // newOpStack has all ops BEFORE the '(':
  // opStack                                parensIdx           beforeParens
  // ['3', '(', '4', '5'].slice(0, 1)   =>  parensIdx = 1   =>  ["3"]
  // ['(', '4', '5'].slice(0, 0)        =>  parensIdx = 0   =>  []
  // ['4', '5'].slice(0, 1)             =>  parensIdx = -1  =>  []
  const beforeParens = parensIdx === -1 ? [] : opStack.slice(0, parensIdx);
  opStack.length = 0;
  opStack.push(...beforeParens);
}

function toTerm(token: string): TermType {
  if (token === '+') {
    return TermHelpers.BinaryOperator(token, (a, b) => a + b);
  } else if (token === '-') {
    return TermHelpers.BinaryOperator(token, (a, b) => a - b);
  } else if (token === '*') {
    return TermHelpers.BinaryOperator(token, (a, b) => a * b);
  } else if (token === '/') {
    return TermHelpers.BinaryOperator(token, (a, b) => a / b);
  }

  const maybeInt = parseInt(token);
  if (!Number.isNaN(maybeInt)) {
    return TermHelpers.NumberTerm(maybeInt);
  }

  throw new Error('Unable to parse string token to Term. Token: ' + token);
}

function compareTokenPrecedence(a: string, b: string) {
  const precedence: { [key: string]: number } = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
  };
  if (precedence[a] === precedence[b]) {
    return 0;
  }
  return precedence[a] > precedence[b] ? 1 : -1;
}
