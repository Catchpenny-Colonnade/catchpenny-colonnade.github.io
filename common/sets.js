namespace("common.Sets",{},() => {
  const powerSet = function(arr) {
    const n = arr.length;
    const powerSetSize = 1 << n; // Equivalent to 2^n
    const result = [];

    for (let i = 0; i < powerSetSize; i++) {
      let subset = [];
      for (let j = 0; j < n; j++) {
        // Check if the j-th bit of i is set (1)
        if ((i & (1 << j)) > 0) {
          subset.push(arr[j]);
        }
      }
      result.push(subset);
    }

    return result;
  }
  return { powerSet };
});