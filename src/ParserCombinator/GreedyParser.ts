/*
This is a greedy parser. This means it assumes that a successful parse
will always advance the nextIndex, unless the parser is wrapped in `attempt()`.

i.e. The only time the parser can backtrack is with `parserA.attempt().or(parserB)`.
If parserA fails, the Parser's state is rewinded back to before parserA consumed.
*/

/* -------------------------------------------------------------------------- */
/*                                   Parser                                   */
/* -------------------------------------------------------------------------- */
class Parser<A> {
    protected constructor(
        public readonly run: (location: Location) => ParserResult<A>
    ) { }

    runString(s: string): ParserResult<A> {
        return this.run(new Location(s, 0))
    }

    /* ---------------------------- Applicative Pure ---------------------------- */

    // pure: A -> F A
    private static succeed<T>(value: T): Parser<T> {
        return new Parser((location) => ParserResult.succeed(value, location))
    }

    private static fail<T>(message: string): Parser<T> {
        return new Parser((location) => ParserResult.fail(
            new ParserFailure({
                errors: [{ message, nextIndex: location.nextIndex }],
                committed: true, location
            })))
    }

    /* ------------------------------- Primitives ------------------------------- */

    static string(s: string): Parser<string> {
        return new Parser((location) => {
            const substring = location.substring()
            if (substring.startsWith(s)) {
                return ParserResult.succeed(s, location.advanceBy(s.length))
            } else {
                const errors = [{ message: `Expected '${s}' but got '${substring}'`, nextIndex: location.nextIndex }]
                return ParserResult.fail(new ParserFailure({ errors, committed: true, location }))
            }
        })
    }

    static digit(): Parser<number> {
        return new Parser((location) => {
            const substring = location.substring()
            const n = parseInt(substring.charAt(0))
            if (!isNaN(n)) {
                return ParserResult.succeed(n, location.advanceBy(1))
            } else {
                const errors = [{ message: `Expected a digit but got ${substring}`, nextIndex: location.nextIndex }]
                return ParserResult.fail(new ParserFailure({ errors, committed: true, location }))
            }
        })
    }

    /* ------------------------------- Combinators ------------------------------ */

    // and: F A -> F B -> F [A, B]    (i.e. Monoidal product)
    and<B>(pb: Parser<B>): Parser<[A, B]> {
        return new Parser((location) =>
            this.run(location)
                .bindSuccess((successA) =>
                    pb
                        .run(successA.location)
                        .mapSuccessValue((b) => [successA.value, b] as [A, B]))
                .mapFailureValue((failure) =>
                    failure.prependingError({
                        message: 'and: Expected both parsers to succeed',
                        nextIndex: location.nextIndex
                    }))
        )
    }

    // or: F A -> F B -> F (Either A B)
    or<B>(pb: Parser<B>): Parser<Either<A, B>> {
        return new Parser((location) =>
            this.run(location)
                .mapSuccessValue(Either.left<A, B>)
                .bindFailureIfUncommitted(() =>
                    pb.run(location)
                        .mapSuccessValue(Either.right<A, B>)
                        .mapFailureValue((failure2) =>
                            failure2.prependingError({
                                message: 'or: Expected either parser to succeed',
                                nextIndex: location.nextIndex
                            })
                        ))
        )
    }

    /* --------------------------------- Attempt -------------------------------- */

    attempt(): Parser<A> {
        return this.mapFailureValue((failure) => failure.uncommit())
    }

    /* ------------------------- Error Message Handling ------------------------- */

    label(message: string): Parser<A> {
        return this.mapFailureValue((failure) => failure.label(message))
    }

    scope(message: string): Parser<A> {
        return this.mapFailureValue((failure) => failure.prependingError({ message, nextIndex: 0 }))
    }

    validate(predicate: (a: A) => boolean, getMessage: (a: A) => string): Parser<A> {
        return this.bindSuccess((a) =>
            predicate(a) ? Parser.succeed(a) : Parser.fail(getMessage(a)))
    }

    /* -------------------------------- Repeaters ------------------------------- */

    optional(): Parser<Maybe<A>> {
        return this
            .mapSuccessValue(Maybe.just)
            .mapFailure((failure) => ParserResult.succeed(Maybe.nothing(), failure.location))
    }

