/*

Homework:

1. Show that stateMap adheres to the functor laws.
2. Show that stateApply adheres to the applicative laws (or some of them).

3.

bind: (A -> F B) -> F A -> F B

What happens if you map with an (A -> F B)? Then you get an F (F B)

We will show (later) that join: F (F B) -> F B is equivalent to bind.

IMPLEMENT join on (State S) and do at least 1 of (implement bind using join or vice versa)

4. Reimplement State from scratch using a class. So you have something like:

class State<S, A> {
  map<B>(f: (a: A) => B): State<S, B> {}
}

5. Observe in #4 how some of the code is easier to read! Also note it still isn't really "clean".

6. Write down the type signatures for map, apply, bind for *Promise<T>* and think about what they "do".

*/

/*
Functor        (A -> B) -> F A -> F B
Applicative  F (A -> B) -> F A -> F B
Monad        (A -> F B) -> F A -> F B
*/

//   S - background type, the data type inside the monad.
//   A - forground type, the unwrapped type you work with outside the monad.
type State<S, A> = (s: S) => [S, A];

// runState: State<S, A> -> S -> A
function runState<S, A>(initialS: S, fa: State<S, A>): A {
    return fa(initialS)[1];
}

// map: (A -> B) -> State S A -> State S B
function stateMap<S, A, B>(f: (a: A) => B, fa: State<S, A>): State<S, B> {
    return (s1: S) => {
        const [s2, a] = fa(s1)
        return [s2, f(a)]
    }
}

// pure: A -> F A
function statePure<S, A>(a: A): State<S, A> {
    return (s: S) => [s, a]
}

// apply: F (A -> B) -> F A -> F B
function stateApply<S, A, B>(ff: State<S, (a: A) => B>, fa: State<S, A>): State<S, B> {
    return stateBind((f) => stateMap(f, fa), ff)

    const fToFB = (f: (a: A) => B) => stateMap(f, fa) // same as above
    return stateBind(fToFB, ff)

    return (s1: S) => {
        const [s2, f] = ff(s1)
        const fb: State<S, B> = stateMap(f, fa)
        return fb(s2)
    }

    return (s1: S) => { // same as above
        const [s2, f] = ff(s1)
        const [s3, a] = fa(s2)
        return [s3, f(a)]
    }
}

// `A -> F B` is called "Kleisli arrow"
// bind: (A -> F B) -> F A -> F B
function stateBind<S, A, B>(
    aToFB: (a: A) => State<S, B>,
    fa: State<S, A>
  ): State<S, B> {
    return stateJoin(stateMap(aToFB, fa))
        // stateMap(aToFB, fa): F (F B)

    return (s1: S) => {
        const [s2, a] = fa(s1);
        return aToFB(a)(s2);
    }
}
 
// join: F (F A) -> F A
function stateJoin<S, A>(ffa: State<S, State<S, A>>): State<S, A> {
    return (s1: S) => {
        const [s2, fa] = ffa(s1);
        return fa(s2);
    }
}

// prod : F A -> F B -> F [A, B]
function stateCombine<S, A, B>(
    fa: State<S, A>,
    fb: State<S, B>
): State<S, [A, B]> {
    return stateBind((a) => stateMap((b) => [a, b], fb), fa)

    const aToFpair : (a: A) => State<S, [A,B]> = 
        (a: A) => stateMap((b: B) => [a, b], fb)
    return stateBind(aToFpair, fa)
}

// -----------------
//  1. Show that stateMap adheres to the functor laws.
function stateMap_<S, A, B>(f: (a: A) => B, fa: State<S, A>): State<S, B> {
    return (s1: S) => {
        const [s2, a] = fa(s1)
        return [s2, f(a)] 
    }
}
/*
Functor law 1: map id = id

fa = (s1) => [s2, a]

stateMap(id, fa)
= (s1) => [s2, id(a)]
= (s1) => [s2, a]
= fa        (Proved!)
*/

export default {}