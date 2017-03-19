//=================================================================================//
//                                   Variables                                     //
//=================================================================================//
//CONSTANTS
//integers represent the keycode of certain keys on the keyboard
const SPACEBAR = 32;
const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const A_KEY = 65;
const D_KEY = 68;
const S_KEY = 83;
const W_KEY = 87;

//additional constants
const THRUST = 35;  //kN
const PIXELS_PER_METER = 496 / 52;  //pixel image vs. actual rocket at 52.00 m tall
const START_FUEL = 5000; //starting fuel level
const START_MONO = 100;  //starting monopropellant level
const START_VX = 0;     //starting horizontal velocity
const START_VY = 10;    //starting vertical velocity


//initialized variables
var wKeyDown = sKeyDown = dKeyDown = aKeyDown = false;    //flags for key input
var thrustChanged = false; //flag to detect whether thrust level has been changed
var gravity = 9.81;     // starting acceleration due to gravity
var thrustLevel = 0;    //starting thrust level, values from 0 - 4
var level = 0;


//uninitialized variables
var stage, queue;   //createjs object
var rocket_sheet, fire_sheet, thruster_sheet; //spritesheets
var rocket, landingSite; //game objects
var pausedText, endText, physicsText, fuelText, helpText; //gui
var altitude;   //height of rocket above landing site in m
var velocityX, velocityY;   //current horizontal, vertical speed in m/s
var landed; //flag to detect whether rocket has successfully landed
var gameover;
var count;
var thrusterPtL, thrusterPtR;
var tinyPt, smallPt, mediumPt, largePt;
var eBackground, eSlice, oBackground, oSlice;
var fuelBar_drawRect, monoBar_drawRect;



//=================================================================================//
//                                   Startup                                       //
//=================================================================================//
function init(){
    queue = new createjs.LoadQueue(false);
    queue.addEventListener("complete", load);
    queue.loadManifest([
        {id: "falcon9", src: "Assets/Falcon9_2.png"},
        {id: "falcon9fire", src: "Assets/Falcon9Fire.png"},
        {id: "falcon9thrusters", src: "Assets/Falcon9Thrusters2.png"},
        {id: "smoke", src: "Assets/Smoke3.png"},
        {id: "ocean", src: "Assets/Ocean.png"},
        {id: "earth", src: "Assets/Earth.png"},
        {id: "earthslice", src: "Assets/EarthSlice.png"},
        {id: "oceanslice", src: "Assets/OceanSlice.png"}
    ]);
}

function load(){
    stage = new createjs.Stage("canvas");
    
    //game objects
    buildSpriteSheets();
    buildGameObjects();
    buildGUI();
    
    
    //buildRect(0,0,450,133,"red");    //debugging purposes
    
    
    //ticker
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", run);
    
    //listen for key / mouse events
    window.onkeydown  = detectKey;  //listener calls detectKey() for "keydown"
    window.onkeyup = removeKey;     //listener calls removeKey() for "keyup"
}

function buildGUI(){
    
    buildBar(790,50,"fuel", "green");
    buildBar(790,103, "mono", "green");
    buildPausedText("yellow");
    buildGameoverText("yellow");
    buildPhysicsText("black");
    buildFuelText("black");
    buildHelpText("white");
}

function buildGameObjects(){
    
    buildEarthBackground();
    buildOceanBackground();
    buildAndPlaceRocket();
    buildLandingSite();
}



function buildAndPlaceRocket(){
    
    var randomX, randomRotation, shiftX, startY;
    
    randomX = Math.floor(Math.random() * stage.canvas.width/2); //0 - 600
    randomRotation = Math.floor(Math.random() * 10);        //0 - 10
    shiftX = stage.canvas.width/5;
    startY = -150;
    
    buildRocket(randomX + shiftX, startY, randomRotation);
    
    resetGameValues();
}

function resetGameValues(){
    
    //switch visible background and landing zone dimensions
    switch(level){
        case 0: //earth
            //background and slice
            eBackground.visible = true;
            eSlice.visible = true;
            oBackground.visible = false;
            oSlice.visible = false;
            
            if(stage.contains(helpText)){
                helpText.visible = true;
            }
            
            
            //remove existing landing pad and replace with new version
            stage.removeChild(landingSite);
            buildLandingSite();
            break;
            
        case 1: //ocean
            //background and slice
            eBackground.visible = false;
            eSlice.visible = false;
            oBackground.visible = true;
            oSlice.visible = true;
            helpText.visible = false;
            
            //remove existing landing pad and replace with new version
            stage.removeChild(landingSite);
            buildLandingSite();
            break;
    }
    
    
    
    //set initial values
    velocityX = START_VX;
    velocityY = START_VY;
    fuel = START_FUEL;
    mono = START_MONO;
    landed = false;
    gameover = false;
    count = 0;
    thrustLevel = 0;
}




