import { evaluateExpression, evaluate, Expression } from './Evaluator';
import Term, { Token } from './Term';
import tokenizer from './Tokenizer';
import parseTokensToTerms from './TokensParser';

function assertEvaluateExpressionEqual(expression: Expression, expected: Term) {
  const actual = evaluateExpression(expression);
  if (actual.token !== expected.token) {
    console.warn('EXPECTED: ' + expected.token + ' ACTUAL: ' + actual.token);
  }
}

function assertParserEqual(expression: string, expected: string) {
  const actual = parseTokensToTerms(tokenizer(expression))
    .map((term) => term.token)
    .join(' ');
  if (actual !== expected) {
    console.warn('EXPECTED: ' + expected + ' ACTUAL: ' + actual);
  }
}

function assertEvaluationEqual(contents: string, expected: number) {
  const actual = evaluate(contents);
  if (actual !== expected) {
    console.warn(contents + ' | EXPECTED: ' + expected + ' ACTUAL: ' + actual);
  }
}

function assertTokenizerEqual(contents: string, expected: Token[]) {
  const actual = tokenizer(contents);
  if (actual.toString() !== expected.toString()) {
    console.warn(contents + ' | EXPECTED: ' + expected + ' ACTUAL: ' + actual);
  }
}

export function runEvaluatorTests() {
  try {
    // INFIX:    (4 + 2) * 3      = 18
    // POSTFIX:   4 2 + 3 *       = 18
    assertEvaluateExpressionEqual(
      [
        Term.MakeNumber(4),
        Term.MakeNumber(2),
        Term.MakeBinaryOperator('+', (x, y) => x + y),
        Term.MakeNumber(3),
        Term.MakeBinaryOperator('*', (x, y) => x * y),
      ],
      Term.MakeNumber(18)
    );

    assertParserEqual('4 + 2 * 3', '4 2 3 * +');
    assertParserEqual('4 * 2 + 3', '4 2 * 3 +');
    assertParserEqual('( 4 + 2 ) * 3', '4 2 + 3 *');
    assertParserEqual('4 + ( 2 * 3 )', '4 2 3 * +');
    assertParserEqual('4 * ( 2 + 3 )', '4 2 3 + *');
    assertParserEqual('3 * 4 + 5', '3 4 * 5 +');
    assertParserEqual('( 3 * 4 + 5 )', '3 4 * 5 +');
    assertParserEqual('( 2 + 3 * 5 ) * 4', '2 3 5 * + 4 *');
    assertParserEqual('( 2 / ( 3 + 1 ) )', '2 3 1 + /');
    assertParserEqual('2 + 3 * 9 - 21', '2 3 9 * + 21 -');

    assertEvaluationEqual('4 + 2 * 3', 10);
    assertEvaluationEqual('4 * 2 + 3', 11);
    assertEvaluationEqual('( 4 + 2 ) * 3', 18);
    assertEvaluationEqual('4 + ( 2 * 3 )', 10);
    assertEvaluationEqual('4 * ( 2 + 3 )', 20);
    assertEvaluationEqual('( 2 + 3 * 5 ) * 4', 68);
    assertEvaluationEqual('( ( ( 4 + 2 ) ) * 7 )', 42);
    assertEvaluationEqual('( 2 / ( 3 + 1 ) )', 0.5);
    assertEvaluationEqual('( 3 * 4 + 5 )', 17);
    assertEvaluationEqual('2 * 1 + 2 * ( 3 * 4 + 5 )', 36);
    assertEvaluationEqual('( ( 2 + 3 ) * ( 9 - 21 * 3 ) * 5 ) * 4', -5400);
    assertEvaluationEqual('2 + 3 * 9 - 21 * 3 * 5 * 4', -1231);
    assertEvaluationEqual('2 + 3 * 9 + 8 + 10 + 21 * 3 * 10 - 5 * 4', 657);

    assertTokenizerEqual('3 * 4 + 5', ['3', '*', '4', '+', '5']);

    console.log('Completed Tests');
  } catch (e) {
    console.error('Uncaught exception', e);
  }
}
