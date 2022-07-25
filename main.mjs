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
  maxHealth = 6
  health = 6
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
class Dungeon {} //@todo move game into here


//=======================================================

// const config = require('./config.json')

import mapgen from './MapGen.mjs'
import process from 'process'
import Noctis from './Noctis.mjs'
import Lib from './Lib.mjs'

let lib = new Lib()
let noctis = new Noctis()

//@todo move logs into game
let logs = []

let roomsToAdd = [
  {type: "fountain"},
  {type: "monster", monster: {health: 4}, reward: {type: "gold", amount: 2}},
  {type: "levelup"},
  {type: "descend"},
  {type: "treasure", amount: 1}
]


// interface for sending information to the player (audio)
// @todo make this its own class
let play = {
  
}

//@todo convert game into proper class Game
let game = {
  nav(dir) {
    let newCell

    if (currentCell.roomType.type == "monster") {
      let monsterDmg = currentCell.monsterHitsFor || this.getDmgFrom(currentCell.roomType.monster)
      let dmgTaken = Math.ceil(monsterDmg - lib.rand(monsterDmg - 1))
      this.player.hurt(dmgTaken)
      logs.push(`bypassing monster, took ${dmgTaken} damage!`)

      //@fixme this is wet code (see below)
      if (this.player.health < 1) {
        logs.push(`died to monster!`)
        this.end()
      }

      delete currentCell.monsterHitsFor
    }

    let msg
    switch (dir) { //@todo there's gotte be a better way to do this, very wet
      case "up":
      msg = "moved north"
        newCell = this.currentLevel.getCell(currentCell.n)
        break
      case "right":
      msg = "moved east"
        newCell = this.currentLevel.getCell(currentCell.e)
        break
      case "down":
      msg = "moved south"
        newCell = this.currentLevel.getCell(currentCell.s)
        break
      case "left":
      msg = "moved west"
        newCell = this.currentLevel.getCell(currentCell.w)
        break
    }

    if (newCell == undefined) {
      msg += ", cannot move there!"
      logs.push(msg)
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
    this.print()
  },

  enterRoom() {
    switch (currentCell.roomType.type) {
      case "treasure":
        this.player.money += currentCell.roomType.amount
        logs.push(`aquired ${currentCell.roomType.amount} gold`)
        delete currentCell.roomType.amount
        currentCell.roomType.type = "empty"
        break
      case "monster":
        currentCell.monsterHitsFor = currentCell.monsterHitsFor || this.getDmgFrom(currentCell.roomType.monster)
        logs.push(`found monster: ${currentCell.monsterHitsFor} / ${currentCell.roomType.monster.health}`)
        break
    }
  },

  interact() {
    switch (currentCell.roomType.type) {
      case "empty":
        logs.push("nothing of importance")
        break
      case "ascend":
        logs.push("not supported yet")
        break
      case "descend":
        logs.push("not supported yet")
        break
      case "levelup":
        this.player.maxHealth += 1
        logs.push(`leveled up to ${this.player.maxHealth}!`)
        currentCell.roomType.type = "empty"
        break
      case "monster":
        this.playerHitsFor = Math.ceil(this.getDmgFrom(this.player))
        currentCell.monsterHitsFor = Math.ceil(currentCell.monsterHitsFor) || Math.ceil(this.getDmgFrom(currentCell.roomType.monster))
        logs.push(`you    : ${this.playerHitsFor} / ${this.player.health}`)
        logs.push(`monster: ${currentCell.monsterHitsFor} / ${currentCell.roomType.monster.health}`)

        // do math here for who takes damage
        let calc = this.playerHitsFor - currentCell.monsterHitsFor
        let dmg = Math.abs(calc)
        if (calc == 0) {
          // tie
          let coin = !!lib.rand(1)
          dmg = lib.rand(1, 3)
          let msg = coin ? `both take ${dmg} damage` : "no damage taken"
          
          logs.push(`tie! ${msg}`)
          
        } else
        if (calc > 0) {
          // player wins
          logs.push(`dealt ${dmg} of damage to monster`)
          //@todo convert monster to new Monster()
          currentCell.roomType.monster.health -= dmg
          delete currentCell.monsterHitsFor

          if (currentCell.roomType.monster.health < 1) {
            logs.push(`killed monster!`)
            //@todo I need an inventory controller
            this.player.money += currentCell.roomType.reward.amount
            currentCell.roomType.type = "empty"
            delete currentCell.roomType.reward
            delete currentCell.roomType.monster
          }
        } else {
          // monster wins
          logs.push(`taken ${dmg} of damage from monster`)
          this.player.hurt(dmg)
          
          //@fixme this is wet (see above)
          if (this.player.health < 1) {
            logs.push(`died to monster!`)
            this.end()
          }
        }
        
        break
      case "fountain":
        if (this.player.health == this.player.maxHealth) {
          logs.push("already healed")
        } else {
          let healed = this.player.maxHealth - this.player.health
          logs.push(`healed ${healed} back to ${this.player.maxHealth}`)
        }
        this.player.heal(999)
        break
    }

    this.print()
  },

  print() {    
    // noctis.send(this.currentLevel.showHex(" ", " "))
    // noctis.send(this.currentLevel.showMap(" ", currentCell))
    // noctis.send("\n")
    noctis.clearConsole(20)

    noctis.send(this.currentLevel.showHex(" ", " "))
    noctis.send("cell:", currentCell.hex)
    noctis.send("type:", currentCell.roomType)
    noctis.send("player:", game.player)
    noctis.send("\n")

    let lastMsgs = logs.slice(-4)

    noctis.send(lastMsgs)
  },

  getDmgFrom(entity) {
    return lib.rand(entity.health - 1) + 1
  },

  end(){
    logs.push(`Game over!`)
    this.print()
    process.exit()
  },

  genNewLevel() {
    let newGame = (new mapgen()).generate(6)
    game.levels.push(newGame)
    this.currentLevel = newGame
  }

}

game.levels = []

game.player = new Player()


game.genNewLevel()

let mapStart = lib.sample(game.currentLevel.cells)
mapStart.roomType = {type: "ascend"}

let currentCell = mapStart // cell, not id

game.currentLevel.cells.forEach(cell => {
  // console.log(cell)
  let nCell = game.currentLevel.cells.filter(i => i.x == cell.x && i.y == cell.y - 1 && cell.y - 1 >= 0)[0]
  let eCell = game.currentLevel.cells.filter(i => i.x == cell.x + 1 && i.y == cell.y && cell.x + 1 >= 0)[0]
  let sCell = game.currentLevel.cells.filter(i => i.x == cell.x && i.y == cell.y + 1 && cell.y + 1 >= 0)[0]
  let wCell = game.currentLevel.cells.filter(i => i.x == cell.x - 1 && i.y == cell.y && cell.x - 1 >= 0)[0]

  if (cell.n == true) {cell.n = nCell.id || false}
  if (cell.e == true) {cell.e = eCell.id || false}
  if (cell.s == true) {cell.s = sCell.id || false}
  if (cell.w == true) {cell.w = wCell.id || false}
})

game.currentLevel.cells.forEach(room => {
  if (room.roomType) {return}

  // remove from available rooms
  let roomType = lib.sample(roomsToAdd) || {type: "empty"}
  roomsToAdd.splice(roomsToAdd.indexOf(roomType), 1)

  room.roomType = roomType
})


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
    game.end()
  }
  if (key = ' ') {
    game.interact()
    return
  }

  // used to check keys
  // console.log(JSON.stringify(key))

})