//=================================================================================//
//                                 Game Controls                                   //
//=================================================================================//


function detectKey(e){ //alert("detectKey()");
    
    e = !e ? window.event : e; //if event is not event, get window.event;
    
    switch(e.keyCode) {
        case W_KEY:
            wKeyDown = true;    //flag for movement
            break;
        case S_KEY:
            sKeyDown = true;    //flag for movement
            break;
        case A_KEY:
            aKeyDown = true;    //flag for movement
            break;
        case D_KEY:
            dKeyDown = true;    //flag for movement
            break;
        case UP_ARROW:
            increaseThrust();
            break;
        case DOWN_ARROW:
            decreaseThrust();
            break;
        case RIGHT_ARROW:
            changeLevel();
            break;
        case SPACEBAR:
            pause();
            break;
    }
}

function removeKey(e){ //alert("removeKey()");
    
    e = !e ? window.event : e;  //if event is not event, get window.event;
    
    switch(e.keyCode) {
        case W_KEY:
            wKeyDown = false;   //reset flag
            break;
        case S_KEY:
            sKeyDown = false;   //reset flag
            break;
        case A_KEY:
            aKeyDown = false;    //flag for movement
            break;
        case D_KEY:
            dKeyDown = false;    //flag for movement
            break;
    }
}


//=================================================================================//
//                                 Game Mechanics                                  //
//=================================================================================//

function run(e){
    if(!e.paused){
        
        if(!gameover){
            //rocket
            updateRocket();
            renderRocket();
            
            //animations
            updateAnimations();
            
            //fuel
            updateFuelLevels();
            
            //GUI
            updateAltitude();
            updateStats();
            updateBars();
        }
        else{
            count++;
            endingSequence(); //??how to run only once
        }
        
        //stage
        stage.update();
    }
}

function pause(){
    
    createjs.Ticker.paused = !createjs.Ticker.paused;
    pausedText.visible = !pausedText.visible;
    
    //stage
    stage.update();
}

function endingSequence(){
    
    if(count === 1){    //to prevent from triggering multiple times b/c framerate
        
        if(landed){ //successful landing
            
            //make gameoverText visible
            createjs.Tween.get(gameoverText).to({alpha: 1}, 50);
            
            //show landed animations
            landedAnimations();
        }
        else{   //failed landing
            
            removeRocket();
            
            //show failure animations
            crashAnimations();
        }
        
        //wait 2 seconds, then reset game
        createjs.Tween.get(gameoverText).to({rotation:0}, 2000).call(resetGame);
    }
}

function removeRocket(){
    
    if(stage.contains(rocket)){
        
        stage.removeChild(rocket);
    }
}

function resetGame(){
    
    removeRocket();
    
    gameoverText.alpha = 0;
    
    buildAndPlaceRocket();
}

function changeLevel(){ //alert("change level");
    
    if(count === 0){
        level = (level + 1) % 2;
        count++;
        resetGame();
    }
}

function increaseThrust(){
    
    if(thrustLevel < 4){
        thrustLevel++;
        thrustChanged = true;
    }
}

function decreaseThrust(){
    
    if(thrustLevel > 0){
        thrustLevel--;
        thrustChanged = true;
    }
}

function reduceMono(){
    
    if(mono >= 1){
        mono -= 1;
    }
}

function reduceFuel(){
    
    if(fuel > 0){
        fuel -= thrustLevel;
    }
    if(fuel < 0){
        fuel = 0;
    }
}

function updateFuelLevels(){
    
    //update monopropellant
    if(aKeyDown || dKeyDown){
        reduceMono();
    }
    //update fuel levels
    if(wKeyDown && thrustLevel > 0){
        reduceFuel();
    }
}


//=================================================================================//
//                                  Movement                                       //
//=================================================================================//



function updateRocket(){
    
    var nextPt, nextRotation;
    
    //determine next position
    nextPt = calcNextPosition();
    
    //check for collision
    detectCollision(nextPt);
    
    //determine next rotation
    nextRotation = calcNextRotation();
    
    //store values
    rocket.nextY = nextPt.y;
    rocket.nextX = nextPt.x;
    rocket.nextRotation = nextRotation;
}


