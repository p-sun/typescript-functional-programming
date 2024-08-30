--%default total
{-
To ignore prelude types like List and Nat.
CMD+`,`. Search for `Idris` and then add `--no-prelude` to `Idris: Process Args`.
 -}
--------------------------
-- Lists
--------------------------
-- If you use {}, you can make Idris infer the type A
data List : Type -> Type where
  Nil : {A: Type} -> List A
  Cons : {A: Type} -> A -> List A -> List A

l0 : List Int
l0 = Nil

-- If you use (), you have to pass the A type explicitly
data List_ : Type -> Type where
  Nil_ : (A: Type) -> List_ A
  Cons_: (A: Type) -> A -> List_ A -> List_ A

l0_ : List_ Int
l0_ = Nil_ Int

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
