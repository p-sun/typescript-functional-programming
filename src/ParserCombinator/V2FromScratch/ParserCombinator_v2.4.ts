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
                return ParserResult.success(new ParserSuccess(s, s.length))
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

    or<B>(pb: Parser<B>): Parser<Either<A, B>> {
        return new Parser((loc) => {
            return this.run(loc).mapSuccess((success1) => {
                return new ParserSuccess(Either.left<A, B>(success1.value), success1.consumedCount)
            }).bindError((failure1) => {
                return pb.run(loc).mapSuccess<Either<A, B>>((success2) => {
                    return new ParserSuccess(Either.right<A, B>(success2.value), success2.consumedCount)
                }).mapFailure((failure2) => {
                    const error = { message: 'Expected either parser to succeed', nextIndex: loc.nextIndex }
                    return new ParserFailure([error, ...failure1.errors, ...failure2.errors])
                })
            })
        })
    }
}

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
    static success<A>(ps: ParserSuccess<A>): ParserResult<A> {
        return new ParserResult({ isSuccessful: true, success: ps })
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
            return ParserResult.success(f(this.data.success))
        } else {
            return ParserResult.failure(this.data.failure.errors)
        }
    }

    // more like append error?
    mapFailure(f: (a: ParserFailure) => ParserFailure): ParserResult<A> {
        if (this.data.isSuccessful) {
            return this
        } else {
            return ParserResult.failure(f(this.data.failure).errors)
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

    bindError(f: (a: ParserFailure) => ParserResult<A>): ParserResult<A> {
        if (this.data.isSuccessful) {
            return this
        } else {
            return f(this.data.failure)
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

type ParserError = { message: string, nextIndex: number }

/* -------------------------------------------------------------------------- */
/*                                   Either                                   */
/* -------------------------------------------------------------------------- */

class Either<L, R> {
    constructor(
        private readonly data:
          | { tag: 'left'; value: L }
          | { tag: 'right'; value: R }
      ) {}
    
    static left<L, R>(l: L): Either<L, R> {
        return new Either<L, R>({ tag: 'left', value: l });
    }

    static right<L, R>(r: R): Either<L, R> {
        return new Either<L, R>({ tag: 'right', value: r });
    }
}

/* -------------------------------------------------------------------------- */
/*                                  Test Utils                                */
/* -------------------------------------------------------------------------- */

function assertSuccess<A>(
    testName: string, result: ParserResult<A>, success: ParserSuccess<A>,
) {
    assertParserResultsAreEqual(testName, result, ParserResult.success(success))
}

function assertFailure<A>(
    testName: string, result: ParserResult<A>, errors: ParserError[],
) {
    assertParserResultsAreEqual(testName, result, ParserResult.failure(errors))
}

function assertParserResultsAreEqual<A>(testname: string, actual: ParserResult<A>, expected: ParserResult<A>) {
    let msg = `Actual: ` + JSON.stringify(actual, null, 2)
    if (isEqualForTests(actual, expected)) {
        console.log('\x1b[32m%s\x1b[0m', `[${testname}] PASSED\n`, msg)
    } else {
        msg += '\nExpected: ' + JSON.stringify(expected, null, 2)
        console.log('\x1b[31m%s\x1b[0m', `[${testname}] FAILED\n`, msg)
    }
}

/// Validate if two ParserResults are equal, ignoring the error messages.
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

/* -------------------------------------------------------------------------- */
/*                                  Run Tests                                 */
/* -------------------------------------------------------------------------b- */

export default function run() {
    const parserAB = Parser.string("ab")

    assertSuccess("Test Parser.string success",
        parserAB.runString("abc"),
        new ParserSuccess("ab", 2))

    assertFailure("Test Parser.string fail",
        parserAB.runString("ad"),
        [{ message: "", nextIndex: 0 }])

    const parserABandCD = Parser.string("ab").and(Parser.string("cd"))

    assertSuccess("Test Parser.and success",
        parserABandCD.runString("abcd"),
        new ParserSuccess(["ab", "cd"], 4))

    assertFailure("Test Parser.and failure",
        parserABandCD.runString("abce"),
        [{ message: "", nextIndex: 2 }])

    const parserHiOrHello = Parser.string("hi").or(Parser.string("hello"))
    assertSuccess("Test Parser.or success right",
        parserHiOrHello.runString("hello world"),
        new ParserSuccess(Either.right("hello"), 5))

    assertSuccess("Test Parser.or success left",
        parserHiOrHello.runString("hi world"),
        new ParserSuccess(Either.left("hi"), 2))

    assertFailure("Test Parser.or failure",
        parserHiOrHello.runString("morning world"),
        [{ message: "", nextIndex: 0 }, { message: "", nextIndex: 0 }, { message: "", nextIndex: 0 }])
}