function calcNextRotation(){
    
    var nextRotation;
    
    if(aKeyDown && mono > 0){
        nextRotation = rocket.rotation + 1;
    }
    else if(dKeyDown && mono > 0){
        nextRotation = rocket.rotation - 1;
    }
    else{
        nextRotation = rocket.rotation;
    }
    
    return nextRotation;
}


function calcNextPosition(){
    
    var nextX, nextY, angle, yThrust, xThrust;
    
    //horizontal position
    nextX = rocket.x;
    xThrust = 0;
    
    if(wKeyDown && fuel > 0){ //engine thrusting
        
        angle = getStandardAngle(rocket.rotation);  //degrees
        xThrust = getXThrust(angle);
        nextX += xThrust;
        velocityX = xThrust;
        
    }
    else{   //continue drifting in previous direction
        
        nextX += velocityX;
    }
    
    
    //vertical position
    nextY = rocket.y;
    yThrust = 0;
    
    if(wKeyDown && fuel > 0 && thrustLevel > 0){   //engine thrusting
        
        angle = getStandardAngle(rocket.rotation);  //degrees
        yThrust = getYThrust(angle);
        velocityY -= yThrust/200;   //??improve how this works
        nextY += velocityY;
        
    }
    else{
        nextY += velocityY;
        velocityY += gravity/49.05; //~0.2 for 9.81 gravity
    }
    
    return new createjs.Point(nextX, nextY);
}


function detectCollision(pt){
    
    var shiftY, shiftX;
    var correctRotation, correctSpeed, correctXRange, correctYRange;
    var pastLeftEdge, pastRightEdge;
    
    //for use in collision calculations
    shiftY = rocket.landingHeight - rocket.center_of_mass;
    shiftX = rocket.landing_width/2;
    
    //checklist for a proper landing
    correctYRange = (pt.y >= landingSite.y - shiftY);
    
    //change values accordingly
    if(correctYRange){
        
        //check if landed
        correctRotation = Math.abs(rocket.rotation) < 5;
        correctSpeed = Math.abs(velocityY) < 2;
        
        pastLeftEdge = (rocket.x - shiftX >= landingSite.x);
        pastRightEdge = !(rocket.x + shiftX <= landingSite.x + landingSite.width);
        correctXRange = pastLeftEdge && !pastRightEdge;
        
        landed = correctYRange && correctXRange && correctRotation && correctSpeed;
        
        //adjust position
        pt.y = landingSite.y - shiftY;
        
        //end current try
        gameover = true;
    }
}

function renderRocket(){
    
    //position
    rocket.y = rocket.nextY;
    rocket.x = rocket.nextX;
    
    //rotation
    rocket.rotation = rocket.nextRotation;
}


function getStandardAngle(rotation){
    
    return 90 - rotation; //convert CreateJS default to standard geometric convention
}

function getYThrust(angle){
    
    //get y component of thrust vector
    return THRUST * (thrustLevel/4) * Math.sin(degreesToRadians(angle));
}

function getXThrust(angle){
    
    //get x component of thrust vector
    return THRUST * (thrustLevel/4) * Math.cos(degreesToRadians(angle));
}

function degreesToRadians(degrees){
    
    return degrees * Math.PI / 180;
}

function radiansToDegrees(radians){
    
    return radians * 180 / Math.PI;
}

function updateAltitude(){
    
    var totalHeight, startingY;
    
    startingY = -150;
    totalHeight = landingSite.y - startingY - 328;
    
    if(rocket.y <= 0){
        altitude = totalHeight + rocket.y;
    }
    else{
        altitude = totalHeight - rocket.y;
    }
}
//=================================================================================//
//                                   Game Objects                                  //
//=================================================================================//

