--%default total
{-
To ignore prelude types like List and Nat.
CMD+`,`. Search for `Idris` and then add `--no-prelude` to `Idris: Process Args`.
 -}
--------------------------
-- Lists
--------------------------
data List : Type -> Type where
  Nil : {A: Type} -> List A
  Cons : {A: Type} -> A -> List A -> List A

l0 : List Int
l0 = Nil

------ Instanciating List ------ 

-- [1]
l1 : List Int
l1 = Cons 1 Nil

-- [2, 1]
l2: List Int
l2 = Cons 2 l1
-- Main> l2
-- Cons 2 (Cons 1 [])

--------------------------
-- NonEmptyList
--------------------------
-- NonEmptyList must have at least 1 element.
-- NonEmptyList is a dependent type where the type itself is indexed by a List A.
data NonEmptyList : {A : Type} -> List A -> Type where
  NonEmptyListCons : {A : Type} -> (h: A) -> (t: List A) -> NonEmptyList (Cons h t)

nonEmptyList1 = NonEmptyListCons 1 Nil
nonEmptyList2 = NonEmptyListCons 2 (Cons 1 Nil)

------ Get Head from List, two different ways ------
data Maybe a = Nothing | Just a

listMaybeHead : {A: Type} -> (List A) -> Maybe A
listMaybeHead Nil = Nothing
listMaybeHead (Cons h t) = Just h

---
listNonEmptyHead : {A : Type} -> (l : List A) -> NonEmptyList l
listNonEmptyHead (Cons h t) = NonEmptyListCons h t
listNonEmptyHead Nil = ?hole

l6 = listNonEmptyHead l2 -- Type: NonEmptyListCons 2 (Cons 1 [])
-- l7 = nonEmptyListHead Nil -- Cannot instantiate. "Unsolved holes" error.

------ Given a List, return a NonEmptyList if possible
maybeNonEmptyList : {A : Type} -> (l : List A) -> Maybe (NonEmptyList l)
maybeNonEmptyList Nil = Nothing
maybeNonEmptyList (Cons h t) = Just (NonEmptyListCons h t)

--------------------------
-- Map & Filter List
--------------------------

listMap: {A, B: Type} -> (A -> B) -> List A -> List B
listMap f Nil = Nil
listMap f (Cons h t) = Cons (f h) (listMap f t)

---

data Boolean : Type where
  True : Boolean
  False : Boolean
  
listFilter: {A: Type} -> (A -> Boolean) -> List A -> List A
listFilter p Nil = Nil
listFilter p (Cons h t) = case p h of
  True => Cons h (listFilter p t)
  False => listFilter p t

--------------------------
-- List with size
--------------------------
data Nat : Type where
  Z : Nat
  S : Nat -> Nat
  
plus: Nat -> Nat -> Nat
plus Z n = n
plus (S m) n = S (plus m n)

-- To compare with Vec implementaion:
-- data List : Type -> Type where
--   Nil : {A: Type} -> List A
--   Cons : {A: Type} -> A -> List A -> List A

-- A homogenesous tuples of fixed length,
-- that tracks the number of elements it contains.
-- e.g. "Vec 3 String" == [String, String, String]
-- How many instances does "Vec 0 T" have? 1   = T^0
-- How many instances does "Vec 1 T" have? T   = T^1
-- How many instances does "Vec 2 T" have? T*T = T^2
data Vec : Nat -> Type -> Type where
  VNil : {T: Type} -> Vec Z T
  VCons : {T: Type} -> {n: Nat} -> (head: T) -> (tail: Vec n T) -> Vec (S n) T

vecConcat : {T: Type} -> {m, n: Nat} -> Vec m T -> Vec n T -> Vec (plus m n) T
vecConcat VNil ys = ys
vecConcat (VCons h tail) ys = VCons h (vecConcat tail ys)

vec3_ = VCons (S(S(S Z))) VNil -- [3]
vec21_ = VCons (S(S(Z))) (VCons (S Z) VNil) -- [2, 1]
vec321_: Vec (S(S(S Z))) Nat
vec321_ = vecConcat vec3_ vec21_ -- [3, 2, 1]