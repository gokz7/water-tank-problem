/*
  ============================================================================
  app.js - THE PAGE CONTROLLER AND SVG DRAWING
  ============================================================================

  What this file does:
    It connects the web page to the logic in water.js.

  The flow in simple words:
    1. The user types heights (or clicks an example) and presses "Calculate".
    2. parseHeights() checks the input. computeWater() finds the water.
    3. drawGrid() builds two SVG pictures, like the two tables in the brief:
         - Chart 1: yellow blocks + blue water
         - Chart 2: only the blue water
    4. The total units and the water per column are shown as text.

  How the grid is measured:
    - Each grid cell is 1 unit of block or water.
    - Row 0 is the BOTTOM of the tank.
    - Grid height = tallest block + 2 empty rows on top (same as the brief).
  ============================================================================
*/


/* ----------------------------------------------------------------------------
   SETTINGS

   What these are:
     Fixed values used across the file, kept in one place so they are easy
     to change.

   Why the limits:
     The algorithm works for any size. But if there are too many columns or
     very tall blocks, each grid cell becomes too small to see. So we limit
     only the DRAWING, not the logic.
---------------------------------------------------------------------------- */
const SVG_NS = "http://www.w3.org/2000/svg";   // needed to create SVG elements from JavaScript
const CELL = 40;                               // size of one grid cell in SVG units
const LABEL_SPACE = 24;                        // space under the grid for column labels
const MAX_COLUMNS = 60;                        // most blocks we will draw
const MAX_HEIGHT = 40;                         // tallest block we will draw


/* ----------------------------------------------------------------------------
   HELPER: svgElement(tag, attributes)

   What it does:
     Makes one SVG shape (like a rectangle or text) and sets its attributes.

   Why we need it:
     SVG elements must be created with a special namespace (SVG_NS).
     Without it, the browser would treat <rect> as unknown HTML and draw
     nothing. This helper saves us from repeating that code every time.

   Example:
     svgElement("rect", { x: 0, y: 0, width: 40, height: 40 })
     -> a 40 x 40 square at the top-left corner
---------------------------------------------------------------------------- */
function svgElement(tag, attributes) {
  const el = document.createElementNS(SVG_NS, tag);           // make the element
  for (const key in attributes) {                             // copy each attribute onto it
    el.setAttribute(key, attributes[key]);
  }
  return el;                                                  // give back the finished shape
}


/* ----------------------------------------------------------------------------
   DRAWING: drawGrid(heights, water, showBlocks, title)

   What it does:
     Builds one full SVG grid picture.

   Inputs:
     heights    -> block height of each column, e.g. [0,4,0,6]
     water      -> water above each column,     e.g. [0,0,4,0]
     showBlocks -> true  = draw yellow blocks + blue water (Chart 1)
                   false = draw only blue water           (Chart 2)
     title      -> a description for screen readers

   How each cell's colour is chosen (r = row number from the bottom):
     r <  height            -> part of the block  -> YELLOW (or empty in Chart 2)
     r <  height + water    -> sits above block   -> BLUE water
     anything else          -> air above water    -> WHITE
---------------------------------------------------------------------------- */
function drawGrid(heights, water, showBlocks, title) {

  // Step 1: Work out the size of the picture.
  const cols = heights.length;                                // one column per block
  const rows = Math.max(...heights) + 2;                      // tallest block + 2 spare rows
  const width = cols * CELL;                                  // total drawing width
  const height = rows * CELL + LABEL_SPACE;                   // total drawing height

  // Step 2: Create the empty SVG canvas.
  // viewBox lets the picture shrink or grow to fit any screen size.
  const svg = svgElement("svg", {
    viewBox: `0 0 ${width} ${height}`,                        // drawing area size
    role: "img",                                              // tells screen readers it is a picture
    "aria-label": title,                                      // description for screen readers
  });

  // Step 3: Draw every cell, column by column.
  for (let c = 0; c < cols; c++) {                            // go column by column

    // Step 3a: Draw the cells of this column from bottom to top.
    // SVG measures y from the TOP, but our rows count from the BOTTOM,
    // so we flip the row number to get the correct y position.
    for (let r = 0; r < rows; r++) {                          // go row by row (r = 0 is bottom)
      const y = (rows - 1 - r) * CELL;                        // flip row so row 0 is at the bottom
      let cls = "cell-empty";                                 // default: empty cell
      if (r < heights[c]) {                                   // this row is inside the block
        cls = showBlocks ? "cell-block" : "cell-empty";       // yellow in Chart 1, empty in Chart 2
      } else if (r < heights[c] + water[c]) {                 // above block but under water level
        cls = "cell-water";                                   // blue water
      }
      svg.appendChild(svgElement("rect", {                    // add the square to the picture
        x: c * CELL, y: y, width: CELL, height: CELL, class: cls,
      }));
    }

    // Step 3b: Write a number under this column.
    // Chart 1 shows the block height. Chart 2 shows the water units.
    const label = svgElement("text", {                        // label under each column
      x: c * CELL + CELL / 2,                                 // centre of the column
      y: rows * CELL + 17,                                    // just below the grid
      class: "col-label",
    });
    label.textContent = showBlocks ? heights[c] : water[c];   // height in chart 1, water in chart 2
    svg.appendChild(label);                                   // add the label to the picture
  }

  // Step 4: Send back the finished picture.
  return svg;
}