function buildRocket(regX, regY, angle){ //alert("buildRocket()");
    
    var sliceIndex;
    sliceIndex = stage.getChildIndex(eSlice);
    
    //Container
    rocket = new createjs.Container();
    
    //dynamically injected properties
    rocket.landing_width = 151;     //distance in pixels between landing leg tips
    rocket.body_width = 39;         //width in pixels of rocket body
    rocket.center_of_mass = 351;    //distance in pixels from top of rocket to C.O.M.
    rocket.height = 496;            //distance from top rocket to bottom of engines
    rocket.landingHeight = 529;     //distance from top to bottom of landing legs
    rocket.nextX = 0;
    rocket.nextY = 0;
    rocket.nextRotation = 0;
    
    //CreateJS properties
    rocket.regY = rocket.center_of_mass;    //vertical registration point
    rocket.x = regX;
    rocket.y = regY;
    rocket.rotation = angle;
    rocket.name = "rocket";
    
    //children for container
    buildBody();
    buildLegs();
    buildFire();
    buildThrusters();
    buildThrusterPoints();
    buildFlamePoints();
    buildCenterOfMass(rocket, "red", 10);
    
    //add to stage
    stage.addChildAt(rocket, sliceIndex);   //behind deepest slice to hide flames
    stage.update();
}

function buildBody(){ //alert("buildBody()");
    
    var body;
    
    //Sprite
    body = new createjs.Sprite(rocket_sheet, "deployFins");
    
    //properties
    body.x = -184/2;
    body.name = "body";
    
    //add to container
    rocket.addChild(body);
}

function buildLegs(){//alert("buildLegs()");
    
    var legs;
    
    //Sprite
    legs = new createjs.Sprite(rocket_sheet, "deployLegs");
    
    //properties
    legs.x = -184/2;
    legs.name = "legs";
    
    //add to container
    rocket.addChild(legs);
}


function buildFire(){//alert("buildFire()");
    
    var fire;
    
    //Sprite
    fire = new createjs.Sprite(fire_sheet, "noFire");
    
    //properties
    fire.y = rocket.height - 5;
    fire.name = "fire";
    fire.regX = 25;
    
    //add to container behind other children
    rocket.addChildAt(fire,0);
}

function buildThrusters(){ //alert("buildThrusters()");
    
    var thrusterL, thrusterR;
    
    //Sprite
    thrusterL = new createjs.Sprite(thruster_sheet, "noThrust");
    
    //properties
    thrusterL.y = 60;
    thrusterL.x = -10;
    thrusterL.name = "thrusterL";
    thrusterL.rotation = 90;
    
    
    //Sprite
    thrusterR = new createjs.Sprite(thruster_sheet, "noThrust");
    
    //properties
    thrusterR.y = 110;
    thrusterR.x = 10;
    thrusterR.name = "thrusterR";
    thrusterR.rotation = -90;
    
    //add to container behind other children
    rocket.addChildAt(thrusterL,thrusterR,0);
}

function buildCenterOfMass(target, color, radius){
    
    var com, add;
    
    //Shape
    com = new createjs.Shape();
    
    
    //properties
    com.x = target.regX;
    com.y = target.regY;
    com.name = "center of mass";
    com.visible = false;
    
    //graphics
    add = radius*1.5;
    com.graphics.beginStroke(color).drawCircle(0, 0, radius);
    com.graphics.moveTo(-add,0).lineTo(add, 0);
    com.graphics.moveTo(0,-add).lineTo(0,add);
    
    //add to container
    target.addChild(com);
}

function buildThrusterPoints(){ //alert("buildThrusterPoints");
    
    //right thruster
    //Shape d
    thrusterPtR = new createjs.Shape();
    thrusterPtR.x = rocket.regX+25;
    thrusterPtR.y = 42;
    //thrusterPtR.graphics.beginFill("red").drawCircle(thrusterPtR.x, thrusterPtR.y, 5);
    
    //left thruster
    //Shape
    thrusterPtL = new createjs.Shape();
    thrusterPtL.x = rocket.regX-25;
    thrusterPtL.y = 42;
    //thrusterPtL.graphics.beginFill("green").drawCircle(thrusterPtL.x, thrusterPtL.y, 5);
    
    rocket.addChild(thrusterPtL, thrusterPtR);
}

function buildFlamePoints(){
    
    //large flame
    largePt = new createjs.Shape();
    largePt.x = rocket.regX;
    largePt.y = rocket.regY + 65;
    //largePt.graphics.beginFill("red").drawCircle(largePt.x, largePt.y, 5);
    
    //medium flame
    mediumPt = new createjs.Shape();
    mediumPt.x = rocket.regX;
    mediumPt.y = rocket.regY - 20;
    //mediumPt.graphics.beginFill("blue").drawCircle(mediumPt.x, mediumPt.y, 5);
    
    //small flame
    smallPt = new createjs.Shape();
    smallPt.x = rocket.regX;
    smallPt.y = rocket.regY - 65;
    //smallPt.graphics.beginFill("green").drawCircle(smallPt.x, smallPt.y, 5);
    
    //tiny flame
    tinyPt = new createjs.Shape();
    tinyPt.x = rocket.regX;
    tinyPt.y = rocket.regY - 75;
    //tinyPt.graphics.beginFill("orange").drawCircle(tinyPt.x, tinyPt.y, 5);
    
    rocket.addChild(largePt, mediumPt, smallPt, tinyPt);
}

