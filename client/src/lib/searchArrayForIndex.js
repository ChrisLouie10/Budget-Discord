export default function searchArrayForIndex(nameKey, prop, myArray) {
  for (let i = 0; i < myArray.length; i += 1) {
    if (myArray[i][prop] === nameKey) {
      return i;
    }
  }
  return -1;
}
