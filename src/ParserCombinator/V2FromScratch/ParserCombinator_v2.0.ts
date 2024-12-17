/* -------------------------------------------------------------------------- */
/*                                ParserResult                                */
/* -------------------------------------------------------------------------- */

class ParserResult<A> {
    private constructor(private readonly data:
        | { tag: 'success', value: A }
        | { tag: 'failure', message: string }) { }

    // Pure
    static success<A>(value: A): ParserResult<A> {
        return new ParserResult({ tag: 'success', value });
    }

    static failure<A>(message: string): ParserResult<A> {
        return new ParserResult({ tag: 'failure', message });
    }

    // All ADTs have a match method
    match<T>(matchers: { success: (a: A) => T; failure: (message: string) => T }): T {
        if (this.data.tag === 'success') {
            return matchers.success(this.data.value);
        } else {
            return matchers.failure(this.data.message);
        }
    }
}

/* -------------------------------------------------------------------------- */
/*                                   Parser                                   */
/* -------------------------------------------------------------------------- */

class Parser<A> {
    private constructor(
        private readonly run: (s: string) => ParserResult<A>
    ) { }

    runString(s: string): ParserResult<A> {
        return this.run(s);
    }

    // Primitives
    static string(str: string): Parser<string> {
        return new Parser((loc) => {
            if (loc.startsWith(str)) {
                return ParserResult.success(str);
            } else {
                return ParserResult.failure(`Expected '${str}' at '${loc}'`);
            }
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
    let passed = isEqualForTests(actual, expected)
    if (!passed) {
        msg += '\nExpected: ' + JSON.stringify(expected, null, 2)
    }
    const color = passed ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m'
    const passedStr = passed ? "PASSED" : "FAILED"
    console.log(color, `[${testname}] ${passedStr}\n`, msg)
}

/* -------------------------------------------------------------------------- */
/*                                  Run Tests                                 */
/* -------------------------------------------------------------------------- */

export default function run() {
    assertParserResultIsEqual("Test Parser.string success",
        Parser.string("ab").runString("ab"),
        ParserResult.success("ab"))

    assertParserResultIsEqual("Test Parser.string fail",
        Parser.string("ab").runString("ad"),
        ParserResult.failure(""))
}
