'// @ts-ignore'
import {C2S} from './node_modules/canvas2svg/canvas2svg.js'; // import the library for svg canvas, otherwise canvas can only be saved as png, jpeg, or webp
const canvas = document.getElementById('myCanvas');
const colorPicker = document.getElementById('colorPicker');
const ctx = new C2S({ width: canvas.width, height: canvas.height }); // get the canvas object from html, and set it to use C2S

let isDrawing = false;
ctx.lineWidth = 10;
let drawNum = 1;
init('list.txt')


colorPicker.addEventListener('change', (event) => {
    ctx.strokeStyle = event.target.value;
  // Use selectedColor to draw
});

canvas.addEventListener('pointerdown', (event) => {
  // Handle pen down event
  console.log('Pen down:', event.clientX, event.clientY); 
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
});

canvas.addEventListener('pointermove', (event) => {
  if (event.pressure > 0) { // Check if pen is actively drawing
    // Handle pen movement event
    console.log('Pen move:', event.clientX, event.clientY); 
    if (!isDrawing) return;

    ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    ctx.stroke();
  }
});

canvas.addEventListener('pointerup', (event) => {
  // Handle pen up event
  console.log('Pen up:', event.clientX, event.clientY); 
  isDrawing = false;
});

document.getElementById("submit").addEventListener('click', submit);
document.getElementById("drawReset").addEventListener('click', drawReset);
document.getElementById("kanjiReset").addEventListener('click', kanjiReset);

function init(filename) {
  fetch(filename)
    .then(checkResult)
    .then(listKanji);
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
  console.log(files[random]);
}

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function submit() {
    const svg = ctx.getSerializedSvg();
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

// function dataURLtoBlob(dataurl) {
//     const arr = dataurl.split(',');
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]); 
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
  
//     while(n--){
//       u8arr[n] = bstr.charCodeAt(n);
//     }
  
//     return new Blob([u8arr], {type: mime});
// }

// function saveData(dataurl, filename) {
//     const blob = dataURLtoBlob(dataurl);
//     const url = window.URL.createObjectURL(blob);
  
//     const link = document.createElement('a');
//     link.href = url;
//     console.log('Filename is ' + filename)
//     link.setAttribute('download', filename);
  
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// }








