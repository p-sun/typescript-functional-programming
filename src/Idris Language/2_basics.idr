%default total
%hide Prelude.Bool
%hide Prelude.List
%hide Prelude.Nil
%hide Builtin.Pair 
%hide Builtin.Void 
%hide Builtin.MkPair 
%hide Prelude.Either
%hide Prelude.Left
%hide Prelude.Right
{-
To ignore prelude types like List and Nat.
CMD+`,`. Search for `Idris` and then add `--no-prelude` to `Idris: Process Args`.
 -}
------ Bools --------
{-
Idris comes with no types. There are ALL built in the standard library.

Imagine you wanted to "create" the Bools.

assert Bool : Type
assert True : Bool
assert False : Bool

Total? Are there other Bools?
Disjoint? True = False?

So we want to say 5 statements:
- Bool:Type
- True:Bool
- False:Bool
- True != False,
- If x:Bool then x=True or X=False
  (i.e. the boolElim function)
  The statement about you can use a Bool if you know how to use True and False
  is called an "elimination rule".

When we say True:Bool and False:Bool we are saying there are two distinct
  ways to *INTRODUCE* a Bool (we say there are 2 "introduction rules").
-}

data Bool : Type where
  True : Bool
  False : Bool

-- Basically a switch statement on the Bool.
-- This function exists inside the type-checker
-- derived from the definition of Bool above.
boolElim: {A: Type} -> Bool -> A -> A -> A
boolElim True t f = t
boolElim False t f = f

not: Bool -> Bool
not True = False
not False = True

not_: Bool -> Bool
not_ b = boolElim b False True

and: Bool -> Bool -> Bool
and True True = True
and _ _ = False

and_: Bool -> Bool -> Bool
and_ b1 b2 = boolElim b1 b2 False

----- Unit vs Void in Idris --------
-- `Unit` is a type with one member. The member carries 
-- no information, to indicate the function returned.
-- Similar to how `void` in TypeScript has one member `undefined`.
data Unit : Type where -- also called True
  Unit_ : Unit

-- `Void` is a type with no members.
-- Similar to `never` in TypeScript, meaning the function never terminates.
{-
function infiniteLoop(): never {
    while (true) {}
}
-}
data Void : Type where -- also called False

--------------------------
-- Inferring Types
--------------------------
-- Round braces () means a type needs to passed into the type constructor.
data P : Type -> Type -> Type where
  MkP : (A: Type) -> (B: Type) -> P A B

l0_ = MkP Int Bool -- P Int Bool

-- Curly braces {} are "named arguments".
l1_ = MkP {A=Int} -- (B : Type) -> P Int B

l2_ : P Int Bool
l2_ = MkP {A=_} {B=_}

-- When we omit the curly braces, we make the types implicit/inferred.
data Q : Type -> Type -> Type where
  MkQ : {A: Type} -> {B: Type} -> Q A B

l3_ : Q Int Bool
l3_ = MkQ -- Note A & B are inferred here

l4_ = MkQ {B=Bool} {A=Int} -- Q Int Bool, same type as above

--------------------------
-- Pair
--------------------------
data Pair : Type -> Type -> Type where
  MkPair : {A, B: Type} -> (a: A) -> (b: B) -> Pair A B

pair_ : Pair Nat Bool
pair_ = MkPair 3 True

--------------------------
-- Either
--------------------------
data Either : Type -> Type -> Type where
  Left : {A, B : Type} -> (l: A) -> Either A B
  Right : {A, B : Type} ->(r: B) -> Either A B

either_string_ : Either String Nat
either_string_ = Left "Hello World"

either_nat_ : Either String Nat
either_nat_ = Right 42

either_bool_ : Either String Nat
-- either_bool_ = Right True   -- Cannot instantiate