    oneOrMore(): Parser<[A, A[]]> {
        return this.and(this.many())
    }

    many(): Parser<A[]> {  /// Zero or more
        return this
            .map2(() => this.many(), (a, acc) => [a, ...acc])
            .mapFailure((failure) => ParserResult.succeed([], failure.location))

        return this
            .mapSuccess(successA =>
                this.many().run(successA.location)
                    .mapSuccessValue(acc => [successA.value, ...acc]))
            .mapFailure((failure) => ParserResult.succeed([], failure.location))
    }

    nMany(n: number): Parser<A[]> {
        if (n === 0) {
            return Parser.succeed([])
        } else {
            return this
                .and(this.nMany(n - 1))
                .mapSuccessValue(([a, acc]) => [a, ...acc])
        }
    }

    /* ---------------------------- Applicative Apply --------------------------- */

    // apply: F (A -> B) -> F A -> F B
    private apply<B>(pf: Parser<(a: A) => B>): Parser<B> {
        return this.map2(() => pf, (a, a2b) => a2b(a))

        // Make apply from bind & pure
        // apply : Monad f => f (a -> b) -> f a -> f b
        // apply fa2b fa = bind fa2b (\a2b => bind fa (\a => pure (a2b a)))
        return pf
            .bindSuccess((a2b) =>
                this.bindSuccess((a) => Parser.succeed(a2b(a))))
    }

    // map2: F A -> F B -> (A -> B -> C) -> F C
    private map2<B, C>(getParserB: () => Parser<B>, f: (a: A, b: B) => C): Parser<C> {
        return this
            .bindSuccess((a) =>
                getParserB().bindSuccess((b) => Parser.succeed(f(a, b))))

        return this
            .mapSuccess((successA) =>
                getParserB()
                    .run(successA.location)
                    .mapSuccessValue((b) => f(successA.value, b)))
    }

    /* ------------------------------- Monad -------------------------------- */

    // bind: F A -> (A -> F B) -> F B
    private bindSuccess<B>(f: (a: A) => Parser<B>): Parser<B> {
        return this.mapSuccess((success) => f(success.value).run(success.location))
    }

    private bindFailure(f: (failure: ParserFailure) => Parser<A>): Parser<A> {
        return this.mapFailure((failure) => f(failure).run(failure.location))
    }

    /* ------------------------------- Functor -------------------------------- */

    mapSuccessValue<B>(f: (a: A) => B): Parser<B> {
        return this.mapResult((result) => result.mapSuccessValue(f))
    }

    private mapFailureValue(f: (a: ParserFailure) => ParserFailure): Parser<A> {
        return this.mapResult((result) => result.mapFailureValue(f))
    }

    private mapSuccess<B>(f: (a: ParserSuccess<A>) => ParserResult<B>): Parser<B> {
        return this.mapResult((result) => result.bindSuccess(f))
    }

    private mapFailure(f: (a: ParserFailure) => ParserResult<A>): Parser<A> {
        return this.mapResult((result) => result.bindFailure(f))
    }

    // map : (A -> B) -> F A -> F B
    private mapResult<B>(f: (a: ParserResult<A>) => ParserResult<B>): Parser<B> {
        return new Parser((location) => f(this.run(location)))
    }

    /* --------------------------------- Monoid --------------------------------- */

    // Reference of how Parser can be a Monoid, though this isn't useful in this Parser.
    // Type narrowing allows Parser<(string | number)> to be a Semigroup.
    // Semigroup append: A -> A -> A
    orGeneric(pb: Parser<A>): Parser<A> {
        return this.or(pb).mapSuccessValue((either) => either.unwrap())
    }

    // Monoid mempty: () -> A
    static identity<T>(): Parser<T> {
        return Parser.fail<T>("No parser succeeded").attempt()
    }
}

/* -------------------------------------------------------------------------- */
/*                                Parser Input                                */
/* -------------------------------------------------------------------------- */

class Location {
    constructor(
        private readonly targetString: string,
        readonly nextIndex: number
    ) { }

    advanceBy(count: number): Location {
        return new Location(this.targetString, this.nextIndex + count)
    }

    substring(): string {
        return this.targetString.slice(this.nextIndex)
    }
}

