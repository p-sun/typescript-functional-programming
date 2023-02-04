import { Token } from './Term';

export class TextBuffer {
  private offset = 0;

  constructor(private readonly contents: string) {}

  get unwindIndex() {
    return this.offset;
  }

  get(length: number = 1) {
    const start = this.offset;
    if (start + length <= this.contents.length) {
      this.offset += length;
      return this.contents.slice(start, start + length);
    }

    this.offset = this.contents.length;
    return undefined;
  }

  seek(pos: number) {
    if (pos === this.offset) {
      return;
    }
    if (pos >= 0 && pos < this.contents.length) {
      this.offset = pos;
    } else {
      throw new Error(
        `Seeking position ${pos} that doesnt exist on content: ${this.contents}`
      );
    }
  }
}

export class ParseResult<T> {
  constructor(
    public readonly data:
      | { tag: 'value'; value: T }
      | { tag: 'error'; message: string }
  ) {}

  static MakeValue<T>(value: T) {
    return new ParseResult({ tag: 'value', value });
  }

  static MakeError<T>(message: string) {
    return new ParseResult<T>({ tag: 'error', message });
  }

  toString() {
    return JSON.stringify(this.data);
  }

  then<U>(
    fn: (value: T) => ParseResult<U> | undefined
  ): ParseResult<U> | undefined {
    if (this.data.tag === 'value') {
      return fn(this.data.value);
    }
    return ParseResult.MakeError(this.data.message);
  }

  errorThen<U>(
    fn: (result: this) => ParseResult<T | U> | undefined
  ): ParseResult<T | U> | undefined {
    if (this.data.tag === 'error') {
      return fn(this);
    }
    return this;
  }
}

export type Parser<T> = (
  buffer: TextBuffer,
  unwindIndex: number // Where to unwind to if Parser fails
) => ParseResult<T> | undefined;

export function And_Parser<S, T>(
  p1: Parser<S>,
  p2: Parser<T>
): Parser<(S | T)[]> {
  return (buffer: TextBuffer, unwindIndex: number) => {
    return p1(buffer, unwindIndex)?.then((value1) => {
      return p2(buffer, unwindIndex)?.then((value2) => {
        return ParseResult.MakeValue([value1, value2]);
      });
    });
  };
}

export function Or_Parser<S, T>(p1: Parser<S>, p2: Parser<T>): Parser<S | T> {
  return (buffer: TextBuffer, unwindIndex: number) => {
    return p1(buffer, unwindIndex)?.errorThen((error1) => {
      return p2(buffer, unwindIndex)?.errorThen((error2) => {
        return error1;
      });
    });
  };
}

// Continue parsing until you can't parse anymore.
// i.e. Match 1 or more, like the '+' in regex.
export function Repeat_Parser<T>(
  parser: Parser<T>,
  join: (value1: T, value2: T) => T
): Parser<T> {
  return (buffer: TextBuffer, unwindIndex: number) => {
    let combined: T | undefined; // Combined value from all parsers
    let result: ParseResult<T> | undefined;
    do {
      result = parser(buffer, buffer.unwindIndex);
      result?.then((newVal) => {
        combined = combined === undefined ? newVal : join(combined, newVal);
        return result;
      });
    } while (result && result.data.tag === 'value');

    return combined ? ParseResult.MakeValue(combined) : result;
  };
}

export function parseChars(chars: Array<string>): Parser<string> {
  const set = new Set(chars);
  return (buffer: TextBuffer, unwindIndex: number) => {
    const l = buffer.get();
    if (l === undefined) {
      return undefined;
    } else if (set.has(l)) {
      return ParseResult.MakeValue(l);
    } else {
      buffer.seek(unwindIndex);
      return ParseResult.MakeError(`Expected '${chars}' but got '${l}'`);
    }
  };
}

export default function tokenizer(contents: string): Token[] {
  const whitespaceRemoved = contents.replace(/\s/g, '');
  let buffer = new TextBuffer(whitespaceRemoved);
  const concatStrings = (str1: string, str2: string) => str1 + str2;

  const parenthesisParser = parseChars(['(', ')']);
  const opParser = parseChars(['+', '-', '*', '/']);
  const digitParser = Repeat_Parser(
    parseChars(Array.from('0123456789')),
    concatStrings
  );
  const allParsers = Or_Parser(
    parenthesisParser,
    Or_Parser(opParser, digitParser)
  ); // TODO: remove while loop

  let tokens = new Array<string>();
  let unwindIndex = buffer.unwindIndex;
  let result = allParsers(buffer, unwindIndex);
  while (result) {
    if (result) {
      if (result.data.tag === 'value') {
        tokens.push(result.data.value);
      } else {
        throw new Error('No Parser exist: ' + result.data.message);
      }
    }
    unwindIndex = buffer.unwindIndex;
    result = allParsers(buffer, unwindIndex);
  }

  return tokens;
}
