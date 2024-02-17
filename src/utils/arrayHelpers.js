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
