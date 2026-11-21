// A tiny seeded random generator (mulberry32). The same seed paints the same
// scene, which is what makes the screenshot scenes repeatable frame for frame.

export function createRandom(seed) {
  let state = seed | 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick an item from a list with the seeded generator.
export function pick(random, list) {
  return list[Math.floor(random() * list.length)];
}
