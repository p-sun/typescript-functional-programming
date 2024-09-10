%hide Prelude.Monoid

--------------------------
-- Monoid
--------------------------
{-
Monoid is a Set, with a binary operator that is associative, and has an identity element.

Examples:
  Nat, +, 0
  Nat, *, 1
  String, concat, ""
  Number[], concat, []
  Bool, or, false
  Bool, and, true

Intuitively a monoid is something we can "reduce from a starting place".
  If you can reduce a T[], then T is a monoid

In `List String`
    - `List` is the functor.
    - "Carrier Set" is the set of all possible lists of strings. i.e. {[], ["a", "hello"], ...}
-}

------ Monoid as data ------
data Monoid_ : Type -> Type where
  MklMonoid_: {S: Type}
    -> (f: S -> S -> S)
    -> (neutral: S)
    -> (assoc: {a,b,c: S} -> f a (f b c) = f (f a b) c)
    -> (neutralLeft: {x: S} -> f neutral x = x)
    -> (neutralRight: {x: S} -> f x neutral = x)
    -> Monoid_ S

------ Monoid as record 1 ------
record Monoid_verbose (S: Type) where
  constructor MkMonoid_verbose
  (<+>): S -> S -> S
  neutral: S
  assoc: {a,b,c: S} -> (a <+> (b <+> c)) = ((a <+> b) <+> c)
  neutralLeft: {x: S} -> neutral <+> x = x
  neutralRight: {x: S} -> x <+> neutral = x

------ Monoid as record 2 ------
-- (with better separation of concerns)
record AssocOperator {S: Type} (f: S -> S -> S) where
  constructor MkAssocOperator
  assoc: {a,b,c: S} -> f a (f b c) = f (f a b) c

record OperatorIdentity {S: Type} (f: S -> S -> S) (neutral: S) where
  constructor MkOperatorIdentity
  neutralLeft: {x: S} -> f neutral x = x
  neutralRight: {x: S} -> f x neutral = x

-- Note that assoc & neutralProof are proofs and contain no bits. So they get compiled out.
record Monoid (S: Type) where
  constructor MkMonoid
  (<+>): S -> S -> S
  neutral: S
  assoc: AssocOperator (<+>)
  neutralProof: OperatorIdentity (<+>) neutral

-- Instanciate the Monoid above with (Nat, +, 0) ------
plusAssoc : {a, b, c: Nat} -> plus a (plus b c) = plus (plus a b) c
plusAssoc {a=Z} = Refl
plusAssoc {a=(S k)} = cong S plusAssoc

plusZeroRight : {n : Nat} -> (plus n Z) = n
plusZeroRight {n=Z} = Refl
plusZeroRight {n=(S n)} = cong S plusZeroRight

zeroIsNeutralProof : OperatorIdentity Prelude.plus 0
zeroIsNeutralProof = MkOperatorIdentity Refl plusZeroRight

AdditiveMonoid: Monoid Nat
AdditiveMonoid = MkMonoid (+) 0 (MkAssocOperator plusAssoc) zeroIsNeutralProof
