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

import { Term } from './Evaluator';

type OpStackTerm = '(' | Term;

export default function parseTokensToTerms(tokens: string[]): Term[] {
  let result: Term[] = [];
  let opStack: OpStackTerm[] = [];

  for (const token of tokens) {
    if (token === '(') {
      opStack.push(token);
    } else if (token === ')') {
      moveFromOpStack(result, opStack);
    } else {
      const term = toTerm(token);
      if (term.tag === 'number') {
        result.push(term);
      } else if (term.tag === 'binaryFunction') {
        const topOfOpStack = opStack[opStack.length - 1];
        if (topOfOpStack && isHigherPrecedence(topOfOpStack, token)) {
          moveFromOpStack(result, opStack);
        }
        opStack.push(term);
      } else {
        throw new Error('Unimplemented parsing for term ' + term.token);
      }
    }
  }

  moveFromOpStack(result, opStack);
  return result;
}

// Move all terms AFTER the last '(' parenthesis from opStack to result stack.
function moveFromOpStack(result: Term[], opStack: OpStackTerm[]) {
  const parensIdx = opStack.lastIndexOf('(');

  const afterParens = opStack.slice(parensIdx + 1);
  result.push(...afterParens.reverse().map((term) => getTerm(term)));

  // newOpStack has all ops BEFORE the '(':
  // opStack                                parensIdx           beforeParens
  // ['3', '(', '4', '5'].slice(0, 1)   =>  parensIdx = 1   =>  ["3"]
  // ['(', '4', '5'].slice(0, 0)        =>  parensIdx = 0   =>  []
  // ['4', '5'].slice(0, 1)             =>  parensIdx = -1  =>  []
  const beforeParens = parensIdx === -1 ? [] : opStack.slice(0, parensIdx);
  opStack.length = 0;
  opStack.push(...beforeParens);
}

function isHigherPrecedence(a: OpStackTerm, b: string) {
  const aToken = getToken(a);
  const precedence: { [key: string]: number } = {
    '(': 1,
    '+': 2,
    '-': 2,
    '*': 3,
    '/': 3,
  };
  return precedence[aToken] > precedence[b];
}

function getToken(opStackTerm: OpStackTerm) {
  if (opStackTerm === '(') {
    return '(';
  }
  return opStackTerm.token;
}

function getTerm(opStackTerm: OpStackTerm): Term {
  if (opStackTerm === '(') {
    throw new Error(`OpStackTerm is an '(', not a term. ${opStackTerm}`);
  }
  return opStackTerm;
}

function toTerm(token: string): Term {
  if (token === '+') {
    return Term.MakeBinaryOperator(token, (a, b) => a + b);
  } else if (token === '-') {
    return Term.MakeBinaryOperator(token, (a, b) => a - b);
  } else if (token === '*') {
    return Term.MakeBinaryOperator(token, (a, b) => a * b);
  } else if (token === '/') {
    return Term.MakeBinaryOperator(token, (a, b) => a / b);
  }

  const maybeInt = parseInt(token);
  if (!Number.isNaN(maybeInt)) {
    return Term.MakeNumber(maybeInt);
  }

  throw new Error('Unable to parse string token to Term. Token: ' + token);
}
