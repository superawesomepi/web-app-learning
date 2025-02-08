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
let drawNum = 1;
let strokes = 0;
let exStrokes = 0;
init('list.txt')


colorPicker.addEventListener('change', (event) => {
    seectx.strokeStyle = event.target.value;
  // Use selectedColor to draw
});

seeCanvas.addEventListener('pointerdown', (event) => {
  // Handle pen down event
  console.log('Pen down:', event.clientX - getOffset(seeCanvas).left, event.clientY - getOffset(seeCanvas).top); 
  isDrawing = true;
  svgctx.beginPath();
  svgctx.moveTo(event.clientX - getOffset(seeCanvas).left, event.clientY - getOffset(seeCanvas).top);
  seectx.beginPath();
  seectx.moveTo(event.clientX - getOffset(seeCanvas).left, event.clientY - getOffset(seeCanvas).top);
});

seeCanvas.addEventListener('pointermove', (event) => {
  if (event.pressure > 0) { // Check if pen is actively drawing
    // Handle pen movement event
    console.log('Pen move:', event.clientX - getOffset(seeCanvas).left, event.clientY - getOffset(seeCanvas).top); 
    if (!isDrawing) return;

    svgctx.lineTo(event.clientX - getOffset(seeCanvas).left, event.clientY - getOffset(seeCanvas).top);
    svgctx.stroke();
    seectx.lineTo(event.clientX - getOffset(seeCanvas).left, event.clientY - getOffset(seeCanvas).top);
    seectx.stroke();
  }
});

seeCanvas.addEventListener('pointerup', (event) => {
  // Handle pen up event
  console.log('Pen up:', event.clientX - getOffset(seeCanvas).left, event.clientY - getOffset(seeCanvas).top); 
  isDrawing = false;
  strokes++;
  document.getElementById("usStrokes").innerHTML = strokes;
});

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
    document.getElementById("usStrokes").innerHTML = strokes
    document.getElementById("result").innerHTML = "currently drawing...";
}

function submit() {
    if(strokes == exStrokes) {
      document.getElementById("result").innerHTML = "Stroke count matched!";
    } else document.getElementById("result").innerHTML = "Stroke count incorrect."
    const svg = svgctx.getSerializedSvg();
    let filename = drawNum + ".svg"
    const link = document.createElement('a');
    link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    link.download = filename;
    link.click();
    //let dataURL = canvas.toDataURL(filename)
    //saveData(dataURL, filename)
    console.log('Saved data ' + filename)
    drawNum++;
    
}










