import Data.List
%hide Maybe
%hide Nothing
%hide Just
%default total

{-
Homework:
An applicative is a functor along with 2 more functions

pure  :: a -> f a
(<*>) :: f (a -> b) -> f a -> f b

1. Try to come up with the applicative laws (or at least some)
2. Find an implementation for pure and <*> for promise, maybe, list, and _ -> string. You can use TS if you like
3. For the implementations in #2, check the laws you found in #1
-}

--------------------------
-- Maybe Applicative
--------------------------
data Maybe : Type -> Type where
  Nothing : {A: Type} -> Maybe A
  Just : {A: Type} -> (a: A) -> Maybe A

maybePure : {A: Type} -> A -> Maybe A
maybePure a = Just a

maybeApply : {A, B: Type} -> Maybe (A -> B) -> Maybe A -> Maybe B
maybeApply (Just f) (Just a) = Just (f a)
maybeApply _ _ = Nothing

--------------------------
-- List Applicative
--------------------------
listPure : {A: Type} -> A -> List A
listPure a = a::Nil

listApply : {A, B: Type} -> List (A -> B) -> List A -> List B
listApply Nil _ = Nil
listApply _ Nil = Nil
listApply fs xs = [f x | f <- fs, x <- xs]

-- Examples
isEven : Nat -> Bool
isEven Z = True
isEven (S Z) = False
isEven (S (S n)) = isEven n

listFnNatToBool: List (Nat -> Bool)
listFnNatToBool = [(\n => True), (\n => isEven n)]

r2: List Bool
r2 = listApply listFnNatToBool [1, 2, 3]

test2: Main.r2 = [True, True, True, False, True, False]
test2 = Refl

--------------------------
-- Run
--------------------------
-- run with `idris2 10_0_applicatives.idr -x main`
main : IO ()
main = do
    printLn $ r2
