%hide Prelude.List
%hide Prelude.Functor
%hide Maybe
%hide Just

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
-- Instantiate a `Functor List`
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

--------------------------
-- Instantiate a `Functor Maybe`
--------------------------
data Maybe: Type -> Type where
  None: {A: Type} -> Maybe A
  Just: {A: Type} -> (a: A) -> Maybe A

maybeMap: {A, B: Type} -> (f: A -> B) -> Maybe A -> Maybe B
maybeMap f None = None
maybeMap f (Just a) = Just (f a)

maybeMapIdentityProof: {A: Type} -> {x: Maybe A} -> maybeMap (\a => a) x = x
maybeMapIdentityProof {x=None} = Refl -- None = None
maybeMapIdentityProof {x=Just a} = Refl -- Just a = Just a

maybeMapCompositionProof: {A, B, C: Type} -> {x: Maybe A} -> {f: A -> B} -> {g: B -> C} 
  -> maybeMap (\x => g (f x)) x = maybeMap g (maybeMap f x)
maybeMapCompositionProof {x=None} = Refl -- None = None
maybeMapCompositionProof {x=Just a} = Refl -- Just (g (f a)) = Just (g (f a))

MaybeFunctor: Functor Maybe
MaybeFunctor = MkFunctor maybeMap maybeMapIdentityProof maybeMapCompositionProof

{-
Homework 0: convert the types from last time into record syntax (or explain why you can't)
Homework 1: study the list functor stuff carefully
Homework 2: finish the missing argument for listFunctor (fill hole ?LIST_MAP_COMPOSITION)
Homework 3: implement the Maybe functor fully (type, map fn, instance of Functor record)
-}
