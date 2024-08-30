%default total
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
-- If you use {}, Idris can try to infer type A
data List : Type -> Type where
  Nil : {A: Type} -> List A
  Cons : {A: Type} -> A -> List A -> List A

l0 : List Int
l0 = Nil

-- If you use (), pass type A explicitly into the type constructor
data List_ : Type -> Type where
  Nil_ : (A: Type) -> List_ A
  Cons_: (A: Type) -> A -> List_ A -> List_ A

l0_ : List_ Int
l0_ = Nil_ Int
