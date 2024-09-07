--------------------------
-- Times
--------------------------
-- We know this terminiates because of "structural recursion". 
-- We see that the first term keeps getting smaller.
times: Nat -> Nat -> Nat
times Z n = Z
times (S m) n = plus (times m n) n

--------------------------
-- Even Propositions - Two Methods
--------------------------
-- "IsEven 4" is a Type that has 0 inhabitants. Represents truthiness.
--    A Type with one instance is also called a "proposition", "predicate", or proof.
--      It has 0 bits of info at runtime.  e.g. LEF, Equal, Even, Divides, Prime
--    As opposed to non-propositions (where you want the data later).
--      e.g. List, Maybe, Pair, Vec
-- "IsEven 3" is a Type that has 1 inhabitants. Represents falsiness.
-- "IsEven False" is a malformed term. Constraint solving fails. A "Unification" error.

------ Method 1 ------
data Even : Nat -> Type where
  EvenZ : Even Z
  EvenS : {n: Nat} -> Even n -> Even (S (S n))

-- Proof that 6 is even
sixIsEven_ : Even (S (S (S (S (S (S Z))))))
sixIsEven_ = EvenS $ EvenS $ EvenS $ EvenZ

------ Method 2  ------
-- Note that any claim that a number is even is that "half of is a natural number"
data Even_ : Nat -> Type where
  MkEven_ : (a: Nat) -> (b: Nat) -> a = times b 2 -> Even_ a

sixIsEven__ : Even_ 6
sixIsEven__ = MkEven_ 6 3 Refl

--------------------------
-- Divides
--------------------------
-- "Constructive Mathematics"  any statement of existance is isomorphic to an "algorithsm computing it"
-- No matter how we define divides, 2 facts must be true:
--    the remainder is 0.
--    the quotient is a whole number.
data Divides : Nat -> Nat -> Type where
  MkDivides : (divisor: Nat) -> (n: Nat) -> (quotient: Nat) 
               -> n = (times divisor quotient) 
               -> Divides divisor n

fiveDividesTen_: Divides 5 10
fiveDividesTen_ = MkDivides 5 10 2 Refl

--------------------------
-- Prime
--------------------------
-- "if p is divisible by d, then d must be 1 or p"
data Prime : Nat -> Type where
  MkPrime : (p: Nat) 
            -> ((d : Nat) -> Divides d p -> Either (d = 1) (d = p))
            -> Prime p
