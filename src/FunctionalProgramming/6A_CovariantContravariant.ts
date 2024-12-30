/* -------------------------------------------------------------------------- */
/*                            Basic Type Inference                            */
/* -------------------------------------------------------------------------- */
type CheckSubtype<A, B> = A extends B ? 
    (B extends A ? 'both' : 'subtype') : 
    (B extends A ? 'supertype' : 'none')

const b0: CheckSubtype<number, number> = 'both'
const b1: CheckSubtype<string, number> = 'none'
const b3: CheckSubtype<number, number[]> = 'none'

/* -------------------------------------------------------------------------- */
/*                            Structural Subtyping                            */
/* -------------------------------------------------------------------------- */

class Empty1 {}
class Empty2 {}

// TS uses structural subtyping, not the name of the type or class.
// This means it compares the values and functions in the type.
const e0: CheckSubtype<Empty1, Empty2> = 'both'

class Parent {
    parentFn(): string { return ''}
}

class Child extends Parent {
    childFn(): number { return 1 }
}

const c1: CheckSubtype<Child, Parent> = 'subtype'

/* -------------------------------------------------------------------------- */
/*                      Covariant vs Contravariant Types                      */
/* -------------------------------------------------------------------------- */
/**
  Let the relation "isSubtype of" be denoted by `<`. 

  "Covariant types preserves subtyping relationships."
  X<Child> is subtype of X<Parent>, so X is covariant

  Covariant types have Child on the left of the `<` relation:
    Child < Parent
    (String => Child) < (String => Parent)
    ImmutableArray<Child> < ImmutableArray<Parent>

  Contravariant types have Parent on the left of the `<` relation:
    (Parent => String) < (Child => String)

  Given (immutable) unary type constructor X<T>,
    If CheckSubtype<X<Child>, X<Parent>> is 'subtype', X is covariant.
    If CheckSubtype<X<Child>, X<Parent>> is 'supertype', X is contravariant.
 */

/* -------------------------- Identity is covariant ------------------------- */

type Identity<T> = T
const c3: CheckSubtype<Identity<Child>, Identity<Parent>> = 'subtype'

// T is Covariant when T<Child> extends T<Parent>.
// Meaning you can pass T<Child> in a function expecting T<Parent>.
function c3_(parent: Identity<Parent>) {
    parent.parentFn()
}
c3_(new Child() as Identity<Child>)

/* ----------------------- Return Types are covariant ----------------------- */

const c5: CheckSubtype<(x: string) => Child, (x: string) => Parent> = 'subtype'

function c5_(toParent: (s: string) => Parent) {
    toParent('hello').parentFn()
}
c5_((_: string) => new Child() )

/* --------------------- Parameter Types are contravariant -------------------- */

const c4: CheckSubtype<(x: Child) => string, (x: Parent) => string> = 'supertype'

// T is Contravariant when T<Parent> extends T<Child>.
// Meaning you can pass T<Parent> to a function expecting T<Child>.
function c4_(takeChild: (x: Child) => string) {
    takeChild(new Child())
}
c4_((x: Parent) => x.parentFn())

/* ---------------------- Immutable Arrays are covariant ---------------------- */

const c2: CheckSubtype<Child[], Parent[]> = 'subtype'

// TS will allow you to pass a subtype into a function expecting supertype.
// However! TS can allow you to illegal things!
function c2_(arr: Parent[]) {
    arr[0].parentFn() // If you only read from the array, it's okay because Parent's methods are accessible.
    arr.push(new Parent()) // But if you mutate it by adding a Parent, it becomes unsafe for Child arrays. 
    // TypeScript doesn't warn us here, which could lead to runtime errors.
}

const childArray: Child[] = [new Child()]
c2_(childArray)
childArray[1].childFn() // ERROR: childFn() is undefined because a Parent was added to the Child array.

/* -------------------- Pair is a co-co variant bifunctor -------------------- */

type Pair<A, B> = [A, B]
const c6: CheckSubtype<Pair<Child, Child>, Pair<Parent, Parent>> = 'subtype'

// We can also have co-contra, contra-co, and contra-contra bifunctors

type Co<T> = T
type Contra<T> = (x: T) => string

type ContraContra<A, B> = [Contra<A>, Contra<B>]
const c7: CheckSubtype<ContraContra<Child, Child>, ContraContra<Parent, Parent>> = 'supertype'

type CoContra<A, B> = [Co<A>, Contra<B>]
const c8: CheckSubtype<CoContra<Child, Parent>, CoContra<Parent, Child>> = 'subtype'

type ContraCo<A, B> = [Contra<A>, Co<B>]
const c9: CheckSubtype<ContraCo<Child, Parent>, ContraCo<Parent, Child>> = 'supertype'

/* --------------- Nesting Co and Contra variant functor types -------------- */
// Wrapping a type in Co doesn't change its variance.
// Wrapping a type in Contra inverts its variance. 
//   i.e. Contra acts like multiplying by -1. Nesting Co and Contra acts like XOR.

type Co2<T> = Co<Co<T>>
type Co3<T> = Contra<Contra<T>>
type Contra1<T> = Contra<Contra<Contra<T>>>
type Contra2<T> = Co<Contra<T>>
type Contra3<T> = Contra<Co<T>>

const c14: CheckSubtype<Contra1<Child>, Contra1<Parent>> = 'supertype'
const c10: CheckSubtype<Contra3<Child>, Contra3<Parent>> = 'supertype'
const c11: CheckSubtype<Contra2<Child>, Contra2<Parent>> = 'supertype'
const c12: CheckSubtype<Co2<Child>, Co2<Parent>> = 'subtype'
const c13: CheckSubtype<Co3<Child>, Co3<Parent>> = 'subtype'

export default function run() { }