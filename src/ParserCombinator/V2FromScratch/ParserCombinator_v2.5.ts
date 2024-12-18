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
                return ParserResult.failure(ParserFailure.create(`Expected '${s}' but got '${substring}''`, loc.nextIndex))
            }
        })
    }

    // Combinators
    // and: Parser<A> -> Parser<B> -> Parser<[A, B]>    (Also Mononoid append)
    and<B>(pb: Parser<B>): Parser<[A, B]> {
        return new Parser((loc) =>
            this.run(loc).bindSuccess((a) =>
                pb
                    .run(loc.advanceBy(a))
                    .mapSuccess((b) => a.append(b))
            )
        )
    }

    // or: Parser<A> -> Parser<B> -> Parser<Either<A, B>>
    or<B>(pb: Parser<B>): Parser<Either<A, B>> {
        return new Parser((loc) => {
            return this.run(loc)
                .mapValue(Either.left<A, B>)
                .bindFailure((failure1) => {
                    return pb.run(loc)
                        .mapValue(Either.right<A, B>)
                        .mapFailure((failure2) => {
                            return failure1
                                .prependingError({ message: 'Expected either parser to succeed', nextIndex: loc.nextIndex })
                                .appendingErrorsFrom(failure2)
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

    advanceBy<A>(ps: ParserSuccess<A>): Location {
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
    static success<T>(success: ParserSuccess<T>): ParserResult<T> {
        return new ParserResult({ isSuccessful: true, success })
    }

    static failure<T>(failure: ParserFailure): ParserResult<T> {
        return new ParserResult({ isSuccessful: false, failure })
    }

    // All ADTs have a match method
    match<B>(matchers: { success: (a: ParserSuccess<A>) => B, failure: (failure: ParserFailure) => B }): B {
        if (this.data.isSuccessful) {
            return matchers.success(this.data.success)
        } else {
            return matchers.failure(this.data.failure)
        }
    }

    // Functor
    // map: (A -> B) -> F A -> F B
    mapValue<B>(f: (a: A) => B): ParserResult<B> {
        return this.mapSuccess((success) => new ParserSuccess(f(success.value), success.consumedCount))
    }

    mapSuccess<B>(f: (a: ParserSuccess<A>) => ParserSuccess<B>): ParserResult<B> {
        if (this.data.isSuccessful) {
            return ParserResult.success(f(this.data.success))
        } else {
            return ParserResult.failure(this.data.failure)
        }
    }

    mapFailure(f: (a: ParserFailure) => ParserFailure): ParserResult<A> {
        if (this.data.isSuccessful) {
            return this
        } else {
            return ParserResult.failure(f(this.data.failure))
        }
    }

    // Monad
    // bind: (A -> F B) -> F A -> F B
    bindSuccess<B>(f: (a: ParserSuccess<A>) => ParserResult<B>): ParserResult<B> {
        if (this.data.isSuccessful) {
            return f(this.data.success)
        } else {
            return ParserResult.failure(this.data.failure)
        }
    }

    bindFailure(f: (a: ParserFailure) => ParserResult<A>): ParserResult<A> {
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

    // Monoid append : F A -> F B -> F [A, B]
    append<B>(sb: ParserSuccess<B>): ParserSuccess<[A, B]> {
        return new ParserSuccess([this.value, sb.value], this.consumedCount + sb.consumedCount)
    }
}

class ParserFailure {
    constructor(
        private readonly errors: ParserError[],
    ) { }

    static create(message: string, nextIndex: number): ParserFailure {
        return new ParserFailure([{ message, nextIndex }])
    }

    prependingError(error: ParserError): ParserFailure {
        return new ParserFailure([error, ...this.errors])
    }

    appendingError(error: ParserError): ParserFailure {
        return new ParserFailure([...this.errors, error])
    }

    preprendingErrorFrom(failure: ParserFailure): ParserFailure {
        return new ParserFailure([...failure.errors, ...this.errors])
    }

    appendingErrorsFrom(failure: ParserFailure): ParserFailure {
        return new ParserFailure([...this.errors, ...failure.errors])
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
    ) { }

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
    assertParserResultsAreEqual(testName, result, ParserResult.failure(new ParserFailure(errors)))
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
                    const errors1 = failure1["errors"]
                    const errors2 = failure2["errors"]
                    return errors1.length === errors2.length &&
                        errors1.every((error, i) => errors2[i]["nextIndex"] === error["nextIndex"])
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

    assertSuccess("Test nested Parser.ands. ('ab' & 'cd') & ('ef' & 'gh')",
        Parser.string("ab").and(Parser.string("cd"))
            .and(Parser.string("ef").and(Parser.string("gh")))
            .runString("abcdefgh"),
        new ParserSuccess([["ab", "cd"], ["ef", "gh"]], 8))
}
