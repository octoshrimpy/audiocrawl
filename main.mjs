class Living {}
class Player extends Living {}
class Monster extends Living {}

class Item {}
class Key extends Item {}
class Potion extends Item {}
class Treasure extends Item {}

class Room {}
class Shop extends Room {}
class Puzzle extends Room {}
class Level {}
class Dungeon {}


//=======================================================

// const config = require('./config.json')

import mapgen from './MapGen.mjs'
mapgen.generate(6)
console.log(mapgen.showCells())


// gameloop

// let input
// while (input != "q") {
//   // print out dungeon
//   // wait for user input
// }
