'// @ts-ignore'
import C2S from 'canvas2svg'; // import the library for svg canvas, otherwise canvas can only be saved as png, jpeg, or webp
const svgCanvas = document.getElementById('svgCanvas');
const seeCanvas = document.getElementById('seeCanvas');
const colorPicker = document.getElementById('colorPicker');
const svgctx = new C2S({ width: svgCanvas.width, height: svgCanvas.height }); // get the canvas object from html, and set it to use C2S
const seectx = seeCanvas.getContext("2d");


let isDrawing = false;
svgctx.lineWidth = 10;
seectx.lineWidth = 10;
let username = "";
let drawNum = 1;
let kanjiName = "";
let strokes = 0;
let exStrokes = 0;
let xArr = [];
let yArr = [];
let coordinates = []
let strokeList = [];
init('list.txt')


colorPicker.addEventListener('change', (event) => {
    seectx.strokeStyle = event.target.value;
  // Use selectedColor to draw
});

function startDrawing(clientX, clientY) {
  // Handle pen down event
  console.log('Pen down:', clientX - getOffset(seeCanvas).left, clientY - getOffset(seeCanvas).top); 
  isDrawing = true;
  svgctx.beginPath();
  svgctx.moveTo(clientX - getOffset(seeCanvas).left, clientY - getOffset(seeCanvas).top);
  seectx.beginPath();
  seectx.moveTo(clientX - getOffset(seeCanvas).left, clientY - getOffset(seeCanvas).top);
  xArr.push(clientX - getOffset(seeCanvas).left);
  yArr.push(clientY - getOffset(seeCanvas).top);
}

function draw(event) {
  if (event.pressure > 0) { // Check if pen is actively drawing
    // Handle pen movement event
    console.log('Pen move:', event.clientX - getOffset(seeCanvas).left, event.clientY - getOffset(seeCanvas).top); 
    if (!isDrawing) return;

    svgctx.lineTo(event.clientX - getOffset(seeCanvas).left, event.clientY - getOffset(seeCanvas).top);
    svgctx.stroke();
    seectx.lineTo(event.clientX - getOffset(seeCanvas).left, event.clientY - getOffset(seeCanvas).top);
    seectx.stroke();
    xArr.push(event.clientX - getOffset(seeCanvas).left);
    yArr.push(event.clientY - getOffset(seeCanvas).top);
  }
}



function stopDrawing(event) {
  // Handle pen up event
  if(!isDrawing) return;
  console.log('Pen up:', event.clientX - getOffset(seeCanvas).left, event.clientY - getOffset(seeCanvas).top); 
  isDrawing = false;
  strokes++;
  document.getElementById("usStrokes").innerHTML = strokes;
  xArr.push(event.clientX - getOffset(seeCanvas).left);
  yArr.push(event.clientY - getOffset(seeCanvas).top);
  console.log(xArr);
  console.log(yArr);
  let xChains = findChains(xArr);
  let yChains = findChains(yArr);
  console.log("x: " + xChains);
  console.log("y: " + yChains);
  // flatten the arrays
  xChains = [].concat(...xChains);
  yChains = [].concat(...yChains);
  let removeIndices = combineUniqueArrays(xChains, yChains);
  console.log("chains: " + removeIndices);
  for (var i = 0; i < xArr.length; i++) {
    coordinates[i] = [xArr[i], yArr[i]];
  }
  console.log("Total coordinates " + coordinates);
  for(const index in removeIndices) {
    coordinates.splice(index, 1);
  }
  console.log("Coordinates remaining: " + coordinates);
  strokeList.push(coordinates);
  console.log("added stroke " + strokes + " to the save data");
  console.log(strokeList);
  coordinates = [];

  xArr = [];
  yArr = [];
}

seeCanvas.addEventListener('pointerdown', function (event) {
  startDrawing(event.clientX, event.clientY)
}, false);
seeCanvas.addEventListener('pointermove', draw);
seeCanvas.addEventListener('pointerup', stopDrawing);
seeCanvas.addEventListener('mouseout', stopDrawing);

seeCanvas.addEventListener('touchstart', function (event) {
  event.preventDefault()
  let clientX = e.touches[0].clientX;
  let clientY = e.touches[0].clientY; 
  startDrawing(clientX, clientY)
}, false);
seeCanvas.addEventListener('touchmove', draw);
seeCanvas.addEventListener('touchend', stopDrawing);

document.getElementById("login").addEventListener('click', login);
document.getElementById("submit").addEventListener('click', submit);
document.getElementById("drawReset").addEventListener('click', drawReset);
document.getElementById("kanjiReset").addEventListener('click', kanjiReset);

