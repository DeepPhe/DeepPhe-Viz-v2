export const flattenObject = (obj, parent) => {
  const flattened = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, key));
    } else {
      flattened[parent + "." + key] = value;
    }
  });
  return flattened;
};

export const fastIntersection = (...arrays) => {
  // Handle edge cases
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return [...new Set(arrays[0])]; // Remove duplicates

  // Use frequency counter approach
  const counts = new Map();

  // Count items in first array
  for (const item of arrays[0]) {
    counts.set(item, 1);
  }

  // For each subsequent array, increment count for items that exist
  for (let i = 1; i < arrays.length; i++) {
    const currentArray = arrays[i];
    const seen = new Set(); // Track items we've seen in this array

    for (const item of currentArray) {
      // Only count each unique item once per array
      if (!seen.has(item) && counts.has(item)) {
        counts.set(item, counts.get(item) + 1);
        seen.add(item);
      }
    }
  }

  // Return items that appear in all arrays
  return Array.from(counts.entries())
    .filter(([_, count]) => count === arrays.length)
    .map(([item]) => item);
};

export const newerfastIntersection = (...arrays) => {
  // Handle edge cases
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return [...arrays[0]];

  // Sort arrays by length (ascending)
  const ordered = arrays.sort((a1, a2) => a1.length - a2.length);
  const result = [];

  // Get unique items from shortest array
  const uniqueItems = [...new Set(ordered[0])];

  // Binary search function
  const binarySearch = (arr, target) => {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid] === target) return true;
      if (arr[mid] < target) left = mid + 1;
      else right = mid - 1;
    }

    return false;
  };

  // Check each unique item from shortest array
  for (const item of uniqueItems) {
    // Use binary search to check if item exists in all other arrays
    let inAllArrays = true;
    for (let i = 1; i < ordered.length; i++) {
      if (!binarySearch(ordered[i], item)) {
        inAllArrays = false;
        break;
      }
    }

    if (inAllArrays) {
      result.push(item);
    }
  }

  return result;
};

export const fastIncludes = (array, item) => {
  //assume the array is sorted
  let left = 0;
  let right = array.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (array[mid] === item) {
      return true;
    } else if (array[mid] < item) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return false;
};

export const oldfastIntersection = (...arrays) => {
  // if we process the arrays from shortest to longest
  // then we will identify failure points faster, i.e. when
  // one item is not in all arrays

  const ordered = arrays.length === 1 ? arrays : arrays.sort((a1, a2) => a1.length - a2.length),
    shortest = ordered[0],
    set = new Set(), // used for bookeeping, Sets are faster
    result = []; // the intersection, conversion from Set is slow
  // for each item in the shortest array
  for (let i = 0; i < shortest.length; i++) {
    const item = shortest[i];
    // see if item is in every subsequent array
    let every = true; // don't use ordered.every ... it is slow
    for (let j = 1; j < ordered.length; j++) {
      if (ordered[j].includes(item)) continue;
      every = false;
      break;
    }
    // ignore if not in every other array, or if already captured
    if (!every || set.has(item)) continue;
    // otherwise, add to bookeeping set and the result
    set.add(item);
    result[result.length] = item;
  }
  return result;
};