/* ----------------------------------------------------------------------------
   MAIN ACTION: calculate()

   What it does:
     Runs every time the user presses "Calculate" or clicks an example.

   Steps:
     1. Read and check the input.
     2. If something is wrong, show an error and stop.
     3. Otherwise, compute the water.
     4. Show the text results.
     5. Draw both SVG charts.
---------------------------------------------------------------------------- */
function calculate() {

  // Step 1: Find the parts of the page we will read from or write to.
  const input = document.getElementById("heights-input");     // the text box
  const errorBox = document.getElementById("error");          // where errors are shown
  const output = document.getElementById("output");           // the results section

  // Step 2: Check the input.
  // First the basic rules from water.js (whole numbers 0 or more),
  // then the drawing size limits from the SETTINGS section.
  const parsed = parseHeights(input.value);                   // check and convert the input
  let message = parsed.error;                                 // any error from parsing
  if (!message && parsed.heights.length > MAX_COLUMNS) {      // too many columns to draw clearly
    message = `Please enter at most ${MAX_COLUMNS} blocks so the drawing stays readable.`;
  }
  if (!message && Math.max(...parsed.heights) > MAX_HEIGHT) { // too tall to draw clearly
    message = `Please keep each height at ${MAX_HEIGHT} or below so the drawing stays readable.`;
  }

  // Step 3: If there is any problem, show it, hide old results and stop here.
  if (message) {
    errorBox.textContent = message;                           // show the error
    output.hidden = true;                                     // hide old charts
    return;                                                   // stop the function
  }

  // Step 4: Input is fine, so clear any old error and run the calculation.
  errorBox.textContent = "";                                  // clear any old error
  const heights = parsed.heights;                             // the valid numbers
  const result = computeWater(heights);                       // the main calculation

  // Step 5: Show the text results.
  // "Unit" for exactly 1, "Units" for anything else.
  document.getElementById("total").textContent = result.total;
  document.getElementById("unit-word").textContent = result.total === 1 ? "Unit" : "Units";
  document.getElementById("echo-input").textContent = `[${heights.join(",")}]`;
  document.getElementById("per-column").textContent = `[${result.water.join(",")}]`;

  // Step 6: Draw both charts.
  // replaceChildren() removes the old picture and puts the new one in.
  const chart1 = document.getElementById("chart-blocks");     // first chart holder
  const chart2 = document.getElementById("chart-water");      // second chart holder
  chart1.replaceChildren(drawGrid(heights, result.water, true, "Blocks with water between them"));
  chart2.replaceChildren(drawGrid(heights, result.water, false, "Water only"));
  output.hidden = false;                                      // show the results
}


/* ----------------------------------------------------------------------------
   EXAMPLE BUTTONS: loadExample(text)

   What it does:
     Puts an example into the text box and calculates it straight away,
     so the user does not have to type it.
---------------------------------------------------------------------------- */
function loadExample(text) {
  document.getElementById("heights-input").value = text;      // fill the text box
  calculate();                                                // run it immediately
}


/* ----------------------------------------------------------------------------
   RANDOM BUTTON: randomExample()

   What it does:
     Makes a random list of 8 to 15 heights, each from 0 to 7, and runs it.

   Why it is useful:
     It lets a reviewer test many different shapes quickly.
---------------------------------------------------------------------------- */
function randomExample() {
  const count = 8 + Math.floor(Math.random() * 8);            // 8 to 15 blocks
  const list = [];                                            // the random heights
  for (let i = 0; i < count; i++) {
    list.push(Math.floor(Math.random() * 8));                 // heights 0 to 7
  }
  loadExample(`[${list.join(",")}]`);                         // show and calculate it
}


/* ----------------------------------------------------------------------------
   START-UP: connect the buttons when the page has loaded

   What it does:
     Waits until the HTML is fully loaded, then tells each button what to
     do when clicked. Finally, it runs the brief's example once so the page
     does not open empty.
---------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {

  // "Calculate" button (and pressing Enter in the text box).
  // preventDefault() stops the browser from reloading the page on submit.
  document.getElementById("input-form").addEventListener("submit", function (event) {
    event.preventDefault();                                   // stop the page from reloading
    calculate();
  });

  // Example buttons: each one stores its own input in "data-example".
  document.querySelectorAll("[data-example]").forEach(function (button) {
    button.addEventListener("click", function () {
      loadExample(button.dataset.example);                    // load that button's example
    });
  });

  // Random button.
  document.getElementById("random-btn").addEventListener("click", randomExample);

  // Show the brief's example as soon as the page opens.
  calculate();
});