function buildLandingSite(){
    
    var x,y, w, h;
    
    //Shape
    landingSite = new createjs.Shape();
    landingSite.visible = false;
    
    switch(level){
        case 0: //earth
            x = 0;
            y = stage.canvas.height - 50;
            w = stage.canvas.width;
            h = 10;
            break;
        case 1: //ocean
            x = 335;
            y = stage.canvas.height - 50;
            w = 450;
            h = 10;
            break;
    }
    
    //createjs properties
    landingSite.graphics.beginFill("green").drawRect(0, 0, w,h);
    landingSite.x = x;
    landingSite.y = y;
    
    //dynamically injected properties
    landingSite.width = w;
    
    //add to container
    stage.addChild(landingSite);
}


function buildEarthBackground(){
    
    var image;
    
    //earth background first
    //HTML image element
    image = queue.getResult("earth");
    
    //Bitmap
    eBackground = new createjs.Bitmap(image);
    eBackground.x = eBackground.y = 0;
    eBackground.visible = true;
    
    //add to container
    stage.addChildAt(eBackground, 0);    //bottom child
    
    
    //slice to hide flames that go into the ground (past 0 altitude)
    image = queue.getResult("earthslice");
    
    //Bitmap
    eSlice = new createjs.Bitmap(image);
    eSlice.x = eSlice.y = 0;
    eSlice.visible = true;
    
    stage.addChild(eSlice);
}

function buildOceanBackground(){
    
    //ocean background first
    //HTML image element
    image = queue.getResult("ocean");
    
    //Bitmap
    oBackground = new createjs.Bitmap(image);
    oBackground.x = oBackground.y = 0;
    oBackground.visible = false;
    
    //add to container
    stage.addChildAt(oBackground, 0);    //bottom child
    
    
    //slice to hide flames that go into the ground (past 0 altitude)
    image = queue.getResult("oceanslice");
    
    //Bitmap
    oSlice = new createjs.Bitmap(image);
    oSlice.x = oSlice.y = 0;
    oSlice.visible = false;
    
    stage.addChild(oSlice);
}



//=================================================================================//
//                                       GUI                                       //
//=================================================================================//

function buildPausedText(color){
    
    pausedText = new createjs.Text("Game Paused", "40px Arial", color);
    pausedText.textAlign = "center";
    pausedText.x = stage.canvas.width/2;
    pausedText.y = stage.canvas.height/2;
    pausedText.visible = false;
    
    stage.addChild(pausedText);
}

function buildGameoverText(color){
    
    gameoverText = new createjs.Text("Landed!", "60px Arial", color);
    gameoverText.textAlign = "center";
    gameoverText.x = stage.canvas.width/2;
    gameoverText.y = 500;
    gameoverText.alpha = 0;
    
    stage.addChild(gameoverText);
}

function buildPhysicsText(color){
    
    var m;
    
    m = "-----------------------------------------\n\n"
    + "Velocity (x): 100 m/s\n\n"
    + "Velocity (y): 100 m/s\n\n"
    + "Rotation: 180 degrees \n\n"
    + "Altitude: 400 m\n\n"
    + "Thrust Level: 4/4 \n\n";
    
    //Text object
    physicsText = new createjs.Text(m, "24px Arial", color);
    physicsText.x = stage.canvas.width - 400;
    physicsText.y = 175;
    
    stage.addChild(physicsText);
    stage.update();
}

function buildFuelText(color){
    
    var m;
    
    m = "Rocket Fuel: " + START_FUEL + " / " + START_FUEL + "\n\n"
    + "Monopropellant: " + START_MONO + " / " + START_MONO;
    
    fuelText = new createjs.Text(m, "26px Arial", color);
    fuelText.x = stage.canvas.width-400;
    fuelText.y = 50;
    
    stage.addChild(fuelText);
    stage.update();
}

function buildHelpText(color){
    
    var m;
    
    m = "Press SPACEBAR to pause gameplay."
    
    helpText = new createjs.Text(m, "24px Arial", color);
    helpText.x = stage.canvas.width-425;
    helpText.y = stage.canvas.height- 40;
    helpText.alpha = 0.5;
    
    stage.addChild(helpText);
    stage.update();
}


