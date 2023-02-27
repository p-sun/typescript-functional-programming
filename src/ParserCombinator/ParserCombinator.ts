/* -------------------------------------------------------------------------- */
/*                                    Token                                   */
/* -------------------------------------------------------------------------- */

type Position = number;

class Token<Kind> {
  constructor(
    public readonly targetString: string,
    public readonly pos: Position, // position in targetString to get the NEXT token value
    public readonly valueText: string, // text of the token
    public readonly value?: Kind // typed value of the token
  ) {}

  next(count: number): Token<Kind> | undefined {
    const endPos = this.pos + count;
    if (endPos > this.targetString.length) {
      return undefined;
    } else {
      const valueText = this.targetString.slice(this.pos, endPos);
      return new Token<Kind>(this.targetString, endPos, valueText, undefined);
    }
  }

  withValue<S>(value: S): Token<S> {
    return new Token<S>(this.targetString, this.pos, this.valueText, value);
  }
}

/* -------------------------------------------------------------------------- */
/*                                 ParseOutput                                */
/* -------------------------------------------------------------------------- */

export type Candidate<Kind, ResultA> = {
  token: Token<Kind>; // Success position after parsing
  result: ResultA; // Nested result after parsing
};

// ONE parser can return ONE OUTPUT with multiple candidates.
// COMBINED w another parser, we get a new output with candidates from the second parser.
export type ParseOutputData<Kind, ResultA> =
  | { successful: true; candidates: Candidate<Kind, ResultA>[] }
  | { successful: false; message: string };

export class ParseOutput<Kind, ResultA> {
  private constructor(public readonly data: ParseOutputData<Kind, ResultA>) {
    Object.freeze(this);
  }

  static MakeValue<Kind, Result>(candidates: Candidate<Kind, Result>[]) {
    return new ParseOutput({
      successful: true,
      candidates,
    });
  }

  static MakeError<Kind, Result>(message: string) {
    return new ParseOutput<Kind, Result>({
      successful: false,
      message,
    });
  }

  get isError() {
    return !this.data.successful;
  }

  get candidates() {
    return this.data.successful ? this.data.candidates : [];
  }

  get errorMsg() {
    return this.data.successful ? undefined : this.data.message;
  }

  toString() {
    return JSON.stringify(this.data, null, 2);
  }

  mapCandidates<B>(
    parseCandidate: (c: Candidate<Kind, ResultA>) => ParseOutput<Kind, B>
  ): ParseOutput<Kind, B> {
    if (!this.data.successful) {
      return ParseOutput.MakeError<Kind, B>(this.data.message);
    }

    const candidatesB: Candidate<Kind, B>[] = [];
    let lastErrorMsg: string | undefined = undefined;

    for (const c of this.candidates) {
      const outputB = parseCandidate(c);
      if (!outputB.data.successful) {
        lastErrorMsg = lastErrorMsg ?? outputB.data.message;
      } else {
        candidatesB.push(...outputB.candidates);
      }
    }

    if (lastErrorMsg !== undefined && candidatesB.length === 0) {
      return ParseOutput.MakeError<Kind, B>(lastErrorMsg);
    } else {
      return ParseOutput.MakeValue<Kind, B>(candidatesB);
    }
  }

  mapResults<ResultB>(fn: (v: ResultA) => ResultB): ParseOutput<Kind, ResultB> {
    if (!this.data.successful) {
      return new ParseOutput(this.data);
    } else {
      return new ParseOutput({
        successful: true,
        candidates: this.data.candidates.map((c) => ({
          token: c.token,
          result: fn(c.result),
        })),
      });
    }
  }

