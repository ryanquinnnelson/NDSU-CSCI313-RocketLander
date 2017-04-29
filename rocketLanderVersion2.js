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

var rocket_sheet, fire_sheet, thruster_sheet, explosion_sheet;
var stage, queue;                               //required for createjs library
var rocket, landingSite;                        //game objects
var collider, gameManager, backgroundManager, guiManager;   //encapsulated objects
var diagText, tempBar;


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
        {id: "oceanslice", src: "Assets/OceanSlice.png"},
        {id: "pauseScreen", src: "Assets/PauseScreen2.png"},
        {id: "loadScreen", src: "Assets/Loading2.png"},
        {id: "explosion", src: "Assets/Explosion.png"}
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
    build_LandingSite();
    build_BackgroundManager();
    build_Collider();
    //build_tempBar();
    //build_GUI();
    //build_tempBar();
    build_GUIManager();

    build_GameManager();
    //build_Rect(0,0, 500, 500, "red"); //debug
    build_Text();   //debug
    //stage.addChild(rocket, landingSite, gui);
    stage.addChild(landingSite, guiManager);
    //alert(stage.children);
}

function startGame(){

    //Ticker object
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", gameManager.gameStep);
    
    //listen for key / mouse events
    window.onkeydown  = detectKey;  //calls detectKey() for "keydown" event
    window.onkeyup = removeKey;     //calls removeKey() for "keyup" event
}



function gameUpdate(){
    
    if(wKeyDown){
        rocket.fireEngine();
    }
    if(aKeyDown){
        rocket.fireLeftThruster();
    }
    if(dKeyDown){
        rocket.fireRightThruster();
    }
    rocket.update();
    collider.update();

    //gui.update();
    
    //temporary
    //diagText.text = rocket.toString();

    guiManager.updatePhysText(rocket.getPhysText());
    guiManager.updateBars(rocket.getMonoPercent(), rocket.getFuelPercent());
    //temporary

    //tempBar.updateFill(rocket.getMono() / rocket.getStartMono() );
    //diagText.text = rocket.toString();
}

function gameRender(){
    rocket.render();
}

function pause(){
    createjs.Ticker.paused = !createjs.Ticker.paused;
    gameManager.paused = !gameManager.paused;
    guiManager.switchPauseScreen();
    stage.update();
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
        case A_KEY:
            //rocket.fireLeftThruster();
            aKeyDown = true;
            break;
        case D_KEY:
            //rocket.fireRightThruster();
            dKeyDown = true;
            break;
        case UP_ARROW:
            rocket.increaseEngineLevel();
            break;
        case DOWN_ARROW:
            rocket.decreaseEngineLevel();
            break;
        case RIGHT_ARROW:
            backgroundManager.switchLevel();     //changes game level
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
            rocket.cutoutEngine();
            break;
        case A_KEY:
            aKeyDown = false;
            rocket.cutoutLeftThruster();
            break;
        case D_KEY:
            dKeyDown = false;
            rocket.cutoutRightThruster();
            break;
    }
}


//=================================================================================//
//                                   Load Functions                                //
//=================================================================================//

/*
 Performs all operations necessary to build the data objects and spritesheets used in the game.
 */
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
        frames:{width:50, height: 75, spacing: 0, count: 6, margin: 0},
        animations: {
            noThrust: 5,                                    //empty frame only
            thrust: [0,4, "thrust", 0.3]                    //continuous animation
        } //end animations
    }; //end data
    
    //SpriteSheet object
    thruster_sheet = new createjs.SpriteSheet(data);

    image = queue.getResult("explosion");

    data = {
        images: [image],
        frames:{width: 96, height: 96, spacing: 0, count: 12, margin: 0},
        animations: {
            boom: [0, 11, .1]                    //continuous animation
        },
        framerate: 30//end animations
    }; //end data

    explosion_sheet = new createjs.SpriteSheet(data);
}//end buildSpriteSheets()


/*
 Performs all operations necessary to instantiate the rocket object and position it within the stage.
 
 Each time the rocket is built, function calculates a random horizontal position and angle.
 */
