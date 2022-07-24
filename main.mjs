class Living {
  health = 4
  maxHealth = 4

  constructor() {}

  hurt(amt) {
    this.health = Math.max(this.health - amt, 0)
  }

  heal(amt) {
    this.health = Math.min(this.health + amt, this.maxHealth)
  }
}

class Player extends Living {
  money = 0
}

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

let roomsToAdd = [
  {type: "fountain"},
  {type: "monster", monster: {health: 4}, reward: {type: "gold", amount: 2}},
  {type: "levelup"},
  {type: "descend"},
  {type: "treasure", amount: 1}
]

let mapStart = lib.sample(mapgen.cells)
mapStart.roomType = {type: "ascend"}

mapgen.cells.forEach(room => {
  if (room.roomType) {return}

  // remove from available rooms
  let roomType = lib.sample(roomsToAdd) || {type: "empty"}
  roomsToAdd.splice(roomsToAdd.indexOf(roomType), 1)

  room.roomType = roomType
})

let currentCell = mapStart // cell, not id

// interface for sending stuff to the player
let play = {
  
}

let game = {
  nav(dir) {
    let newCell

    if (currentCell.roomType.type == "monster") {
      let monsterDmg = currentCell.monsterHitsFor || this.getDmgFrom(currentCell.roomType.monster)
      let dmgTaken = Math.ceil(monsterDmg - lib.rand(monsterDmg - 1))
      this.player.hurt(dmgTaken)
      noctis.send(`bypassing monster, took ${dmgTaken} damage!`)
      delete currentCell.monsterHitsFor
    }

    switch (dir) {
      case "up":
      this.lastLog = "moved north"
        newCell = mapgen.getCell(currentCell.n)
        break
      case "right":
      this.lastLog = "moved east"
        newCell = mapgen.getCell(currentCell.e)
        break
      case "down":
      this.lastLog = "moved south"
        newCell = mapgen.getCell(currentCell.s)
        break
      case "left":
      this.lastLog = "moved west"
        newCell = mapgen.getCell(currentCell.w)
        break
    }

    if (newCell == undefined) {
      this.lastLog += ", cannot move there!"
      this.print()
      return
    }

    this.moveToCell(newCell)
  },

  moveToCell(cell) {
    currentCell = cell
    // noctis.clearConsole(99)
    this.print()
    this.enterRoom()
  },

  enterRoom() {
    switch (currentCell.roomType.type) {
      case "treasure":
        this.player.money += currentCell.roomType.amount
        this.lastLog = `aquired ${currentCell.roomType.amount} gold`
        delete currentCell.roomType.amount
        currentCell.roomType.type = "empty"
        break
      case "monster":
        currentCell.monsterHitsFor = currentCell.monsterHitsFor || this.getDmgFrom(currentCell.roomType.monster)
        this.lastLog = `found monster: ${currentCell.monsterHitsFor} / ${currentCell.roomType.monster.health}`
        break
    }
  },

  interact() {
    switch (currentCell.roomType.type) {
      case "empty":
        this.lastLog = "nothing of importance"
        break
      case "ascend":
        this.lastLog = "not supported yet"
        break
      case "descend":
        this.lastLog = "not supported yet"
        break
      case "levelup":
        this.lastLog = "not supported yet"
        break
      case "monster":
        this.playerHitsFor =  this.getDmgFrom(this.player)
        // do math here for who takes damage

        
        break
      case "fountain":
        this.player.heal(999)
        // noctis.clearConsole(99)
        break
    }

    this.print()
  },

  print() {    
    // noctis.send(mapgen.showHex(" ", " "))
    // noctis.send(mapgen.showMap(" ", currentCell))
    noctis.send("\n")
    noctis.send(mapgen.showHex(" ", " "))
    noctis.send("cell:", currentCell.hex)
    noctis.send("type:", currentCell.roomType)
    noctis.send("player:", game.player)
    noctis.send("\n")
    noctis.send(game.lastLog)
  },

  getDmgFrom(entity) {
    return lib.rand(entity.health - 1) + 1
  }

}

game.player = new Player()

// gameloop
var stdin = process.stdin

// without this, we would only get streams once enter is pressed
stdin.setRawMode( true )

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume()

// i don't want binary, do you?
stdin.setEncoding( 'utf8' )

// print out dungeon
noctis.clearConsole(99)
game.print()

// on any data into stdin
stdin.on( 'data', function( key ){
  // console.log(key)
  if (key == '\u001B\u005B\u0041') {
    game.nav("up")
    return
  }
  if (key == '\u001B\u005B\u0043') {
    game.nav("right")
    return
  }
  if (key == '\u001B\u005B\u0042') {
    game.nav("down")
    return
  } 
  if (key == '\u001B\u005B\u0044') {
    game.nav("left")
    return
  }
  // ctrl-c ( end of text )
  if ( key === '\u0003' ) {
    process.exit()
  }
  if (key = ' ') {
    game.interact()
    return
  }

  // used to check keys
  // console.log(JSON.stringify(key))

})
