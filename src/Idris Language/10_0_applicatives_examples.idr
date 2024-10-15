import Data.List
%hide Maybe
%hide Nothing
%hide Just
%default total

{-
An applicative is a functor along with 2 more functions

pure  :: a -> f a
(<*>) :: f (a -> b) -> f a -> f b
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
-- Promise Applicative
--------------------------
data Promise: Type -> Type where
  Pending: {A: Type} -> Promise A
  Resolved: {A: Type} -> A -> Promise A
  Rejected: {A: Type} -> String -> Promise A

promiseApply: {A, B: Type} -> Promise (A -> B) -> Promise A -> Promise B
promiseApply (Resolved f) (Resolved a) = Resolved (f a)
promiseApply (Rejected errorFn) (Rejected errorA) = Rejected (errorFn ++ " " ++ errorA)
promiseApply (Rejected errorStr) _ = Rejected errorStr
promiseApply _ (Rejected errorStr) = Rejected errorStr
promiseApply _ _ = Pending

--------------------------
-- Reader Applicative
--------------------------
Reader: Type -> Type
Reader a = String -> a

readerPure: {A: Type} -> A -> Reader A
readerPure a = \_ => a

readerApply: {A, B: Type} -> Reader (A -> B) -> Reader A -> Reader B
readerApply readerF readerA = \s => (readerF s) (readerA s)
-- readerF s : A -> B
-- readerA s : A
-- (readerF s) (readerA s) : B
-- \s => (readerF s) (readerA s) : Reader B

--------------------------
-- ToString (opposite of Reader)
--------------------------
-- Note ToString is NOT an applicative, b/c we have to treat it like it only has one instance.
ToString: Type -> Type
ToString a = a -> String

toStringPure: {A: Type} -> A -> ToString A
toStringPure a = \a => "hamburger"

toStringApply: {A, B: Type} -> ToString (A -> B) -> ToString A -> ToString B
toStringApply toStringF toStringA = \b => (toStringF (\a => b))
-- toStringF : (A -> B) => String 
-- toStringA : A => String
-- (toStringF (\a => b)) : String
-- \b => (toStringF (\a => b)) : ToString B

--------------------------
-- Identity<X> is trival applicative
--------------------------
{-
Is Identity X = X a functor?

map: (X -> Y) -> (Identity X  -> Identity Y)
map = id

Yes!

Is Identity<X> = X an applicative?

pure : X -> Identity X
pure = id

apply: Identity (X -> Y) -> Identity X -> Identity Y
apply = id

Yes!

Technically we need to check the functor and applicative laws
however since everything is just id, they end up trivial.
-}

--------------------------
-- Run
--------------------------
-- run with `idris2 10_0_applicatives.idr -x main`
main : IO ()
main = do
    printLn $ r2
