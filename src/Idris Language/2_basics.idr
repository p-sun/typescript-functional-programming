%default total
{-
To ignore prelude types like List and Nat.
CMD+`,`. Search for `Idris` and then add `--no-prelude` to `Idris: Process Args`.
 -}
------ Bools --------
{-
Idris comes with no types. There are ALL built in the standard library.

Imagine you wanted to "create" the booleans.

assert Boolean : Type
assert True : Boolean
assert False : Boolean

Total? Are there other Booleans?
Disjoint? True = False?

So we want to say 5 statements:
- Boolean:Type
- True:Boolean
- False:Boolean
- True != False,
- If x:Boolean then x=True or X=False
  (i.e. the boolElim function)
  The statement about you can use a boolean if you know how to use True and False
  is called an "elimination rule".

When we say True:Boolean and False:Boolean we are saying there are two distinct
  ways to *INTRODUCE* a boolean (we say there are 2 "introduction rules").
-}

data Boolean : Type where
  True : Boolean
  False : Boolean

-- Basically a switch statement on the Boolean.
-- This function exists inside the type-checker
-- derived from the definition of Boolean above.
boolElim: {A: Type} -> Boolean -> A -> A -> A
boolElim True t f = t
boolElim False t f = f

not: Boolean -> Boolean
not True = False
not False = True

not_: Boolean -> Boolean
not_ b = boolElim b False True

and: Boolean -> Boolean -> Boolean
and True True = True
and _ _ = False

and_: Boolean -> Boolean -> Boolean
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
