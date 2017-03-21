//created by Ryan Nelson and Jack Morgan Spring 2017

/*
 This game involves the depiction of a SpaceX Falcon 9 rocket.
 
 */
//=================================================================================//
//                              Constants & Variables                              //
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
const THRUST = 35;       //force rocket generates at full power, in kN
const START_FUEL = 500;  //starting rocket fuel level for each attempt
const START_MONO = 100;  //starting monopropellant level for each attempt
const START_VX = 0;      //starting horizontal velocity for each attempt
const START_VY = 10;     //starting vertical velocity for each attempt

/*
 ratio of image height in pixels to actual height of the rocket in meters
 -   Graphic of rocket is 496 pixels in height from engines to top of interstage
 -   SpaceX Falcon 9 first stage is 52.00 m tall from engines to top of interstage
 
 ratio is used to determine velocities in m/s and altitude in m rather than pixels
 */
const PIXELS_PER_METER = 496 / 52;


//VARIABLES
//initialized variables
var wKeyDown = sKeyDown = dKeyDown = aKeyDown = false;    //flags for keyboard input
var thrustChanged = false;  //flag to detect whether thrust level has changed
var gravity = 9.81;         //starting acceleration due to gravity in m/s/s
var thrustLevel = 0;        //starting thrust level
var level = 0;              //indicates current game level number


//uninitialized variables
var stage, queue;                               //createjs objects
var rocket_sheet, fire_sheet, thruster_sheet;   //spritesheets
var rocket;      //rocket player flies and attempts to land
var landingSite; //invisible location rocket must land to successfully touchdown
var pausedText, endText, physicsText, fuelText, helpText; //gui objects

//physics
var velocityX, velocityY;//current horizontal, vertical speed in m/s respectively
var altitude;            //current height from bottom of landing legs to surface in m

//animation
var thrusterPtL, thrusterPtR;
var tinyPt, smallPt, mediumPt, largePt; //location of end of

//flags
var landed;     //flag to detect whether rocket has successfully landed
var gameover;   //flag to detect whether level should be restarted
var count;               //number of times endingSequence() has been called

/*
 Background is built in two pieces to simulate a solid landing surface through which rocket flames cannot penetrate. This is accomplished by having the background be a full image, and including a horizontal slice of the bottom horizontal half of the landing site. If the slice is kept in front of the rocket and its sprites, rocket flames that extend past the horizontal center are hidden.
 
 eBackground and eSlice reference the Bitmap images for the earth background
 oBackground and oSlice reference the Bitmap images for the ocean background
 */
var eBackground, eSlice, oBackground, oSlice;   //Bitmap objects of game background

/*
 Note on Graphics Command Objects
 Each Shape object in CreateJS has a graphics property by default, a reference to a graphics object. This graphics object contains a stack of graphics command objects (GCO). It begins empty by default, but as a drawing function is called (i.e. beginFill, drawRect, drawCircle, etc.) a GCO is pushed to the graphics stack. This GCO is an object with a given type (Graphics.Rect, for drawRect).
 
 A reference to this object can be stored and changes can be made to any GCO later. If a change is made, the next time the stage is updated and the Shape is redrawn, any GCO changes will be visible.
 
 Visualization of remaining fuel levels for each type of fuel is built by using a Shape object. Each Shape object pushes two GCOs to its graphics object, one for the border and one for the fill of each fuel level visualization. The reference to the GCO created for the fill is stored and updated as the game progresses and fuel is consumed. fuelBar_drawRect and monoBar_drawRect hold those references.
 */
var fuelBar_drawRect, monoBar_drawRect, landingSite_drawRect;  //reference to GCOs


//=================================================================================//
//                                   Startup                                       //
//=================================================================================//
/*
 Initializes the CreateJS Queue object used for loading all external image data.
 */
