class Room{

  constructor(ctx, isStarter = false) {
    this.ctx = ctx
    let room = {}
    room.id = lib.rand(1000, 9999)
    room.doors = this.generateDoors()
    if( !isStarter ) {
      room.content = this.generateContent()
    }
    return room
  }

  generateContent() {
    let content = []
    for( let contentBox of this.ctx.config.roomContent) {
      for (let i = 0; i < contentBox[1]; i++) {
        content.push(contentBox[0])
      }
    }
    let rand = lib.rand(0, content.length)
    return content[rand]
  }

  //@todo this could generate a starter room with no doors
  generateDoors() {
    return {
      N: lib.rand(0,1) == 0 ? true : false,
      S: lib.rand(0,1) == 0 ? true : false,
      E: lib.rand(0,1) == 0 ? true : false,
      W: lib.rand(0,1) == 0 ? true : false,
    }
  }
}

class Level {}

class Shop {}

class Living {}

class Player extends Living {}

class Monster extends Living {}

class Puzzle {}

class Item {}

class Key extends Item {}

class Potion extends Item {}

class Treasure extends Item {}

class Dungeon {
  ctx = {
    player: {},
    dungeon: {
      rooms: []
    }
  }
  constructor(config = {}) {
    this.ctx.config = config
    let startRoom = new Room(this.ctx, true)
    this.ctx.player = {
      health   : 4,
      loc      : 0,   // roomid ?
      money    : 0,
      inventory: []   //@todo to implement later
    }
    this.ctx.dungeon.rooms.push(startRoom)
    // this.#roomIter(this.ctx.dungeon.rooms[0]) // starting room
  }

  #roomIter(room) {
  console.log("creating room from", room.id)

    // if enough rooms made
    if (this.ctx.dungeon.rooms.length > 2) {
      console.log("too many rooms!")
      return false
    }

    // iterate over doors
    for (let door in room.doors) {
      console.log("checking door", door)

      // if door exists
      if (room.doors[door]) {
      console.log(door, "exists!")

        // create new room
        let newRoom = new Room(this.ctx)
        console.log("new room created:", newRoom.id)
        
        // attach new room to old room door
        room.doors[door] = newRoom.id

        // grab doorway from old room
        let doorway
        switch(door){
          case "N":
            doorway = "S"
            break
          case "S":
            doorway = "N"
            break
          case "E":
            doorway = "W"
            break
          case "W":
            doorway = "E"
            break
        }

        console.log("connecting door", door, "to new room's", doorway, "door")
        // point the new room to the old room
        newRoom.doors[doorway] = room.id

        // store to dungeon
        this.ctx.dungeon.rooms.push(newRoom)
        
        // recurse over newly-created room
        this.#roomIter(newRoom)
      }
    }

  }

  createRoom() {
    return new Room()
  }

  travel(cardinalDir) {
    //@todo something to do with ctx here
    // most likely using room ids. not sure how. array of arrays?

  }
}


//=======================================================

const config = require('./config.json')

lib = new class Lib {
  rand(min = 0, max = 100) {
    return Math.round(Math.random() * (max - min) + min)
  }
}

let dungeon = new Dungeon(config)
console.log(dungeon.ctx.dungeon.rooms)

// gameloop

// let input
// while (input != "q") {
//   // print out dungeon
//   // wait for user input
// }

