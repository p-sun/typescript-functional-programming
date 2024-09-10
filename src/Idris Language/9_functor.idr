%hide Prelude.List
%hide Prelude.Functor

--------------------------
-- Functor
--------------------------
{-
A functor FA has a map function adheres to two laws:
Law 1: map id FA = FA
Law 2: map g (map f FA) = map (x => g(f(x))) FA
-} 
record Functor (F: Type -> Type) where
  constructor MkFunctor
  fmap: {A, B: Type} -> (A -> B) -> F A -> F B
  identityProof: {A: Type} -> {x: F A} -> fmap (\a => a) x = x
  compositionProof: {A, B, C: Type} -> {f: A -> B} -> {g: B -> C} -> {x: F A}
    -> fmap (g . f) x = fmap g (fmap f x)

--------------------------
-- Instanciate a `Functor List`
--------------------------
data List : Type -> Type where
  Nil: {A: Type} -> List A
  Cons: {A: Type} -> A -> List A -> List A

listmap: {A, B: Type} -> (A -> B) -> List A -> List B
listmap f Nil = Nil
listmap f (Cons x xs) = Cons (f x) (listmap f xs)

-- Functor Law 1: map id FA = FA
listMapIdentityProof: {A: Type} -> {x: List A} -> listmap (\a => a) x = x
listMapIdentityProof {x=Nil} = Refl
listMapIdentityProof {x=(Cons h t)} = cong (Cons h) (listMapIdentityProof {x=t})

-- Functor Law 2: map g (map f FA) = map (x => g(f(x))) FA
listMapCompositionProof: {A, B, C: Type} -> {f: A -> B} -> {g: B -> C} -> {x: List A}
    -> listmap (g . f) x = listmap g (listmap f x)
        -- listmap (\x => g (f x)) x = listmap g (listmap f x)
listMapCompositionProof {x=Nil} = Refl
listMapCompositionProof {x=Cons x xs} = cong (Cons (g (f x))) listMapCompositionProof
    -- Cons (g (f x)) (listmap (\x => g (f x)) xs) = Cons (g (f x)) (listmap g (listmap f xs))

listFunctor: Functor List
listFunctor = MkFunctor listmap listMapIdentityProof listMapCompositionProof

{-
Homework 0: convert the types from last time into record syntax (or explain why you can't)
Homework 1: study the list functor stuff carefully
Homework 2: finish the missing argument for listFunctor (fill hole ?LIST_MAP_COMPOSITION)
Homework 3: implement the Maybe functor fully (type, map fn, instance of Functor record)
-}
