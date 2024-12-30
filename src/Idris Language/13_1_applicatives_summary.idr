-- Note: Comment out the sections with %hide and this will still typecheck,
-- because this is how the interfaces are defined in Idris2.
-- Idris2 Prelude Interfaces: https://www.idris-lang.org/docs/idris2/current/prelude_docs/docs/Prelude.Interfaces.html

{-
Which ones can be implemented in terms of the others?

Base set Functor: map

Base set Applicative: pure, apply, map
  - Make Monoidal
    - unit with pure 
    - prod with apply, map, (pair)
  - Make Applicative map2, map3 with map, apply

Base set Monoidal: unit, prod, map
  - Make Applicative
    - apply with map, prod, (evalPair)
    - pure with map, unit

Base set Monad: bind, pure
  - Make Monad join with bind
  - Make Applicative apply with bind & pure
  - Make Functor map with bind & pure

Base set Monad: join, pure, map
  - Make Monad bind with join & map
  - Make Applicative apply with join & map
-}

--------------------------
-- Functor
--------------------------
%hide Functor
interface Functor f where
  map : (a -> b) -> f a -> f b

%hide Prelude.Ops.infixr.(<$>)
infixl 4 <$>
(<$>) : Functor f => (a -> b) -> f a -> f b
(<$>) = map

--------------------------
-- Applicative
--------------------------
%hide Applicative
%hide apply
%hide pure
interface Functor f => Applicative f where
  pure : a -> f a
  apply : f (a -> b) -> f a -> f b

%hide Prelude.Ops.infixr.(<*>)
infixl 3 <*>
(<*>) : Applicative f => f (a -> b) -> f a -> f b
(<*>) = apply

--------------------------
-- Monoidal
--------------------------
interface Functor f => Monoidal f where
  unit : f ()
  prod : f a -> f b -> f (a, b)

infixl 6 <**>
(<**>) : Monoidal f => f a -> f b -> f (a, b)
(<**>) = prod

--------------------------
-- Monad
--------------------------
%hide Monad
%hide join
interface Applicative f => Monad f where
    bind : f a -> (a -> f b) -> f b
    join : f (f a) -> f a

infixl 1 >>=
(>>=) : Monad f => f a -> (a -> f b) -> f b
(>>=) = bind

--------------------------
-- List as Monad Example
--------------------------
%hide listBind
listBind : List a -> (a -> List b) -> List b
listBind [] _ = []
listBind (x :: xs) a2fb = a2fb x ++ (listBind xs a2fb)

--------------------------
-- Applicative & Monoidal are Isomorphic
--------------------------

{- Applicative to Monoidal  -}
unit_ : Applicative f => f ()
unit_ = pure ()

pair : a -> b -> (a, b)
pair = (,)

prod_ : Applicative f => f a -> f b -> f (a, b)
prod_ fa fb = (,) <$> fa <*> fb
--
-- prod_ fa fb = apply (map pair fa) fb
-- prod_ fa = apply (map pair fa)
-- prod_ = apply . map pair
--
-- pair : a -> b -> (a, b)
-- map : (A -> B) -> F A -> F B            -- make B = b -> (a, b), A = a
-- map pair : f a -> f (b -> (a, b))        
-- map pair fa : f (b -> (a, b))
--
-- apply : F (A -> B) -> F A -> F B         -- make A = b, B = (a, b)
-- apply (map pair fa) : f (b -> (a, b)) -> f b -> f (a, b)        
-- apply (map pair fa) fb : f (a, b)

{- Monoidal to Applicative -}
pure_ : Monoidal f => a -> f a
pure_ a = map (\_ => a) unit
--            (\_ => a) : () -> a
--        map : (A -> B) -> F A -> F B   -- Make A = (), B = a
--        map (\_ => a) : f () -> f a
--        map (\_ => a) unit : f a

evalPair : (a -> b, a) -> b
evalPair (f, a) = f a