function updateStats(){
    
    //physics
    physicsText.text = "Velocity (x): " + velocityX.toFixed(2) + " m/s\n\n"
    + "Velocity (y): " + velocityY.toFixed(2) + " m/s\n\n"
    + "Rotation: " + rocket.rotation + " degrees\n\n"
    + "Altitude: " + (altitude / PIXELS_PER_METER).toFixed(2) + " m\n\n"
    + "Thrust Level: " + thrustLevel + "/4\n\n";
    
    //fuel
    fuelText.text = "Rocket Fuel: " + fuel + " / " + START_FUEL + "\n\n"
    + "Monopropellant: " + mono + " / " + START_MONO;
}

function buildBar(x,y,type, fillColor){
    
    var border, fill;
    
    //Container
    bar = new createjs.Container();
    bar.x = x;
    bar.y = y;
    
    //Border
    //Shape
    border = new createjs.Shape();
    border.x = border.y = 0;    //relative to container
    border.name = "name";
    border.graphics.beginStroke("black").drawRect(0,0,400,30);
    
    //Fill
    //Shape
    fill = new createjs.Shape();
    fill.x = fill.y = 0;    //relative to container
    fill.name = "fill";
    fill.graphics.endStroke().beginFill(fillColor);
    fill.graphics.drawRect(0,0,300,30);
    
    switch(type){
        case "fuel":
            fuelBar_drawRect = fill.graphics.command;  //save reference
            break;
        case "mono":
            monoBar_drawRect = fill.graphics.command;   //save reference
            break;
    }
    
    //add Shapes to container
    bar.addChild(fill, border);
    
    //add Container to stage
    stage.addChild(bar);
    stage.update();
}

function updateBars(){
    
    var width;
    
    //rocket fuel
    //calculate new fill length in pixels per rocket fuel level
    width = (fuel / START_FUEL) * 400;
    fuelBar_drawRect.w = width;
    
    //monopropellant
    //calculate new fill length in pixels per monopropellant level
    width = (mono / START_MONO) * 400;
    monoBar_drawRect.w = width;
    
    stage.update();
}





//=================================================================================//
//                                   Animations                                    //
//=================================================================================//
function buildSpriteSheets(){ //alert("buildSpriteSheets()");
    
    var image, data;
    
    //spritesheet for rocket
    //HTML Image Object
    image = queue.getResult("falcon9");
    
    //generic object
    data = {
        images: [image],
        frames:{width: 184, height: 861, spacing: 0, count: 27, margin: 0},
        animations: {
            closedFins: 0,
            deployFins: [0, 2, "deployedFins", 0.1],    //start, end, [next], [speed]
            deployedFins: 2,
            closeFins: {
                frames: [2,1,0],
                next: "closedFins",
                speed: 0.1
            },
            finsLeft: 3,
            finsRight: 5,
            closedLegs: 6,
            deployLegs: [6,10, "deployedLegs", 0.1],
            deployedLegs: 10,
        } //end animations
    }; //end data
    
    rocket_sheet = new createjs.SpriteSheet(data);
    
    
    //spritesheet for fire
    //HTML Image Object
    image = queue.getResult("falcon9fire");
    
    //generic object
    data = {
        images: [image],
        frames:{width: 50, height: 364, spacing: 0, count: 21, margin: 0},
        animations: {
            noFire: 20,
                
            //animations for engine firing continuously
            tinyFire: [15,19, "tinyFire", 0.3],
            smallFire: [0,4, "smallFire", 0.3],
            mediumFire: [5,9, "mediumFire", 0.3],
            largeFire: [10,14, "largeFire", 0.3],
                
            //animations for engine cutout
            cutTinyFire: [15,19, "noFire", 1.5],
            cutSmallFire: [0,4, "cutTinyFire", 1.5],
            cutMediumFire: [5,9, "cutSmallFire", 1.5],
            cutLargeFire: [10,14, "cutMediumFire", 1.5]
        } //end animations
    }; //end data
    
    fire_sheet = new createjs.SpriteSheet(data);
    
    //spritesheet for thruster
    //HTML Image Object
    image = queue.getResult("falcon9thrusters");
    
    //generic object
    data = {
        images: [image],
        frames:{width: 50, height: 75, spacing: 0, count: 6, margin: 0},
        animations: {
            noThrust: 5,
            thrust: [0,4, "thrust", 0.3]
        } //end animations
    }; //end data
    
    thruster_sheet = new createjs.SpriteSheet(data);
}

