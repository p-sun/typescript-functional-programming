type IsSubtype<T, U> = T extends U ? true : false;
type CheckSubtype<A, B> = A extends B ? (B extends A ? 'both' : 'subtype') : (B extends A ? 'supertype' : 'none')

/* -------------------------------------------------------------------------- */
/*                            Basic Type Inference                            */
/* -------------------------------------------------------------------------- */

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
const e0: IsSubtype<Empty1, Empty2> = true

class Parent {
    parentFn(): string { return ''}
}

class Child extends Parent {
    childFn(): number { return 1 }
}

const c1: IsSubtype<Child, Parent> = true

/* -------------------------------------------------------------------------- */
/*                            Arrays and Subtyping                            */
/* -------------------------------------------------------------------------- */

const b4: CheckSubtype<Child[], Parent[]> = 'subtype'

// TS will allow you to pass a subtype into a function expecting supertype.
// However! TS can allow you to illegal things!

// Theoretically can I pass a Child anywhere that expect a Parent? YES
// Theoretically can I pass a Parent anywhere that expect a Child? NO

// Theoretically, can I pass a Child[] to someone who expects a Parent[]?
function takeParents(arr: Parent[]) {
    arr[0].parentFn() // If you only read it... ok!
    arr.push(new Parent()) // If you mutate it... no! If we push a Parent, it's unsafe! TS doesn't warn us.
}
const childArray: Child[] = []
takeParents(childArray)
childArray[0].childFn() // ERROR: childFn() is undefined

// Theoretically, can I pass a Parent[] to something that expect a Child[]?
function takeChildren(arr: Child[]) {
    arr[0].childFn() // If you read it... no!
    arr.push(new Child()) // If you only mutate it... ok!
}
const parentsArray: Parent[] = []
// takeChildren(parentsArray) // ERROR: 'Parent[]' is not assignable to parameter of type 'Child[]'
parentsArray[0].parentFn()

// Can I pass a (c: Child) => string to a (c: Parent) => string
// NO! We might end up call a Child function on a Parent instance
// Can I pass a (c: Parent) => string to a (c: Child) => string
// YES!

// Summary:
// Child < Parent
// Covariant: ImmutableArray<Child> < ImmutableArray<Parent>
// Contravariant: (Parent => T) < (Child => T)

/* -------------------------------------------------------------------------- */
/*                      Covariant vs Contravariant Types                      */
/* -------------------------------------------------------------------------- */
/**
 * IsSubtype<T<Child>, T<Parent>> is true, T is covariant. i.e. The Child is on the left.
 * IsSubtype<T<Parent>, T<Child>> is true, T is contravariant. i.e. The Child is on the right.
 * To make types clearer, all remaining IsSubtype in this file are assigned to true.
 */

/* -------------------------- Identity is covariant ------------------------- */

type Identity<T> = T
const f0: IsSubtype<Identity<Child>, Identity<Parent>> = true

// T is Covariant when T<Child> extends T<Parent>. Meaning you can pass T<Child> to a function expecting T<Parent>.
function covariantFn(x: Identity<Parent>) {
    x.parentFn()
}
covariantFn(new Child())

/* ----------------------- ArrowRight is covariant ----------------------- */

type ArrowRight<T> = (s: string) => T
const c5: IsSubtype<(x: string) => Child, (x: string) => Parent> = true

function c5_(toParent: (s: string) => Parent) {
    toParent('hello').parentFn()
}
const toChild = (_: string) => new Child()
c5_(toChild)

/* ----------------------- ArrowLeft is contravariant ----------------------- */

type ArrowLeft<T> = (x: T) => string
const c4: IsSubtype<(x: Parent) => string, (x: Child) => string> = true

// T is Contravariant when T<Parent> extends T<Child>. Meaning you can pass T<Parent> to a function expecting T<Child>.
function contravariantFn(takeChild: (x: Child) => string) {
    takeChild(new Child())
}
const takeParent = (x: Parent) => x.parentFn()
contravariantFn(takeParent)

/* -------------------- Pair is a co-co variant bifunctor -------------------- */

type Pair<A, B> = [A, B]
const c6: IsSubtype<Pair<Child, Child>, Pair<Parent, Parent>> = true

// We can also have co-contra, contra-co, and contra-contra bifunctors

type Co<T> = T
type Contra<T> = (x: T) => string

type ContraContra<A, B> = [Contra<A>, Contra<B>]
const c7: IsSubtype<ContraContra<Parent, Parent>, ContraContra<Child, Child>> = true

type CoContra<A, B> = [Co<A>, Contra<B>]
const c8: IsSubtype<CoContra<Child, Parent>, CoContra<Parent, Child>> = true

type ContraCo<A, B> = [Contra<A>, Co<B>]
const c9: IsSubtype<ContraCo<Parent, Child>, ContraCo<Child, Parent>> = true

/* --------------- Nesting Co and Contra variant functor types -------------- */
// Wrapping a type in Co doesn't change its variance.
// Wrapping a type in Contra inverts its variance. 
//   i.e. Contra acts like multiplying by -1. Nesting Co and Contra acts like XOR.

type Co2<T> = Co<Co<T>>
type Co3<T> = Contra<Contra<T>>
type Contra1<T> = Contra<Contra<Contra<T>>>
type Contra2<T> = Co<Contra<T>>
type Contra3<T> = Contra<Co<T>>

const c14: IsSubtype<Contra1<Parent>, Contra1<Child>> = true
const c10: IsSubtype<Contra3<Parent>, Contra3<Child>> = true
const c11: IsSubtype<Contra2<Parent>, Contra2<Child>> = true
const c12: IsSubtype<Co2<Child>, Co2<Parent>> = true
const c13: IsSubtype<Co3<Child>, Co3<Parent>> = true

export default function run() { }