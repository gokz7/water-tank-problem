/*
  ============================================================================
  water.js - THE LOGIC (no drawing here)
  ============================================================================

  What this file does:
    It has two jobs:
      1. parseHeights()  -> reads what the user typed and turns it into numbers
      2. computeWater()  -> finds how much water gets trapped

  The main idea in simple words:
    - Water can sit on a column only if there is a taller wall on BOTH sides.
    - The water rises up to the SHORTER of those two walls (it spills over
      the lower one).
    - So for every column:
          water = min(tallest wall on left, tallest wall on right) - height

  Worked example from the brief: [0,4,0,0,0,6,0,6,4,0]
    leftMax  = [0,4,4,4,4,6,6,6,6,6]
    rightMax = [6,6,6,6,6,6,6,6,4,0]
    min      = [0,4,4,4,4,6,6,6,4,0]
    water    = [0,0,4,4,4,0,6,0,0,0]   -> total = 18

  Speed:  O(n)  (three simple loops over the list)
  Memory: O(n)  (two helper lists)
  ============================================================================
*/


/* ----------------------------------------------------------------------------
   FUNCTION 1: parseHeights(text)

   What it does:
     Takes the text from the input box, for example "[0,4,0,6]" or "0 4 0 6",
     and turns it into a list of numbers like [0, 4, 0, 6].

   Why we need it:
     The brief says every height must be greater than -1, so only whole
     numbers 0, 1, 2, 3... are allowed. If the user types something wrong
     (a negative number, a decimal, a letter, or nothing at all) we send back
     a clear error message instead of a wrong answer.

   What it gives back:
     - On success: { heights: [0, 4, 0, 6] }
     - On failure: { error: "some message" }
---------------------------------------------------------------------------- */
function parseHeights(text) {

  // Step 1: Clean the text.
  // Remove the square brackets and any spaces at the start or end,
  // so "[0,4,0]" and "0,4,0" are treated the same way.
  const cleaned = text.replace(/[\[\]]/g, "").trim();         // remove [ and ] and outer spaces

  // Step 2: Stop early if the box is empty.
  if (cleaned === "") {                                        // nothing typed
    return { error: "Please enter at least one block height." };
  }

  // Step 3: Split the text into separate pieces.
  // Commas, spaces, or both can be used between numbers.
  const parts = cleaned.split(/[\s,]+/).filter(p => p !== ""); // split on commas and/or spaces

  // Step 4: Check every piece and turn it into a number.
  // The pattern /^\d+$/ means "only digits from start to end".
  // So "-1" (has a minus), "2.5" (has a dot) and "abc" (letters) all fail.
  const heights = [];                                          // final list of numbers
  for (const part of parts) {                                  // check each value one by one
    if (!/^\d+$/.test(part)) {                                 // only whole numbers 0,1,2... allowed
      return { error: `"${part}" is not valid. Heights must be whole numbers 0 or more.` };
    }
    heights.push(Number(part));                                // store the valid number
  }

  // Step 5: Every piece was valid, so send the list back.
  return { heights: heights };                                 // success: return the list
}


/* ----------------------------------------------------------------------------
   FUNCTION 2: computeWater(heights)

   What it does:
     Finds how much water sits above each column, and the total.

   How it works (3 passes):
     Pass 1 (left to right):  leftMax[i]  = tallest block from the start to i
     Pass 2 (right to left):  rightMax[i] = tallest block from i to the end
     Pass 3 (every column):   water[i]    = min(leftMax[i], rightMax[i]) - heights[i]

   Why water can never be negative:
     leftMax[i] and rightMax[i] both include heights[i] itself, so the
     smaller of them is always at least heights[i]. The lowest answer is 0.

   What it gives back:
     { water: [water above each column], total: total units }
---------------------------------------------------------------------------- */
function computeWater(heights) {

  // Set up: three lists the same length as the input, all starting at 0.
  const n = heights.length;                                    // number of blocks
  const leftMax = new Array(n).fill(0);                        // tallest wall on the left side
  const rightMax = new Array(n).fill(0);                       // tallest wall on the right side
  const water = new Array(n).fill(0);                          // water above each block

  // Pass 1: Walk from LEFT to RIGHT.
  // At each column, keep the bigger of "this block" and "the tallest seen
  // so far on the left". Example: [0,4,0,6] -> leftMax = [0,4,4,6]
  for (let i = 0; i < n; i++) {                                // walk left to right
    leftMax[i] = Math.max(heights[i], i > 0 ? leftMax[i - 1] : 0); // first column has nothing on its left
  }

  // Pass 2: Walk from RIGHT to LEFT.
  // Same idea, but now we track the tallest wall on the right.
  // Example: [0,4,0,6] -> rightMax = [6,6,6,6]
  for (let i = n - 1; i >= 0; i--) {                           // walk right to left
    rightMax[i] = Math.max(heights[i], i < n - 1 ? rightMax[i + 1] : 0); // last column has nothing on its right
  }

  // Pass 3: Work out the water for each column and add it all up.
  // The water level is the shorter wall. Take away the block height,
  // and what is left is the water standing on top of that block.
  // Example column 2 of the brief: min(4, 6) - 0 = 4 units.
  let total = 0;                                               // running total of water
  for (let i = 0; i < n; i++) {                                // check every position
    const level = Math.min(leftMax[i], rightMax[i]);           // water rises to the lower wall
    water[i] = level - heights[i];                             // water = level minus block
    total += water[i];                                         // add to the total
  }

  // Send back both the per-column water (used for drawing) and the total.
  return { water: water, total: total };                       // per-column water and total
}


/* ----------------------------------------------------------------------------
   EXPORT FOR TESTS

   What it does:
     Lets test.js (run with Node.js) load these two functions.

   Why the "if" check:
     In the browser there is no "module", so this part is skipped and the
     functions are simply available to app.js. In Node.js, "module" exists,
     so the functions get exported for testing.
---------------------------------------------------------------------------- */
if (typeof module !== "undefined") {                           // true only in Node.js
  module.exports = { parseHeights, computeWater };             // share the two functions
}
