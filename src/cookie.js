'// @ts-ignore'
const seeCanvas = document.getElementById('seeCanvas');
const colorPicker = document.getElementById('colorPicker');
const seectx = seeCanvas.getContext("2d");

let files = [];
const select = document.getElementById("kanjiOptions");
let expectedStrokeString = "";
let expectedCoordinates = [];
let strokeCoordinates = [];
let leniency = 30;
let accuracy = 0;
let userKanjiInfo = {
  "username": "",
  "kanjiName": "",
  "kanjiData": ""
}
let kanjiComparison = {
  "baseKanji": [],
  "userKanji": [],
  "leeway": 0
}
let isDrawing = false;
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
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;
init('list.txt')
console.log("fetching kanji from db");
//let expectedStrokeString = fetchKanji();
fetchKanji("roku_4").then(processStrokeArray).then(setCoordinates);

function processStrokeArray (expectedStrokeArray) {
  expectedStrokeString = expectedStrokeArray.toString();
  console.log("fetched kanji from db");
  console.log(expectedStrokeString);
  console.log("loading");
  
}

slider.oninput = function() {
  output.innerHTML = this.value;
  leniency = parseInt(this.value);
}

colorPicker.addEventListener('change', (event) => {
    seectx.strokeStyle = event.target.value;
  // Use selectedColor to draw
});

function startDrawing(clientX, clientY) {
  // Handle pen down event
  console.log('Pen down:', clientX - getOffset(seeCanvas).left, clientY - getOffset(seeCanvas).top); 
  isDrawing = true;
  seectx.beginPath();
  seectx.moveTo(clientX - getOffset(seeCanvas).left, clientY - getOffset(seeCanvas).top);
  xArr.push(clientX - getOffset(seeCanvas).left);
  yArr.push(clientY - getOffset(seeCanvas).top);
}

function draw(clientX, clientY) {
  // Handle pen movement event
  console.log('Pen move:', clientX - getOffset(seeCanvas).left, clientY - getOffset(seeCanvas).top); 
  if (!isDrawing) return;

  seectx.lineTo(clientX - getOffset(seeCanvas).left, clientY - getOffset(seeCanvas).top);
  seectx.stroke();
  xArr.push(clientX - getOffset(seeCanvas).left);
  yArr.push(clientY - getOffset(seeCanvas).top);
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
  //let xChains = findChains(xArr);
  //let yChains = findChains(yArr);
  //console.log("x: " + xChains);
  //console.log("y: " + yChains);
  // flatten the arrays
  //xChains = [].concat(...xChains);
  //yChains = [].concat(...yChains);
  //let removeIndices = combineUniqueArrays(xChains, yChains);
  //console.log("chains: " + removeIndices);
  for (var i = 0; i < xArr.length; i++) {
    coordinates[i] = [xArr[i], yArr[i]];
  }
  console.log("Total coordinates " + coordinates);
  //for(const index in removeIndices) {
    //coordinates.splice(index, 1);
  //}
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
seeCanvas.addEventListener('pointermove', function (event) {
  if (event.pressure > 0) { // Check if pen is actively drawing
    draw(event.clientX, event.clientY);
  }
}, false);

seeCanvas.addEventListener('pointerup', stopDrawing);
seeCanvas.addEventListener('mouseout', stopDrawing);

seeCanvas.addEventListener('touchstart', function (event) {
  console.log("finger touchie the screen woo");
  event.preventDefault()
  let clientX = event.touches[0].clientX;
  let clientY = event.touches[0].clientY; 
  startDrawing(clientX, clientY)
}, false);
seeCanvas.addEventListener('touchmove', function (event) {
  if (event.pressure > 0) { // Check if pen is actively drawing 
    console.log("finger movie the screen woo");
    event.preventDefault()
    let clientX = event.touches[0].clientX;
    let clientY = event.touches[0].clientY; 
    draw(clientX, clientY)
  }
}, false);
seeCanvas.addEventListener('touchend', stopDrawing);

document.getElementById("login").addEventListener('click', login);
document.getElementById("submit").addEventListener('click', submit);
document.getElementById("drawReset").addEventListener('click', drawReset);
select.addEventListener('change', function() {
  console.log("changing selected kanji");
  kanjiSelect();
});

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
    .then(getRandKanji)
    .then(setKanjiOptions);    
  drawReset();
  setCoordinates();
  document.getElementById("username").value = "";
}

function checkResult(response) {
  if(response.ok){
    return response.text();
  } else {
    throw new Error(`Failed to load file`);
  }
}

function getRandKanji(text) {
  files = text.split('\n');
  console.log(files);
  let random = Math.floor(Math.random() * files.length)
  random = 5;
  document.getElementById('myKanji').src='complete_kanji/' + files[random];
  exStrokes = files[random].substring(files[random].indexOf("_")+1, files[random].indexOf("."));
  console.log(files[random]);
  kanjiName = files[random].substring(0, files[random].indexOf("_"));
  userKanjiInfo["kanjiName"] = kanjiName;
}