{- Note how similar apply_'s implementation is to prod_:
prod_ : Applicative f => f a -> f b -> f (a, b)
prod_ fa fb = (,) <$> fa <*> fb 
-}
apply_ : Monoidal f => f (a -> b) -> f a -> f b
apply_ fa2b fa = evalPair <$> (fa2b <**> fa)
--             = map evalPair (prod fa2b fa)
-- prod : F A -> F B -> F (A, B)    -- Make A = (a -> b), B = a
-- prod fa2b fa : f ((a -> b), a)
--
-- eval : (a -> b, a) -> b
-- map : (A -> B) -> F A -> F B    -- Make A = (a -> b, a), B = a
-- map eval : f (a -> b, a) -> f a
-- map eval (prod fa2b fa) : f a

--------------------------
-- From Applicative -- map2 & map3
--------------------------
map2 : Applicative f => (a -> b -> c) -> f a -> f b -> f c
map2 a2b2c fa fb = a2b2c <$> fa <*> fb
--                 a2b2c <$> fa : f (b -> c)
--                (a2b2c <$> fa) <*> fb : f c
--
--               = apply (map a2b2c fa) fb

map3 : Applicative f => (a -> b -> c -> d) -> f a -> f b -> f c -> f d
map3 a2b2c2d fa fb fc = a2b2c2d <$> fa <*> fb <*> fc
--                      a2b2c2d <$> fa : f (b -> c -> d)
--                     (a2b2c2d <$> fa) <*> fb : f (c -> d)
--                    ((a2b2c2d <$> fa) <*> fb) <*> fc : f d
--
--                    = apply (apply (map a2b2c2d fa) fb) fc

--------------------------
-- To Monad, from only bind, pure
--------------------------
{- map from bind & pure -}
map_ : Monad f => (a -> b) -> f a -> f b
map_ a2b fa = bind fa (pure . a2b)
-- pure . a2b : a -> f b

{- join from bind -}
join_ : Monad f => f (f a) -> f a
join_ ffa = bind ffa id
-- bind : F A -> (A -> F B) -> F B    -- Make A = f a, B = a
-- bind : f (f a) -> (f a -> f a) -> f a
-- bind ffa id : f a

{- apply from bind & pure -}
apply__ : Monad f => f (a -> b) -> f a -> f b
apply__ fa2b fa = bind fa2b (\a2b => bind fa (\a => pure (a2b a)))
-- apply__ fa2b fa = fa2b >>= (\a2b => fa >>= (\a => pure (a2b a)))
-- apply__ fa2b fa = fa2b >>= (\a2b => fa >>= (pure . a2b))
{-
Thought process: How do we make `f b` from `a2b: a -> b`, `fa`, and bind? What's the type of `bind fa2b`?
bind : F A -> (A -> F B) -> F B    -- Make A = a -> B, B = b
bind : f (a -> b) -> ((a -> b) -> f b) -> f b
bind fa2b : ((a -> b) -> f b) -> f b

Now we need to make `f b` from `a2b: a -> b` and `fa`.
bind2 : f a -> (a -> f b) -> f b
bind2 fa : (a -> f b) -> f b

Now we need to make `f b` from `a` and `a2b: a -> b`.
pure (a2b a) : f b
-}

--------------------------
-- To Monad, from only join, pure, map
--------------------------
{- bind from join & map -}
bind_ : Monad f => f a -> (a -> f b) -> f b
bind_ fa a2fb = join (map a2fb fa)
{-
map : (A -> B) -> F A -> F B
map a2fb : f a -> f (f b)     where A = a, B = f b
map a2fb fa : f (f b)
join (map a2fb fa) : f b
 -}

{- apply from join & map -}
apply___ : Monad f => f (a -> b) -> f a -> f b
apply___ fa2b fa = join (map (\a2b => map a2b fa) fa2b)
{-
                   map a2b fa        : f b
           \a2b => map a2b fa        : (a -> b) -> f b
      map (\a2b => map a2b fa)       : f (a -> b) -> f (f b)
      map (\a2b => map a2b fa) fa2b  : f (f b)
join (map (\a2b => map a2b fa) fa2b) : f b
-}
