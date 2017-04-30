//rocketLanderVersion2.js

//global variables
var rocket_sheet, fire_sheet, thruster_sheet, explosion_sheet; //animation spritesheets
var stage, queue;              //required for createjs library
var rocket, landingSite;       //game objects
var collider;                  //checks rocket and landing site for collisions
var GM;                        //game manager
var BM;                        //background manager
var guiManager;                //GUI manager
var IM;                        //input manager


//=================================================================================//
//                                   Startup                                       //
//=================================================================================//

/*
 loads images, stores data in objects for later ref
 */
function load(){
    queue = new createjs.LoadQueue(false);
    queue.on("complete", init, once=true);
    queue.loadManifest([
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
        {id: "explosion", src: "Assets/Explosion2.png"}
    ]);
}


function init(){
    loadGame();
    startGame();
}


function loadGame(){ //alert("loadGame()");
    
    //create stage
    stage = new createjs.Stage("canvas");
    
    //objects
    build_SpriteSheets();
    build_Rocket();
    build_LandingSite();
    build_BackgroundManager();
    build_Collider();
    build_GUIManager();
    build_GameManager();
    build_InputManager();

    //add to stage
    stage.addChild(landingSite, guiManager);
    
    //show load screen
    guiManager.loadAnimation(GM);
}

function startGame(){

    //Ticker object
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", GM.gameStep);
    
    //listen for key / mouse events
    window.onkeydown  = IM.detectKey;  //calls detectKey() for "keydown" event
    window.onkeyup = IM.removeKey;     //calls removeKey() for "keyup" event
}



//=================================================================================//
//                       Load Functions  - Animations                              //
//=================================================================================//

/*
 Performs all operations necessary to build the data objects 
 and spritesheets used in the game.
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
        frames:{width: 96, height: 96, spacing: 0, count: 13, margin: 0},
        animations: {
            boom: [0, 11, "gone", .25],
            gone: 12
        }
    }; //end data

    explosion_sheet = new createjs.SpriteSheet(data);
}//end buildSpriteSheets()


//=================================================================================//
//                        Load Functions  - Game Objects                           //
//=================================================================================//


/*
 Performs all operations necessary to instantiate the rocket object and position it within the stage.
 Each time the rocket is built, function calculates a random horizontal position and angle.
 */
function build_Rocket(){ //alert("build");
    
    const START_Y = -200;    //-150
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
 Encapsulates all operations necessary to instantiate the landingSite and position it within the stage. 
 Landing Site object contains all functionality and properties related to the landing site inside itself.
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


//=================================================================================//
//                    Load Functions  - Encapsulated Objects                       //
//=================================================================================//

/*
 Encapsulates all operations necessary to build the backgrounds of the game as well 
 as an object to manage them. Slices of the backgrounds are drawn in front of the 
 rocket to hide any flame extending below the landing site level. This gives the
 impression that the ground is solid.
 */
function build_BackgroundManager(){
    
    var ocean, earth, oceanSlice, earthSlice;
    
    BM = new createjs.DisplayObject();
    
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

    BM.setBackground = function(level){
        
        var currentBackground, currentSlice, nextBackground, nextSlice;
        
        switch(level){
            case 0:
                currentBackground = stage.getChildByName("ocean");
                currentSlice = stage.getChildByName("oceanslice");
                nextBackground = stage.getChildByName("earth");
                nextSlice = stage.getChildByName("earthslice");
                break;
                
            case 1:
                currentBackground = stage.getChildByName("earth");
                currentSlice = stage.getChildByName("earthslice");
                nextBackground = stage.getChildByName("ocean");
                nextSlice = stage.getChildByName("oceanslice");
                break;
        }//end switch
        
        nextBackground.visible = nextSlice.visible = true;
        currentBackground.visible = currentSlice.visible = false;
        
        stage.update();
    }//end setBackground
}

/*
 Encapsulates all functionality needed to keep track of the rocket 
 and the landing site and detect when a collision occurs. 
 Collider also detects whether rocket landed or crashed.
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
            goodYSpeed    = Math.abs(rocket.velocityY) < 5; //speed < 10 m/s
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
    
    //triggers functions from rocket and GM related to a landed rocket
    collider.rocketLanded = function(){
        rocket.land(landingSite.y);
        guiManager.showLandedText();
        setTimeout(GM.restartGame(), 1000);
    }
    
    //triggers functions from rocket and GM related to a crashed rocket
    collider.rocketCrashed = function(){
        rocket.crash(landingSite.y);
        guiManager.explode(rocket.x);
        setTimeout(GM.restartGame(), 1000);
    }
}

function build_GUIManager(){
    
    guiManager = new objects.GUI_Manager();
}

function build_InputManager(){
    
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
    
    IM = new createjs.DisplayObject();
    
    /*
     Changes flags for movement control based on keyboard input.
     Calls certain methods for other keyboard input.
     */
    IM.detectKey = function(e){
        //type check for known browser issues
        e = !e ? window.event : e; //if event is not event, get window.event;
        
        switch(e.keyCode) {
            case W_KEY:
                //wKeyDown = true;
                GM.set_wKeyDown(true);
                break;
            case A_KEY:
                //aKeyDown = true;
                GM.set_aKeyDown(true);
                break;
            case D_KEY:
                //dKeyDown = true;
                GM.set_dKeyDown(true);
                break;
            case UP_ARROW:
                rocket.increaseEngineLevel();
                break;
            case DOWN_ARROW:
                rocket.decreaseEngineLevel();
                break;
            case RIGHT_ARROW:
                GM.switchLevel();     //changes game level
                break;
            case SPACEBAR:
                GM.pause();           //pauses or unpauses the game
                break;
        }//end switch
    }//end detectKey
    
    /*
     Changes flags for movement control based on keyboard input.
     */
    IM.removeKey = function(e){
        //type check for known browser issues
        e = !e ? window.event : e;  //if event is not event, get window.event;
        
        switch(e.keyCode) {
            case W_KEY:
                //wKeyDown = false;    //flag for movement
                GM.set_wKeyDown(false);
                rocket.cutoutEngine();
                break;
            case A_KEY:
                //aKeyDown = false;
                GM.set_aKeyDown(false);
                rocket.cutoutLeftThruster();
                break;
            case D_KEY:
                //dKeyDown = false;
                GM.set_dKeyDown(false);
                rocket.cutoutRightThruster();
                break;
        }//end switch
    }//end removeKey
    
}

