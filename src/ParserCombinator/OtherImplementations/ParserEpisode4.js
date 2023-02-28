/* -------------------------------------------------------------------------- */
/*                                   Logging                                  */
/* -------------------------------------------------------------------------- */

const logPrefix = (parserState, parserName) =>
  `-${Array(parserState.index).fill('-').join('')} ${
    parserState.index
  } ${parserName} `;

const logMiddle = (parserName, parserState, nextState) => {
  console.log(
    `${logPrefix(parserState, parserName)} middle | nextInd: ${
      nextState.index
    } result: ${nextState.result}`
  );
};

const logStart = (parserName, parserState) => {
  console.log(`${logPrefix(parserState, parserName)} start`);
};

const logReturn = (parserName, parserState, nextState) => {
  console.log(
    `${logPrefix(parserState, parserName)} RETURN | nextInd: ${
      nextState.index
    } result: ${nextState.result}`
  );
};

/* -------------------------------------------------------------------------- */
/*                              Parser Combinator                             */
/* -------------------------------------------------------------------------- */

const updateParserState = (state, index, result) => ({
  ...state,
  index,
  result,
});

const updateParserResult = (state, result) => ({
  ...state,
  result,
});

const updateParserError = (state, errorMsg) => ({
  ...state,
  isError: true,
  error: errorMsg,
});

class Parser {
  constructor(parserStateTransformerFn) {
    this.parserStateTransformerFn = parserStateTransformerFn;
  }

  run(targetString) {
    const initialState = {
      targetString,
      index: 0,
      result: null,
      isError: false,
      error: null,
    };

    return this.parserStateTransformerFn(initialState);
  }

  map(fn) {
    return new Parser((parserState) => {
      const nextState = this.parserStateTransformerFn(parserState);

      if (nextState.isError) return nextState;

      return updateParserResult(nextState, fn(nextState.result));
    });
  }

  chain(fn) {
    return new Parser((parserState) => {
      const nextState = this.parserStateTransformerFn(parserState);

      if (nextState.isError) return nextState;

      const nextParser = fn(nextState.result);

      return nextParser.parserStateTransformerFn(nextState);
    });
  }

  errorMap(fn) {
    return new Parser((parserState) => {
      const nextState = this.parserStateTransformerFn(parserState);

      if (!nextState.isError) return nextState;

      return updateParserError(nextState, fn(nextState.error, nextState.index));
    });
  }
}

const str = (s) =>
  new Parser((parserState) => {
    const { targetString, index, isError } = parserState;

    if (isError) {
      return parserState;
    }

    const slicedTarget = targetString.slice(index);

    if (slicedTarget.length === 0) {
      return updateParserError(
        parserState,
        `str: Tried to match "${s}", but got Unexpected end of input.`
      );
    }

    if (slicedTarget.startsWith(s)) {
      return updateParserState(parserState, index + s.length, s);
    }

    return updateParserError(
      parserState,
      `str: Tried to match "${s}", but got "${targetString.slice(
        index,
        index + 10
      )}"`
    );
  });

const lettersRegex = /^[A-Za-z]+/;
const letters = new Parser((parserState) => {
  const { targetString, index, isError } = parserState;

  if (isError) {
    return parserState;
  }

  const slicedTarget = targetString.slice(index);

  if (slicedTarget.length === 0) {
    return updateParserError(
      parserState,
      `letters: Got Unexpected end of input.`
    );
  }

  const regexMatch = slicedTarget.match(lettersRegex);

  if (regexMatch) {
    return updateParserState(
      parserState,
      index + regexMatch[0].length,
      regexMatch[0]
    );
  }

  return updateParserError(
    parserState,
    `letters: Couldn't match letters at index ${index}`
  );
});

const digitsRegex = /^[0-9]+/;
const digits = new Parser((parserState) => {
  const { targetString, index, isError } = parserState;

  if (isError) {
    return parserState;
  }

  const slicedTarget = targetString.slice(index);

  if (slicedTarget.length === 0) {
    return updateParserError(
      parserState,
      `digits: Got Unexpected end of input.`
    );
  }

  const regexMatch = slicedTarget.match(digitsRegex);

  if (regexMatch) {
    return updateParserState(
      parserState,
      index + regexMatch[0].length,
      regexMatch[0]
    );
  }

  return updateParserError(
    parserState,
    `digits: Couldn't match digits at index ${index}`
  );
});

