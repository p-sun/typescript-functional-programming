type Test<T, U> = T extends U ? true : false;

/* -------------------------------------------------------------------------- */
/*                            Basic Type Inference                            */
/* -------------------------------------------------------------------------- */

const b0: Test<number, number> = true
const b1: Test<string, number> = false
const b3: Test<number, number[]> = false

/* -------------------------------------------------------------------------- */
/*                            Structural Subtyping                            */
/* -------------------------------------------------------------------------- */

class Empty1 {}
class Empty2 {}

// TS uses structural subtyping, not the name of the type or class.
// This means it compares the values and functions in the type.
const e0: Test<Empty1, Empty2> = true

class Parent {
    parentFn(): string { return ''}
}

class Child extends Parent {
    childFn(): number { return 1 }
}

const c1: Test<Child, Parent> = true

/* -------------------------------------------------------------------------- */
/*                      Covariant vs Contravariant Types                      */
/* -------------------------------------------------------------------------- */
/**
 * Test<T<Child>, T<Parent>> is true, T is covariant. i.e. The Child is on the left.
 * Test<T<Parent>, T<Child>> is true, T is contravariant. i.e. The Child is on the right.
 * To make types clearer, all remaining types in this file are assigned `true`.
 */

/* -------------------------- Identity is covariant ------------------------- */

type Identity<T> = T
const f0: Test<Identity<Child>, Identity<Parent>> = true

// T is Covariant when T<Child> extends T<Parent>. Meaning you can pass T<Child> to a function expecting T<Parent>.
function covariantFn(x: Identity<Parent>) {
    x.parentFn()
}
covariantFn(new Child())

/* ----------------------- ArrowRight is covariant ----------------------- */

type ArrowRight<T> = (s: string) => T
const c5: Test<(x: string) => Child, (x: string) => Parent> = true

function c5_(toParent: (s: string) => Parent) {
    toParent('hello').parentFn()
}
const toChild = (_: string) => new Child()
c5_(toChild)

/* ----------------------- ArrowLeft is contravariant ----------------------- */

type ArrowLeft<T> = (x: T) => string
const c4: Test<(x: Parent) => string, (x: Child) => string> = true

// T is Contravariant when T<Parent> extends T<Child>. Meaning you can pass T<Parent> to a function expecting T<Child>.
function contravariantFn(takeChild: (x: Child) => string) {
    takeChild(new Child())
}
const takeParent = (x: Parent) => x.parentFn()
contravariantFn(takeParent)

/* -------------------- Pair is a co-co variant bifunctor -------------------- */

type Pair<A, B> = [A, B]
const c6: Test<Pair<Child, Child>, Pair<Parent, Parent>> = true

// We can also have co-contra, contra-co, and contra-contra bifunctors

type Co<T> = T
type Contra<T> = (x: T) => string

type ContraContra<A, B> = [Contra<A>, Contra<B>]
const c7: Test<ContraContra<Parent, Parent>, ContraContra<Child, Child>> = true

type CoContra<A, B> = [Co<A>, Contra<B>]
const c8: Test<CoContra<Child, Parent>, CoContra<Parent, Child>> = true

type ContraCo<A, B> = [Contra<A>, Co<B>]
const c9: Test<ContraCo<Parent, Child>, ContraCo<Child, Parent>> = true

/* --------------- Nesting Co and Contra variant functor types -------------- */
// Wrapping a type in Co doesn't change its variance.
// Wrapping a type in Contra inverts its variance. 
//   i.e. Contra acts like multiplying by -1. Nesting Co and Contra acts like XOR.

type Co2<T> = Co<Co<T>>
type Co3<T> = Contra<Contra<T>>
type Contra1<T> = Contra<Contra<Contra<T>>>
type Contra2<T> = Co<Contra<T>>
type Contra3<T> = Contra<Co<T>>

const c14: Test<Contra1<Parent>, Contra1<Child>> = true
const c10: Test<Contra3<Parent>, Contra3<Child>> = true
const c11: Test<Contra2<Parent>, Contra2<Child>> = true
const c12: Test<Co2<Child>, Co2<Parent>> = true
const c13: Test<Co3<Child>, Co3<Parent>> = true

export default function run() { }