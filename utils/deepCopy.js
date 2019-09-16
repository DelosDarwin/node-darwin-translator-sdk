module.exports = function deepCopy(obj) {
   return JSON.parse(JSON.stringify(obj))
}
