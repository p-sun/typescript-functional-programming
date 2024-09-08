%hide Prelude.List
%hide Prelude.Functor

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

Clarity check: Is (List String) a functor?
    NO! List is the functor.
    'String' in 'List String' is called the "carrier set".
-}

data Monoid_ : Type -> Type where
  MklMonoid_: {S: Type}
    -> (f: S -> S -> S)
    -> (neutral: S)
    -> (assoc: {a,b,c: S} -> f a (f b c) = f (f a b) c)
    -> (neutralLeft: {x: S} -> f neutral x = x)
    -> (neutralRight: {x: S} -> f x neutral = x)
    -> Monoid_ S

record Monoid_verbose (S: Type) where
  constructor MkMonoid_verbose
  (<+>): S -> S -> S
  neutral: S
  assoc: {a,b,c: S} -> (a <+> (b <+> c)) = ((a <+> b) <+> c)
  neutralLeft: {x: S} -> neutral <+> x = x
  neutralRight: {x: S} -> x <+> neutral = x

record AssocOperator {S: Type} (f: S -> S -> S) where
  constructor MkAssocOperator
  assoc: {a,b,c: S} -> f a (f b c) = f (f a b) c

record OperatorIdentity {S: Type} (f: S -> S -> S) (neutral: S) where
  constructor MkOperatorIdentity
  neutralLeft: {x: S} -> f neutral x = x
  neutralRight: {x: S} -> f x neutral = x

record Monoid (S: Type) where
  constructor MkMonoid
  (<+>): S -> S -> S
  neutral: S
  assoc: AssocOperator (<+>)
  neutralProof: OperatorIdentity (<+>) neutral

--------------------------
-- Functor
--------------------------
record Functor (F: Type -> Type) where
  constructor MkFunctor
  map: {A, B: Type} -> (A -> B) -> F A -> F B
  indentity: {A: Type} -> {x: F A} -> map (\a => a) x = x
  composition: {A, B, C: Type} -> {f: A -> B} -> {g: B -> C} -> {x: F A}
    -> map (g . f) x = map g (map f x)

data List : Type -> Type where
  Nil: {A: Type} -> List A
  Cons: {A: Type} -> A -> List A -> List A

listMap: {A, B: Type} -> (A -> B) -> List A -> List B
listMap f Nil = Nil
listMap f (Cons x xs) = Cons (f x) (listMap f xs)

listFunctorIdentityProof: {A: Type} -> {x: List A} -> listMap (\a => a) x = x
listFunctorIdentityProof {x=Nil} = Refl
listFunctorIdentityProof {x=(Cons h t)} = cong (Cons h) (listFunctorIdentityProof {x=t})

listFunctor: Functor List
listFunctor = MkFunctor listMap listFunctorIdentityProof ?LIST_MAP_COMPOSITION

{-
Homework 0: convert the types from last time into record syntax (or explain why you can't)
Homework 1: study the list functor stuff carefully
Homework 2: finish the missing argument for listFunctor (fill hole ?LIST_MAP_COMPOSITION)
Homework 3: implement the Maybe functor fully (type, map fn, instance of Functor record)
-}