/* -------------------------------------------------------------------------- */
/*                                Parser Output                               */
/* -------------------------------------------------------------------------- */

class ParserResult<A> {
    private constructor(private readonly data: (
        | { isSuccessful: true, success: ParserSuccess<A> }
        | { isSuccessful: false, failure: ParserFailure })) { }

    getValue(): A | undefined {
        return this.data.isSuccessful ? this.data.success.value : undefined
    }

    getIsCommitted(): boolean {
        return this.data.isSuccessful ? true : this.data.failure.committed
    }

    /* -------------------------- Applicative/Monoidal -------------------------- */

    static succeed<T>(value: T, location: Location): ParserResult<T> {
        return new ParserResult({ isSuccessful: true, success: { value, location } })
    }

    static fail<T>(failure: ParserFailure): ParserResult<T> {
        return new ParserResult({ isSuccessful: false, failure })
    }

    // Monoidal product: F A -> F B -> F [A, B]
    pair<B>(rb: ParserResult<B>): ParserResult<[A, B]> {
        return this.bindSuccess((success) => rb.mapSuccessValue((b) => [success.value, b]))
    }

    /* --------------------------------- Functor -------------------------------- */

    // map: (A -> B) -> F A -> F B
    mapSuccessValue<B>(f: (a: A) => B): ParserResult<B> {
        return this.bindSuccess((success) => ParserResult.succeed(f(success.value), success.location))
    }

    mapFailureValue(f: (a: ParserFailure) => ParserFailure): ParserResult<A> {
        return this.bindFailure((failure) => ParserResult.fail(f(failure)))
    }

    /* ---------------------------------- Monad --------------------------------- */

    // Unused b/c bindSuccess & bindFailure are more ergonomic. Note bindFailure is named 
    // so to mirror bindSuccess, but it is not an Monad 'bind' because it doesn't return `F B`.
    private bind<B>(options: {
        success: (a: ParserSuccess<A>) => ParserResult<B>,
        failure: (a: ParserFailure) => ParserResult<B>
    }): ParserResult<B> {
        return this.data.isSuccessful ? options.success(this.data.success) : options.failure(this.data.failure)
    }

    // bind: (A -> F B) -> F A -> F B
    bindSuccess<B>(f: (a: ParserSuccess<A>) => ParserResult<B>): ParserResult<B> {
        if (this.data.isSuccessful) {
            return f(this.data.success)
        } else {
            return ParserResult.fail(this.data.failure)
        }
    }

    bindFailure(f: (a: ParserFailure) => ParserResult<A>): ParserResult<A> {
        if (this.data.isSuccessful) {
            return this
        } else {
            return f(this.data.failure)
        }
    }

    bindFailureIfUncommitted(recovery: () => ParserResult<A>): ParserResult<A> {
        if (!this.data.isSuccessful && !this.data.failure.committed) {
            return recovery()
        } else {
            return this
        }
    }
}

type ParserSuccess<A> = { value: A, location: Location }

class ParserFailure {
    private readonly errors: ParserError[]
    public readonly committed: boolean
    public readonly location: Location

    constructor(data: { errors: ParserError[], committed: boolean, location: Location }) {
        this.errors = data.errors
        this.committed = data.committed
        this.location = data.location
    }

    uncommit(): ParserFailure {
        return new ParserFailure({ errors: this.errors, committed: false, location: this.location })
    }

    label(message: string): ParserFailure {
        const nextIndex = this.errors.at(-1)?.nextIndex ?? 0
        return this.mapErrors((prevErrors) => [{ message, nextIndex }])
    }

    prependingError(error: ParserError): ParserFailure {
        return this.mapErrors((prevErrors) => [error, ...prevErrors])
    }

    appendingError(error: ParserError): ParserFailure {
        return this.mapErrors((prevErrors) => [...prevErrors, error])
    }

    appendingErrorsFrom(failure: ParserFailure): ParserFailure {
        return this.mapErrors((prevErrors) => [...prevErrors, ...failure.errors])
    }

    private mapErrors(f: (error: ParserError[]) => ParserError[]): ParserFailure {
        return new ParserFailure({ errors: f(this.errors), committed: this.committed, location: this.location })
    }
}

type ParserError = { message: string, nextIndex: number }

