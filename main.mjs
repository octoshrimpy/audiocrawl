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

    if (this.currentCell.roomType.type == "monster") {
      let monsterDmg = this.currentCell.monsterHitsFor || this.getDmgFrom(this.currentCell.roomType.monster)
      let dmgTaken = Math.ceil(monsterDmg - lib.rand(monsterDmg - 1))
      this.player.hurt(dmgTaken)
      logs.push(`bypassing monster, took ${dmgTaken} damage!`)

      //@fixme this is wet code (see below)
      if (this.player.health < 1) {
        logs.push(`died to monster!`)
        this.end()
      }

      // delete this.currentCell.monsterHitsFor
    }

    let msg
    switch (dir) { //@todo there's gotte be a better way to do this, very wet
      case "up":
      msg = "moved north"
        newCell = this.currentLevel.getCell(this.currentCell.n)
        break
      case "right":
      msg = "moved east"
        newCell = this.currentLevel.getCell(this.currentCell.e)
        break
      case "down":
      msg = "moved south"
        newCell = this.currentLevel.getCell(this.currentCell.s)
        break
      case "left":
      msg = "moved west"
        newCell = this.currentLevel.getCell(this.currentCell.w)
        break
    }

    if (newCell == undefined) {
      msg += ", cannot move there!"
    }

    logs.push(msg)
    
    if (newCell == undefined) { 
      this.print()
      return 
    }

    this.moveToCell(newCell)
  },

  moveToCell(cell) {
    this.currentCell = cell
    // noctis.clearConsole(99)
    this.enterRoom()
    this.print()
  },

  enterRoom() {
    switch (this.currentCell.roomType.type) {
      case "treasure":
        this.player.money += this.currentCell.roomType.amount
        logs.push(`aquired ${this.currentCell.roomType.amount} gold`)
        delete this.currentCell.roomType.amount
        this.currentCell.roomType.type = "empty"
        break

      case "monster":
        this.currentCell.monsterHitsFor = this.currentCell.monsterHitsFor || this.getDmgFrom(this.currentCell.roomType.monster)
        logs.push(`found monster: ${this.currentCell.monsterHitsFor} / ${this.currentCell.roomType.monster.health}`)
        break
    }
  },

  interact() {
    switch (this.currentCell.roomType.type) {
      case "empty":
        logs.push("nothing of importance")
        break

      case "ascend":
        logs.push("not supported yet")
        break
      
      case "descend":
        this.genNewLevel()
        logs.push("descended the stairs")
        break
      
      case "levelup":
        this.player.maxHealth += 1
        logs.push(`leveled up to ${this.player.maxHealth}!`)
        this.currentCell.roomType.type = "empty"
        break
      
      case "monster":
        this.playerHitsFor = Math.ceil(this.getDmgFrom(this.player))
        this.currentCell.monsterHitsFor = Math.ceil(this.currentCell.monsterHitsFor) || Math.ceil(this.getDmgFrom(this.currentCell.roomType.monster))
        logs.push(`you    : ${this.playerHitsFor} / ${this.player.health}`)
        logs.push(`monster: ${this.currentCell.monsterHitsFor} / ${this.currentCell.roomType.monster.health}`)

        // do math here for who takes damage
        let calc = this.playerHitsFor - this.currentCell.monsterHitsFor
        let dmg = Math.abs(calc)
        if (calc == 0) {
          // tie
          let coin = !!lib.rand(1)
          dmg = lib.rand(1, 3)
          let msg = coin ? `both take ${dmg} damage` : "no damage taken"
          //@fixme this isn't working, always no damage taken
          //@todo do damage to both parties if coin gods deem it so 
          
          logs.push(`tie! ${msg}`)
          
        } else
        if (calc > 0) {
          // player wins
          logs.push(`dealt ${dmg} of damage to monster`)
          //@todo convert monster to new Monster()
          this.currentCell.roomType.monster.health -= dmg
          delete this.currentCell.monsterHitsFor

          if (this.currentCell.roomType.monster.health < 1) {
            logs.push(`killed monster!`)
            //@todo I need an inventory controller
            this.player.money += this.currentCell.roomType.reward.amount
            this.currentCell.roomType.type = "empty"
            delete this.currentCell.roomType.reward
            delete this.currentCell.roomType.monster
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
    // noctis.send(this.currentLevel.showMap(" ", this.currentCell))
    // noctis.send("\n")

    // noctis.clearConsole(20)

    noctis.send(this.currentLevel.showHex(" ", " "))
    noctis.send("cell:", this.currentCell.hex)
    noctis.send("type:", this.currentCell.roomType.type)
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
    let newLevel = (new mapgen()).generate(6)
    this.currentLevel = newLevel

    let mapStart = lib.sample(this.currentLevel.cells)
    mapStart.roomType = {type: "ascend"}

    this.currentCell = mapStart // cell, not id
  
    console.log(roomsToAdd)
    let _rooms = lib.cloneDeep(roomsToAdd)
    console.log(_rooms)
    //@fixme rocco why does this _rooms var get modified when generating
    // the second dungeon level??? aargh

    this.currentLevel.cells.forEach(cell => {
      let nCell = this.currentLevel.cells.filter(i => i.x == cell.x && i.y == cell.y - 1 && cell.y - 1 >= 0)[0]
      let eCell = this.currentLevel.cells.filter(i => i.x == cell.x + 1 && i.y == cell.y && cell.x + 1 >= 0)[0]
      let sCell = this.currentLevel.cells.filter(i => i.x == cell.x && i.y == cell.y + 1 && cell.y + 1 >= 0)[0]
      let wCell = this.currentLevel.cells.filter(i => i.x == cell.x - 1 && i.y == cell.y && cell.x - 1 >= 0)[0]

      if (cell.n == true) {cell.n = nCell.id || false}
      if (cell.e == true) {cell.e = eCell.id || false}
      if (cell.s == true) {cell.s = sCell.id || false}
      if (cell.w == true) {cell.w = wCell.id || false}

      if (cell.roomType) {return}

      // remove from available rooms
      let roomType = lib.sample(_rooms) 
      _rooms.splice(_rooms.indexOf(roomType), 1)

      cell.roomType = roomType
    })

    game.levels.push(this.currentLevel)
  }

}

game.levels = []

game.player = new Player()


game.genNewLevel()



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
// noctis.clearConsole(99)
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
