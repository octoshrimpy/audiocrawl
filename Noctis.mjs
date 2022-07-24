class Noctis {
  static ctx = new Noctis()
  currentMSg = []
  useStatus = false
  statusPrefix = "[ "
  statusCenter = null
  statusSuffix = " ] "
  logWidth = 0

  static updateMessage = (...args) => new Noctis().updateMessage(...args)
  updateMessage(msg) {
    let ctx = Noctis.ctx
    ctx.currentMSg = msg
    ctx.replace(ctx.currentMSg)

    return ctx
  }

  static updateStatus = (...args) => new Noctis().updateStatus(...args)
  updateStatus(status) {
    let ctx = Noctis.ctx
    ctx.statusCenter = status
    ctx.replace(ctx.currentMSg)

    return ctx
  }

  static getStatus = (...args) => new Noctis().getStatus(...args)
  getStatus() {
    let ctx = Noctis.ctx
    return ctx.statusPrefix + ctx.statusCenter + ctx.statusSuffix
  }

  static withStatus = (...args) => new Noctis().withStatus(...args)
  withStatus(length = 1) {
    let ctx = Noctis.ctx
    ctx.useStatus = true
    ctx.statusCenter = " ".repeat(length)
    return ctx
  }

  static send = (...args) => new Noctis().send(...args)
  send(...args) {
    let ctx = Noctis.ctx
    ctx.currentMSg = args
    ctx.print()
    return ctx
  }

  static append = (...args) => new Noctis().append(...args)
  append(...args) {
    let ctx = Noctis.ctx
    ctx.clearConsole()
    ctx.currentMSg.push(...args)
    ctx.print()
    return ctx
  }

  static replace = (...args) => new Noctis().replace(...args)
  replace(...args) { 
    let ctx = Noctis.ctx
    ctx.clearConsole()
    ctx.send(...args)
    return ctx
  }

  // https://stackoverflow.com/a/65863081
  static clearConsole = (...args) => new Noctis().clearConsole(...args)
  async clearConsole(count = 1) { 
    let ctx = Noctis.ctx

    let width = process.stdout.columns
    let length = ctx.logWidth
    let lineWrapCount = Math.floor(length/width) + 1

    let finalCount = lineWrapCount * count

    for (let iter = 1; iter <= finalCount; iter++) {
      process.stdout.moveCursor(0, -1) // up one line
      process.stdout.clearLine(1) // from cursor to end
    }
    return ctx
  }

  static print = (...args) => new Noctis().print(...args)
  print() {
    let log = console.log

    let ctx = Noctis.ctx
    let args = Array.from(ctx.currentMSg)
    
    if (ctx.useStatus) {
      args.unshift(ctx.getStatus())
    }
    
    log.apply(console, args)
    
    // ctx.logWidth = JSON.stringify(args).length
    // let length = 0
    // args.forEach(arg => length += JSON.stringify(arg).length)
    // console.dir(length)
    return ctx
  }
}

export default Noctis


// // set it up
// console.n = new Noctis()
// let noctis = new Noctis()




// // use it
// console.n.withStatus().send("foo")
// noctis.updateStatus('o')
// Noctis.updateMessage("bar")




// // and some fun, too

// // setup timings
// function sleep(ms){
//     return new Promise(res => {
//         setTimeout(res, ms);
//     });
// }

// // setup typing
// async function type(msg, speedMod = 1){
//   let sleepTime = 40 + (10*speedMod)

//   Noctis.send(msg[0])
//   for (let letter of msg.slice(1).split("")) {
//     // console.log
//     await sleep(sleepTime)
//     Noctis.append(letter)
//   }
// }

// // grant sentience
// (async () => {
//   await type("hello human")
//   await type("this is slow", 10)
//   await type("and this is really fast, so fast your human eyes cannot even keep up ha ha ha ha", -5)
//   Noctis.updateStatus("x")
//   Noctis.updateMessage("this is test")
// })()