/* -------------------------------------------------------------------------- */
/*                                   Either                                   */
/* -------------------------------------------------------------------------- */

// Bifunctor
class Either<L, R> {
    private constructor(
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

    /* ---------------------------------- Monad --------------------------------- */

    private join<L, R>(this: Either<Either<L, R>, Either<L, R>>): Either<L, R> {
        return this.match({
            left: (l) => l,
            right: (r) => r
        })
    }

    /* --------------------- Unused Useful Bifunctor methods --------------------- */

    // All ADTs have a match method.
    private match<T>(matchers: { left: (l: L) => T, right: (r: R) => T }): T {
        return this.data.tag === 'left' ? matchers.left(this.data.value) : matchers.right(this.data.value)
    }

    // "map" preserves structure. "match" doesn't preserve structure.
    private bimap<P, Q>(f: (l: L) => P, g: (r: R) => Q): Either<P, Q> {
        return this.match({
            left: (l) => Either.left(f(l)),
            right: (r) => Either.right(g(r))
        })
    }

    unwrap(): L | R {
        return this.match<L | R>({ left: (l) => l, right: (r) => r })
    }
}

/* -------------------------------------------------------------------------- */
/*                                    Maybe                                   */
/* -------------------------------------------------------------------------- */

class Maybe<A> {
    private constructor(private data: { tag: 'just', value: A } | { tag: 'nothing' }) { }

    static just<A>(a: A): Maybe<A> {
        return new Maybe({ tag: 'just', value: a })
    }

    static nothing<A>(): Maybe<A> {
        return new Maybe({ tag: 'nothing' })
    }
}

/* -------------------------------------------------------------------------- */
/*                                  Test Utils                                */
/* -------------------------------------------------------------------------- */

type TestOptions<A> = {
    testName: string,
    parser: Parser<A>,
    targetString: string
}

function assertSuccess<A>(
    options: { successValue: A, nextIndex: number } & TestOptions<A>
) {
    const { testName, parser, targetString, successValue, nextIndex } = options
    const parserSuccess = ParserResult.succeed(successValue, new Location(targetString, nextIndex))
    assertParserResultsAreEqual(testName, targetString, parser.runString(targetString), parserSuccess)
}

function assertFailure<A>(
    options: { errors: ParserError[] } & TestOptions<A>
) {
    const { testName, parser, targetString, errors } = options
    const nextIndex = errors.at(-1)?.nextIndex ?? 0
    const parserFailure = new ParserFailure({ errors, committed: true, location: new Location(targetString, nextIndex) })
    assertParserResultsAreEqual(testName, targetString, parser.runString(targetString), ParserResult.fail(parserFailure))
}

function assertParserResultsAreEqual<A>(testname: string, targetString: string, actual: ParserResult<A>, expected: ParserResult<A>) {
    let msg = `Actual: ` + JSON.stringify(actual, null, 2)
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
        console.log('\x1b[32m%s\x1b[0m', `${testname} .runString('${targetString}') PASSED\n`, msg)
    } else {
        msg += '\nExpected: ' + JSON.stringify(expected, null, 2)
        console.log('\x1b[31m%s\x1b[0m', `${testname} .runString('${targetString}') FAILED\n`, msg)
    }
}

/* -------------------------------------------------------------------------- */
/*                                  Run Tests                                 */
/* -------------------------------------------------------------------------b- */

