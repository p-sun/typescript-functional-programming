%hide Prelude.List
%hide Prelude.Functor

--------------------------
-- Functor
--------------------------
record Functor (F: Type -> Type) where
  constructor MkFunctor
  map: {A, B: Type} -> (A -> B) -> F A -> F B
  indentity: {A: Type} -> {x: F A} -> map (\a => a) x = x
  composition: {A, B, C: Type} -> {f: A -> B} -> {g: B -> C} -> {x: F A}
    -> map (g . f) x = map g (map f x)

--------------------------
-- Instanciate a `Functor List`
--------------------------
data List : Type -> Type where
  Nil: {A: Type} -> List A
  Cons: {A: Type} -> A -> List A -> List A

listMap: {A, B: Type} -> (A -> B) -> List A -> List B
listMap f Nil = Nil
listMap f (Cons x xs) = Cons (f x) (listMap f xs)

{-
A functor FA has a map function adheres to two laws:
Law 1: map id FA = FA
Law 2: map g (map f FA) = map (x => g(f(x))) FA
-} 

listFunctorIdentityProof: {A: Type} -> {x: List A} -> listMap (\a => a) x = x
listFunctorIdentityProof {x=Nil} = Refl
listFunctorIdentityProof {x=(Cons h t)} = cong (Cons h) (listFunctorIdentityProof {x=t})

listFunctorCompositionProof: {A, B, C: Type} -> {f: A -> B} -> {g: B -> C} -> {x: List A}
    -> listMap (g . f) x = listMap g (listMap f x)
listFunctorCompositionProof = case x of 
    Nil => Refl
    Cons x xs => ?TODO2

listFunctor: Functor List
listFunctor = MkFunctor listMap listFunctorIdentityProof listFunctorCompositionProof

{-
Homework 0: convert the types from last time into record syntax (or explain why you can't)
Homework 1: study the list functor stuff carefully
Homework 2: finish the missing argument for listFunctor (fill hole ?LIST_MAP_COMPOSITION)
Homework 3: implement the Maybe functor fully (type, map fn, instance of Functor record)
-}