function build_GameManager(){

    GM = new createjs.DisplayObject();
    
    //properties
    GM.count = 0;
    GM.gameover = true;
    //GM.paused = createjs.Ticker.paused;
    GM.level = 0;
    GM.wKeyDown = false;
    GM.aKeyDown = false;
    GM.dKeyDown = false;
    
    GM.gameStep = function(e){
        
        if(!createjs.Ticker.paused){
            
            if(!GM.gameover){
                GM.gameUpdate();
                GM.gameRender();
            }
            
            stage.update();
        }
    }
    
    GM.gameUpdate = function(){
        
        if(GM.wKeyDown){
            rocket.fireEngine();
        }
        if(GM.aKeyDown){
            rocket.fireLeftThruster();
        }
        if(GM.dKeyDown){
            rocket.fireRightThruster();
        }
        
        rocket.update();
        collider.update();
        guiManager.update(rocket);
    }
    
    GM.gameRender = function(){
        rocket.render();
    }
    
    GM.restartGame = function(){
        
        GM.count++;
        GM.gameover = true;
        
        //window.removeEventListener("keydown", detectKey); //doesn't work
        //need to stop key access
        //wKeyDown = sKeyDown = dKeyDown = aKeyDown = false;
        
        if(GM.count === 1){
            
            //wait 2 seconds, then reset game
            createjs.Tween.get(collider).to({rotation:0}, 2500).call(GM.reset);
        }
    }
    
    GM.reset = function(){

        GM.count = 0;
        GM.gameover = false;

        rocket.reset();
        build_Rocket();
    }
    
    GM.switchLevel = function(){
        
        if(createjs.Ticker.paused){
            GM.level = (GM.level + 1) % 2;
            BM.setBackground(GM.level);
        }
    }
    
    GM.set_wKeyDown = function(value){
        GM.wKeyDown = value
    }
    
    GM.set_aKeyDown = function(value){
        GM.aKeyDown = value
    }
    
    GM.set_dKeyDown = function(value){
        GM.dKeyDown = value
    }
    
    GM.pause = function(){
        
        createjs.Ticker.paused = !createjs.Ticker.paused;
        guiManager.switchPauseScreen();
        
        stage.update();
    }
}

/*
 Encapsulates all functionality necessary to build and animate smoke from the rocket.
 Function is called every time a thruster or engine fires. 
 The generated smoke bitmap is placed near the given point, then fades upward and is removed.
 
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

function sleep(duration) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

