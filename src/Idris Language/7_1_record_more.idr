--------------------------
--- More Types as Records
--------------------------
-- Note that record only has one constructor.
-- So Either cannot be a Record because it has two constructors, Left and Right.
--------------------------

--------------------------
-- Pair
--------------------------
record Pair (A: Type) (B: Type) where
    constructor MkPair
    first: A
    second: B
---
data Pair_ : Type -> Type -> Type where
  MkPair_ : {A, B: Type} -> (a: A) -> (b: B) -> Pair_ A B

pair_ : Pair_ Nat Bool
pair_ = MkPair_ 3 True

--------------------------
-- Even
--------------------------
record Even where
    constructor MkEven
    a: Nat
    b: Nat
    aIsDoubleB: a = (b * 2)

sixIsEven_ : Even
sixIsEven_ = MkEven 6 3 Refl
---
data Even_ : Nat -> Type where
  MkEven_ : (a: Nat) -> (b: Nat) -> a = (b * 2) -> Even_ a

sixIsEven__ : Even_ 6
sixIsEven__ = MkEven_ 6 3 Refl

--------------------------
-- Divides
--------------------------
record Divides where
    constructor MkDivides
    divisor: Nat
    n: Nat
    quotient: Nat
    proofItDivides: n = (divisor * quotient)

fiveDividesTen_: Divides
fiveDividesTen_ = MkDivides 5 10 2 Refl

---
data Divides_ : Nat -> Nat -> Type where
  MkDivides_ : (divisor: Nat) -> (n: Nat) -> (quotient: Nat) 
               -> n = (divisor * quotient) 
               -> Divides_ divisor n

fiveDividesTen__: Divides_ 5 10
fiveDividesTen__ = MkDivides_ 5 10 2 Refl
