const canvas = document.getElementById("sortingCanvas");  // Get the canvas element
const ctx = canvas.getContext("2d");  // Get the 2D drawing context

let arrSize = 10;
let array = [];
let isSorting = false;
let delay = 800; // Delay in milliseconds for visualization

function generateArray() {

  if (isSorting) return;  // Prevent generating a new array while sorting

  array = [];  // Reset the array
  
  for (let i = 0; i < arrSize; i++) {
    array.push(Math.floor(Math.random() * 100)); // Random numbers between 1 and 100
  }
  drawArray();
}

function drawArray(highlight = {}) {  //if no val pass to highlight, it will be empty obj
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas

  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  const barWidth = 25;
  const gap = 8;
  const numBars = arrSize;
  const totalBarsWidth = numBars * barWidth + (numBars - 1) * gap;
  const leftMargin = (canvas.width - totalBarsWidth) / 2;

  for (let index = 0; index < arrSize; index++) {
    const value = array[index];
    const barHeight = 3.5 * value;
    const x = leftMargin + index * (barWidth + gap);
    const y = canvas.height - barHeight;

    // Draw bar
    ctx.fillStyle = highlight[index] || "#000"; // black
    ctx.fillRect(x, y, barWidth, barHeight);

    // Draw value on top of the bar
    ctx.fillStyle = "white";
    ctx.fillText(value, x + barWidth / 2, y - 5);
  }
}



