-- Prevent cluttering the ordinary global name space with short identifiers.
%prefix_record_projections off

--------------------------
-- Person as a Type
--------------------------
-- Quick syntax for types with a single constructor
data Person: Type where
  MkPerson: (name: String) -> (age: Nat) -> Person

personName: Person -> String
personName (MkPerson n _) = n

updatePersonName: (n: String) -> Person -> Person
updatePersonName n (MkPerson _ a) = MkPerson n a

--------------------------
-- Person as a Record
--------------------------
-- A Record is a type with a single constructor, getters for all the fields, updaters for all fields.
record PersonRecord where
  constructor MkPersonRecord
  name: String
  age: Nat

-- instance of PersonRecord
alice : PersonRecord
alice = MkPersonRecord "Alice Smith" 36

-- Accessing fields of alice
aliceName : String
aliceName = alice.name  -- "Alice Smith"

-- Modifying fields
renamedAlice : PersonRecord
renamedAlice = ({ name := "Alice Johnson", age := 25 } alice)

-- A function to greet a person
greetPerson : PersonRecord -> String
greetPerson person = "Hello, " ++ person.name ++ "! You are " ++ show person.age ++ " years old."

greetAlice : String
greetAlice = greetPerson alice  -- "Hello, Alice Smith! You are 25 years old."

-- Main> greetingAlice
-- "Hello, Alice Smith! You are 36 years old."
-- Main> renamedAlice
-- MkPersonRecord "Alice Johnson" 25
-- Main> greetingAlice
-- "Hello, Alice Smith! You are 36 years old."

--------------------------
-- Point as a Record
--------------------------
-- https://idris2.readthedocs.io/en/latest/reference/records.html

record Point where
  constructor MkPoint
  x : Double
  y : Double

record Rect where
  constructor MkRect
  topLeft : Point
  bottomRight : Point

pt : Point
pt = MkPoint 4.2 6.6

rect : Rect
rect =
  MkRect
    (MkPoint 1.1 2.5)
    (MkPoint 4.3 6.3)

-- user-defined projection
(.squared) : Double -> Double
(.squared) x = x * x

-- run with `idris2 7_record.idr -x main`
main : IO ()
main = do
    printLn $ pt.x -- 4.2
    printLn $ pt.x.squared -- 17.64
    print $ map (.x) [MkPoint 1 2, MkPoint 3 4] -- [1.0, 3.0]

    -- desugars to (.topLeft.x rect + .bottomRight.y rect)
    printLn $ rect.topLeft.x + rect.bottomRight.y -- 7.4
  
    -- update record
    printLn $ ({ topLeft.x := 3 } rect).topLeft.x -- 3.0

    -- prints 2.1
    printLn $ ({ topLeft.x $= (+1) } rect).topLeft.x