  reduceResults<ResultB>(
    fn: (acc: ResultB, v: ResultA) => ResultB,
    initialAcc: ResultB
  ): ParseOutput<Kind, ResultB> {
    if (!this.data.successful) {
      return new ParseOutput(this.data);
    } else {
      let result = initialAcc;
      return new ParseOutput({
        successful: true,
        candidates: this.data.candidates.map((c) => {
          result = fn(result, c.result);
          return {
            token: c.token,
            result,
          };
        }),
      });
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                              CombinatorParser                              */
/* -------------------------------------------------------------------------- */

export class CombinatorParser<Kind, ResultA> {
  constructor(
    readonly parse: (token: Token<Kind>) => ParseOutput<Kind, ResultA>
  ) {}

  run(targetString: string) {
    return this.parse(new Token<Kind>(targetString, 0, ''));
  }

  mapResults<ResultB>(
    fn: (v: ResultA) => ResultB
  ): CombinatorParser<Kind, ResultB> {
    return new CombinatorParser((token: Token<Kind>) =>
      this.parse(token).mapResults(fn)
    );
  }

  reduceResults<ResultB>(
    fn: (acc: ResultB, v: ResultA) => ResultB,
    initialAcc: ResultB
  ): CombinatorParser<Kind, ResultB> {
    return new CombinatorParser((token: Token<Kind>) =>
      this.parse(token).reduceResults(fn, initialAcc)
    );
  }

  // Apply another parser to each candidate of this parser.
  // Just like 'add' and 'sequence', but potentially nicer API.
  chain<ResultB>(parser: CombinatorParser<Kind, ResultB>) {
    return new CombinatorParser((token: Token<Kind>) =>
      this.parse(token).mapCandidates((c) =>
        parser
          .parse(c.token)
          .mapResults(
            (resultB) =>
              (c.result instanceof Array
                ? [...c.result, resultB]
                : [c.result, resultB]) as ResultA extends Array<any>
                ? [...ResultA, ResultB]
                : [ResultA, ResultB]
          )
      )
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                              Character Parser                              */
/* -------------------------------------------------------------------------- */

export function str<Kind>(
  ...toMatchStrings: string[]
): CombinatorParser<Kind, string> {
  return new CombinatorParser((token: Token<Kind>) => {
    for (const toMatch of toMatchStrings) {
      const nextToken = token.next(toMatch.length);
      if (nextToken && nextToken.valueText === toMatch) {
        return ParseOutput.MakeValue([
          {
            token: nextToken, //.withValue(toMatch),
            result: toMatch,
          },
        ]);
      }
    }

    return ParseOutput.MakeError(
      `Expected any of [${toMatchStrings}] at position ${token.pos}.`
    );
  });
}

/* -------------------------------------------------------------------------- */
/*                        Combine Parsers Sequentially                        */
/* -------------------------------------------------------------------------- */

export function sequence<Kind, A, B>(
  p1: CombinatorParser<Kind, A>,
  p2: CombinatorParser<Kind, B>
): CombinatorParser<Kind, [A, B]>;

export function sequence<Kind, A, B, C>(
  p1: CombinatorParser<Kind, A>,
  p2: CombinatorParser<Kind, B>,
  p3: CombinatorParser<Kind, C>
): CombinatorParser<Kind, [A, B, C]>;

export function sequence<Kind, A, B, C, D>(
  p1: CombinatorParser<Kind, A>,
  p2: CombinatorParser<Kind, B>,
  p3: CombinatorParser<Kind, C>,
  p4: CombinatorParser<Kind, D>
): CombinatorParser<Kind, [A, B, C, D]>;

export function sequence<Kind>(
  ...parsers: CombinatorParser<Kind, unknown>[]
): CombinatorParser<Kind, unknown> {
  if (parsers.length === 0) {
    throw new Error('sequenceOf_Parser: No parsers provided to sequenceOf.');
  }

  return new CombinatorParser<Kind, unknown>((token: Token<Kind>) => {
    let output: ParseOutput<Kind, unknown[]> = parsers[0]
      .parse(token)
      .mapResults((result) => [result]);

    for (const p of parsers.slice(1)) {
      output = output.mapCandidates((aCandidate) =>
        p
          .parse(aCandidate.token)
          .mapResults((bResult) => aCandidate.result.concat(bResult))
      );
    }
    return output;
  });
}

// Does the same as 'sequence` but only takes 2 parsers and typing is done within the method.
// Keeping around just for comparison to `sequence`. All parsers must pass.
export function and<Kind, ResultA, ResultB>(
  aParser: CombinatorParser<Kind, ResultA>,
  bParser: CombinatorParser<Kind, ResultB>
): CombinatorParser<Kind, [ResultA, ResultB]> {
  return new CombinatorParser<Kind, [ResultA, ResultB]>(
    (token: Token<Kind>) => {
      return aParser
        .parse(token)
        .mapCandidates((candidateA) =>
          bParser
            .parse(candidateA.token)
            .mapResults((bResult) => [candidateA.result, bResult])
        );
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                                     Or                                     */
/* -------------------------------------------------------------------------- */

// Resulting candidates are union of all parsers.
export function or<Kind, TResultA, TResultB>(
  a: CombinatorParser<Kind, TResultA>,
  b: CombinatorParser<Kind, TResultB>
): CombinatorParser<Kind, TResultA | TResultB> {
  return new CombinatorParser((token: Token<Kind>) => {
    const outputA = a.parse(token);
    const outputB = b.parse(token);
    if (!outputA.data.successful && !outputB.data.successful) {
      return ParseOutput.MakeError(
        `Both OR parsers failed:[${outputA.data.message}, ${outputB.data.message}]`
      );
    }

    let candidates: Candidate<Kind, TResultA | TResultB>[] = [
      ...outputA.candidates,
      ...outputB.candidates,
    ];
    return ParseOutput.MakeValue(candidates);
  });
}

// Resulting candidates is the first successful parser.
export function orFirst<Kind, TResultA, TResultB>(
  a: CombinatorParser<Kind, TResultA>,
  b: CombinatorParser<Kind, TResultB>
): CombinatorParser<Kind, TResultA | TResultB> {
  return new CombinatorParser((token: Token<Kind>) => {
    const outputA = a.parse(token);
    if (outputA.data.successful) {
      return outputA;
    }

    const outputB = b.parse(token);
    if (outputB.data.successful) {
      return outputB;
    }

    return ParseOutput.MakeError(
      `Both OR parsers failed:[${outputA.data.message}, ${outputB.data.message}]`
    );
  });
}

/* -------------------------------------------------------------------------- */
/*                                   Repeat                                   */
/* -------------------------------------------------------------------------- */

// Like the * operator in regex.
// Resulting candidates apply the parser 0 or more times.
// Always succeeds, with [] candidates if there are no matches.
export function repeat<Kind, ResultA>(
  parser: CombinatorParser<Kind, ResultA>
): CombinatorParser<Kind, ResultA[]> {
  return new CombinatorParser((token: Token<Kind>) => {
    const emptyCandidate = { token, result: [] };
    return ParseOutput.MakeValue([
      emptyCandidate,
      ..._candidatesForRepeatParser(parser, token),
    ]);
  });
}

// Like the + operator in regex.
export function repeatOnceOrMore<Kind, ResultA>(
  parser: CombinatorParser<Kind, ResultA>
): CombinatorParser<Kind, ResultA[]> {
  return new CombinatorParser((token: Token<Kind>) => {
    const candidates = _candidatesForRepeatParser(parser, token);
    if (candidates.length === 0) {
      return ParseOutput.MakeError('No matches for repeatAtLeastOnce parser.');
    } else {
      return ParseOutput.MakeValue(candidates);
    }
  });
}

function _candidatesForRepeatParser<Kind, ResultA>(
  parser: CombinatorParser<Kind, ResultA>,
  token: Token<Kind>
) {
  const newCandidates: Candidate<Kind, ResultA[]>[] = [];
  let output = parser.parse(token).mapResults((result) => [result]);

  while (output.data.successful) {
    newCandidates.push(...output.candidates);

    output = output.mapCandidates((aCandidate) =>
      parser
        .parse(aCandidate.token)
        .mapResults((bResult) => aCandidate.result.concat(bResult))
    );
  }
  return newCandidates;
}

/* -------------------------------------------------------------------------- */
/*                                   Usage                                   */
/* -------------------------------------------------------------------------- */
// For more examples, see ParserCombinator.test.ts.

export default function run() {
  const w = str('w');
  const o = str('o');
  const r = str('r');
  const l = str('l');

  console.log(
    `(w|wo)r*l worrrld w chaining: \n${or(w, and(w, o))
      .chain(o)
      .chain(repeat(r))
      .chain(l)
      .run('worrld')}`
  );

}