function build_Rocket(){ //alert("build");
    
    const START_Y = -150;    //-150
    var randomX, randomAngle, shiftX, startY;
    
    //calculate position and angle values needed for rocket initialization
    randomX = Math.floor(Math.random() * stage.canvas.width/2); //0 - 600
    randomAngle = Math.floor(Math.random() * 10);        //0 - 10
    shiftX = stage.canvas.width/5;  //shift position 20% from left edge
    
    if(!rocket){ //rocket hasn't been initialized yet
        
        //construct rocket object
        rocket = new objects.Rocket(rocket_sheet, fire_sheet, thruster_sheet);
        
        //store function definitions in event listeners
        rocket.addToListener("leftThrusterFiring", build_Smoke);
        rocket.addToListener("rightThrusterFiring", build_Smoke);
        rocket.addToListener("engineFiring", build_Smoke);
        
        stage.addChild(rocket);
    } //end if
    
    rocket.position(randomX + shiftX, START_Y, randomAngle);
}//end build_Rocket

/*
 Encapsulates all operations necessary to instantiate the landingSite and position it within the stage. Landing Site object contains all functionality and properties related to the landing site inside itself.
 */
function build_LandingSite(){
    
    //default location
    const START_X = 0;
    const START_Y = stage.canvas.height - 50;
    const START_W = stage.canvas.width;
    const START_H = 10;
    
    //Shape
    landingSite = new createjs.Shape();
    landingSite.visible = false;
    
    //createjs properties
    landingSite.graphics.beginFill("green").drawRect(0, 0, START_W, START_H);
    landingSite.drawRect = landingSite.graphics.command; //store reference for later
    landingSite.x = START_X;
    landingSite.y = START_Y;
    
    //dynamically injected properties
    landingSite.width = stage.canvas.width;
    
    //draws the landing site based on the given level
    //gco stands for graphic command object
    landingSite.redraw = function(level){
        
        var gco, w,x; //h;
        
        switch(level){
            case 0: //earth
                w = stage.canvas.width; //landing site extends full width of canvas
                //h =
                x = 0;
                break;
            case 1: //ocean
                w = 450;                //landing site only on drone ship
                //h =
                x = 335;
                break;
        }
        
        gco = landingSite.drawRect; //reference to Graphics.Rect gco
        gco.w = w;
       // gco.h = h;    //height doesn't change
        //gco.x = x;
        this.width = w;
        this.x = x;
    }
    
    landingSite.show = function(){
        this.visible = true;
    }
    
    landingSite.hide = function(){
        this.visible = false;
    }
}//end build_landingSite

/*
 Encapsulates all operations necessary to build the backgrounds of the game as well as an object to manage them. Slices of the backgrounds are drawn in front of the rocket  to hide any flame extending below the landing site level. This gives the impression that the ground is solid.
 */
function build_BackgroundManager(){
    
    var ocean, earth, oceanSlice, earthSlice;
    
    backgroundManager = new createjs.DisplayObject();
    
    //build Earth background
    //HTML image element
    image = queue.getResult("earth");
    
    //Bitmap
    earth = new createjs.Bitmap(image);
    earth.x = earth.y = 0;
    earth.visible = true;
    earth.name = "earth";
    
    //background slice to hide flames that go into the ground (past 0 altitude)
    image = queue.getResult("earthslice");
    
    //Bitmap
    earthSlice = new createjs.Bitmap(image);
    earthSlice.x = earthSlice.y = 0;
    earthSlice.visible = true;
    earthSlice.name = "earthslice";
    
    //build Ocean background
    //HTML image element
    image = queue.getResult("ocean");
    
    //Bitmap
    ocean = new createjs.Bitmap(image);
    ocean.x = ocean.y = 0;
    ocean.visible = false;
    ocean.name = "ocean";
    
    //background slice to hide flames that go into the ground (past 0 altitude)
    image = queue.getResult("oceanslice");
    
    //Bitmap
    oceanSlice = new createjs.Bitmap(image);
    oceanSlice.x = oceanSlice.y = 0;
    oceanSlice.visible = false;
    oceanSlice.name = "oceanslice";
    
    //add to stage
    stage.addChildAt(earth, ocean, 0);
    stage.addChild(earthSlice, oceanSlice);

    backgroundManager.current = 0;

    backgroundManager.switchLevel = function(){
        if(gameManager.paused){
            if(this.current === 0){
                this.show(1);
                this.current = 1;
                landingSite.redraw(1);
            } else {
                this.show(0);
                this.current = 0;
                landingSite.redraw(0);
            }
            stage.update();
        }

    }
    
    //function used to change the visibility of the background object based on level
    backgroundManager.show = function(level){
        switch(level){
            case 0:
                this.showEarthBackground();
                break;
            case 1:
                this.showOceanBackground();
                break;
        }//end switch
    }
    
    backgroundManager.showEarthBackground = function(){
        var background, slice;
        
        background = stage.getChildByName("earth");
        slice = stage.getChildByName("earthslice");
        
        background.visible = slice.visible = true;
        this.hideOceanBackground();
    }
    
    //unnecessary method
    backgroundManager.hideEarthBackground = function(){
        var background, slice;
        
        background = stage.getChildByName("earth");
        slice = stage.getChildByName("earthslice");
        
        background.visible = slice.visible = false;
    }
    
    backgroundManager.showOceanBackground = function(){
        var background, slice;
        
        background = stage.getChildByName("ocean");
        slice = stage.getChildByName("oceanslice");
        
        background.visible = slice.visible = true;
        this.hideEarthBackground();
    }
    
    //unnecessary method
    backgroundManager.hideOceanBackground = function(){
        var background, slice;
        
        background = stage.getChildByName("ocean");
        slice = stage.getChildByName("oceanslice");
        
        background.visible = slice.visible = false;
    }
}