// sets the html displayed image to the chosen kanji
function displayKanji(file) {
  document.getElementById('myKanji').src=file;
  console.log(file);
}

function kanjiSelect() {
    console.log('Getting new kanji');
    drawReset()
    const selectedValue = select.value;
    console.log("chose kanji " + selectedValue);
    setNewKanji(selectedValue);
}

function setNewKanji(filename) {
  document.getElementById('myKanji').src='complete_kanji/' + filename;
  exStrokes = filename.substring(filename.indexOf("_")+1, filename.indexOf("."));
  console.log(filename);
  console.log(filename.substring(0, filename.indexOf(".")))
  kanjiName = filename.substring(0, filename.indexOf("_"));
  userKanjiInfo["kanjiName"] = kanjiName;
  fetchKanji(filename.substring(0, filename.indexOf("."))).then(processStrokeArray).then(setCoordinates);
}

function drawReset() {
    console.log('reset drawing');
    seectx.clearRect(0, 0, seeCanvas.width, seeCanvas.height);
    strokes = 0;
    strokeList = [];
    document.getElementById("usStrokes").innerHTML = strokes
    document.getElementById("result").innerHTML = "currently drawing...";
    //document.getElementById("pointMatching").innerHTML = "waiting...";
    //document.getElementById("pointCheck").innerHTML = "waiting...";
}

function setCoordinates() {
  console.log("setting coordinates for new kanji");
  strokeCoordinates = [];
  console.log("on string " + expectedStrokeString);
  expectedStrokeString.replace("\n", "");
  let strokesList = expectedStrokeString.substring(9, expectedStrokeString.length-1).split("<stroke> ");
  for (let i = 0; i < strokesList.length; i++) {
    expectedCoordinates = [];
    const coords = strokesList[i].split(',');
    console.log(coords);
    for(let i = 0; i < coords.length; i+=2) {
      expectedCoordinates[i/2] = [coords[i], coords[i+1]];
    }
    console.log(expectedCoordinates);
    strokeCoordinates.push(expectedCoordinates);
  }
  console.log(strokeCoordinates);
  exStrokes = strokeCoordinates.length;
}

function setKanjiOptions() {
  select.innerHTML = "";
  console.log("adding options for kanji selection");
  for(let i = 0; i < files.length; i++) {
    let option = files[i];
    let el = document.createElement("option");
    el.textContent = option;
    el.value = option;
    select.appendChild(el);
    console.log("added " + el + " to dropdown options");
  }
}

function login() {
  username = document.getElementById("username").value;
  console.log("Set username to " + username);
  document.getElementById("curUser").innerHTML = username;
  userKanjiInfo["username"] = username
}

function submit() {
    if(strokes == exStrokes) {
      document.getElementById("result").innerHTML = "Stroke count matched!";
    } else document.getElementById("result").innerHTML = "Stroke count incorrect."
    accuracy = 0;
    let filename = username + "-" + kanjiName + ".txt"
    const link = document.createElement('a');
    let text = "";
    for (let i = 0; i < strokeList.length; i++) {
      text = text + "<stroke> " + strokeList[i] + "\n";
    }
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    link.download = filename;
    link.click();
    console.log('Saved data ' + filename)
    scoreKanji(strokeCoordinates, strokeList);
    upload(text);
    drawNum++;
    
}

