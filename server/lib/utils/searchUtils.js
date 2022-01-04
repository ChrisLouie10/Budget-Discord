function binarySearch(arr, val) {
  let start = 0;
  let end = arr.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);

    if (arr[mid] == val) return true;
    if (arr[mid] < val) start = mid + 1;
    else end = mid - 1;
  }

  return false;
}

module.exports = {
  binarySearch,
};
