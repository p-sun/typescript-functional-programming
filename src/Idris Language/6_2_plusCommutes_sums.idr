%default total 

-- plus: Nat -> Nat -> Nat
-- plus Z n = n
-- plus (S m) n = S (plus m n)

plusRightZero : (n : Nat) -> plus n Z = n
plusRightZero Z = Refl -- plus Z Z = Z
plusRightZero (S n) = cong S (plusRightZero n) -- S (plus n 0) = S n

symm : {A : Type} -> {x, y : A} -> x = y -> y = x
symm Refl = Refl

--------------------------
-- Plus is Communitative
--------------------------
plusRightSucc : (m: Nat) -> (n: Nat) -> plus m (S n) = plus (S m) n
plusRightSucc Z n = Refl -- S n = S n
plusRightSucc (S m) n = cong S (plusRightSucc m n) 
    -- plus (S m) (S n) = plus (S (S m)) n
    -- S (plus m (S n)) = S (plus (S m) n)

plusCommutes : (m: Nat) -> (n: Nat) -> (plus m n) = (plus n m)
plusCommutes Z Z = Refl -- 0 = 0
plusCommutes (S m) Z = cong S (plusCommutes m Z) -- S (plus m 0) = S m
plusCommutes Z (S n) = cong S (plusCommutes Z n) -- S n = S (plus n 0)
plusCommutes (S m) (S n) = 
    -- X = plus m (S n)
    -- Y = S (plus m n)
    -- Z = plus n (S m)
    let recCall = plusCommutes (S m) n in -- S (plus m n) = plus n (S m)    [Y = Z]
        -- cong S ?x_eq_z -- x_eq_z: plus m (S n) = plus n (S m)            [X = Z]
        cong S $ trans (plusRightSucc m n) recCall --                       [cong S (X = Z)]

--------------------------
-- Plus is Associative
--------------------------
plusAssoc : (a, b, c: Nat) -> a + (b + c) = (a + b) + c
plusAssoc Z b c = Refl -- plus b c = plus b c
plusAssoc (S a) b c = cong S (plusAssoc a b c)
    -- cong S ?H   -- H: plus a (plus b c) = plus (plus a b) c

plusQuadAssoc : (a,b,c,d: Nat) -> (a + b) + (c + d) = (a + c) + (b + d)
plusQuadAssoc a b c d =                  --   (a + b) + (c + d)
rewrite sym (plusAssoc a b (c+d)) in     -- = a + (b + (c + d))
    rewrite plusAssoc b c d in           -- = a + ((b + c) + d)
    rewrite (plusCommutes b c) in        -- = a + ((c + b) + d)
        rewrite sym (plusAssoc c b d) in -- = a + (c + (b + d))
        rewrite (plusAssoc a c (b+d)) in -- = (a + c) + (b + d)
            Refl

--------------------------
-- Times
--------------------------
-- How Idris Defines '*'
-- mult : Nat -> Nat -> Nat
-- mult Z _ = Z
-- mult (S k) n = plus n (mult k n)

-- (S m) * n = n + (m * n)
timesProof_: (m, n: Nat) -> mult (S m) n = plus n (mult m n)
timesProof_ m n = Refl

--------------------------
-- Plus Distributes
--------------------------
plusDistribLeft : (a,b,c: Nat) -> a * (b + c) = (a * b) + (a * c)
plusDistribLeft Z b c = Refl
plusDistribLeft (S a) b c =                           -- (S a) * (b+c)   = (S a)*b + (S a)*c
                                                      -- (b+c) + a*(b+c) = (S a)*b + (S a)*c
    rewrite plusDistribLeft a b c in                  -- (b+c) + (ab+ac) = (S a)*b + (S a)*c
        rewrite plusQuadAssoc b c (a*b) (a*c) in Refl -- (b+ab) + (c+ac) = (S a)*b + (S a)*c

--------------------------
-- Sums
--------------------------
-- Finite sums: \Sigma_{i=0}^{n} f(i)
Sum : (n: Nat) -> (f: Nat -> Nat) -> Nat
Sum Z f = f Z
Sum (S n) f = (f (S n)) + (Sum n f)

-- Finite sums distributes across addition
sumAddition : (n: Nat) -> (f, g: Nat -> Nat) -> (Sum n f) + (Sum n g) = Sum n (\i => f i + g i)
sumAddition 0 f g = Refl
sumAddition (S n) f g =
  let recCall = sumAddition n f g in
    rewrite (sym recCall) in
      plusQuadAssoc (f (S n)) (Sum n f) (g (S n)) (Sum n g)

-- Finite sums distributes across scalar multiplication.
sumScalars : (n, a: Nat) -> (f: Nat -> Nat) -> (Sum n (\i => a * (f i))) = a * (Sum n f)
sumScalars Z a f = Refl
sumScalars (S n) a f =
  rewrite sumScalars n a f in
    sym $ plusDistribLeft a (f (S n)) (Sum n f)