function init(){
    queue = new createjs.LoadQueue(false);
    queue.addEventListener("complete", load);   //calls load() when loading finishes
    queue.loadManifest([    //loads images and stores data in objects for later ref
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

/*
 Initializes the CreateJS Stage object on which all visualizations are drawn.
 Builds spritesheets, game objects, and GUI.
 Sets frames per second and starts CreateJS Ticker object
 Creates event listeners for key input and "tick" event
 */
function load(){
    
    //Stage object
    stage = new createjs.Stage("canvas");
    
    //build game objects
    buildSpriteSheets();
    buildGameObjects();
    buildGUI();
    resetGameValues();  //reset values to given defaults
    //buildRect(0,0,450,133,"red");    //debugging purposes
    
    //Ticker object
    createjs.Ticker.framerate = 60; //frames per second
    createjs.Ticker.addEventListener("tick", run);  //calls run() for "tick" event
    
    //listen for key / mouse events
    window.onkeydown  = detectKey;  //calls detectKey() for "keydown" event
    window.onkeyup = removeKey;     //calls removeKey() for "keyup" event
}



/*
 Builds GUI objects.
 - pausedText is the text that appears when game is paused
 - gamoverText is the text that appears if player lands rocket
 - physicsText is the text displaying statistics of velocity, altitude, etc.
 - fuelText is the text displaying Rocket Fuel and Monopropellant levels
 - helpText informs the player of how to pause the game
 
 Also builds graphic visualization (fill bars) of remaining fuel levels.
 */
function buildGUI(){
    
    var m1, m2, m3, m4, m5;
    var p1X, p1Y, p2X, p3X, p3Y;
    
    //visualization of fuel remaining
    buildBar(790,50,"fuel", "green");
    buildBar(790,103, "mono", "green");
    
    //text to be displayed for various GUI Text objects
    m1 = "Game Paused";
    m2 = "Landed!";
    m3 = "-----------------------------------------\n\n"
        + "Velocity (x): 100 m/s\n\n" + "Velocity (y): 100 m/s\n\n"
        + "Rotation: 180 degrees \n\n" + "Altitude: 400 m\n\n"
        + "Thrust Level: 4/4 \n\n";
    m4 = "Rocket Fuel: " + START_FUEL + " / " + START_FUEL + "\n\n" + "Monopropellant: " + START_MONO + " / " + START_MONO;
    m5 = "Press SPACEBAR to pause gameplay.";
    
    //location coordinates for various GUI Text objects
    p1X = stage.canvas.width/2;
    p1Y = stage.canvas.height/2 - 25;
    p2X = stage.canvas.width - 400;
    p3X = stage.canvas.width - 425;
    p3Y = stage.canvas.height - 40;

    //initialization of Text objects
    pausedText = buildText(m1,"40px Arial","yellow","center",p1X,p1Y,false, 1);
    gameoverText = buildText(m2, "60px Arial", "yellow","center", p1X, 500, true, 0);
    physicsText = buildText(m3, "24px Arial", "black", "left", p2X, 175, true, 1);
    fuelText = buildText(m4, "26px Arial", "black", "left", p2X, 50, true, 1);
    helpText = buildText(m5, "24px Arial", "white", "left", p3X, p3Y, true, 0.5);
}

/*
 Builds CreateJS objects used as actors in the game.
 */
function buildGameObjects(){
    
    //Loads backgrounds for all levels
    buildEarthBackground();
    buildOceanBackground();
    
    //Performs operations to build and position rocket
    buildAndPlaceRocket();
    
    //builds and positions landing site
    buildLandingSite();
}


/*
 Calculates random position and angle rocket will start at for given attempt.
 Random position is limited to a certain horizontal range.
 Random angle is limited to a certain range.
 Rocket begins at the same height every time.
 */
function buildAndPlaceRocket(){
    
    var randomX, randomRotation, shiftX, startY;
    
    //calculate position and angle values needed for rocket initialization
    randomX = Math.floor(Math.random() * stage.canvas.width/2); //0 - 600
    randomRotation = Math.floor(Math.random() * 10);        //0 - 10
    shiftX = stage.canvas.width/5;  //shift position 20% from left edge
    startY = -150;  //rocket starts out of frame
    
    //initialize rocket
    buildRocket(randomX + shiftX, startY, randomRotation);
}

/*
 Sets values for game variables to default.
 Sets the game background image and text visibility based on level.
 */
function resetGameValues(){
    
    //switch visible background and landing zone dimensions based on game level
    switch(level){
        case 0: //earth background
            //correct background and slice are displayed
            eBackground.visible = eSlice.visible = true;
            oBackground.visible = oSlice.visible = false;
            
            if(stage.contains(helpText)){ //gui is built after rocket is built  ??fix
                helpText.visible = true;
            }

            //update landingSite Shape
            landingSite.x = 0;
            landingSite_drawRect.w = stage.canvas.width;
            landingSite.width = stage.canvas.width;
            break;
            
        case 1: //ocean background
            //correct background and slice are displayed
            eBackground.visible = eSlice.visible = helpText.visible = false;
            oBackground.visible = oSlice.visible = true;
            
            //update landingSite Shape
            landingSite.x = 335;
            landingSite_drawRect.w = landingSite.width = 450;
            break;
    }
    
    //reset variable values
    velocityX = START_VX;
    velocityY = START_VY;
    fuel = START_FUEL;
    mono = START_MONO;
    landed = gameover = false;
    count = 0;
    thrustLevel = 0;
}




//=================================================================================//
//                                 Game Controls                                   //
//=================================================================================//

/*
 Changes flags for movement control based on keyboard input.
 Calls certain methods for other keyboard input.
 */
function detectKey(e){ //alert("detectKey()");
    
    //type check for known browser issues
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
            increaseThrust();   //changes thrustLevel
            break;
        case DOWN_ARROW:
            decreaseThrust();   //changesthrustLevel
            break;
        case RIGHT_ARROW:
            changeLevel();      //changes game level
            break;
        case SPACEBAR:
            pause();            //pauses the game
            break;
    }
}

/*
 Changes flags for movemenet control based on keyboard input.
 */
function removeKey(e){ //alert("removeKey()");
    
    //type check for known browser issues
    e = !e ? window.event : e;  //if event is not event, get window.event;
    
    switch(e.keyCode) {
        case W_KEY:
            wKeyDown = false;    //flag for movement
            break;
        case S_KEY:
            sKeyDown = false;    //flag for movement
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

/*
 Performs main steps required for game to run.
 */
function run(e){
    if(!e.paused){  //Ticker is not paused
        
        if(!gameover){  //game is active
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
        else{   //game is not active
            count++;    //flag for number of times endingSequence has been called
            endingSequence();
        }
        
        //stage
        stage.update();
    }
}

/*
 Performs operations need to pause the game.
 */
function pause(){
    
    createjs.Ticker.paused = !createjs.Ticker.paused;   //pauses calling of run()
    pausedText.visible = !pausedText.visible;   //text shown during pause
    
    //stage
    stage.update();
}

/*
 Triggers animations and operations needed when rocket lands or crashes.
 */
function endingSequence(){
    
    if(count === 1){    //to prevent from triggering multiple times b/c framerate
        
        if(landed){ //successful landing
            
            //make gameoverText visible
            createjs.Tween.get(gameoverText).to({alpha: 1}, 50);
            
            //show landed animations
            landedAnimations();
        }
        else{   //failed landing
            
            //remove rocket from view
            removeRocket();
            
            //show failure animations
            crashAnimations();
        } //end else
        
        //wait 2 seconds, then reset game
        //no change is actually made to gameoverText object
        //not possible to use call() without get() and to()
        createjs.Tween.get(gameoverText).to({rotation:0}, 2000).call(resetGame);
    } //end if
}

/*
 If stage contains the rocket, removes it from Stage.
 */
function removeRocket(){
    
    if(stage.contains(rocket)){
        
        stage.removeChild(rocket);
    }
}

/*
 Performs operations necessary to start a new attempt.
 */
function resetGame(){
    
    removeRocket(); //if rocket hadn't been removed already
    
    gameoverText.alpha = 0; //gameoverText no longer visible
    
    buildAndPlaceRocket();  //build rocket again    ??simplify by reusing rocket
    
    resetGameValues();  //reset values to given defaults
}

/*
 Performs operations needed to change the game level.
 */
function changeLevel(){ //alert("change level");
    
    if(count === 0){    //game is active and endingSequence() has not been called
        
        level = (level + 1) % 2;    //modular arithmetic to loop level options
        count++;    //??to prevent endingSequence from being called
        resetGame();    //reset variable values and background image
    }
}

/*
 Performs operations and checks needed to increase thrust level.
 */
function increaseThrust(){
    
    if(thrustLevel < 4){    //can't exceed 4
        thrustLevel++;
        thrustChanged = true;   //flag for animation change
    }
}

/*
 Performs operations and checks needed to decrease thrust level.
 */
function decreaseThrust(){
    
    if(thrustLevel > 0){    //can't be lower than 0
        thrustLevel--;
        thrustChanged = true;   //flag for animation change
    }
}



/*
 Performs operations needed to update the fuel levels based on game activity.
 */
function updateFuelLevels(){
    
    //update monopropellant
    if(aKeyDown || dKeyDown){
        reduceMono();
    }
    //update fuel levels
    if(wKeyDown && thrustLevel > 0){    //player is thrusting at nonzero level
        reduceFuel();
    }
}

/*
 Reduces the current amount of monopropellant.
 */
function reduceMono(){
    
    if(mono >= 1){  //fuel remaining
        mono -= 1;
    }
}

/*
 Reduces the current amount of rocket fuel, based on thrustLevel.
 */
function reduceFuel(){
    
    if(fuel > 0){   //fuel remaining
        fuel -= thrustLevel;
    }
    if(fuel < 0){   //to reset value if high thrust level brought fuel below 0
        fuel = 0;
    }
}


//=================================================================================//
//                                  Movement                                       //
//=================================================================================//


/*
 Calculates next position and rotation, checks for collisions, and stores values.
 */
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

/*
 Revises the value of altitude based on rocket position.
 */
function updateAltitude(){
    
    var totalHeight, startingY;
    
    startingY = -150;
    
    //considers distance rocket center of mass to bottom of landing legs
    totalHeight = landingSite.y - startingY - 328;
    
    if(rocket.y <= 0){  //rocket is above the screen
        altitude = totalHeight + rocket.y;
    }
    else{   //rocket is on the screen
        altitude = totalHeight - rocket.y;
    }
}

/*
 Calculates next rotation based on keyboard input and monopropellant level.
 */
function calcNextRotation(){
    
    var nextRotation;
    
    if(aKeyDown && mono > 0){
        nextRotation = rocket.rotation + 1; //rotate right
    }
    else if(dKeyDown && mono > 0){
        nextRotation = rocket.rotation - 1; //rotate left
    }
    else{
        nextRotation = rocket.rotation;     //don't rotate any further
    }
    
    return nextRotation;
}

/*
 Calculates next position based on keyboard input, thrustLevel, rocket fuel level.
 Updates horizontal and vertical velocity values based on same data.
 
 Simulates acceleration by storing current vertical velocity values, and allowing this value to be modified based on the forces acting on the rocket.
 
 Forces include the force of gravity and the thrust of the rocket engine.
 
 Realistically calculates the vertical thrust vector based on the given angle of the rocket. For example, a rocket flying straight up and down has all of its thrust as a vertical force. A rocket flying straight sideways has none of its thrust as a vertical force. A rocket flying at 45 degrees has half of its thrust as vertical force and half as horizontal.
 
 Simulates momentum by continuing horizontal movement after engine quits firing in that direction. It does this by storing and utilizing horizontal velocity values.
 */
function calcNextPosition(){
    
    var nextX, nextY, angle, yThrust, xThrust;
    
    //horizontal position
    nextX = rocket.x;
    xThrust = 0;    //reset value
    
    if(wKeyDown && fuel > 0){ //engine thrusting with fuel remaining
        
        angle = getStandardAngle(rocket.rotation);  //get current angle in degrees
        xThrust = getXThrust(angle);    //get thrust vector based on angle
        nextX += xThrust;               //change horizontal position based on thrust
        velocityX = xThrust;            //store velocity to simulate momentum
    }
    else{   //continue drifting in previous direction
        
        nextX += velocityX;
    }
    
    
    //vertical position
    nextY = rocket.y;
    yThrust = 0;    //reset value
    
    if(wKeyDown && fuel > 0 && thrustLevel > 0){ //nonzero thrustLevel, fuel remains
        
        angle = getStandardAngle(rocket.rotation);  //get current angle in degrees
        yThrust = getYThrust(angle);            //get thrust vector based on angle
        velocityY -= yThrust/200;//change per percent thrust not countering gravity
        nextY += velocityY;
        
    }
    else{
        nextY += velocityY;
        velocityY += gravity/49.05; //~0.2 for 9.81 gravity, falls faster and faster
    }
    
    return new createjs.Point(nextX, nextY);    //return x,y position as Point object
}

/*
 Checks whether rocket has reached the landing site altitude.
 If it has, checks whether rocket has performed a proper landing or is destroyed.
 */
function detectCollision(pt){
    
    var shiftY, shiftX;
    var correctRotation, correctSpeed, correctXRange, correctYRange;
    var pastLeftEdge, pastRightEdge;
    
    //for use in collision calculations
    shiftY = rocket.landingHeight - rocket.center_of_mass;
    shiftX = rocket.landing_width/2;    //half the width of distance between legs
    
    //checklist for a proper landing
    //checks vertical range first
    correctYRange = (pt.y >= landingSite.y - shiftY); //landing legs at 0 altitude
    
    //change values accordingly
    if(correctYRange){  //vertical range is good
        
        //checklist for proper landing
        correctRotation = Math.abs(rocket.rotation) < 5; //rotation below 5 degrees
        correctSpeed = Math.abs(velocityY) < 2; //speed below 2 m/s
        
        //rocket horizontally in correct location
        pastLeftEdge = (rocket.x - shiftX >= landingSite.x);
        pastRightEdge = !(rocket.x + shiftX <= landingSite.x + landingSite.width);
        correctXRange = pastLeftEdge && !pastRightEdge;
        
        //checks whether proper landing conditions have been met
        landed = correctYRange && correctXRange && correctRotation && correctSpeed;
 
        //adjust position to 0 altitude
        pt.y = landingSite.y - shiftY;
        
        //end current try whether succeeded or failed
        gameover = true;
    }
}

/*
 Takes stored values and updates actual position and rotation of rocket.
 */
function renderRocket(){
    
    //position
    rocket.y = rocket.nextY;
    rocket.x = rocket.nextX;
    
    //rotation
    rocket.rotation = rocket.nextRotation;
}

/*
 Helper function to convert CreateJS rotation conventions into standard geometric conventions.
 
 CreateJS sets 0 degrees as straight vertical.
 Standard geometric convention sets 0 degrees as straight horizontal.
 */
function getStandardAngle(rotation){
    
    return 90 - rotation;
}

/*
 Helper function to calculate vertical component of thrust vector.
 Uses angle in degrees.
 */
function getYThrust(angle){
    
    //get y component of thrust vector based on angle and default thrust value
    return THRUST * (thrustLevel/4) * Math.sin(degreesToRadians(angle));
}

/*
 Helper function to calculate horizontal component of thrust vector.
 Uses angle in degrees.
 */
function getXThrust(angle){
    
    //get x component of thrust vector based on angle and default thrust value
    return THRUST * (thrustLevel/4) * Math.cos(degreesToRadians(angle));
}

/*
 Helper function takes angle in degrees and converts value to radians.
 */
function degreesToRadians(degrees){
    
    return degrees * Math.PI / 180;
}

/*
 Helper function takes angle in radians and converts value to degrees.
 */
function radiansToDegrees(radians){
    
    return radians * 180 / Math.PI;
}


//=================================================================================//
//                                   Game Objects                                  //
//=================================================================================//

/*
 Performs all operations necessary to built the rocket object.
 Rocket is designed as a Container. It stores multiple sprites and game objects used to create visualization and animation.
 */
function buildRocket(regX, regY, angle){ //alert("buildRocket()");
    
    var sliceIndex;
    
    //Container
    rocket = new createjs.Container();
    
    //dynamically injected properties
    rocket.landing_width = 151;     //distance in pixels between landing leg tips
    rocket.body_width = 39;         //width in pixels of rocket body
    rocket.center_of_mass = 351;    //distance in pixels from top of rocket to C.O.M.
    rocket.height = 496;            //distance from top rocket to bottom of engines
    rocket.landingHeight = 529;     //distance from top to bottom of landing legs
    rocket.nextX = 0;               //stores future horizontal position in pixels
    rocket.nextY = 0;               //stores future vertical position in pixels
    rocket.nextRotation = 0;        //stores future rotation in degrees
    
    //CreateJS properties
    rocket.regY = rocket.center_of_mass;    //vertical registration point
    rocket.x = regX;
    rocket.y = regY;
    rocket.rotation = angle;
    rocket.name = "rocket";
    
    //children for container
    buildBody();
    buildLegs();    //landing legs
    buildFire();    //flame below engines
    buildThrusters();   //cold-gas thrusters at top of rocket near grid fins
    buildThrusterPoints();  //ref end of thrust visualization for smoke generation
    buildFlamePoints();     //ref end of fire visualization for smoke generation
    buildCenterOfMass(rocket, "red", 10);   //visualization of center of mass
    
    //to position rocket behind deepest slice to simulate solid landing surface
    sliceIndex = stage.getChildIndex(eSlice);
    
    //add to stage
    stage.addChildAt(rocket, sliceIndex);   //behind deepest slice to hide flames
    stage.update();
}

/*
 Initializes the sprite that forms the main body of the rocket, including grid fins.
 */
function buildBody(){ //alert("buildBody()");
    
    var body;
    
    //Sprite
    body = new createjs.Sprite(rocket_sheet, "deployFins");
    
    //properties
    body.x = -184/2;    //relative to rocket container
    body.name = "body";
    
    //add to container
    rocket.addChild(body);
}

/*
 Initializes the sprite that forms the landing legs of the rocket.
 Legs are built separately so they can be animated independent of grid fins.
 */
function buildLegs(){//alert("buildLegs()");
    
    var legs;
    
    //Sprite
    legs = new createjs.Sprite(rocket_sheet, "deployLegs");
    
    //properties
    legs.x = -184/2;    //relative to rocket container
    legs.name = "legs";
    
    //add to container
    rocket.addChild(legs);
}

/*
 Initializes the sprite that forms the engine fire when engine is thrusting.
 Fire is built separately so it can be animated independent of other rocket parts.
 */
function buildFire(){//alert("buildFire()");
    
    var fire;
    
    //Sprite
    fire = new createjs.Sprite(fire_sheet, "noFire");
    
    //properties
    fire.y = rocket.height - 5; //relative to rocket container
    fire.name = "fire";
    fire.regX = 25;
    
    //add to container behind other children
    rocket.addChildAt(fire,0);
}

/*
 Initializes the sprite that forms the cold-gas thrusters at top of rocket.
 Thrusters are built separately so they can be animated independent of other parts.
 Thrusters are built independent of each other so each can be animated by itself.
 */
function buildThrusters(){ //alert("buildThrusters()");
    
    var thrusterL, thrusterR;
    
    //Sprite
    thrusterL = new createjs.Sprite(thruster_sheet, "noThrust");
    
    //properties
    thrusterL.y = 60;   //relative to rocket container
    thrusterL.x = -10;
    thrusterL.name = "thrusterL";
    thrusterL.rotation = 90;    //rotate spritesheet graphic
    
    
    //Sprite
    thrusterR = new createjs.Sprite(thruster_sheet, "noThrust");
    
    //properties
    thrusterR.y = 110; //relative to rocket container
    thrusterR.x = 10;
    thrusterR.name = "thrusterR";
    thrusterR.rotation = -90;   //rotate spritesheet graphic
    
    //add to container behind other children
    rocket.addChildAt(thrusterL,thrusterR,0);
}

/*
 Initializes the Shape object used to visualize the center of mass of the rocket.
 Center of mass was calculated using actual rocket specs.
 Shape is initially invisible.
 */
function buildCenterOfMass(target, color, radius){
    
    var com, add;
    
    //Shape
    com = new createjs.Shape();
    
    //properties
    com.x = target.regX;    //relative on rocket container
    com.y = target.regY;
    com.name = "center of mass";
    com.visible = false;
    
    //graphics for visualize representation
    add = radius*1.5;
    com.graphics.beginStroke(color).drawCircle(0, 0, radius);
    com.graphics.moveTo(-add,0).lineTo(add, 0);
    com.graphics.moveTo(0,-add).lineTo(0,add);
    
    //add to container
    target.addChild(com);
}

/*
 Initializes the Shape objects used to coordinate smoke generation with thruster animation. These objects are not intented to be seen.
 
 Shape objects are used because they can be stored in the rocket container, and as the container moves and rotates, these Shape objects remain in their original positions relative to the rocket. These indicate the end tip of thruster visualization, and are used to determine locations to generate smoke sprites.
 */
function buildThrusterPoints(){ //alert("buildThrusterPoints");
    
    //right thruster
    //Shape
    thrusterPtR = new createjs.Shape();
    thrusterPtR.x = rocket.regX+25; //relative to rocket container
    thrusterPtR.y = 42;
    //thrusterPtR.graphics.beginFill("red").drawCircle(thrusterPtR.x, thrusterPtR.y, 5);
    
    //left thruster
    //Shape
    thrusterPtL = new createjs.Shape();
    thrusterPtL.x = rocket.regX-25; //relative to rocket container
    thrusterPtL.y = 42;
    //thrusterPtL.graphics.beginFill("green").drawCircle(thrusterPtL.x, thrusterPtL.y, 5);
    
    rocket.addChild(thrusterPtL, thrusterPtR);
}

/*
 Initializes the Shape objects used to coordinate smoke generation with engine fire animation. These objects are not intented to be seen.
 
 Shape objects are used because they can be stored in the rocket container, and as the container moves and rotates, these Shape objects remain in their original positions relative to the rocket. These indicate the end tips of each size of engine fire visualization, and are used to determine locations to generate smoke sprites.
 */
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

/*
 Initializes the invisible Shape object used in collision detection to determine if rocket made a proper landing.
 
 Landing site is initialized based on earth background (level 1).
 A reference to the graphics command object used to build the Shape is stored to alter the shape depending on the level.
 */
function buildLandingSite(){
    
    //Shape
    landingSite = new createjs.Shape();
    landingSite.visible = true;
    
    //createjs properties
    landingSite.graphics.beginFill("green").drawRect(0, 0, stage.canvas.width,10);
    landingSite_drawRect = landingSite.graphics.command;
    landingSite.x = 0;
    landingSite.y = stage.canvas.height - 50;
    
    //dynamically injected properties
    landingSite.width = stage.canvas.width;
    
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

function buildText(txt, style, color, alignment, x,y, visible, alpha){
    
    var text;
    
    text = new createjs.Text(txt, style, color);
    text.textAlign = alignment;
    text.x = x;
    text.y = y;
    text.visible = visible;
    text.alpha = alpha;
    
    stage.addChild(text);
    
    return text;
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


/*
//Deprecation zone

 
 function buildGUI_deprecated(){
 
 buildBar(790,50,"fuel", "green");
 buildBar(790,103, "mono", "green");
 buildPausedText("yellow");
 buildGameoverText("yellow");
 buildPhysicsText("black");
 buildFuelText("black");
 buildHelpText("white");
 }
 
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
 
 m = "Press SPACEBAR to pause gameplay.";
 
 helpText = new createjs.Text(m, "24px Arial", color);
 helpText.x = stage.canvas.width-425;
 helpText.y = stage.canvas.height- 40;
 helpText.alpha = 0.5;
 
 stage.addChild(helpText);
 stage.update();
 }
 
 
 */
