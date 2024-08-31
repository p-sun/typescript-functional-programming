%hide Prelude.List
%hide Prelude.Maybe
%hide Prelude.Just
%hide Prelude.Nothing

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
-- Map & Filter List
--------------------------

listMap : {A, B: Type} -> (A -> B) -> List A -> List B
listMap f Nil = Nil
listMap f (Cons h t) = Cons (f h) (listMap f t)

---
  
listFilter: {A: Type} -> (A -> Bool) -> List A -> List A
listFilter p Nil = Nil
listFilter p (Cons h t) = case p h of
  True => Cons h (listFilter p t)
  False => listFilter p t

--------------------------
-- List with size
--------------------------
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
data Vec : Nat -> (T: Type) -> Type where
  VNil : {T: Type} -> Vec Z T
  (::) : {T: Type} -> {n: Nat} -> (head: T) -> (tail: Vec n T) -> Vec (S n) T

vecConcat : {T: Type} -> {m, n: Nat} -> Vec m T -> Vec n T -> Vec (plus m n) T
vecConcat VNil ys = ys
vecConcat (h::tail) ys = h::(vecConcat tail ys)

vecT_ = True::VNil -- [True]
vecFT_ = False::(True::VNil) -- [False, True]
vecTFT_: Vec 3 Bool
vecTFT_ = vecConcat vecT_ vecFT_ -- [True, False, True]

--------------------------
-- NonEmptyList
--------------------------
-- NonEmptyList must have at least 1 element.
-- NonEmptyList is a dependent type where the type itself is indexed by a List A.
data NonEmptyList : {A : Type} -> List A -> Type where
  NonEmptyListCons : {A : Type} -> (h: A) -> (t: List A) -> NonEmptyList (Cons h t)

nonEmptyList1 = NonEmptyListCons 1 Nil
nonEmptyList2 = NonEmptyListCons 2 (Cons 1 Nil)
nonEmptyList3 = NonEmptyListCons 3 (Cons 2 (Cons 1 Nil))

--------------------------
-- NonEmptyList From List
--------------------------
data Maybe a = Nothing | Just a

------ Given a List, return a NonEmptyList if possible
listNonEmptyHead : {A : Type} -> (l : List A) -> NonEmptyList l
listNonEmptyHead Nil = ?hole
listNonEmptyHead (Cons h t) = NonEmptyListCons h t

l6 = listNonEmptyHead l2 -- Type: NonEmptyListCons 2 (Cons 1 [])
-- l7 = nonEmptyListHead Nil -- Cannot instantiate. "Unsolved holes" error.

------ Given a List, return a Maybe NonEmptyList
maybeNonEmptyList : {A : Type} -> (l : List A) -> Maybe (NonEmptyList l)
maybeNonEmptyList Nil = Nothing
maybeNonEmptyList (Cons h t) = Just (NonEmptyListCons h t)

--------------------------
-- Head From List
--------------------------
------ Get Maybe Head from List ------
listMaybeHead : {A: Type} -> (List A) -> Maybe A
listMaybeHead Nil = Nothing
listMaybeHead (Cons h t) = Just h

------ Get Head from List, by passing in proof that List is non-empty ------
listHead : {A: Type} -> (l: List A) -> (NonEmptyList l) -> A
listHead (Cons head _) _ = head

list789_ : List Int
list789_ = Cons 7 (Cons 8 (Cons 9 Nil))

list789_nonEmptyProof_ : NonEmptyList Main.list789_
list789_nonEmptyProof_ = NonEmptyListCons 7 (Cons 8 (Cons 9 Nil))

myHead_ : Int
myHead_ = listHead list789_ list789_nonEmptyProof_ -- value of 7
