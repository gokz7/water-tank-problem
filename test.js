/*
  ============================================================================
  test.js - CHECKS THAT THE LOGIC IS CORRECT
  ============================================================================

  What this file does:
    It runs the two functions from water.js on known inputs and compares
    the result with the answer we expect. It prints PASS or FAIL for each.

  How to run:
    node test.js

  Where the expected answers come from:
    Worked out by hand. The comment next to each case shows the water
    above each column, so anyone can add them up and check.
  ============================================================================
*/


/* ----------------------------------------------------------------------------
   STEP 1: LOAD THE FUNCTIONS
   Bring in parseHeights() and computeWater() from water.js.
---------------------------------------------------------------------------- */
const { parseHeights, computeWater } = require("./water.js"); // load the logic file


/* ----------------------------------------------------------------------------
   STEP 2: WATER CALCULATION TESTS
   Each line is [input heights, expected total water].
   Covers the brief's example plus edge cases:
   rising only, falling only, all zeros, one block, and an empty list.
---------------------------------------------------------------------------- */
const cases = [                                                     // [input, expected total]
  [[0, 4, 0, 0, 0, 6, 0, 6, 4, 0], 18],                             // example from the PDF: 0,0,4,4,4,0,6,0,0,0
  [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], 6],                        // well-known case: 0,0,1,0,1,2,1,0,0,1,0,0
  [[4, 2, 0, 3, 2, 5], 9],                                          // 0,2,4,1,2,0
  [[3, 0, 3], 3],                                                   // one gap between equal walls
  [[1, 2, 3, 4], 0],                                                // only rising: water flows off
  [[4, 3, 2, 1], 0],                                                // only falling: water flows off
  [[0, 0, 0], 0],                                                   // no blocks at all
  [[5], 0],                                                         // a single block holds nothing
  [[], 0],                                                          // empty list
];


/* ----------------------------------------------------------------------------
   STEP 3: RUN THE WATER TESTS
   For each case: compute the total, compare it with the expected answer,
   print the result, and count any failures.
---------------------------------------------------------------------------- */
let failed = 0;                                                     // count of failed tests
for (const [input, expected] of cases) {                            // run every test case
  const got = computeWater(input).total;                            // our answer
  const ok = got === expected;                                      // does it match?
  if (!ok) failed++;                                                // remember failures
  console.log(`${ok ? "PASS" : "FAIL"}  [${input}] -> ${got} (expected ${expected})`);
}


/* ----------------------------------------------------------------------------
   STEP 4: INPUT CHECK TESTS
   Each line is [what the user types, should it be accepted?].
   The brief says n > -1, so negatives must be rejected. Decimals, text
   and empty input must also be rejected.
---------------------------------------------------------------------------- */
const inputChecks = [                                               // [typed text, should it be valid?]
  ["[0,4,0,0,0,6,0,6,4,0]", true],                                  // same format as the PDF
  ["0 4 0 6", true],                                                // spaces instead of commas
  ["0,-1,3", false],                                                // negative is not allowed (n > -1)
  ["0,2.5,3", false],                                               // decimals are not allowed
  ["0,abc,3", false],                                               // text is not allowed
  ["", false],                                                      // empty input
];


/* ----------------------------------------------------------------------------
   STEP 5: RUN THE INPUT CHECKS
   An input counts as "valid" when parseHeights() returns no error.
---------------------------------------------------------------------------- */
for (const [text, shouldBeValid] of inputChecks) {                  // run every input check
  const isValid = !parseHeights(text).error;                        // valid if there is no error
  const ok = isValid === shouldBeValid;                             // did it behave as expected?
  if (!ok) failed++;                                                // remember failures
  console.log(`${ok ? "PASS" : "FAIL"}  input "${text}" valid=${isValid}`);
}


/* ----------------------------------------------------------------------------
   STEP 6: FINAL SUMMARY
   Print the overall result. Exit code 0 means all passed, 1 means something
   failed (useful if this is ever run in an automatic check).
---------------------------------------------------------------------------- */
console.log(failed === 0 ? "\nAll tests passed." : `\n${failed} test(s) failed.`);
process.exit(failed === 0 ? 0 : 1);                                 // non-zero exit if anything failed