export default function run() {
    const parserAB = Parser.string("ab")

    assertSuccess({
        testName: `Test Parser.str success: string("ab")`,
        parser: parserAB,
        targetString: "abc",
        successValue: "ab",
        nextIndex: 2
    })

    assertFailure({
        testName: `Test Parser.str failure: string("ab")`,
        parser: parserAB,
        targetString: "ad",
        errors: [{ message: "Expected 'ab' but got 'ad'", nextIndex: 0 }],
    })

    const parserABandCD = Parser.string("ab").and(Parser.string("cd"))

    assertSuccess({
        testName: "Test Parser.and success: ('ab' && 'cd')",
        parser: parserABandCD,
        targetString: "abcd",
        successValue: ["ab", "cd"],
        nextIndex: 4
    })

    assertFailure({
        testName: "Test Parser.and failure: ('ab' && 'cd')",
        parser: parserABandCD,
        targetString: "abce",
        errors: [
            { message: "and: Expected both parsers to succeed", nextIndex: 0 },
            { message: "Expected 'cd' but got 'ce'", nextIndex: 2 }],
    })

    assertFailure({
        testName: "Test Parser.and failure: ('ab' && 'cd')",
        parser: parserABandCD,
        targetString: "WW",
        errors: [
            { message: "and: Expected both parsers to succeed", nextIndex: 0 },
            { message: "Expected 'ab' but got 'WW", nextIndex: 0 }]
    })

    const parserABandCD_and_EFandGH = Parser.string("ab").and(Parser.string("cd"))
        .and(Parser.string("ef").and(Parser.string("gh")))

    assertSuccess({
        testName: "Test nested Parser.and: ('ab' && 'cd') && ('ef' && 'gh')",
        parser: parserABandCD_and_EFandGH,
        targetString: "abcdefgh",
        successValue: [["ab", "cd"], ["ef", "gh"]],
        nextIndex: 8
    })

    assertFailure({
        testName: "Test nested Parser.and failure: ('aa' && 'bb') && 'cc'",
        parser: Parser.string("aa").and(Parser.string("bb")).and(Parser.string("cc")),
        targetString: "aabbYY",
        errors: [
            { message: "and: Expected both parsers to succeed", nextIndex: 0 },
            { message: "Expected 'cc' but got 'YY'", nextIndex: 4 }]
    })

    assertFailure({
        testName: "Test nested Parser.and failure: ('aa' && 'bb') && 'cc'",
        parser: Parser.string("aa").and(Parser.string("bb")).and(Parser.string("cc")),
        targetString: "aaYYcc",
        errors: [
            { message: "and: Expected both parsers to succeed", nextIndex: 0 },
            { message: "and: Expected both parsers to succeed", nextIndex: 0 },
            { message: "Expected 'bb' but got 'YYcc'", nextIndex: 2 }]
    })

    assertFailure({
        testName: "Test nested Parser.and failure: 'aa' && ('bb' && 'cc')",
        parser: Parser.string("aa").and(Parser.string("bb").and(Parser.string("cc"))),
        targetString: "aaWWcc",
        errors: [
            { message: "and: Expected both parsers to succeed", nextIndex: 0 },
            { message: "and: Expected both parsers to succeed", nextIndex: 2 },
            { message: "Expected 'bb' but got 'WWcc'", nextIndex: 2 }]
    })

    assertFailure({
        testName: "Test nested Parser.and failure: 'aa' && ('bb' && 'cc')",
        parser: Parser.string("aa").and(Parser.string("bb").and(Parser.string("cc"))),
        targetString: "aabbZZ",
        errors: [
            { message: "and: Expected both parsers to succeed", nextIndex: 0 },
            { message: "and: Expected both parsers to succeed", nextIndex: 2 },
            { message: "Expected 'cc' but got 'ZZ'", nextIndex: 4 }]
    })

    assertFailure({
        testName: "Test nested ors: ab || (gh || ij)",
        parser: Parser.string("ab")
            .or(Parser.string("gh").or(Parser.string("ij"))),
        targetString: "MM",
        errors: [
            { "message": "Expected 'ab' but got 'MM'", "nextIndex": 0 }]
    })

    assertFailure({
        testName: `Test label: AA && (TT || RR)`,
        parser: Parser.string("AA")
            .and(Parser.string("TT").or(Parser.string("RR")))
            .label("label: AND parser failed"),
        targetString: "AAMM",
        errors: [{ message: "label: AND parser failed", nextIndex: 2 }]
    })

    assertFailure({
        testName: `Test scope: AA && (TT || RR)`,
        parser: Parser.string("AA")
            .and(Parser.string("TT").or(Parser.string("RR")))
            .scope("label: AND parser failed"),
        targetString: "AAMM",
        errors: [
            { message: "label: AND parser failed", nextIndex: 0 },
            { message: "and: Expected both parsers to succeed", nextIndex: 0 },
            { message: "Expected 'TT' but got 'MM'", nextIndex: 2 }]
    })

    const parserAAorBB = Parser.string("AA").or(Parser.string("BB"))
    assertSuccess({
        testName: `Test Parser.or success left: AA || BB`,
        parser: parserAAorBB,
        targetString: "AA",
        successValue: Either.left("AA"),
        nextIndex: 2
    })

    // This parser is greedy, so if AA consumed, we don't backtrack to try the BB branch
    assertFailure({
        testName: `Test Parser.or fail right: AA || BB`,
        parser: parserAAorBB,
        targetString: "BB",
        errors: [
            { "message": "Expected 'AA' but got 'BB'", "nextIndex": 0 }]
    })

    assertSuccess({
        testName: `Test Parser.or & attempt: attempt(AA) || BB`,
        parser: Parser.string("AA").attempt().or(Parser.string("BB")),
        targetString: "BB",
        successValue: Either.right("BB"),
        nextIndex: 2
    })

    const parseCat = Parser.string("cat")
    const parseSpace = Parser.string(" ")
    const parseCaterpillar = Parser.string("caterpillar")
    assertSuccess({
        testName: "Test attempt: attempt('cat ') || 'caterpillar' suceeds",
        parser: parseCat.and(parseSpace).attempt().or(parseCaterpillar),
        targetString: "caterpillar",
        successValue: Either.right("caterpillar"),
        nextIndex: 11
    })

    assertFailure({
        testName: "Test without attempt: 'cat ' || 'caterpillar' ",
        parser: parseCat.and(parseSpace).or(parseCaterpillar),
        targetString: "caterpillar",
        errors: [
            { message: "and: Expected both parsers to succeed", nextIndex: 0 },
            { message: "Expected ' ' but got 'erpillar'", nextIndex: 3 }]
    })

    const parserNestedAndsOrs =
        Parser.string("ab")
            .and(Parser.string("cd")
                .or(Parser.string("ef"))).attempt()
            .or(Parser.string("gh").attempt()
                .or(Parser.string("ij")))

    assertSuccess({
        testName: "Test nested and & or 1: (ab && (cd || ef)) || (gh || ij)",
        parser: parserNestedAndsOrs,
        targetString: "ij",
        successValue: Either.right(Either.right("ij")),
        nextIndex: 2
    })

    assertFailure({
        testName: "Test nested and & or 2: (ab && (cd || ef)) || (gh || ij)",
        parser: parserNestedAndsOrs,
        targetString: "abij",
        errors: [
            { message: "or: Expected either parser to succeed", nextIndex: 0 },
            { message: "or: Expected either parser to succeed", nextIndex: 0 },
            { message: "Expected 'ij' but got 'abij'", nextIndex: 0 }]
    })

    const parserOptionalAA_and_BB = Parser.string("AA").optional().and(Parser.string("BB"))

    assertSuccess({
        testName: "Test optional: optional(AA) && BB",
        parser: parserOptionalAA_and_BB,
        targetString: "AABB",
        successValue: [Maybe.just("AA"), "BB"],
        nextIndex: 4
    })

    assertSuccess({
        testName: "Test optional: optional(AA) && BB",
        parser: parserOptionalAA_and_BB,
        targetString: "BB",
        successValue: [Maybe.nothing(), "BB"],
        nextIndex: 2
    })

    assertSuccess({
        testName: "Test optional: AA && optional(BB)",
        parser: Parser.string("AA").and(Parser.string("BB").optional()),
        targetString: "AACC",
        successValue: ["AA", Maybe.nothing()],
        nextIndex: 2
    })

    const parserZeroOrMoreAB = Parser.string("AB").many()

    assertSuccess({
        testName: "Test zero or more: many(AB)",
        parser: parserZeroOrMoreAB,
        targetString: "ABABAB??",
        successValue: ["AB", "AB", "AB"],
        nextIndex: 6
    })

    assertSuccess({
        testName: "Test zero or more: many(AB)",
        parser: parserZeroOrMoreAB,
        targetString: "YY",
        successValue: [],
        nextIndex: 0
    })

    const parserOneOrMoreCD = Parser.string("CD").oneOrMore()

    assertSuccess({
        testName: "Test one or more: oneOrMore(CD)",
        parser: parserOneOrMoreCD,
        targetString: "CDCDCDCD????",
        successValue: ["CD", ["CD", "CD", "CD"]],
        nextIndex: 8
    })

    assertSuccess({
        testName: "Test one or more: oneOrMore(CD)",
        parser: parserOneOrMoreCD,
        targetString: "CD",
        successValue: ["CD", []],
        nextIndex: 2
    })

    assertSuccess({
        testName: "Test nMany: nMany(3, EF)",
        parser: Parser.string("EF").nMany(3),
        targetString: "EFEFEF??",
        successValue: ["EF", "EF", "EF"],
        nextIndex: 6
    })

    assertSuccess({
        testName: "Test nMany: nMany(0, EF)",
        parser: Parser.string("EF").nMany(0),
        targetString: "GGG",
        successValue: [],
        nextIndex: 0
    })

    const isNumber = (s: string) => !isNaN(parseInt(s))

    assertSuccess({
        testName: "Test validate: validate(888, isEven)",
        parser: Parser.string("888").validate(
            isNumber, (s) => `'${s}' is not a number`),
        targetString: "888",
        successValue: "888",
        nextIndex: 3
    })

    assertFailure({
        testName: "Test validate: validate(NotNum, isEven)",
        parser: Parser.string("NotNum").validate(
            isNumber, (s) => `'${s}' is not a number`),
        targetString: "NotNum",
        errors: [{ message: "'NotNum' is not a number", nextIndex: 6 }]
    })

    assertSuccess({
        testName: `Test digit: digit("123")`,
        parser: Parser.digit().many(),
        targetString: "123",
        successValue: [1, 2, 3],
        nextIndex: 3
    })

    const parserAppend =
        Parser.string("E").mapSuccessValue<string | number>(s => s)
            .attempt()
            .orGeneric(
                Parser.digit().mapSuccessValue<string | number>(s => s)
            )

    assertSuccess({
        testName: "Test append: E || digit()",
        parser: parserAppend,
        targetString: "E",
        successValue: "E",
        nextIndex: 1
    })

    assertSuccess({
        testName: "Test append: E || digit()",
        parser: parserAppend,
        targetString: "3",
        successValue: 3,
        nextIndex: 1
    })

    /* ----------------------- Prove Parser<X> is a Monoid ---------------------- */

    // For any X, Parser<X> is a Monoid with orGeneric() and identity(), 
    // if we consider all "fail committed" to be the same, and "fail uncommited" to be the same.
    const x = Parser.string("x")
    const identity = Parser.identity<string>()

    const assertEqualResult = (result1: ParserResult<string>, result2: ParserResult<string>) => {
        const passed = result1.getValue() === result2.getValue() && result1.getIsCommitted() === result2.getIsCommitted()
        const color = passed ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m'
        console.log(color, passed ? "PASSED" : "FAILED",
            `Value: ${result1.getValue()} | Committed: ${result1.getIsCommitted()}`)
    }

    // Prove Monoid identity laws: x + 0 = x, 0 + x = x
    let expected = x.runString("x") // x committed
    assertEqualResult(x.orGeneric(identity).runString("x"), expected) // x committed
    assertEqualResult(identity.orGeneric(x).runString("x"), expected) // x committed

    expected = x.runString("?") // fail on x, committed
    assertEqualResult(x.orGeneric(identity).runString("?"), expected) // fail on x, committed
    assertEqualResult(identity.orGeneric(x).runString("?"), expected) // fail on x, committed

    expected = x.attempt().runString("?") // fail on x, uncommitted
    assertEqualResult(x.attempt().orGeneric(identity).runString("?"), expected) // fail on identity, uncommitted
    assertEqualResult(identity.orGeneric(x.attempt()).runString("?"), expected) // fail on x, uncommitted

    // Prove Monoid associativity laws: (a + b) + c = a + (b + c)
    // Assuming a, b, and c are attepted parsers, it always parses A, B, C
    // in the that order. whichever succeeds first is the result, and fails uncommitted otherwise.
    const a = Parser.string("A").attempt()
    const b = Parser.string("B").attempt()
    const c = Parser.string("C").attempt()
    const leftHalf = a.orGeneric(b).orGeneric(c)
    const rightHalf = a.orGeneric(b.orGeneric(c))
    assertEqualResult(leftHalf.runString("A"), rightHalf.runString("A")) // A committed
    assertEqualResult(leftHalf.runString("B"), rightHalf.runString("B")) // B committed
    assertEqualResult(leftHalf.runString("C"), rightHalf.runString("C")) // C committed
}