const sequenceOf = (parsers) =>
  new Parser((parserState) => {
    if (parserState.isError) {
      return parserState;
    }
    logStart('sequenceOf', parserState);
    const results = [];
    let nextState = parserState;

    for (let p of parsers) {
      logMiddle('sequenceOf', parserState, nextState);
      nextState = p.parserStateTransformerFn(nextState);
      results.push(nextState.result);
    }

    logReturn(
      'sequenceOf',
      parserState,
      updateParserResult(nextState, results)
    );
    return updateParserResult(nextState, results);
  });

const choice = (parsers) =>
  new Parser((parserState) => {
    if (parserState.isError) {
      return parserState;
    }
    logStart('choice', parserState);
    for (let p of parsers) {
      const nextState = p.parserStateTransformerFn(parserState);
      if (!nextState.isError) {
        logReturn('choice', parserState, nextState);
        return nextState;
      }
    }

    return updateParserError(
      parserState,
      `choice: Unable to match with any parser at index ${parserState.index}`
    );
  });

const many = (parser) =>
  new Parser((parserState) => {
    if (parserState.isError) {
      return parserState;
    }

    let nextState = parserState;
    const results = [];
    let done = false;

    while (!done) {
      let testState = parser.parserStateTransformerFn(nextState);

      if (!testState.isError) {
        results.push(testState.result);
        nextState = testState;
      } else {
        done = true;
      }
    }

    return updateParserResult(nextState, results);
  });

const many1 = (parser) =>
  new Parser((parserState) => {
    if (parserState.isError) {
      return parserState;
    }

    let nextState = parserState;
    const results = [];
    let done = false;

    while (!done) {
      const nextState = parser.parserStateTransformerFn(nextState);
      if (!nextState.isError) {
        results.push(nextState.result);
      } else {
        done = true;
      }
    }

    if (results.length === 0) {
      return updateParserError(
        parserState,
        `many1: Unable to match any input using parser @ index ${parserState.index}`
      );
    }

    return updateParserResult(nextState, results);
  });

const sepBy = (separatorParser) => (valueParser) =>
  new Parser((parserState) => {
    logStart('sepBy', parserState);

    const results = [];
    let nextState = parserState;

    while (true) {
      logMiddle('sepBy', parserState, nextState);
      const thingWeWantState = valueParser.parserStateTransformerFn(nextState);
      if (thingWeWantState.isError) {
        break;
      }
      results.push(thingWeWantState.result);
      nextState = thingWeWantState;

      logMiddle('sepBy', parserState, nextState);
      const separatorState =
        separatorParser.parserStateTransformerFn(nextState);
      if (separatorState.isError) {
        break;
      }
      nextState = separatorState;
    }

    logReturn('sepBy', parserState, updateParserResult(nextState, results));
    return updateParserResult(nextState, results);
  });

const sepBy1 = (separatorParser) => (valueParser) =>
  new Parser((parserState) => {
    const results = [];
    let nextState = parserState;

    while (true) {
      const thingWeWantState = valueParser.parserStateTransformerFn(nextState);
      if (thingWeWantState.isError) {
        break;
      }
      results.push(thingWeWantState.result);
      nextState = thingWeWantState;

      const separatorState =
        separatorParser.parserStateTransformerFn(nextState);
      if (separatorState.isError) {
        break;
      }
      nextState = separatorState;
    }

    if (results.length === 0) {
      return updateParserError(
        parserState,
        `sepBy1: Unable to capture any results at index ${parserState.index}`
      );
    }

    return updateParserResult(nextState, results);
  });

const between = (leftParser, rightParser) => (contentParser) =>
  sequenceOf([leftParser, contentParser, rightParser]).map((results) => {
    console.log(`*** Between results`, results);
    return results[1];
  });

const lazy = (parserThunk) =>
  new Parser((parserState) => {
    const parser = parserThunk();
    return parser.parserStateTransformerFn(parserState);
  });

/* -------------------------------------------------------------------------- */
/*                                Chain Parsing                               */
/* -------------------------------------------------------------------------- */

const stringParser = letters.map((result) => ({
  type: 'string',
  value: result,
}));

