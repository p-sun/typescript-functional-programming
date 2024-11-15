class State<S, A> {
    constructor(private readonly run: (s: S) => [S, A]) {}

    // pure: A -> F A
    static pure<S, A>(a: A): State<S, A> {
        return new State((s: S) => [s, a])
    }

    // map: (A -> B) -> State S A -> State S B
    map<B>(f: (a: A) => B): State<S, B> {
        return new State((s1: S) => {
            const [s2, a] = this.run(s1)
            return [s2, f(a)]
        })
    }

    // apply: F (A -> B) -> F A -> F B
    apply<B>(ff: State<S, (a: A) => B>): State<S, B> {
        return this.bind((a: A) => ff.map((f) => f(a)))
    }

    // bind: (A -> F B) -> F A -> F B
    bind<B>(aToFB: (a: A) => State<S, B>): State<S, B> {
        return this.map(aToFB).join()
    }

    // join: F (F A) -> F A
    join<B>(this: State<S, State<S, B>>): State<S, B> {
        return new State((s1: S) => {
            const [s, s2] = this.run(s1)
            return s2.run(s)
        })
    }

    // prod : F A -> F B -> F [A, B]
    combine<B>(fb: State<S, B>): State<S, [A, B]> {
        return this.bind((a: A) => fb.map((b) => [a, b]))
    }
}
