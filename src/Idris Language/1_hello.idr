module Main

main : IO ()
main = putStrLn "Hello world"

{-
To install:
https://idris2.readthedocs.io/en/latest/tutorial/starting.html
$ brew install idris2

To execute in terminal:
$ idris2 1_hello.idr -x main
Hello world

To execute in the interactive environment:
idris2 1_hello.idr
Main> :t main
Main.main : IO ()
Main> :c hello main
File build/exec/hello written
Main> :exec main
Hello world
Main> :q
Bye for now!
-}