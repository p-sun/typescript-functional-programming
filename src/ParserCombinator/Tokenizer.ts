import { TermToken } from '../MathEvaluator/Term';
import {
  TextBuffer,
  matchChars,
  RepeatToString_Parser,
  Or_Parser,
  RepeatToArray_Parser,
} from './OtherImplementations/ParserCombinatorOld';
import { str, repeatOnceOrMore_greedy, orFirst } from './ParserCombinator';

export default function mathTokenizer(contents: string): TermToken[] {
  return mathTokenizer_newParserCombinator(contents);
}

function mathTokenizer_newParserCombinator(contents: string): TermToken[] {
  const whitespaceRemoved = contents.replace(/\s/g, '');
  const parenthesis = str('(', ')'); // \(|\)
  const operator = str('+', '-', '*', '/'); // (\+|-|\*|\/)
  const digits = repeatOnceOrMore_greedy(
    str(...Array.from('0123456789'))
  ).mapResults((digitsArr) => digitsArr.join('')); // \d*
  const token = orFirst(orFirst(parenthesis, operator), digits);
  const tokenArrayParser = repeatOnceOrMore_greedy(token); // ([\(|\)]|[\+|-|\*|\/]|\d+)+

  const result = tokenArrayParser.run(whitespaceRemoved);
  if (result) {
    if (result.data.successful) {
      return result.data.candidates[0].result;
    } else {
      return [`Tokenizer error: ${result.data.message}`];
    }
  }
  return ['Tokenizer error: Result is empty.'];
}

function mathTokenizer_oldParserCombinator(contents: string): TermToken[] {
  const whitespaceRemoved = contents.replace(/\s/g, '');
  let buffer = new TextBuffer(whitespaceRemoved);
  const parenthesisParser = matchChars(['(', ')']); // \(|\)
  const opParser = matchChars(['+', '-', '*', '/']); // (\+|-|\*|\/)
  const digitsParser = RepeatToString_Parser(
    matchChars(Array.from('0123456789'))
  ); // \d+
  const tokenParser = Or_Parser(
    parenthesisParser,
    Or_Parser(opParser, digitsParser)
  ); // [\(|\)]|[\+|-|\*|\/]|\d+
  const tokenArrayParser = RepeatToArray_Parser(tokenParser); // ([\(|\)]|[\+|-|\*|\/]|\d+)+

  let unwindIndex = buffer.unwindIndex;
  let result = tokenArrayParser(buffer, unwindIndex);
  debugger;
  if (result) {
    if (result.data.tag === 'value') {
      return result.data.value;
    } else {
      return [`Tokenizer error: ${result.data.message}`];
    }
  }
  return ['Tokenizer error: Result is empty.'];
}
