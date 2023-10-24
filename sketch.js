let table; // Table of anxious thoughts
let thoughtImage; // Image of thought bubble
let video;  // webcam input
let cropped;// webcam input cropped to face
let model;  // BlazeFace machine-learning model
let faces = [];   // detected faces
let aspectRatio; // aspect ratio of webcam input

// print details when a face is first found
let hasFace = true;

function preload() {
  table = loadTable("HW2---text-csv/texts.csv", "csv", "None");
  console.log(table);
  thoughtImage = loadImage("thought.svg")
}

function setup() {
  video = createCapture(VIDEO);
  // video.size(1920,1080);
  aspectRatio = video.width / video.height;
  console.log(video.width);
  console.log(video.height);
  console.log(aspectRatio);
  video.hide();

  // load the BlazeFace model
  loadFaceModel();

  textSize(8);
  textStyle(BOLD);

  // Canvas for sketch fit to window
  let startWidth = windowWidth;
  let startHeight = startWidth / aspectRatio;

  if (startHeight > windowWidth) {
    startHeight = windowHeight;
    startWidth = startHeight * aspectRatio;
  }

  createCanvas(startWidth, startHeight);
}


// TensorFlow requires the loading of the
// model to be done in an asynchronous function
// this means it will load in the background
// and be available to us when it's done
async function loadFaceModel() {
  model = await blazeface.load();
}


function draw() {
  background(255);

  image(video, 0,0, width, height);

  // if the video is active and the model has
  // been loaded, get the faces from this frame
  if (video.loadedmetadata && model !== undefined) {
    getFaces();
  }

  // if we have face data
  if (faces !== undefined) {
    // The first time a face is found print the info
    if (hasFace) {
      console.log(faces);
      hasFace = false;
    }
    for (let j = 0; j < faces.length; j++) {
      let face = faces[j];
      // console.log(face);

      // Manage key features of face
      let topLeft = face.topLeft;
      let bottomRight = face.bottomRight;

      // console.log("Top Left " + topLeft);
      // console.log("Bottom Right " + bottomRight);

      let rightEye = face.landmarks[0];
      let leftEye =  face.landmarks[1];
      let nose =     face.landmarks[2];
      let lips =     face.landmarks[3];
      let rightEar = face.landmarks[4];
      let leftEar =  face.landmarks[5];

      // Map video points to scale of canvas
      rightEye = scalePoint(rightEye);
      leftEye =  scalePoint(leftEye);
      nose =     scalePoint(nose);
      lips =     scalePoint(lips);

      // console.log(lips);

      topLeft =     scalePoint(topLeft);
      bottomRight = scalePoint(bottomRight);

      // console.log("Scaled Top Left " + topLeft);
      // console.log("Scaled Bottom Right " + bottomRight);

      
      // Display video cropped to face
      // cropped = video.get(topLeft[0], topLeft[1], bottomRight[0], bottomRight[1]);
      // image(cropped, 0,0, cropped.width, cropped.height);

      // Map cropped video points to scale of canvas
      // rightEye = scalePointCropped(rightEye);
      // leftEye =  scalePointCropped(leftEye);
      // nose =     scalePointCropped(nose);
      // lips =     scalePointCropped(lips);

      // topLeft =     scalePointCropped(topLeft);
      // bottomRight =     scalePointCropped(bottomRight);

      let faceWidth = bottomRight.x - topLeft.x;
      let faceHeight = bottomRight.y - topLeft.y;
      // console.log(faceWidth);
      // console.log(faceHeight);

      noFill();
      stroke(255,0,0);

      // Draw bounding box around face
      rect(topLeft.x, topLeft.y, faceWidth, faceHeight);

      push();
      rectMode(CENTER);
      imageMode(CENTER);
      textAlign(CENTER, CENTER);
      translate(topLeft.x + faceWidth/3, topLeft.y - 100)

      fill(255);
      noStroke();
      
      image(thoughtImage, 0, 0, faceWidth);

        push();

        fill(0);

        // let randNum = int(random(0, table.getRowCount() - 1));
        // console.log(randNum);
        let thoughtText = table.getRow(j).arr[0];
        // console.log(thoughtText);
        text(thoughtText, 0, -20, faceWidth - 20, 30);

        pop();

      pop();
      
      // Draw Circle over mouth
      // circle(lips.x, lips.y, 20);
    }
  }
  else {
    
  }
}


// Resize canvas when the window is resized
function windowResized() {
  resizeCanvasToWindow();
}

function resizeCanvasToWindow() {
  let newWidth = windowWidth;
  let newHeight = newWidth / aspectRatio;

  if (newHeight > windowWidth) {
    newHeight = windowHeight;
    newWidth = newHeight * aspectRatio;
  }
  resizeCanvas(newWidth, newHeight);
}

// Converts positions in the video to the canvas' dimensions
function scalePoint(pt) {
  let x = map(pt[0], 0,video.width, 0, width);
  let y = map(pt[1], 0,video.height, 0, height);
  return createVector(x, y);
}

// Converts positions in the cropped video to the canvas' dimensions
// function scalePointCropped(pt) {
//   let x = map(pt[0], 0,cropped.width, 0,width);
//   let y = map(pt[1], 0,cropped.height, 0,height);
//   return createVector(x, y);
// }

function getText() {
  
}


// like loading the model, TensorFlow requires
// we get the face data using an async function
async function getFaces() {
  
  // get predictions using the video as
  // an input source (can also be an image
  // or canvas!)
  const predictions = await model.estimateFaces(
    document.querySelector('video'),
    false
  );

  // false means we want positions rather than 
  // tensors (ie useful screen locations instead
  // of super-mathy bits)
  
  // if we there were no predictions, set
  // the face to undefined
  if (predictions.length === 0) {
    faces = [];
  }

  // otherwise, grab the first face
  else {
    for (let j = 0; j < predictions.length; j++) {
      faces[j] = predictions[j];
    }
  }
}

