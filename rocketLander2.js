//=================================================================================//
//                                   Variables                                     //
//=================================================================================//
//CONSTANTS
//integers represent the keycode of certain keys on the keyboard
const W_KEY = 87;
const A_KEY = 65;
const D_KEY = 68;
const S_KEY = 83;
const UP_ARROW = 38;
const DOWN_ARROW = 40;
const ESC_KEY = 27;
const SPACEBAR = 32;


const MASS = 27500; //kg
const THRUST = 35;  //kN
const PIXELS_PER_METER = 496 / 52;  //pixel image vs. actual rocket at 52.00 m tall


var wKeyDown = sKeyDown = dKeyDown = aKeyDown = false;    //flags
var thrustChanged = false;
var gravity = 9.81; // acceleration due to gravity
var thrustLevel = 0; //0 - 4



var stage, queue, rocket_sheet, fire_sheet, thruster_sheet;
var rocket;
var pauseText, stats;
var velocityX = 0;
var velocityY = 0;
var direction = 0;





//=================================================================================//
//                                   Startup                                       //
//=================================================================================//
function init(){
    queue = new createjs.LoadQueue(false);
    queue.addEventListener("complete", load);
    queue.loadManifest([
        {id: "falcon9", src: "Assets/Falcon9.png"},
        {id: "falcon9fire", src: "Assets/Falcon9Fire.png"},
        {id: "falcon9thrusters", src: "Assets/Falcon9Thrusters2.png"}
    ]);
}

function load(){
    stage = new createjs.Stage("canvas");
    
    //game objects
    buildSpriteSheets();
    buildRocket(400,400,direction);
    buildPauseText("yellow");
    buildStats("white");
    //buildRect(0,0,575,400,"red");
    
    //ticker
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", run);
    
    //listen for key / mouse events
    window.onkeydown  = detectKey;  //listener calls detectKey() for "keydown"
    window.onkeyup = removeKey;     //listener calls removeKey() for "keyup"
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
            if(thrustLevel < 4){
                thrustLevel++;
                thrustChanged = true;
            }
            break;
        case DOWN_ARROW:
            if(thrustLevel > 0){
                thrustLevel--;
                thrustChanged = true;
            }
            break;
        case ESC_KEY:
            break;
        case SPACEBAR:
            pause(e);
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
        
        
        
        updateRocket();
        updateAnimations();
        renderRocket();
        
        
        updateStats();
        stage.update();
    }
}

function pause(e){
    createjs.Ticker.paused = !createjs.Ticker.paused;
    pauseText.visible = !pauseText.visible;
    stage.update();
}




//=================================================================================//
//                                  Movement                                       //
//=================================================================================//

function updateRocket(){
    
    
    var nextX, nextY, angle, yThrust, xThrust;
    nextX = rocket.x;
    
    if(wKeyDown){
        
        angle = getStandardAngle(rocket.rotation);
        xThrust = getXThrust(angle);
        nextX += xThrust;
        velocityX = xThrust;
        //alert(velocityX);
    }
    else{
        nextX += velocityX;
    }

    
    
    
    
    
    
    //calculate next y position
    nextY = rocket.y;
    
    if(wKeyDown){
        
        angle = getStandardAngle(rocket.rotation);
        yThrust = getYThrust(angle);
        nextY -= yThrust - gravity;
        velocityY++;
    }
    else if(!wKeyDown){
        nextY += gravity;
        velocityY--;
    }
    
    
    
    
    //calculate next angle
    nextAngle = rocket.rotation;
    //alert(nextAngle);
    if(aKeyDown){
        rocket.rotation += 1;
    }
    if(dKeyDown){
        rocket.rotation -= 1;
    }
    

    rocket.nextY = nextY;
    rocket.nextX = nextX;
}




function renderRocket(){
    rocket.y = rocket.nextY;
    rocket.x = rocket.nextX;

}

//convert CreateJS default to standard geometric convention
function getStandardAngle(rotation){
    return 90 - rotation;
}

function getYThrust(angle){
    return THRUST * (thrustLevel/4) * Math.sin(degreesToRadians(angle));
}

function getXThrust(angle){
    return THRUST * (thrustLevel/4) * Math.cos(degreesToRadians(angle));
}

function degreesToRadians(degrees){
    
    return degrees * Math.PI / 180;
}

function radiansToDegrees(radians){
    
    return radians * 180 / Math.PI;
}



//=================================================================================//
//                                   Control                                       //
//=================================================================================//




//=================================================================================//
//                                   Game Objects                                  //
//=================================================================================//

function buildRocket(regX, regY, angle){ //alert("buildRocket()");
    
    //Container
    rocket = new createjs.Container();
    
    //dynamically injected properties
    rocket.landing_width = 151;     //distance in pixels between landing leg tips
    rocket.body_width = 39;         //width in pixels of rocket body
    rocket.center_of_mass = 351;    //distance in pixels from top of rocket to C.O.M.
    rocket.height = 496;            //distance from top of rocket to bottom of engines
    rocket.nextX = 0;
    rocket.nextY = 0;
    rocket.nextAngle = 0;
    
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
    buildCenterOfMass(rocket, "red", 10);
    
    //add to stage
    stage.addChild(rocket);
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

//=================================================================================//
//                                       GUI                                       //
//=================================================================================//

function buildPauseText(color){
    pauseText = new createjs.Text("Game Paused", "40px Arial", color);
    pauseText.textAlign = "center";
    pauseText.x = stage.canvas.width/2;
    pauseText.y = stage.canvas.height/2;
    pauseText.visible = false;
    
    stage.addChild(pauseText);
}

function buildStats(color){
    var m;
    
    m = "Gravity: " + gravity + " m/s/s\n\n"
    + "Velocity (x): " + velocityX.toFixed(2) + " m/s\n\n"
    + "Velocity (y): " + velocityY.toFixed(2) + " m/s\n\n"
    + "Rotation: " + rocket.rotation + " degrees\n\n"
    + "NextY: " + rocket.nextY + " px\n\n"
    + "Thrust Level: " + thrustLevel + "\n\n";
    
    stats = new createjs.Text(m, "24px Arial", color);
    stats.x = stage.canvas.width - 300;
    stats.y = 50;
    
    stage.addChild(stats);
}

function updateStats(){
    stats.text = "Gravity: " + gravity + " m/s/s\n\n"
    + "Velocity (x): " + velocityX.toFixed(2) + " m/s\n\n"
    + "Velocity (y): " + velocityY.toFixed(2) + " m/s\n\n"
    + "Rotation: " + rocket.rotation + " degrees\n\n"
    + "NextY: " + rocket.nextY + " px\n\n"
    + "Thrust Level: " + thrustLevel + "\n\n";
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


function updateEngine(){
    var engineFiring, child;
    
    //flag for engine firing
    child = rocket.getChildByName("fire");
    
    
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

function updateAnimations(){
    
    updateThrusters();
    updateEngine();
    
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




