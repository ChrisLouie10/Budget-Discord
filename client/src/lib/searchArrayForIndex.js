export default function searchArrayForIndex(nameKey, prop, myArray){
  for (var i=0; i < myArray.length; i++) {
      if (myArray[i][prop] === nameKey) {
          return i;
      }
  }
}