const numberParser = digits.map((result) => ({
  type: 'number',
  value: Number(result),
}));

const dicerollParser = sequenceOf([digits, str('d'), digits]).map(
  ([n, _, s]) => ({
    type: 'diceroll',
    value: [Number(n), Number(s)],
  })
);

const chainParser = sequenceOf([letters, str(':')])
  .map((results) => results[0])
  .chain((type) => {
    if (type === 'string') {
      return stringParser;
    } else if (type === 'number') {
      return numberParser;
    }
    return dicerollParser;
  });

/* -------------------------------------------------------------------------- */
/*                        Interesting Recursive Parsing                       */
/* -------------------------------------------------------------------------- */
/*
0  1  2  3  4  5  6  7  8  9  10 11 12 13 14      // Index
[  1  ,  [  2  ,  [  3  ]  ,  4  ]  ,  5  ]       // Target String

^ 0 between 
-> 0 sequenceOf, found '['
   ^ 1 sepBy -> choice -> digits, found '1'
      ^ 2 -> 1 sepBy found ',' 

[  1  ,  [  2  ,  [  3  ]  ,  4  ]  ,  5  ]
         ^  3 choice -> arrayParser -> between
         -> 3 sequenceOf, found '['
            ^ 4 sepBy -> choice -> digits, found '2'
                ^ 5 -> found ','

[  1  ,  [  2  ,  [  3  ]  ,  4  ]  ,  5  ]
                  ^  6 choice -> arrayParser -> between
                  -> 6 sequenceOf, found '['
                     ^ 7 -> sepBy -> choice -> digits -> found '3'
                        ^ 8 -> found ']'
                  <-    RETURN ['[', 3,']'] to 6 between          
            <-    RETURN [3] to 4 sepBy         
            
[  1  ,  [  2  ,  [  3  ]  ,  4  ]  ,  5  ]
            -> 4 sepBy  ^ 8 found [,3,]
            -> 4 sepBy     ^ 9 found ','
            -> 4 sepBy        ^ 10 -> choice -> digits, found '4'
            -> 4 sepBy           ^ 11 -> found ']'
   <-                            RETURN [2,[3],4] to 1 sepBy

[  1  ,  [  2  ,  [  3  ]  ,  4  ]  ,  5  ]
   -> 1 sepBy                    ^ 11 found [,2,[,3,],4,]
   -> 1 sepBy                       ^ 12 found ','
   -> 1 sepBy                          ^ 13 -> choice -> digits, found '5'
   -> 1 sepBy                             ^ 14 -> found ']'
<-                                        RETURN [1,[2,[3],4],5] to final return
*/
function recursiveParsingExample() {
  const value = lazy(() => choice([digits, arrayParser]));

  // (contentParser) =>
  //    sequenceOf([str('['), contentParser, str(']')]).map((results) => results[1]);
  const betweenSquareBrackets = between(str('['), str(']'));

  // (valueParser) =>
  //    while true: valueParser -> str(',') -> valueParser -> str(',') -> ... repeat until error
  //    return resulting array from all valueParsers
  const commaSeparated = sepBy(str(','));
  const arrayParser = betweenSquareBrackets(commaSeparated(value));
  console.log('*** FINAL RESULTS: ', arrayParser.run('[1,[2,[3],4],5]'));
}

export default function run() {
  // 123
  console.log(betweenSquareBrackets(digits).run('[123]'));
  console.log(betweenSquareBrackets(digits).run('[1[23]6]'));

  // [ 'a', 'a', 'a' ]
  console.log(commaSeparated(str('a')).run('a,a,a'));

  // 'a'
  console.log(str('a').run('a'));

  // 1234
  console.log(choice([digits, arrayParser]).run('1234'));

  // [ '123', '456' ]
  console.log(choice([digits, arrayParser]).run('[123,456]'));

  // Not exactly `lazy`, but allows for `value` to refer
  // to `arrayParser` before it's defined.
  const lazyA = lazy(() => str('a'));
  console.log(lazyA.run('a'));

  console.log(chainParser.run('diceroll:2d8'));

  const w = str('w');
  const o = str('o');
  const r = str('r');
  const parser = sequenceOf([choice([sequenceOf([w, o]), w]), many(r)]);
  console.log(parser.run('worl'));

  recursiveParsingExample();
}