//-----------------------------------thrusters-----------------------------------

function updateThrusters(){
    
    var isThrustingL, isThrustingR;
    
    //flags
    isThrustingL = rocket.getChildByName("thrusterL").currentAnimation === "thrust";
    isThrustingR = rocket.getChildByName("thrusterR").currentAnimation === "thrust";
    
    //left thruster
    if(aKeyDown && !isThrustingL){
        rocket.getChildByName("thrusterL").gotoAndPlay("thrust");
    }
    if(!aKeyDown && isThrustingL){
        rocket.getChildByName("thrusterL").gotoAndPlay("noThrust");
    }
    
    //right thruster
    if(dKeyDown && !isThrustingR){
        rocket.getChildByName("thrusterR").gotoAndPlay("thrust");
    }
    if(!dKeyDown && isThrustingR){
        rocket.getChildByName("thrusterR").gotoAndPlay("noThrust");
    }
}

function cutThrustersAnimation(){
    
    var isThrustingR, isThrustingL;
    
    //flags
    isThrustingL = rocket.getChildByName("thrusterL").currentAnimation === "thrust";
    isThrustingR = rocket.getChildByName("thrusterR").currentAnimation === "thrust";
    
    if(isThrustingL || isThrustingR){
        rocket.getChildByName("thrusterL").gotoAndPlay("noThrust");
        rocket.getChildByName("thrusterR").gotoAndPlay("noThrust");
    }
}

function flareThrusters(){
    
    var isThrustingR, isThrustingL;
    
    //flags
    isThrustingL = rocket.getChildByName("thrusterL").currentAnimation === "thrust";
    isThrustingR = rocket.getChildByName("thrusterR").currentAnimation === "thrust";
    
    if(!isThrustingL && !isThrustingR){
        rocket.getChildByName("thrusterL").gotoAndPlay("thrust");
        rocket.getChildByName("thrusterR").gotoAndPlay("thrust");
    }
}

//-----------------------------------engine-----------------------------------


function updateEngine(){
    
    var engineFiring, child;
    
    //get fire sprite
    child = rocket.getChildByName("fire");
    
    //flag for engine firing
    engineFiring =  child.currentAnimation === "tinyFire" ||
                    child.currentAnimation === "smallFire" ||
                    child.currentAnimation === "mediumFire" ||
                    child.currentAnimation === "largeFire";
    
    //engine
    if(wKeyDown && !engineFiring){
        
        engineFiring = true;
        thrustChanged = false;
        child = rocket.getChildByName("fire");
        
        switch(thrustLevel){
            case 0:
                child.gotoAndPlay("noFire");
                break;
            case 1:
                child.gotoAndPlay("tinyFire");
                break;
            case 2:
                child.gotoAndPlay("smallFire");
                break;
            case 3:
                child.gotoAndPlay("mediumFire");
                break;
            case 4:
                child.gotoAndPlay("largeFire");
                break;
        } //end switch
    } //end if
    else if(wKeyDown && thrustChanged){
        
        engineFiring = true;
        thrustChanged = false;
        child = rocket.getChildByName("fire");
        
        switch(thrustLevel){
            case 0:
                child.gotoAndPlay("noFire");
                break;
            case 1:
                child.gotoAndPlay("tinyFire");
                break;
            case 2:
                child.gotoAndPlay("smallFire");
                break;
            case 3:
                child.gotoAndPlay("mediumFire");
                break;
            case 4:
                child.gotoAndPlay("largeFire");
                break;
        } //end switch
    } //end if
    else if(!wKeyDown && engineFiring){
        
        engineFiring = false;
        
        child = rocket.getChildByName("fire");
        
        
        switch(thrustLevel){
            case 0:
                child.gotoAndPlay("noFire");
                break;
            case 1:
                child.gotoAndPlay("cutTinyFire");
                break;
            case 2:
                child.gotoAndPlay("cutSmallFire");
                break;
            case 3:
                child.gotoAndPlay("cutMediumFire");
                break;
            case 4:
                child.gotoAndPlay("cutLargeFire");
                //alert("test");
                break;
        } //end switch
    } //end if
}


