function parseIntegers (arr) {
  if (!Array.isArray(arr)) {
    throw new Error("Value passed must be an array!");
  }
  var finalArr = [];
  recursiveParse(arr);
  function recursiveParse (arr) {
    for (var i = 0; i < arr.length; i++) {
      if (Array.isArray(arr[i])) {
        recursiveParse(arr[i]);
      } else if (typeof(arr[i]) !== "number") {
        throw new Error("Array must only contain numbers.");
      } else {
        finalArr.push(arr[i]);
      }
    }
  }
  return finalArr;
}

console.log(parseIntegers([[1, 2, 3, 4], [1, [2, 3, 4]]]));
