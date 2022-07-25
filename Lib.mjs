export default class Lib {

  rand(min, max) {
    if (!min && !max) { return Math.random() }
    if (!max) {
      max = min
      min = 0
    } else {
      max += 1
    }

    return Math.floor(this.rand() * (max - min) + min)
  }

  sample(arr) {
    return arr[this.rand(arr.length)]
  }

  cloneDeep(arr) {
    return arr.map(item => Array.isArray(item) ? this.cloneDeep(item) : item)

  }

}
