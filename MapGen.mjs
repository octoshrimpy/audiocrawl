import Lib from './Lib.mjs'
let lib = new Lib()


class Cell {
  static base = 16

  constructor(id) {
    // ID is unused, but helpful for debugging
    this.id = id

    // symbol within cell for visual debugging
    this.symbol = ""
    
    this.n = false
    this.e = false
    this.s = false
    this.w = false

    this.x = 0
    this.y = 0

    this.hex = "0"
  }

  place(x, y) {
    this.x = x
    this.y = y

    return this
  }

  neighbors() {
    return [this.n, this.e, this.s, this.w].reduce(function(sum, val) {
      return sum + (val ? 1 : 0)
    })
  }

  toBinary() {
    return [
      this.n ? "1" : "0",
      this.e ? "1" : "0",
      this.s ? "1" : "0",
      this.w ? "1" : "0",
    ].join("")
  }

  toHex() {
    return this.hex = parseInt(this.toBinary(), 2).toString(16)
  }

}

class Algorithm {
  static DIRS = {
    n: [0, -1],
    e: [1, 0],
    s: [0, 1],
    w: [-1, 0],
  }

  static inverseDir(dir) {
    switch (dir) {
      case "n": return "s"
      case "e": return "w"
      case "s": return "n"
      case "w": return "e"
    }
  }

  static genCell(dungeon, cell) {
    cell = cell || lib.sample(dungeon.cells) || dungeon.findOrGenCell()
    let dir = lib.sample(Object.keys(Algorithm.DIRS))
    let [x, y] = Algorithm.DIRS[dir]

    if (dungeon.branches == "low") {
      // The more branches exist, the less likely it is to add a new one
      if (lib.rand(cell.neighbors() + 1) > 0) { return }
    } else if (dungeon.branches == "med") {
      // No-op
      // If an existing direction is chosen, skip (skip is from `if (cell[dir]) { return }` below)
    } else if (dungeon.branches == "high") {
      // Always add a branch when the cell is selected
      if (cell.neighbors() < 4 && cell[dir]) {
        this.genCell(dungeon, cell)
        //@todo 
        // I would expect the below to work instead of recursive calling, but it throws a weird err
        // while (cell[dir]) {
        //   dir = lib.sample(Object.keys(Algorithm.DIRS))
        //   [x, y] = Algorithm.DIRS[new_dir]
        // }
      }
    }
    // Skip recalculations if the branch already exists
    if (cell[dir]) { return }

    cell[dir] = true
    let new_cell = dungeon.findOrGenCell(cell.x + x, cell.y + y)
    new_cell[this.inverseDir(dir)] = true

    // Recalculate stored values - mostly for debugging
    cell.toHex()
    new_cell.toHex()
  }
}

class Dungeon {
  constructor(cell_count = 0, opts={}) {
    this.cell_count = cell_count
    this.cells = []
    this.branches = opts.branches || "high" // "low", "med", "high"
  }

  generate(cell_count = this.cell_count) {
    this.cell_count = cell_count
    while (this.cells.length < this.cell_count) { Algorithm.genCell(this) }
    // Fix map so that arrays don't have negative values
    this.calculateOffsets()
  }

  calculateOffsets() {
    let dungeon = this
    this.min_x = 0
    this.min_y = 0
    this.max_x = 0
    this.max_y = 0

    // Find the min/max values of x/y
    this.cells.forEach(function(cell) {
      if (cell.x < dungeon.min_x) { dungeon.min_x = cell.x }
      if (cell.y < dungeon.min_y) { dungeon.min_y = cell.y }

      if (cell.x > dungeon.max_x) { dungeon.max_x = cell.x }
      if (cell.y > dungeon.max_y) { dungeon.max_y = cell.y }
    })
    // Change the x/y values based on the min/max so that we don't have
    //   negatives since arrays don't understand that.
    this.cells.forEach(function(cell) {
      cell.x -= dungeon.min_x
      cell.y -= dungeon.min_y
    })
    // Sort cells left/right up/down just for debugging purposes
    this.cells = this.cells.sort(function(cell1, cell2) {
      let y_diff = cell1.y - cell2.y
      if (y_diff != 0) { return y_diff}

      return cell1.x - cell2.x
    })

    // Sets some helper values for generating the map later
    this.width = (this.max_x - this.min_x) + 1
    this.height = (this.max_y - this.min_y) + 1
  }

  findOrGenCell(x=0, y=0) {
    let new_cell = this.findCell(x, y)
    if (new_cell) { return new_cell }

    new_cell = (new Cell(this.cells.length + 1)).place(x, y)
    this.cells.push(new_cell)
    return new_cell
  }

  findCell(x=0, y=0) {
    return this.cells.find(function(cell) {
      return cell.x == x && cell.y == y
    })
  }

  // Unused, but helpful for debugging
  getCell(id) {
    return this.cells.find(function(cell) {
      return cell.id == id
    })
  }

  toHex() {
    let dungeon = this
    if (this.cells.length == 0) { this.generate() }

    let map = Array(dungeon.height).fill().map(function(_, y) {
      return Array(dungeon.width).fill().map(function(_, x) {
        return "0"
      })
    })

    this.cells.forEach(function(cell) {
      map[cell.y][cell.x] = cell.toHex()
    })

    return map
  }

  toCells(cell_width=5) { // Must be an odd number > 1
    let dungeon = this
    let compact = this.toHex()
    let half_cell = Math.floor(cell_width / 2)
    console.log(dungeon)

    let map = Array(dungeon.height * cell_width).fill().map(function(_, y) {
      return Array(dungeon.width * cell_width).fill().map(function(_, x) {
        return " "
      })
    })

    compact.forEach(function(row, y) {
      row.forEach(function(cell_hex, x) {
        if (cell_hex == "0") { return } // Blank cell, skip
        let origin_x = (x * cell_width)
        let origin_y = (y * cell_width)
        let center_x = origin_x + half_cell
        let center_y = origin_y + half_cell

        // View what the hex value is for the center
        // map[center_y][center_x] = cell_hex
        let cell_binary = parseInt(cell_hex, 16).toString(2).padStart(4, "0")
        let [n, e, s, w] = cell_binary.split("").map(function(char) { return char == "1" })
        // Bridges
        if (n) { map[center_y - half_cell][center_x] = "#" }
        if (e) { map[center_y][center_x + half_cell] = "#" }
        if (s) { map[center_y + half_cell][center_x] = "#" }
        if (w) { map[center_y][center_x - half_cell] = "#" }
        // Box
        Array(cell_width - 2).fill().forEach(function(_, cell_y) {
          Array(cell_width - 2).fill().forEach(function(_, cell_x) {
            let x_border = cell_x == 0 || cell_x == cell_width - 3
            let y_border = cell_y == 0 || cell_y == cell_width - 3
            if (x_border || y_border) {
              map[origin_y + (cell_y + 1)][origin_x + (cell_x + 1)] = "#"
            }
          })
        })
        map[center_y][center_x] = "g"
      })
    })

    return map
  }

  showCells() {
    return this.toCells().map(function(row) { return row.join(" ") }).join("\n")
  }

  showHex() {
    return this.toHex().map(function(row) { return row.join(" ") }).join("\n")
  }
}


// let dungeon = new Dungeon(6)

// console.log(dungeon)

// console.log(dungeon.toHex().map(function(row) { return row.join(" ") }).join("\n"));
// console.log(dungeon.toCells().map(function(row) { return row.join(" ") }).join("\n"));


let mapgen = new Dungeon() 
export default mapgen