import {
  And_Parser,
  matchChars,
  Or_Parser,
  Parser,
  RepeatToString_Parser,
  TextBuffer,
} from '../../ParserCombinator/OtherImplementations/ParserCombinatorOld';
import { evaluateExpression, evaluate, Expression } from '../Evaluator';
import Term from '../Term';
import mathTokenizer from '../Tokenizer';
import parseTokensToTerms from '../TokensParser';

export default function runEvaluatorTests() {
  try {
    // H e l l o W o r l d
    // 0 1 2 3 4 5 6 7 8 9
    // const H = matchChars(['H']);
    // const e = matchChars(['e']);
    // const R = matchChars(['R']);
    // const l = matchChars(['l']);
    // const o = matchChars(['o']);
    // const W = matchChars(['W']);
    // const repeatH = RepeatToString_Parser(H); // H+
    // const he = And_Parser(H, e);
    // const hel = And_Parser(H, And_Parser(e, l));
    // const lR = And_Parser(l, R);
    // const ll = And_Parser(l, l);
    // const llo = And_Parser(l, And_Parser(l, o));
    // const lR__or__l__or__llo = Or_Parser(lR, Or_Parser(l, llo));
    // const hel2 = And_Parser(he, lR__or__l__or__llo);
    // const hello = And_Parser(he, And_Parser(lR__or__l__or__llo, W));
    // assertParseResult('HelloWorld', `H,e`, 'llo', he);
    // assertParseResult('HelloWorld', `H,e,l`, 'loW', hel);
    // assertParseResult('lloWorld', `l`, 'loW', lR__or__l__or__llo);
    // assertParseResult('HelloWorld', 'H,e,l', 'loW', hel2);
    // const Hel = And_Parser(Or_Parser(H, And_Parser(H, e)), l); // (H|He)l
    // assertParseResult('HelloWorld', 'H,e,l', 'loW', Hel);
    // assertParseResult('HelloWorld', 'H,e,l', 'loW', hello);

    runMathTokenizerTests();
    runMathParserTests();
    runMathEvaluationTests();
    runParserCombinatorTests();
    console.log('Completed Tests');
  } catch (e) {
    console.error('Uncaught exception', e);
  }
}

function runMathTokenizerTests() {
  assertTokenizerEqual('3 * 4 + 5', '3 * 4 + 5');
  assertTokenizerEqual('3*4+5', '3 * 4 + 5');
  assertTokenizerEqual('(3+4)', '( 3 + 4 )');
  assertTokenizerEqual('36', '36');
  assertTokenizerEqual('(36 + 42)', '( 36 + 42 )');
}

function runMathParserTests() {
  assertParseTermsEqual('4 + 2 * 3', '4 2 3 * +');
  assertParseTermsEqual('4 * 2 + 3', '4 2 * 3 +');
  assertParseTermsEqual('( 4 + 2 ) * 3', '4 2 + 3 *');
  assertParseTermsEqual('4 + ( 2 * 3 )', '4 2 3 * +');
  assertParseTermsEqual('4 * ( 2 + 3 )', '4 2 3 + *');
  assertParseTermsEqual('3 * 4 + 5', '3 4 * 5 +');
  assertParseTermsEqual('( 3 * 4 + 5 )', '3 4 * 5 +');
  assertParseTermsEqual('( 2 + 3 * 5 ) * 4', '2 3 5 * + 4 *');
  assertParseTermsEqual('( 2 / ( 3 + 1 ) )', '2 3 1 + /');
  assertParseTermsEqual('2 + 3 * 9 - 21', '2 3 9 * + 21 -');
}

function runMathEvaluationTests() {
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
}

function runParserCombinatorTests() {
  const HelloWorld = 'Hello World';
  const HHHelloWorld = 'HHHello World';
  const elloWorld = 'ello World';

  const H = matchChars(['H']);
  const e = matchChars(['e']);
  const R = matchChars(['R']);

  const repeatH = RepeatToString_Parser(H); // H+

  assertParseResult(HelloWorld, `H,e`, 'llo', And_Parser(H, e)); // He
  assertParseResult(HelloWorld, 'H', 'ell', Or_Parser(H, e)); // H|e
  assertParseResult(HelloWorld, 'H', 'ell', Or_Parser(e, H)); // e|H
  assertParseResult(
    HelloWorld,
    `Expected 'R' but got 'H'`,
    'Hel',
    Or_Parser(R, e)
  ); // M|e
  assertParseResult(
    HelloWorld,
    `Expected 'R' but got 'H'`,
    'Hel',
    And_Parser(R, e)
  ); // Me
  assertParseResult(
    HelloWorld,
    `Expected 'R' but got 'H'`,
    'Hel',
    And_Parser(R, e)
  ); // Me
  assertParseResult(
    HelloWorld,
    `Expected 'R' but got 'e'`,
    'Hel',
    And_Parser(H, R)
  ); // HR
  assertParseResult(HHHelloWorld, `HHH`, 'ell', repeatH); // H+
  assertParseResult(elloWorld, `Expected 'H' but got 'e'`, 'ell', repeatH); // H+
  assertParseResult(elloWorld, `e`, 'llo', Or_Parser(repeatH, e)); // H+|e
  assertParseResult(HHHelloWorld, `HHH`, 'ell', Or_Parser(repeatH, e)); // H+|e
  assertParseResult(HHHelloWorld, `HHH,e`, 'llo', And_Parser(repeatH, e)); // H+e
  assertParseResult(
    elloWorld,
    `Expected 'H' but got 'e'`,
    'ell',
    And_Parser(repeatH, e)
  ); // H+e
}

function assertTokenizerEqual(contents: string, expected: string) {
  assertArrayEqual(contents, expected, mathTokenizer);
}

function assertParseTermsEqual(contents: string, expected: string) {
  assertArrayEqual(contents, expected, (contents) => {
    return parseTokensToTerms(mathTokenizer(contents)).map(
      (term) => term.token
    );
  });
}

function assertEvaluateExpressionEqual(expression: Expression, expected: Term) {
  const actual = evaluateExpression(expression);
  if (actual.token !== expected.token) {
    console.warn(`EXPECTED: ${expected} | ACTUAL: ${actual}`);
  }
}

function assertEvaluationEqual(contents: string, expected: number) {
  assertEqual(contents, expected, evaluate);
}

function assertParseResult<T>(
  contents: string,
  expectedValue: string,
  next3Values: string,
  parser: Parser<T>
) {
  let buffer = new TextBuffer(contents);
  let result = parser(buffer, 0);

  assertEqual(contents, expectedValue, () => {
    if (result?.data.tag === 'value') {
      return result.data.value;
    }
    return result?.data.message ?? 'undefined';
  });

  assertEqual(`Next 3 values of ${contents}`, next3Values, () => buffer.get(3));
}

function assertArrayEqual<T>(
  contents: string,
  expected: string,
  fn: (contents: string) => T[]
) {
  assertEqual(contents, expected, (contents) => fn(contents).join(' '));
}

function assertEqual<T>(
  contents: string,
  expected: T,
  fn: (contents: string) => T | undefined
) {
  const actual = fn(contents);
  if (`${actual}` !== `${expected}`) {
    console.warn(`${contents} | EXPECTED: ${expected} | ACTUAL: ${actual}`);
  }
}