/*
 Encapsualtes all functionality necessary to build and animate smoke from the rocket.
 Function is called every time a thruster or engine fires. The generated smoke bitmap is placed near the given point, then fades upward and is removed.
 
 Position and amount of time for fadeout is randomly selected to create a more realistic appearance to the smoke.
 */
function build_Smoke(endPt){
    
    var b, image,randomX, randomShift, randomDirection, globalPt, randomMS;

    //get x,y of endPt, relative to stage
    if(endPt){ //not undefined
        globalPt = endPt.localToGlobal(endPt.x, endPt.y);
        
        //calculate random values for use with positioning
        randomDirection = Math.random() > 0.5 ? -1 : 1; //50% chance either direction
        randomX = Math.floor(Math.random() * 30);
        randomShift = randomX * randomDirection;
        
        //HTML image object
        image = queue.getResult("smoke");
        
        //Bitmap object
        b = new createjs.Bitmap(image);
        b.x = globalPt.x - b.image.width/2 + randomShift;    //center horizontally
        b.y = globalPt.y - b.image.height/2;                 //center vertically
        b.alpha = 0.5;                                       //slightly transparent
        b.name = "smoke";
        
        //injected properties
        b.complete = function(){

            stage.removeChild(this);
        }
        
        //smoke bitmap visibility is decreased and object is moved upward
        b.fadeout = function(e){
            
            var randomMS;
            
            //calculate random amount of time to add to standard fadeout time
            randomMS = Math.floor(Math.random() * 500) + 3000;    //3000 - 3500
            
            //uses tween to fade target while also moving it upward
            //calls for sprite to be removed after completing this animation
            createjs.Tween.get(e.target).to({alpha: 0, y: e.target.y - 150}, randomMS).call(b.complete);
        }
        
        //add event listener to bitmap to be called when object added to stage
        b.addEventListener("added", b.fadeout);
        
        //add to container
        stage.addChild(b);
    }//end if
}//end build_Smoke

/*
 Encapsulates all functionality needed to keep track of the rocket and the landing site and detect when a collision occurs. Collider also detects whether rocket landed or crashed.
 */
