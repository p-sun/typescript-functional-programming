/* -------------------------------------------------------------------------- */
/*                                Parser Input                                */
/* -------------------------------------------------------------------------- */

class Location {
    constructor(
        private readonly targetString: string,
        readonly nextIndex: number = 0
    ) { }

    advance<A>(ps: ParserSuccess<A>): Location {
        return new Location(this.targetString, this.nextIndex + ps.consumedCount)
    }

    nextString(): string {
        return this.targetString.slice(this.nextIndex)
    }
}

/* -------------------------------------------------------------------------- */
/*                                Parser Output                               */
/* -------------------------------------------------------------------------- */

class ParserResult<A> {
    private constructor(private readonly data:
        | { isSuccessful: true, success: ParserSuccess<A> }
        | { isSuccessful: false, failure: ParserFailure }) { }

    // Pure
    static success<A>(value: A, consumedCount: number): ParserResult<A> {
        return new ParserResult({ isSuccessful: true, success: new ParserSuccess(value, consumedCount) })
    }

    static failure<A>(errors: ParserError[]): ParserResult<A> {
        return new ParserResult({ isSuccessful: false, failure: new ParserFailure(errors) })
    }

    // All ADTs have a match method
    match<T>(matchers: { success: (a: ParserSuccess<A>) => T, failure: (errors: ParserError[]) => T }): T {
        if (this.data.isSuccessful) {
            return matchers.success(this.data.success)
        } else {
            return matchers.failure(this.data.failure.errors)
        }
    }

    // Functor
    // map: (A -> B) -> F A -> F B
    mapSuccess<B>(f: (a: ParserSuccess<A>) => ParserSuccess<B>): ParserResult<B> {
        if (this.data.isSuccessful) {
            return ParserResult.success(f(this.data.success).value, f(this.data.success).consumedCount)
        } else {
            return ParserResult.failure(this.data.failure.errors)
        }
    }

    // Monad
    // bind: (A -> F B) -> F A -> F B
    bindSuccess<B>(f: (a: ParserSuccess<A>) => ParserResult<B>): ParserResult<B> {
        if (this.data.isSuccessful) {
            return f(this.data.success)
        } else {
            return ParserResult.failure(this.data.failure.errors)
        }
    }
}

class ParserSuccess<A> {
    constructor(
        public readonly value: A,
        public readonly consumedCount: number
    ) { }

    append<B>(sb: ParserSuccess<B>): ParserSuccess<[A, B]> {
        return new ParserSuccess([this.value, sb.value], this.consumedCount + sb.consumedCount)
    }
}

type ParserError = { message: string, nextIndex: number }

class ParserFailure {
    constructor(
        readonly errors: ParserError[],
    ) { }

    static create(message: string, nextIndex: number): ParserFailure {
        return new ParserFailure([{ message, nextIndex }])
    }

    appendingError(error: ParserError): ParserFailure {
        return new ParserFailure([...this.errors, error])
    }
}

/* -------------------------------------------------------------------------- */
/*                                   Parser                                   */
/* -------------------------------------------------------------------------- */

class Parser<A> {
    private constructor(
        private readonly run: (loc: Location) => ParserResult<A>
    ) { }

    runString(s: string): ParserResult<A> {
        return this.run(new Location(s))
    }

    // Primitives
    static string(s: string): Parser<string> {
        return new Parser((loc) => {
            const substring = loc.nextString()
            if (substring.startsWith(s)) {
                return ParserResult.success(s, s.length)
            } else {
                return ParserResult.failure([{ message: `Expected '${s}' but got '${substring}''`, nextIndex: loc.nextIndex }])
            }
        })
    }

    // Combinators
    // and: Parser<A> -> Parser<B> -> Parser<[A, B]>
    and<B>(pb: Parser<B>): Parser<[A, B]> {
        return new Parser((loc) =>
            this.run(loc).bindSuccess((a) =>
                pb
                    .run(loc.advance(a))
                    .mapSuccess((b) => a.append(b))
            )
        )
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
        success: (success1) =>
            result2.match({
                success: (success2) => JSON.stringify(success1) === JSON.stringify(success2),
                failure: () => false,
            }),
        failure: (failure1) =>
            result2.match({
                success: () => false,
                failure: (failure2) => {
                    return failure1.length === failure2.length &&
                        failure1.every((error, i) => failure2[i]["nextIndex"] === error["nextIndex"])
                },
            }),
    })
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
        ParserResult.failure([{ message: "", nextIndex: 0 }]))

    assertParserResultIsEqual("Test Parser.and success",
        Parser.string("ab").and(Parser.string("cd")).runString("abcd"),
        ParserResult.success(["ab", "cd"], 4))

    assertParserResultIsEqual("Test Parser.and failure",
        Parser.string("ab").and(Parser.string("cd")).runString("abce"),
        ParserResult.failure([{ message: "", nextIndex: 2 }]))
}

export default { runParserTests }