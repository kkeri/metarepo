# Metarepo

This repository is a container of my miscellaneous metaprogramming experiments.
I gave up finding fancy names for my tiny projects, so I decided to number
them instead.

**XP01** - [A minimalist proof system for propositional logic](src/xp01/README.md)  
**XP02** - Under construction

## How to build

The projects are written in JavaScript/TypeScript, and you need to install
__node.js__ to build and run them (v8 or higher is recommended).
On Windows you will also need a Linux shell, e.g. git bash.

Every `src/xp..` subdirectory is a standalone project that can be built from
the main directory. For example, to build XP01, type

~~~
make xp01
~~~

To find out how to run the programs, look at the readme file of each project.
