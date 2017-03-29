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

var rocket_sheet, fire_sheet, thruster_sheet, stage, queue, rocket, diagText;
var wKeyDown = sKeyDown = dKeyDown = aKeyDown = false;

function load(){
    queue = new createjs.LoadQueue(false);
    queue.on("complete", init, once=true);
    queue.loadManifest([    //loads images, stores data in objects for later ref
        {id: "falcon9", src: "Assets/Falcon9_2.png"},
        {id: "falcon9fire", src: "Assets/Falcon9Fire.png"},
        {id: "falcon9thrusters", src: "Assets/Falcon9Thrusters2.png"},
        {id: "smoke", src: "Assets/Smoke3.png"},
        {id: "ocean", src: "Assets/Ocean.png"},
        {id: "earth", src: "Assets/Earth2.png"},
        {id: "earthslice", src: "Assets/EarthSlice.png"},
        {id: "oceanslice", src: "Assets/OceanSlice.png"}
    ]);
}


function init(){
    loadGame();
    startGame();
}


function loadGame(){ //alert("loadGame()");
    stage = new createjs.Stage("canvas");
    build_SpriteSheets();
    build_Rocket();
    //build_Rect(0,0, 300, 300, "red"); //debug
    build_Text();   //debug
    
    stage.addChild(rocket);
    stage.update();
}

function startGame(){
    //Ticker object
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", gameStep);
    
    //listen for key / mouse events
    window.onkeydown  = detectKey;  //calls detectKey() for "keydown" event
    window.onkeyup = removeKey;     //calls removeKey() for "keyup" event
}

function gameStep(e){
    if(!createjs.Ticker.paused){
        
        diagText.text = rocket.toString() +"\n\nW Key Down: " + wKeyDown;
        if(wKeyDown){
            rocket.fireEngine();
        }

        stage.update();
    }
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
            wKeyDown = true;
            break;
        case S_KEY:
            //sKeyDown = true;    //flag for movement
            break;
        case A_KEY:
            rocket.fireLeftThruster();
            break;
        case D_KEY:
            rocket.fireRightThruster();
            break;
        case UP_ARROW:
            rocket.increaseEngineLevel();
            break;
        case DOWN_ARROW:
            rocket.decreaseEngineLevel();
            break;
        case RIGHT_ARROW:
            //changeLevel();      //changes game level
            break;
        case SPACEBAR:
            //pause();            //pauses the game
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
            rocket.cutoutEngine();
            break;
        case S_KEY:
            //sKeyDown = false;    //flag for movement
            break;
        case A_KEY:
            rocket.cutoutLeftThruster();
            break;
        case D_KEY:
            rocket.cutoutRightThruster();
            break;
    }
}


//=================================================================================//
//                                   Load Functions                                //
//=================================================================================//


function build_SpriteSheets(){ //alert("buildSpriteSheets()");
    
    var image, data;
    
    //spritesheet for rocket
    //HTML Image Object
    image = queue.getResult("falcon9");
    
    //generic object
    data = {
        images: [image],
        frames:{width: 184, height: 861, spacing: 0, count: 27, margin: 0},
        animations: {
            closedFins: 0,                              //fins stay shut
            deployFins: [0, 2, "deployedFins", 0.1],    //fins extend
            deployedFins: 2,                            //fins stay open
            closeFins: {                                //fins close
                frames: [2,1,0],
                next: "closedFins",
                speed: 0.1
            },
            finsLeft: 3,                                //fins shift left
            finsRight: 5,                               //fins shift right
            closedLegs: 6,                              //legs stay closed
            deployLegs: [6,10, "deployedLegs", 0.1],    //legs extend down
            deployedLegs: 10,                           //legs stay down
        } //end animations
    }; //end data
    
    //SpriteSheet object
    rocket_sheet = new createjs.SpriteSheet(data);
    
    
    //spritesheet for fire
    //HTML Image Object
    image = queue.getResult("falcon9fire");
    
    //generic object
    data = {
        images: [image],
        frames:{width: 50, height: 364, spacing: 0, count: 21, margin: 0},
        animations: {
            noFire: 20,                                     //empty frame only
                
                //animations for engine firing continuously
            tinyFire: [15,19, "tinyFire", 0.3],             //smallest flame
            smallFire: [0,4, "smallFire", 0.3],
            mediumFire: [5,9, "mediumFire", 0.3],
            largeFire: [10,14, "largeFire", 0.3],           //largest flame
                
                //animations for engine cutout
            cutTinyFire: [15,19, "noFire", 1.5],            //steps tiny to none
            cutSmallFire: [0,4, "cutTinyFire", 1.5],        //steps small to tiny
            cutMediumFire: [5,9, "cutSmallFire", 1.5],      //steps medium to small
            cutLargeFire: [10,14, "cutMediumFire", 1.5]     //steps large to medium
        } //end animations
    }; //end data
    
    //SpriteSheet object
    fire_sheet = new createjs.SpriteSheet(data);
    
    //spritesheet for thruster
    //HTML Image Object
    image = queue.getResult("falcon9thrusters");
    
    //generic object
    data = {
        images: [image],
        frames:{width: 50, height: 75, spacing: 0, count: 6, margin: 0},
        animations: {
            noThrust: 5,                                    //empty frame only
            thrust: [0,4, "thrust", 0.3]                    //continuous animation
        } //end animations
    }; //end data
    
    //SpriteSheet object
    thruster_sheet = new createjs.SpriteSheet(data);
}//end buildSpriteSheets()


function build_Rocket(){
    
    const START_Y = 300;    //-150
    var randomX, randomAngle, shiftX, startY;
    
    //calculate position and angle values needed for rocket initialization
    randomX = Math.floor(Math.random() * stage.canvas.width/2); //0 - 600
    randomAngle = Math.floor(Math.random() * 10);        //0 - 10
    shiftX = stage.canvas.width/5;  //shift position 20% from left edge
    
    rocket = new objects.Rocket(rocket_sheet, fire_sheet, thruster_sheet);

    rocket.position(randomX + shiftX, START_Y, randomAngle);
}

//=================================================================================//
//                                      Debug                                      //
//=================================================================================//

/*
 Used to visualize x,y coordinates on canvas.
 */
function build_Rect(x, y, width, height, color){
    
    var rect;
    
    rect = new createjs.Shape();
    rect.graphics.beginStroke(color).drawRect(x,y,width,height);
    rect.x = rect.y = 0;
    
    stage.addChild(rect);
    stage.update();
}

function callAlert(){
    alert("callAlert");
}

function build_Text(){
    diagText = new createjs.Text("", "20px Arial", "white");
    diagText.x = 50;
    diagText.y = 700;
    
    stage.addChild(diagText);
    stage.update();
}