// returns the offset of an element in relation to the webpage. This is needed for the canvases, although it seems to be relative position and doesn't work properly if the page is scrollable, which I need to fix later.
function getOffset(element) {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

// this just grabs a random kanji right now, it's bad and will be addressed at...some point
function init(filename) {
  fetch(filename)
    .then(checkResult)
    .then(listKanji);    
  drawReset();
}

function checkResult(response) {
  if(response.ok){
    return response.text();
  } else {
    throw new Error(`Failed to load file`);
  }
}

function listKanji(text) {
  const files = text.split('\n');
  console.log(files);
  let random = Math.floor(Math.random() * files.length)
  document.getElementById('myKanji').src='complete_kanji/' + files[random];
  exStrokes = files[random].at(-5);
  document.getElementById("exStrokes").innerHTML = exStrokes;
  console.log(files[random]);
  kanjiName = files[random].substring(0, files[random].indexOf("_"));
}

// sets the html displayed image to the chosen kanji
function displayKanji(file) {
  document.getElementById('myKanji').src=file;
  console.log(file);
}

function kanjiReset() {
    console.log('Getting new kanji');
    drawReset()
    init('list.txt')
}

function drawReset() {
    console.log('reset drawing');
    svgctx.clearRect(0, 0, svgCanvas.width, svgCanvas.height);
    seectx.clearRect(0, 0, seeCanvas.width, seeCanvas.height);
    strokes = 0;
    strokeList = [];
    document.getElementById("usStrokes").innerHTML = strokes
    document.getElementById("result").innerHTML = "currently drawing...";
}

function login() {
  username = document.getElementById("username").value;
  console.log("Set username to " + username);
}

function submit() {
    if(strokes == exStrokes) {
      document.getElementById("result").innerHTML = "Stroke count matched!";
    } else document.getElementById("result").innerHTML = "Stroke count incorrect."
    //const svg = svgctx.getSerializedSvg();
    //let filename = drawNum + ".svg"
    let filename = username + "-" + kanjiName + ".txt"
    const link = document.createElement('a');
    let text = "";
    for (let i = 0; i < strokeList.length; i++) {
      text = text + "<stroke> " + strokeList[i] + "\n";
    }
    //link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    link.download = filename;
    link.click();
    //let dataURL = canvas.toDataURL(filename)
    //saveData(dataURL, filename)
    console.log('Saved data ' + filename)
    upload(text);
    drawNum++;
    
}

function upload(text) {
  const request = new Request('hipy.py', {method: 'POST', body: '{"action": "upload", "state": '+JSON.stringify(text)+'}'});
  fetch(request)
      .then(function(response) {
          if(response.ok) {
              return response.json();
          }
      })
  .then(function(response_json) {
      console.log(response_json);
  });
}

// function to find chains in the given array and returns the indices of those chains
function findChains(arr) {
  const chains = [];
  let currentChain = [];

  for (let i = 0; i < arr.length; i++) {
    if (i === 0 || arr[i] === arr[i - 1]) { // is there a chain? tests if current val is same as previous, or if 0 to avoid index -1
      currentChain.push(i);
    } else {
      if (currentChain.length > 2) { // if the current number is not the same as the previous, check if the chain is longer than 1, then it's a chain so push it to the chains array. Given this, we also don't want to consider pushing a chain unless it is at least 3 elements, instead of 2
        // it's worth considering that we may want to maintain the first and last elements in a chain to avoid significant breaks in coordinate data
        currentChain.splice(0, 1); // remove the first element
        currentChain.splice(currentChain.length-1, 1); // remove the last element
        console.log("Adding chain: " + currentChain);
        chains.push(currentChain);
      }
      currentChain = [i]; // update starting index
    }
  }

  if (currentChain.length > 2) { // if there is a chain at the end, pushes that also
    currentChain.splice(0, 1); // remove the first element
    currentChain.splice(currentChain.length-1, 1); // remove the last element
    console.log("Adding chain: " + currentChain);
    chains.push(currentChain);
  }

  return chains;
}

function combineUniqueArrays(arr1, arr2) {
  const combined = [...arr1, ...arr2];
  console.log("combined array of removeables is " + combined);
  const unique = [];

  for (const item of combined) {
    console.log("checking if " + item + " is present")
    if (!unique.includes(item)) {
      console.log("did not find " + item + ", adding it")
      unique.push(item);
    }
  }
  unique.sort((x, y) => y - x); // sort uses an alphabetical sort, so a comparison function is needed for a numerical sort. This will sort in descending order so array indices can be removed in reverse order to avoid index mismatches
  return unique;
}