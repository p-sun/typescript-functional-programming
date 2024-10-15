%default total

--------------------------
-- Operators
--------------------------
-- (+) is a prefix operator
plusTest1 : 8 = plus 3 5
plusTest1 = Refl

plusTest2 : 8 = (+) 3 5
plusTest2 = Refl

-- + is an infix operator
plusTest3 : 8 = 3 + 5
plusTest3 = Refl

-- Declare a custom infix operator
infixl 6 +++ -- Declare the fixity and precedence
(+++) : Integer -> Integer -> Bool
(+++) a b = ((a + b) > 0)

test5 : (-8 +++ 2) = False
test5 = Refl
