# Cube Calculus & Consensus Algorithm

## About
This webapp implements a rudimentary version of the consensus algorithm as discussed in the lecture
"Digitaltechnik und Entwurfsverfahren" at [KIT](https://www.kit.edu/).
The goal is to find a mostly minimal version of a given logical formula. After having been transformed to 
its [DNF](https://en.wikipedia.org/wiki/Disjunctive_normal_form), the product terms (AND terms) are represented as cubes (n-tuples)
in the cube calculus. Via the consensus algorithm, one can find overlaps of these cubes that eliminate variables.
The disjunction of the remaining non-overlapping cubes (retransformed to product terms) represents a minimized version of the original formula.
If there are three literals in the formula, it is possible to represent the cubes graphically in a 3D cube-like environment
and visualize the overlapping.

Please note that this procedure oftentimes *does not* produce an optimal minimized version!
More information regarding the theory can be found over at [Martin's blog](https://martin-thoma.com/das-consensus-verfahren/) (great resource, in German only).

A live demo can be viewed at [https://cube.kuhn.codes/](https://cube.kuhn.codes/).

## Set up
Clone the repository and run
```
npm install
```
and you should be good to go. Currently, the only dependency is three.js.

## Usage
Enter a formula using natural language operators and parenthesis. After the calculations you can find the determined minimized version at the bottom.

If you have exactly three literals in your formula, it will be represented in the 3D cube mesh:
Click on the different table rows to add / remove different cubes to / from the visualization.