function upload(text) {
  userKanjiInfo["kanjiData"] = text
  const request = new Request('hipy.py', {method: 'POST', body: '{"action": "upload", "state": '+JSON.stringify(userKanjiInfo)+'}'});
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

function fetchKanji(kanji_name) {
  const request = new Request('hipy.py', {method: 'POST', body: '{"action": "fetch", "state": '+JSON.stringify(kanji_name)+'}'});
  return fetch(request)
    .then(function(response) {
      if(response.ok) {
        return response.json();
      }
    })
    .then(function(response_json) {
      console.log(response_json);
      return response_json;
    });
}

function gradeKanji() {
  const request = new Request('hipy.py', {method: 'POST', body: '{"action": "grade", "state": '+JSON.stringify(kanjiComparison)+'}'});
  return fetch(request)
    .then(function(response) {
      if(response.ok) {
        return response.json();
      }
    })
    .then(function(response_json) {
      console.log(response_json);
      return response_json;
    });
}


function scoreKanji(kanjiOne, kanjiTwo) {
  // convert to ints from strings for comparison
  kanjiOne.forEach(strokeArr => { // split kanji into strokes
    strokeArr.forEach(pointArr => { // split strokes into points
      pointArr[0] = Math.round(pointArr[0]); // subtract xMin and yMin from each point to normalize the kanji to 0,0
      pointArr[1] = Math.round(pointArr[1]);
    })
  })
  kanjiTwo.forEach(strokeArr => { // split kanji into strokes
    strokeArr.forEach(pointArr => { // split strokes into points
      pointArr[0] = Math.round(pointArr[0]); // subtract xMin and yMin from each point to normalize the kanji to 0,0
      pointArr[1] = Math.round(pointArr[1]);
    })
  })
  console.log("scoring kanji");
  console.log(kanjiOne);
  console.log(kanjiTwo);
  // normalize the kanji using linear transformation 
  // normalize kanjiOne to 0,0 and get its x and y maximum
  let normalizedKanjiOne = [];
  let onexMax = 0;
  let oneyMax = 0;
  [normalizedKanjiOne, onexMax, oneyMax] = normalizeKanjiLinearly(kanjiOne);
  console.log("normalized first kanji");
  console.log(normalizedKanjiOne);
  // normalize kanjiTwo to 0,0 and get its x and y maximum
  let normalizedKanjiTwo = [];
  let twoxMax = 0;
  let twoyMax = 0;
  [normalizedKanjiTwo, twoxMax, twoyMax] = normalizeKanjiLinearly(kanjiTwo);
  console.log("normalized second kanji");
  console.log(normalizedKanjiTwo);

  // normalize kanjiTwo to kanjiOne using scaling transformation
  let xScaleFactor = twoxMax/onexMax;
  let yScaleFactor = twoyMax/oneyMax;
  normalizedKanjiTwo.forEach(strokeArr => { // split kanji into strokes
    strokeArr.forEach(pointArr => { // split strokes into points
      pointArr[0] /= xScaleFactor; // subtract xMin and yMin from each point to normalize the kanji to 0,0
      pointArr[1] /= yScaleFactor;
    })
  })
  kanjiComparison["baseKanji"] = normalizedKanjiOne;
  kanjiComparison["userKanji"] = normalizedKanjiTwo;
  kanjiComparison["leeway"] = leniency;
  console.log("grading with a leniency of " + kanjiComparison["leeway"]);
  gradeKanji().then(
    (result) => {
      document.getElementById("score").innerHTML = result[result.length-1].toFixed(2)+ "%";
      console.log("set score");
    }
  )
  console.log("converting kanji to text");
  let textK1 = "";
  for (let i = 0; i < kanjiOne.length; i++) {
    textK1 = textK1 + "<stroke> " + kanjiOne[i] + "\n";
  }
  let textK2 = "";
  for (let i = 0; i < kanjiTwo.length; i++) {
    textK2 = textK2 + "<stroke> " + kanjiTwo[i] + "\n";
  }
  let textKN1 = "";
  for (let i = 0; i < normalizedKanjiOne.length; i++) {
    textKN1 = textKN1 + "<stroke> " + normalizedKanjiOne[i] + "\n";
  }
  let textKN2 = "";
  for (let i = 0; i < normalizedKanjiTwo.length; i++) {
    textKN2 = textKN2 + "<stroke> " + normalizedKanjiTwo[i] + "\n";
  }
  
  console.log("Here are the original kanji data");
  console.log(textK1);
  console.log(textK2);
  console.log("and here are the normalized kanji data");
  console.log(textKN1);
  console.log(textKN2);
}

// this function takes in the expected kanji data, normalizes it to the top left, and returns that, plus the new max x and y coords
// technically I could save it as such in the db, and maybe I will later for efficiency, but for now I want to keep the original data
function normalizeKanjiLinearly(kanjiCoords) {
  let xShift = 0;
  let yShift = 0;
  let xMin = 1000; // this will never be larger than canvas size so it really doesn't need to be too big
  let yMin = 1000;
  let xMax = 0;
  let yMax = 0;
  let shiftedArray = JSON.parse(JSON.stringify(kanjiCoords)); // this is so dumb but apparently it avoids aliasing so yay
  // gets the smallest x and y coordinates from the entire kanji
  kanjiCoords.forEach(strokeArr => { // split kanji into strokes
    strokeArr.forEach(pointArr => { // split strokes into points
      console.log("testing for minimum with " + pointArr[0] + " and " + pointArr[1] + " against " + xMin + " and " + yMin);
      if(pointArr[0] < xMin) { // check if the x and y coords are the lowest in the kanji
        console.log("found that " + pointArr[0] + " was less than " + xMin + " and set new x minimum");
        xMin = pointArr[0];
        
      }  
      if(pointArr[1] < yMin) {
        console.log("found that " + pointArr[1] + " was less than " + yMin + " and set new y minimum");
        yMin = pointArr[1];
      }     
    })
  })
  // normalize all coordinates to 0,0 by subtracting those minimums
  shiftedArray.forEach(strokeArr => { // split kanji into strokes
    strokeArr.forEach(pointArr => { // split strokes into points
      pointArr[0] -= xMin; // subtract xMin and yMin from each point to normalize the kanji to 0,0
      pointArr[1] -= yMin;
      if(pointArr[0] > xMax) xMax = pointArr[0];
      if(pointArr[1] > yMax) yMax = pointArr[1]; 
    })
  })
  return [shiftedArray, xMax, xMin];
}

