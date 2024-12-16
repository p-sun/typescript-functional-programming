/* -------------------------------------------------------------------------- */
/*                                Parser Input                                */
/* -------------------------------------------------------------------------- */

class Location {
    constructor(
        public readonly targetString: string,
        public readonly nextIndex: number = 0
    ) { }

    advance<A>(ps: ParserSuccess<A>): Location {
        return new Location(this.targetString, this.nextIndex + ps.consumedCount);
    }
}

/* -------------------------------------------------------------------------- */
/*                                Parser Output                               */
/* -------------------------------------------------------------------------- */

class ParserResult<A> {
    private constructor(private readonly data:
        | { isSuccessful: true, success: ParserSuccess<A> }
        | { isSuccessful: false, message: string }) { }

    // Pure
    static success<A>(value: A, consumedCount: number): ParserResult<A> {
        return new ParserResult({ isSuccessful: true, success: new ParserSuccess(value, consumedCount) });
    }

    static failure<A>(message: string): ParserResult<A> {
        return new ParserResult({ isSuccessful: false, message });
    }

    // All ADTs have a match method
    match<T>(matchers: { success: (a: ParserSuccess<A>) => T; failure: (message: string) => T }): T {
        if (this.data.isSuccessful) {
            return matchers.success(this.data.success);
        } else {
            return matchers.failure(this.data.message);
        }
    }
}

class ParserSuccess<A> {
    constructor(
        public readonly value: A,
        public readonly consumedCount: number
    ) { }
}

/* -------------------------------------------------------------------------- */
/*                                   Parser                                   */
/* -------------------------------------------------------------------------- */

class Parser<A> {
    private constructor(
        private readonly run: (loc: Location) => ParserResult<A>
    ) { }

    runString(s: string): ParserResult<A> {
        return this.run(new Location(s));
    }

    // Primitives
    static string(s: string): Parser<string> {
        return new Parser((loc) => {
            if (loc.targetString.startsWith(s, loc.nextIndex)) {
                return ParserResult.success(s, s.length);
            } else {
                return ParserResult.failure(`Expected '${s}' at ${loc.nextIndex}`);
            }
        })
    }

    // Combinators
    and<B>(pb: Parser<B>): Parser<[A, B]> {
        return new Parser((loc) => {
            return this.run(loc).match({
                success: (sa) => pb.run(loc.advance(sa)).match({
                    success: (sb) => ParserResult.success<[A, B]>([sa.value, sb.value], sa.consumedCount + sb.consumedCount),
                    failure: (message) => ParserResult.failure(message)
                }),
                failure: (message) => ParserResult.failure(message)
            })
        })
    }
}

/* -------------------------------------------------------------------------- */
/*                                  Test Utils                                */
/* -------------------------------------------------------------------------- */

// Two ParserResults are equal if their success values are equal, 
// or if they're both failures.
function isEqualForTests<A>(
    result1: ParserResult<A>,
    result2: ParserResult<A>,
): boolean {
    return result1.match({
        success: (value1) =>
            result2.match({
                success: (value2) => JSON.stringify(value1) === JSON.stringify(value2),
                failure: () => false,
            }),
        failure: () =>
            result2.match({
                success: () => false,
                failure: () => true,
            }),
    });
}

function assertParserResultIsEqual<A>(testname: string, actual: ParserResult<A>, expected: ParserResult<A>) {
    let msg = `Actual: ` + JSON.stringify(actual, null, 2)
    if (isEqualForTests(actual, expected)) {
        console.log('\x1b[32m%s\x1b[0m', `[${testname}] PASSED\n`, msg)
    } else {
        msg += '\nExpected: ' + JSON.stringify(expected, null, 2)
        console.log('\x1b[31m%s\x1b[0m', `[${testname}] FAILED\n`, msg)
    }
}

/* -------------------------------------------------------------------------- */
/*                                  Run Tests                                 */
/* -------------------------------------------------------------------------b- */

export function runParserTests() {
    assertParserResultIsEqual("Test Parser.string success",
        Parser.string("ab").runString("abc"),
        ParserResult.success("ab", 2))

    assertParserResultIsEqual("Test Parser.string fail",
        Parser.string("ab").runString("ad"),
        ParserResult.failure(""))

    assertParserResultIsEqual("Test Parser.and success",
        Parser.string("ab").and(Parser.string("cd")).runString("abcd"),
        ParserResult.success(["ab", "cd"], 4))

    assertParserResultIsEqual("Test Parser.and failure",
        Parser.string("ab").and(Parser.string("cd")).runString("abce"),
        ParserResult.failure(""))
}

export default { runParserTests }