// Nat
type Nat = undefined[]
type Zero = []
type Suc<N extends Nat> = [undefined, ...N]

// Nat Ops
type Pred<N extends Nat> = N extends [infer H, ...infer T extends Nat] ? T : Zero
type Add<M extends Nat, N extends Nat> = M extends [infer H, ...infer T extends Nat] ? Suc<Add<T, N>> : N
type Mul<M extends Nat, N extends Nat> = M extends [infer H, ...infer T extends Nat] ? Add<Mul<T, N>, N> : Zero

// Nat Compare
type Eq<A extends Nat, B extends Nat> =
  A extends [infer AH, ...infer AT extends Nat] ? (
    B extends [infer BH, ...infer BT extends Nat] ? Eq<AT, BT> : false
  ) : B extends Zero ? true : false

type Less<A extends Nat, B extends Nat> =
  A extends [infer AH, ...infer AT extends Nat] ? (
    B extends [infer BH, ...infer BT extends Nat] ? Less<AT, BT> : false
  ) : B extends Zero ? false : true

// Subtraction
type Sub<A extends Nat, B extends Nat> =
  A extends [infer AH, ...infer AT extends Nat] ? (
    B extends [infer BH, ...infer BT extends Nat] ? Sub<AT, BT> : A
  ) : Zero

// Division
type HasDivisor<A extends Nat, B extends [undefined, ...Nat]> =
  Eq<A, B> extends true ? true :
  Less<A, B> extends true ? false :
  HasDivisor<Sub<A, B>, B>

// Nat Constants
type One = Suc<Zero>
type Two = Suc<One>
type Three = Suc<Two>
type Five = Add<Two, Three>
type Ten = Add<Five, Five>
type Thirty = Mul<Three, Ten>

// Nat Fns
type RangeArray<Start extends Nat, Count extends Nat> = Count extends [infer H, ...infer T extends Nat] ? [Start, ...RangeArray<Suc<Start>, T>] : []
type Length<T extends any[]> =  T extends { length: infer L } ? L : never
type NatToNumber<N extends Nat> = Length<N>
type NatArrayToNumberArray<N extends Nat[]> = N extends [infer H extends Nat, ...infer T extends Nat[]] ? [NatToNumber<H>, ...NatArrayToNumberArray<T>] : []

// Sieve of Eratosthenes

type TwoToX<X extends [undefined, undefined, ...Nat]> = RangeArray<Two, Pred<X>>

type RemoveMultiplesOf<Arr extends Nat[], F extends [undefined, undefined, ...Nat]> =
  Arr extends [infer H extends Nat, ...infer T extends Nat[]] ?
    [...(HasDivisor<H, F> extends true ? [] : [H]), ...RemoveMultiplesOf<T, F>] : []

type Sieve<Candidates extends Nat[], Primes extends Nat[] = []> =
    Candidates extends [infer H extends [undefined, undefined, ...Nat], ...infer T extends Nat[]] ?
      Sieve<RemoveMultiplesOf<Candidates, H>, [...Primes, H]> : Primes

type PrimesLessThanEqual<Max extends [undefined, undefined, ...Nat]> = Sieve<TwoToX<Max>>

type PrimesUpTo30 = NatArrayToNumberArray<PrimesLessThanEqual<Thirty>>