async function bubbleSort() {
  isSorting = true;

  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      const highlighted = {
        [j]: "yellow",      //[j] means dynamically set j value
        [j + 1]: "yellow"
      };
      drawArray(highlighted);
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];  //swapping putting max ele at end of grp

        drawArray({
          [j]: "green",
          [j + 1]: "green"
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Highlight final sorted array in blue
  const finalHighlight = {};
  for (let i = 0; i < array.length; i++) {
    finalHighlight[i] = "blue";
  }
  drawArray(finalHighlight);

  isSorting = false;

}

// async function selectionSort() {
//   isSorting = true;
//   for (let i = 0; i < array.length - 1; i++) {
//     let minIndex = i;
//     for (let j = i + 1; j < array.length; j++) {
//       if (array[j] < array[minIndex]) {
//         minIndex = j;
//       }
//     }
//     if (minIndex !== i) {
//       [array[i], array[minIndex]] = [array[minIndex], array[i]];
//       drawArray();
//       await new Promise((resolve) => setTimeout(resolve, 50));
//     }
//   }
//   isSorting = false;
// }
async function selectionSort() {
  isSorting = true;

  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;

    // Highlight the current i
    drawArray({ [i]: "orange" });
    await new Promise((resolve) => setTimeout(resolve, delay));

    for (let j = i + 1; j < array.length; j++) {
      const highlight = {
        [i]: "orange",         // current position
        [j]: "yellow",         // currently comparing
        [minIndex]: "green"    // current minimum
      };
      drawArray(highlight);
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (array[j] < array[minIndex]) {
        minIndex = j;

        // Re-highlight with updated minIndex
        drawArray({
          [i]: "orange",
          [j]: "yellow",
          [minIndex]: "green"
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];

      // Show swap
      drawArray({
        [i]: "red",
        [minIndex]: "red"
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Optional: color whole array as sorted
  const finalHighlight = {};
  for (let i = 0; i < array.length; i++) {
    finalHighlight[i] = "blue";
  }
  drawArray(finalHighlight);

  isSorting = false;
}

// async function insertionSort() {
//   isSorting = true;
//   for (let i = 1; i < array.length; i++) {
//     let key = array[i];
//     let j = i - 1;
//     while (j >= 0 && array[j] > key) {
//       array[j + 1] = array[j];
//       j = j - 1;
//       drawArray();
//       await new Promise((resolve) => setTimeout(resolve, 50));
//     }
//     array[j + 1] = key;
//     drawArray();
//     await new Promise((resolve) => setTimeout(resolve, 50));
//   }
//   isSorting = false;
// }
async function insertionSort() {
  isSorting = true;

  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;

    // Highlight the key being inserted
    drawArray({ [i]: "orange" });
    await new Promise((resolve) => setTimeout(resolve, delay));

    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j]; // Shift element right

      // Highlight the shift
      drawArray({
        [j]: "yellow",     // Element being compared
        [j + 1]: "red",     // Element being shifted
        [i]: "orange"       // Key
      });
      await new Promise((resolve) => setTimeout(resolve, delay));

      j = j - 1;
    }

    array[j + 1] = key;

    // Show insertion of key
    drawArray({ [j + 1]: "green" });
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Final sorted highlight
  const finalHighlight = {};
  for (let i = 0; i < array.length; i++) {
    finalHighlight[i] = "blue";
  }
  drawArray(finalHighlight);

  isSorting = false;
}


async function mergeSort() {
  isSorting = true;
  await mergeSortHelper(0, array.length - 1);
  isSorting = false;
  const finalHighlight = {};
  for (let i = 0; i < array.length; i++) {
    finalHighlight[i] = "blue";
  }
  drawArray(finalHighlight);
}

async function mergeSortHelper(left, right) {
  if (left >= right) return;
  const mid = Math.floor((left + right) / 2);
  await mergeSortHelper(left, mid);
  await mergeSortHelper(mid + 1, right);
  await merge(left, mid, right);
}

async function merge(left, mid, right) {
  let n1 = mid - left + 1;
  let n2 = right - mid;
  let L = [], R = [];

  for (let i = 0; i < n1; i++) L.push(array[left + i]);
  for (let j = 0; j < n2; j++) R.push(array[mid + 1 + j]);

  let i = 0, j = 0, k = left;

  while (i < n1 && j < n2) {
    // Highlight current range and the two elements being compared
    const highlight = {};
    for (let x = left; x <= right; x++) highlight[x] = "orange";
    highlight[k] = "green"; // Position where new value will be placed

    drawArray(highlight);
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (L[i] <= R[j]) {
      array[k] = L[i];
      i++;
    } else {
      array[k] = R[j];
      j++;
    }
    k++;
  }

  while (i < n1) {
    array[k] = L[i];
    const highlight = {};
    for (let x = left; x <= right; x++) highlight[x] = "orange";
    highlight[k] = "green";
    drawArray(highlight);
    await new Promise((resolve) => setTimeout(resolve, delay));
    i++;
    k++;
  }

  while (j < n2) {
    array[k] = R[j];
    const highlight = {};
    for (let x = left; x <= right; x++) highlight[x] = "orange";
    highlight[k] = "green";
    drawArray(highlight);
    await new Promise((resolve) => setTimeout(resolve, delay));
    j++;
    k++;
  }
}

async function quickSort() {
  isSorting = true;
  await quickSortHelper(0, array.length - 1);
  isSorting = false;

  const finalHighlight = {};
  for (let i = 0; i < array.length; i++) {
    finalHighlight[i] = "blue";
  }
  drawArray(finalHighlight);
}

async function quickSortHelper(low, high) {
  if (low < high) {
    let pi = await partition(low, high);
    await quickSortHelper(low, pi - 1);
    await quickSortHelper(pi + 1, high);
  }
}

async function partition(low, high) {
  let pivot = array[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    const highlight = {
      [high]: "orange",  // pivot
      [j]: "yellow",     // current element being compared
    };

    if (array[j] < pivot) {
      i++;
      [array[i], array[j]] = [array[j], array[i]];

      // Highlight the swap
      highlight[i] = "red";
      highlight[j] = "red";

      drawArray(highlight);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      drawArray(highlight);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Final pivot swap
  [array[i + 1], array[high]] = [array[high], array[i + 1]];

  const finalHighlight = {
    [i + 1]: "green",  // pivot placed in correct position
    [high]: "red",
  };
  drawArray(finalHighlight);
  await new Promise((resolve) => setTimeout(resolve, delay));

  return i + 1;
}


// Update button event listeners to match HTML IDs

document.getElementById("generateBtn").addEventListener("click", function () {

  if (isSorting) alert("Sorting in progress..."); // Prevent generating a new array while sorting

  arrSize = parseInt(document.getElementById("arraySize").value);
  console.log(arrSize);
  if (arrSize < 1 || arrSize > 30) {
    alert("Please enter a valid array size between 1 and 30.");
    return;
  }
  if (!isSorting) {
    generateArray();
  }
});

document.getElementById("speed").addEventListener("input", function () {
  if (isSorting) {
    alert("Cannot change speed while sorting is in progress.");
    return;
  }

  delay = parseFloat(this.value) * 1000; // Convert to milliseconds
});

document.getElementById("bubble-sort").addEventListener("click", function () {
  if (!isSorting) {
    bubbleSort();
  }
});

document
  .getElementById("selection-sort")
  .addEventListener("click", function () {
    if (!isSorting) {
      selectionSort();
    }
  });

document
  .getElementById("insertion-sort")
  .addEventListener("click", function () {
    if (!isSorting) {
      insertionSort();
    }
  });

document.getElementById("merge-sort").addEventListener("click", function () {
  if (!isSorting) {
    mergeSort();
  }
});

document.getElementById("quick-sort").addEventListener("click", function () {
  if (!isSorting) {
    quickSort();
  }
});

if(!isSorting) {
  generateArray(); // Initial array generation
}
