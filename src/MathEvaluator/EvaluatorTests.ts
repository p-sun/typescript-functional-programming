import { evaluateExpression, evaluate, Expression } from './Evaluator';
import Term from './Term';
import tokenizer, {
  AND_Parser,
  OR_Parser,
  parseChars,
  Parser,
  ParseResult,
  REPEAT_Parser,
  REPEAT_TWICE_Parser,
  TextBuffer,
} from './Tokenizer';
import parseTokensToTerms from './TokensParser';

function assertEvaluateExpressionEqual(expression: Expression, expected: Term) {
  const actual = evaluateExpression(expression);
  if (actual.token !== expected.token) {
    console.warn(`EXPECTED: ${expected} | ACTUAL: ${actual}`);
  }
}

function assertParserEqual(contents: string, expected: string) {
  assertArrayEqual(contents, expected, (contents) => {
    return parseTokensToTerms(tokenizer(contents)).map((term) => term.token);
  });
}

function assertEvaluationEqual(contents: string, expected: number) {
  assertEqual(contents, expected, evaluate);
}

function assertTokenizerEqual(contents: string, expected: string) {
  assertArrayEqual(contents, expected, tokenizer);
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

    assertTokenizerEqual('3 * 4 + 5', '3 * 4 + 5');
    assertTokenizerEqual('3*4+5', '3 * 4 + 5');
    assertTokenizerEqual('(3+4)', '( 3 + 4 )');
    assertTokenizerEqual('36', '36');
    assertTokenizerEqual('(36 + 42)', '( 36 + 42 )');

    assertParserCombinators();

    console.log('Completed Tests');
  } catch (e) {
    console.error('Uncaught exception', e);
  }
}

function assertParseResult<T>(
  contents: string,
  expectedValue: string,
  next3Values: string,
  parser: Parser<T>
) {
  let buffer = new TextBuffer(contents);
  let result = parser(buffer);

  assertEqual(contents, expectedValue, () => {
    if (result?.data.tag === 'value') {
      return result.data.value;
    }
    return result?.data.message ?? 'undefined';
  });

  assertEqual(`Next 3 values of ${contents}`, next3Values, () => buffer.get(3));
}

function assertParserCombinators() {
  const helloWorld = 'Hello World';

  const HHHelloWorld = 'HHHello World';
  const elloWorld = 'ello World';

  const concatStrings = (str1: string, str2: string) => str1 + str2;

  const H = parseChars(['H']);
  const e = parseChars(['e']);
  const R = parseChars(['R']);
  const repeatH = REPEAT_Parser(H, concatStrings); // H+

  assertParseResult(helloWorld, `H,e`, 'llo', AND_Parser(H, e)); // He
  assertParseResult(helloWorld, 'H', 'ell', OR_Parser(H, e)); // (H|e)
  assertParseResult(helloWorld, 'H', 'ell', OR_Parser(e, H)); // (e|H)
  assertParseResult(
    helloWorld,
    `Expected letter 'R' but got 'H'`,
    'Hel',
    OR_Parser(R, e)
  ); // (M|e)
  assertParseResult(
    helloWorld,
    `Expected letter 'R' but got 'H'`,
    'Hel',
    AND_Parser(R, e)
  ); // Me
  assertParseResult(
    helloWorld,
    `Expected letter 'R' but got 'H'`,
    'Hel',
    AND_Parser(R, e)
  ); // Me
  assertParseResult(
    helloWorld,
    `Expected letter 'R' but got 'e'`,
    'Hel',
    AND_Parser(H, R)
  ); // HR
  assertParseResult(
    HHHelloWorld,
    `HH`,
    'Hel',
    REPEAT_TWICE_Parser(H, concatStrings)
  ); // H{2}
  assertParseResult(HHHelloWorld, `HHH`, 'ell', repeatH); // H+
  assertParseResult(
    elloWorld,
    `Expected letter 'H' but got 'e'`,
    'ell',
    repeatH
  ); // H+
  assertParseResult(elloWorld, `e`, 'llo', OR_Parser(repeatH, e)); // (H+|e)
  assertParseResult(HHHelloWorld, `HHH`, 'ell', OR_Parser(repeatH, e)); // (H+|e)
  assertParseResult(HHHelloWorld, `HHH,e`, 'llo', AND_Parser(repeatH, e)); // H+e
}