function cutEngineAnimation(){
    
    var child, engineFiring;
    
    //get fire sprite
    child = rocket.getChildByName("fire");
    
    //check whether engine is currently firing
    engineFiring =  child.currentAnimation === "tinyFire" ||
                    child.currentAnimation === "smallFire" ||
                    child.currentAnimation === "mediumFire" ||
                    child.currentAnimation === "largeFire";
    
    
    if(engineFiring){
        
        engineFiring = false; //reset flag
        
        switch(thrustLevel){
            case 0:
                child.gotoAndPlay("noFire");
                break;
            case 1:
                child.gotoAndPlay("cutTinyFire");
                break;
            case 2:
                child.gotoAndPlay("cutSmallFire");
                break;
            case 3:
                child.gotoAndPlay("cutMediumFire");
                break;
            case 4:
                child.gotoAndPlay("cutLargeFire");
                break;
        }
    }
}

//-----------------------------------overall-----------------------------------

function updateAnimations(){
    
    //thrusters animation
    if(mono > 0){
        updateThrusters();
        thrusterSmoke();
    }
    else{
        cutThrustersAnimation();
    }
    
    //engine animation
    if(fuel > 0){
        updateEngine();
        engineSmoke();
    }
    else{
        cutEngineAnimation();
    }
    
    
}

function landedAnimations(){
    
    cutEngineAnimation();
    flareThrusters();
}

function crashAnimations(){
    
}
//-----------------------------------smoke-----------------------------------

function thrusterSmoke(){
    
    var isThrustingL, isThrustingR, globalPt;
    
    //flags
    isThrustingL = rocket.getChildByName("thrusterL").currentAnimation === "thrust";
    isThrustingR = rocket.getChildByName("thrusterR").currentAnimation === "thrust";
    
    
    if(isThrustingR){
        //get current location of tip of right thrust animation
        globalPt = thrusterPtR.localToGlobal(thrusterPtR.x, thrusterPtR.y);
        //alert(globalPt);
        buildSmoke(globalPt.x, globalPt.y, 1);
        
    }
    
    if(isThrustingL){
        //get current location of tip of left thrust animation
        globalPt = thrusterPtL.localToGlobal(thrusterPtL.x, thrusterPtL.y);
        //alert(globalPt);
        buildSmoke(globalPt.x, globalPt.y);
    }
}

function engineSmoke(){
    
    var globalPt, child, engineFiring;
    
    child = rocket.getChildByName("fire");
    
    //check if engine is currently firing
    engineFiring =  child.currentAnimation === "tinyFire" ||
                    child.currentAnimation === "smallFire" ||
                    child.currentAnimation === "mediumFire" ||
                    child.currentAnimation === "largeFire";
    
    if(engineFiring){
        switch(thrustLevel){
            case 1:
                globalPt = tinyPt.localToGlobal(tinyPt.x, tinyPt.y);
                break;
            case 2:
                globalPt = smallPt.localToGlobal(smallPt.x, smallPt.y);
                break;
            case 3:
                globalPt = mediumPt.localToGlobal(mediumPt.x, mediumPt.y);
                break;
            case 4:
                globalPt = largePt.localToGlobal(largePt.x, largePt.y);
                break;
        }
        
        buildSmoke(globalPt.x, globalPt.y);
    }
}



function buildSmoke(x,y){
    
    var b, image,randomX, randomShift, randomDirection;
    
    randomDirection = Math.random() > 0.5 ? -1 : 1;
    randomX = Math.floor(Math.random() * 30);
    randomShift = randomX * randomDirection;
    
    
    image = queue.getResult("smoke");
    
    b = new createjs.Bitmap(image);
    b.x = x - b.image.width/2 + randomShift;
    b.y = y - b.image.height/2;
    b.alpha = 0.5;
    b.addEventListener("added", fadeout);
    
    stage.addChild(b);
}


function fadeout(e){
    
    var randomMS;
    
    randomMS = Math.floor(Math.random() * 500);    //0 - 1000
    
    createjs.Tween.get(e.target).to({alpha: 0, y: e.target.y - 150}, randomMS + 3000).call(smokeComplete);
}

function smokeComplete(){
    
    stage.removeChild(this);
}

//=================================================================================//
//                                      Debug                                      //
//=================================================================================//

function buildRect(x, y, width, height, color){
    
    var rect;
    
    rect = new createjs.Shape();
    rect.graphics.beginStroke(color).drawRect(x,y,width,height);
    rect.x = rect.y = 0;
    
    stage.addChild(rect);
    stage.update();
}




