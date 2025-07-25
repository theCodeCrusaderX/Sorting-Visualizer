const canvas = document.getElementById("sortingCanvas"); // Get the canvas element
const ctx = canvas.getContext("2d"); // Get the 2D drawing context
const explanationDiv = document.getElementById("ai-explanation"); // Get the explanation div

let arrSize = 10;
let array = [];
let isSorting = false;
let delay = 800; // Delay in milliseconds for visualization
let hasShownLoadingMessage = false; // Track if loading message has been shown

function generateArray() {
  if (isSorting) return; // Prevent generating a new array while sorting
  hasShownLoadingMessage = false;

  array = []; // Reset the array

  for (let i = 0; i < arrSize; i++) {
    array.push(Math.floor(Math.random() * 100)); // Random numbers between 1 and 100
  }
  drawArray();
}

function drawArray(highlight = {}) {
  //if no val pass to highlight, it will be empty obj
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

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

// =================================================================
//  AI INTEGRATION (Calling backend server)
// =================================================================

async function getExplanation(details) {
  // Get the checkbox element
  const aiToggle = document.getElementById("enableAi");
  console.log("AI Toggle checked:", aiToggle.checked);

  // If the checkbox is not checked, clear the text and stop
  if (!aiToggle.checked) {
    explanationDiv.innerHTML = "<p>AI explanations are disabled.</p>";
    return; // Prevents the API call
  }

  const prompt = `Explain this step of the ${
    details.algorithm
  } algorithm in one simple sentence for a visualizer.
- Step: ${details.step}.
- Array State: [${details.arrayState.join(", ")}].
- Details: ${details.context}`;

  // Show loading message only on first time
  if (!hasShownLoadingMessage) {
    explanationDiv.innerHTML = "<p><em>Generating explanation...</em></p>";
    hasShownLoadingMessage = true;
  }

  try {
    const response = await fetch("http://localhost:3000/get-explanation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    explanationDiv.innerHTML = `<p>${data.explanation}</p>`;
  } catch (error) {
    console.error("Error fetching explanation:", error);
    explanationDiv.innerHTML =
      "<p>Could not connect to the AI server. Is it running?</p>";
  }
}

async function bubbleSort() {
  isSorting = true;
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      // drawArray({ [j]: "yellow", [j + 1]: "yellow" });
      await getExplanation({
        algorithm: "Bubble Sort",
        step: "Comparing",
        arrayState: array,
        context: `Comparing ${array[j]} and ${array[j + 1]}.`,
      });
      drawArray({ [j]: "yellow", [j + 1]: "yellow" });

      await new Promise((r) => setTimeout(r, delay));

      if (array[j] > array[j + 1]) {
        await getExplanation({
          algorithm: "Bubble Sort",
          step: "Swapping",
          arrayState: array,
          context: `Swapping ${array[j]} and ${array[j + 1]}.`,
        });
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        drawArray({ [j]: "green", [j + 1]: "green" });
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  drawArray();
  await getExplanation({
    algorithm: "Bubble Sort",
    step: "Finished",
    arrayState: array,
    context: "The array is fully sorted.",
  });
  isSorting = false;

  const finalHighlight = {};
  for (let i = 0; i < array.length; i++) {
    finalHighlight[i] = "Gray";
  }
  drawArray(finalHighlight);

  isSorting = false;
}

async function selectionSort() {
  isSorting = true;

  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;

    drawArray({ [i]: "orange" });
    await getExplanation({
      algorithm: "Selection Sort",
      step: "Starting new iteration",
      arrayState: array,
      context: `Assuming ${array[i]} at index ${i} is the minimum.`,
    });
    await new Promise((resolve) => setTimeout(resolve, delay));

    for (let j = i + 1; j < array.length; j++) {
      const highlight = {
        [i]: "orange",
        [j]: "yellow",
        [minIndex]: "green",
      };
      drawArray(highlight);

      await getExplanation({
        algorithm: "Selection Sort",
        step: "Comparing",
        arrayState: array,
        context: `Comparing ${array[j]} with current minimum ${array[minIndex]}.`,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));

      if (array[j] < array[minIndex]) {
        minIndex = j;

        drawArray({
          [i]: "orange",
          [j]: "yellow",
          [minIndex]: "green",
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    if (minIndex !== i) {
      await getExplanation({
        algorithm: "Selection Sort",
        step: "Swapping",
        arrayState: array,
        context: `Swapping ${array[i]} and ${array[minIndex]}.`,
      });

      [array[i], array[minIndex]] = [array[minIndex], array[i]];

      drawArray({
        [i]: "red",
        [minIndex]: "red",
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const finalHighlight = {};
  for (let i = 0; i < array.length; i++) {
    finalHighlight[i] = "blue";
  }
  drawArray(finalHighlight);

  await getExplanation({
    algorithm: "Selection Sort",
    step: "Finished",
    arrayState: array,
    context: "The array is fully sorted.",
  });

  isSorting = false;
}

async function insertionSort() {
  isSorting = true;

  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;

    drawArray({ [i]: "orange" });
    await getExplanation({
      algorithm: "Insertion Sort",
      step: "Key Selection",
      arrayState: array,
      context: `Selected key ${key} at index ${i}.`,
    });
    await new Promise((resolve) => setTimeout(resolve, delay));

    while (j >= 0 && array[j] > key) {
      await getExplanation({
        algorithm: "Insertion Sort",
        step: "Shifting",
        arrayState: array,
        context: `Shifting ${array[j]} to the right.`,
      });

      array[j + 1] = array[j];

      drawArray({
        [j]: "yellow",
        [j + 1]: "red",
        [i]: "orange",
      });
      await new Promise((resolve) => setTimeout(resolve, delay));

      j = j - 1;
    }

    array[j + 1] = key;

    await getExplanation({
      algorithm: "Insertion Sort",
      step: "Insertion",
      arrayState: array,
      context: `Inserted key ${key} at position ${j + 1}.`,
    });

    drawArray({ [j + 1]: "green" });
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const finalHighlight = {};
  for (let i = 0; i < array.length; i++) {
    finalHighlight[i] = "blue";
  }
  drawArray(finalHighlight);

  await getExplanation({
    algorithm: "Insertion Sort",
    step: "Finished",
    arrayState: array,
    context: "The array is fully sorted.",
  });

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

  await getExplanation({
    algorithm: "Merge Sort",
    step: "Finished",
    arrayState: array,
    context: "The array is fully sorted.",
  });
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
  let L = [],
    R = [];

  for (let i = 0; i < n1; i++) L.push(array[left + i]);
  for (let j = 0; j < n2; j++) R.push(array[mid + 1 + j]);

  await getExplanation({
    algorithm: "Merge Sort",
    step: "Merging",
    arrayState: array,
    context: `Merging subarrays [${L}] and [${R}].`,
  });

  let i = 0,
    j = 0,
    k = left;

  while (i < n1 && j < n2) {
    const highlight = {};
    for (let x = left; x <= right; x++) highlight[x] = "orange";
    highlight[k] = "green";

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

  await getExplanation({
    algorithm: "Quick Sort",
    step: "Finished",
    arrayState: array,
    context: "The array is fully sorted.",
  });
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

  await getExplanation({
    algorithm: "Quick Sort",
    step: "Choosing Pivot",
    arrayState: array,
    context: `Pivot selected: ${pivot} at index ${high}.`,
  });

  for (let j = low; j < high; j++) {
    const highlight = {
      [high]: "orange",
      [j]: "yellow",
    };

    await getExplanation({
      algorithm: "Quick Sort",
      step: "Comparing",
      arrayState: array,
      context: `Comparing ${array[j]} with pivot ${pivot}.`,
    });

    if (array[j] < pivot) {
      i++;
      [array[i], array[j]] = [array[j], array[i]];

      highlight[i] = "red";
      highlight[j] = "red";

      drawArray(highlight);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      drawArray(highlight);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  [array[i + 1], array[high]] = [array[high], array[i + 1]];

  const finalHighlight = {
    [i + 1]: "green",
    [high]: "red",
  };
  drawArray(finalHighlight);

  await getExplanation({
    algorithm: "Quick Sort",
    step: "Placing Pivot",
    arrayState: array,
    context: `Placed pivot ${pivot} at index ${i + 1}.`,
  });

  await new Promise((resolve) => setTimeout(resolve, delay));

  return i + 1;
}

// Update button event listeners to match HTML IDs

document.getElementById("generateBtn").addEventListener("click", function () {
  if (isSorting) {
    alert("Sorting in progress...");
    return;
  } // Prevent generating a new array while sorting

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

if (!isSorting) {
  generateArray(); // Initial array generation
}