function build_Collider(){
    
    collider = new createjs.DisplayObject();

    //injected properties
    //variables
    collider.rocketAltitude;    //height above bottom of stage in pixels
    collider.landingSiteAltitude;
    
    //functions
    collider.getRocketAltitude = function(){
        return this.rocketAltitude;
    }
    
    collider.getLandingSiteAltitude = function(){
        return this.landingSiteAltitude;
    }
    
    collider.update = function(){
        this.updateCollision();
        this.updateAltitude();
    }
    
    //updates the store altitude values of both the rocket and landing site
    collider.updateAltitude = function(){
        this.rocketAltitude = rocket.y + rocket.centerToExtendedLegs;
        this.landingSiteAltitude = landingSite.y;
    }
    
    //check rocket against landingSite and water, trigger events if collision
    collider.updateCollision = function(){//alert("check");
        
        var shiftY, shiftX, width;
        var goodRotation, goodXSpeed, goodYSpeed, goodXRange, goodYRange, landed;
        var pastLeftEdge, pastRightEdge;
        
        //for use in collision calculations
        shiftY = rocket.landingHeight - rocket.center_of_mass;
        shiftX = rocket.landing_width/2;    //half the width of distance between legs
        width = landingSite.width;
        
        //checklist for a proper landing
        //checks vertical range first
        goodYRange = (rocket.nextY >= landingSite.y - shiftY);
        
        if(goodYRange){  //vertical range is good
            
            //checklist for proper landing
            goodRotation  = Math.abs(rocket.rotation) < 5; //rotation < 5 degrees
            goodYSpeed    = Math.abs(rocket.velocityY) < 10; //speed < 10 m/s
            goodXSpeed    = Math.abs(rocket.velocityX) < 10;
            
            //rocket horizontally in correct location
            pastLeftEdge = (rocket.nextX - shiftX >= landingSite.x);
            pastRightEdge = !(rocket.nextX + shiftX <= landingSite.x + width);
            goodXRange = pastLeftEdge && !pastRightEdge;
            
            //checks whether proper landing conditions have been met
            landed = goodXRange && goodRotation && goodXSpeed && goodYSpeed;
            
            
            if(landed){
                this.rocketLanded();
            }
            else{
                this.rocketCrashed();
            }
        }//end if(goodYRange)
    }//end collider.update
    
    //triggers functions from rocket and gameManager related to a landed rocket
    collider.rocketLanded = function(){
        rocket.land(landingSite.y);
        guiManager.showLandedText();
        gameManager.restartGame();
    }
    
    //triggers functions from rocket and gameManager related to a crashed rocket
    collider.rocketCrashed = function(){
        rocket.crash(landingSite.y);
        guiManager.explode(rocket.x);
        gameManager.restartGame();
    }
}

function build_GUIManager(){
    guiManager = new objects.GUI_Manager();
}

/*
function build_GUI(){
    
    var image;
    
    image = queue.getResult("pauseScreen");
    
    gui = new objects.GUI(image);
}
 */

function build_GameManager(){

    gameManager = new createjs.DisplayObject();
    
    //properties
    gameManager.count = 0;
    gameManager.gameover = false;
    gameManager.paused = createjs.Ticker.paused;
    
    gameManager.gameStep = function(e){
        
        if(!createjs.Ticker.paused){
            
            if(!gameManager.gameover){
                gameUpdate();
                gameRender();
            }
            
            stage.update();
        }
    }
    
    gameManager.restartGame = function(){
        
        gameManager.count++;
        gameManager.gameover = true;
        
        //window.removeEventListener("keydown", detectKey); //doesn't work
        //need to stop key access
        //wKeyDown = sKeyDown = dKeyDown = aKeyDown = false;
        
        if(gameManager.count === 1){
            
            //wait 2 seconds, then reset game
            createjs.Tween.get(diagText).to({rotation: 0}, 2500).call(gameManager.reset);
        }
    }
    
    gameManager.reset = function(){

        gameManager.count = 0;
        gameManager.gameover = false;
        
        //stage.removeChild(rocket);
        rocket.reset();
        build_Rocket();
        //alert(rocket.children);
        //stage.addChildAt(rocket,3);
    }
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

function build_tempBar(){
    tempBar = new objects.FuelBar(750,50,"green", "black");
    stage.addChild(tempBar);
}


/*
 //DEPRECATED
 function fadeout(e){
 var randomMS;
 
 //calculate random amount of time to add to standard fadeout time
 randomMS = Math.floor(Math.random() * 500) + 3000;    //3000 - 3500
 
 //uses tween to fade target while also moving it upward
 //calls for sprite to be removed after completing this animation
 createjs.Tween.get(e.target).to({alpha: 0, y: e.target.y - 150}, randomMS).call(removeBitmap);
 }
 
 function removeBitmap(){
 stage.removeChild(this);
 }
 */











