export function isEmpty(obj) {
  for (const i in obj) return false;
  return true;
}