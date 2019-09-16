export default function deepCopy(obj) {
   return JSON.parse(JSON.stringify(obj))
}
