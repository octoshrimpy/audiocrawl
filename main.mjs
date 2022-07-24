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
import process from 'process'
import Noctis from './Noctis.mjs'
import Lib from './Lib.mjs'

let lib = new Lib()
let noctis = new Noctis()

mapgen.generate(6)

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


let mapStart = lib.sample(mapgen.cells)

let currentCell = mapStart // cell, not id

let game = {
  nav(dir) {
    let newCell
    switch (dir) {
      case "up":
        newCell = mapgen.getCell(currentCell.n)
      case "right":
        newCell = mapgen.getCell(currentCell.e)
      case "left":
        newCell = mapgen.getCell(currentCell.s)
      case "down":
        newCell = mapgen.getCell(currentCell.w)
    }
    console.log(newCell)

    this.moveToCell(newCell)
  },

  moveToCell(cell) {
    currentCell = cell
    noctis.clearConsole(99)
    this.print()
  },

  print() {    
    noctis.send(mapgen.showHex())
    noctis.send("\n")
    noctis.send("cell:", currentCell)
  }

}


// gameloop
var stdin = process.stdin


// wait for user input

// without this, we would only get streams once enter is pressed
stdin.setRawMode( true )

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume()

// i don't want binary, do you?
stdin.setEncoding( 'utf8' )

// print out dungeon
game.print()

// on any data into stdin
stdin.on( 'data', function( key ){
  // ctrl-c ( end of text )
  if (key == '\u001B\u005B\u0041') {
    game.nav("up")

  }
  if (key == '\u001B\u005B\u0043') {
    game.nav("right")

  }
  if (key == '\u001B\u005B\u0042') {
    game.nav("down")

  }
  if (key == '\u001B\u005B\u0044') {
    game.nav("left")

  }
  if ( key === '\u0003' ) {
    process.exit()
  }

})
