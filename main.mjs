class Living {}
class Player extends Living {}
class Monster extends Living {}

class Item {}
class Key extends Item {}
class Potion extends Item {}
class Treasure extends Item {}

class Room {}
class Shop extends Room {}
class Puzzle extends Room {};
class Level {}
class Dungeon {}


//=======================================================

// const config = require('./config.json')

import mapgen from './MapGen.mjs'
mapgen.generate(3)

// get visual map size
let map = mapgen.showHex("")
let mapWidth = map.split("\n")[0].length
let mapHeight = map.match(/\n/gi).length + 1

console.log(mapgen.showHex(""))
mapgen.cells.forEach(cell => {
  // console.log(cell)
  let nCell = mapgen.cells.filter(i => i.x == cell.x && i.y == cell.y - 1 && cell.y - 1 >= 0)[0]
  let eCell = mapgen.cells.filter(i => i.x == cell.x + 1 && i.y == cell.y && cell.x + 1 >= 0)[0]
  let sCell = mapgen.cells.filter(i => i.x == cell.x && i.y == cell.y + 1 && cell.y + 1 >= 0)[0]
  let wCell = mapgen.cells.filter(i => i.x == cell.x - 1 && i.y == cell.y && cell.x - 1 >= 0)[0]

  if (cell.n == true) {cell.n = nCell.id || false}
  if (cell.e == true) {cell.e = eCell.id || false}
  if (cell.s == true) {cell.s = sCell.id || false}
  if (cell.w == true) {cell.w = wCell.id || false}
})


console.log(mapgen)


// gameloop

// let input
// while (input != "q") {
//   // print out dungeon
//   // wait for user input
// }
