var stage, queue, rocket_sheet, fire_sheet;
var rocket;
var forceSummary, resultant;
var gravity = 9.81; //m/s/s

const DRY_MASS = 26500; //kg
const RESIDUAL_PROPELLANT = 1000; //kg

function init(){
    queue = new createjs.LoadQueue(false);
    queue.addEventListener("complete", load);
    queue.loadManifest([
        {id: "falcon9", src: "Assets/Falcon9.png"},
        {id: "falcon9fire", src: "Assets/Falcon9Fire.png"}
    ]);
}

function load(){
    stage = new createjs.Stage("canvas");
    
    buildSpriteSheets();
    buildRocket(400,400,0);
    buildRect(0,0,400,300,"red");
    
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", run);
    
    //forces
    setDefaultForces(rocket);
    getResultant(rocket);
    displayResultant(rocket, "green");
}


//=================================================================================//
//                                Game Mechanics                                   //
//=================================================================================//
function run(e){
    stage.update();
}

//=================================================================================//
//                                      Physics                                    //
//=================================================================================//

/*
    Adding two forces due to gravity, one acting in the upper section and the second acting in the lower section. This results in a more natural rotation if the rocket is angled, rather than if a single gravity force was acting through the center of mass (resulting in no rotation).
 
 //distances are from the top of the target, downward
 */
function setDefaultForces(target){
    
    resetForceSummary();

    var gravityTop, gravityBottom, ratio;
    var topDistance, bottomDistance, remainder;
    
    //percentage of mass below center of mass
    ratio = target.center_of_mass / target.height;
    
    //top gravitational force
    gravity1 = gravity * target.mass * (1-ratio); //percent of gravity force for top
    length1 = target.center_of_mass / 2;        //middle of upper section
    //alert(length1);
    
    //bottom gravitational force
    gravity2 = gravity * target.mass * ratio; //percent for bottom
    remainder = (target.height - target.center_of_mass);
    length2 = remainder/2 + target.center_of_mass; //middle of lower section
    //alert(length2);
    
    //add forces to target
    addForce(target.x, length1, gravity1, 270, target); //straight down
    addForce(target.x, length2, gravity2, 270, target); //straight down
}

function getResultant(target){ //alert("getResultant()");
    
    sumForces(target);
    sumMoments(target);
}



/*
        x:      x-coordinate where force acts
        y:      y-coordinate where force acts
        m:      magnitude in kilonewtons (kN)
        dir:    direction of force vector in degrees, with 0 degrees according to standard geometry convention (horizontal). Degrees increase in counterclockwise fashion according to geometry convention as well.
 
        Note: location of 0 degrees differs from CreateJS (CreateJS has 0 degrees starting vertically). CreateJS follows the same convention for degree increase (counterclockwise).
 
        Note: moment arm is the perpendicular distance between the target's center of mass and the force vector acting on the target.
        Note: length of the moment arm in pixels
 */
function addForce(x,y, magnitude, direction, target){ //alert("addForce()");
    
    var force;
    
    //generic object
    force = {x: x, y:y, magnitude: magnitude, direction: direction};
    
    target.forces.push(force);
}


function sumForces(target){ //alert("sumForces()");
 
    var i, xTotal, yTotal, xForce, yForce;
    
    
    xTotal = yTotal = 0;
    
    for(i = 0; i < target.forces.length; i++){
        
        current = target.forces[i];
        
        //x component
        xForce = getXComponent(current);
        xTotal += xForce;
        
        //y component
        yForce = getYComponent(current);
        yTotal += yForce;
        
        //alert("xForce: " + xForce + ", yForce: " + yForce);
    }
    

    if(Math.abs(xTotal) < 1){ //value is extremely small
        xTotal = 0;
    }
    if(Math.abs(yTotal) < 1){ //value is extremely small
        yTotal = 0;
    }
    
    forceSummary.xComponent = xTotal;  //store value
    forceSummary.yComponent = yTotal;  //store value
    //alert(forceSummary.xComponent + "," + forceSummary.yComponent);
}

/*
    Method takes each force currently acting on target and calculates a total moment in kiloNewton * meters.
 
    For each force acting on the target:
    -   Determine the direction of the force in standard geometric convention (SGC), relative to the target
        (i.e. if the target is pointing 90 degrees SGC and is acted on by a force with a direction of 180 degrees SGC, the direction of the force relative to the target is 180 degrees SGC.
 
        If the target is pointing 135 degrees SGC, and is acted on by a force with a direction of 225 degrees SGC, the direction of the force relative to the target is 180 degrees SGC.
 
        If the target is pointing 45 degrees SGC, and is acted on by a force with a direction of 225 degrees SGC, the direction of the force relative to the target is 270 degrees SGC.
 
    -   Determine the x,y point the force acts at, relative to target coordinate system
 
    -   Break the force into horizontal and vertical components
 
    -   Calculate the moment arm for each component
 
    -   Calculate the moment for each component and add to the total
 
    Once all individual forces have been processed, save the resulting total moment.
 
    Note:
    Negative moment indicates counterclockwise torque.
 
    Standard geometric convention (SGC) for angle:
    -  0 degrees is horizontal
    -  degrees increase in counterclockwise direction
 
    CreateJS convention (CJS) for rotation angle:
    -  0 degrees is vertical
    -  degrees increase in clockwise direction
 */
function sumMoments(target){
    
    var conversion, momentTotal, i, current;
    var relativeDirection, radians, localPt, xForce, yForce, moment_arm, moment;

    //get number of pixels per meter based on image
    conversion = target.height / 52;    //actual first stage is 52.00 m tall
    
    //set starting value
    momentTotal = 0;
    
    for(i = 0; i < target.forces.length; i++){  //for each force in array
        
        current = target.forces[i];
        
        
        //determine direction of force, relative to target coordinate system
        relativeDirection = current.direction + target.rotation;
        radians = degreesToRadians(relativeDirection);
        
        //determine force x,y relative to target coordinate system
        localPt = target.globalToLocal(current.x, current.y);
        
        //determine x- and y-component forces relative to this new direction
        xForce = Math.sin(radians) * current.magnitude;
        yForce = Math.cos(radians) * current.magnitude;

        //calculate horizontal moment in kiloNewton * meters
        moment_arm = Math.abs(target.regY - localPt.y) / conversion;
        moment = yForce * moment_arm;
        momentTotal += moment;

        //calculate vertical moment in kiloNewton * meters
        moment_arm = Math.abs(target.regX - localPt.x) / conversion;
        moment = xForce * moment_arm;
        momentTotal += moment;
    } //end for
    
    
    if(Math.abs(momentTotal) < 1){ //value is extremely small
        momentTotal = 0;
    }
    
    forceSummary.moment = momentTotal; //store value
    //alert(forceSummary.moment);
}



function getXComponent(force){

    var radians;
    
    radians = degreesToRadians(force.direction);
    
    return Math.cos(radians) * force.magnitude;
}

function getYComponent(force){

    var radians;
    
    radians = degreesToRadians(force.direction);
    
    return Math.sin(radians) * force.magnitude;
}


function degreesToRadians(degrees){
    
    return degrees * Math.PI / 180;
}

function radiansToDegrees(radians){
    
    return radians * 180 / Math.PI;
}

function resetForceSummary(){
    
    forceSummary = {xComponent: 0, yComponent: 0, moment: 0};
}


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
    rocket.forces = [];             //forces acting on rocket
    rocket.mass = DRY_MASS + RESIDUAL_PROPELLANT;
    
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
    fire = new createjs.Sprite(fire_sheet, "mediumFire");
    
    //properties
    fire.y = rocket.height - 5;
    fire.name = "fire";
    fire.regX = 25;
    
    //add to container behind other children
    rocket.addChildAt(fire,0);
}

//=================================================================================//
//                                     Graphics                                    //
//=================================================================================//

function buildCenterOfMass(target, color, radius){
    var com, add;
    
    //Shape
    com = new createjs.Shape();
    
    
    //properties
    com.x = target.regX;
    com.y = target.regY;
    com.name = "center of mass";
    
    
    //graphics
    add = radius*1.5;
    com.graphics.beginStroke(color).drawCircle(0, 0, radius);
    com.graphics.moveTo(-add,0).lineTo(add, 0);
    com.graphics.moveTo(0,-add).lineTo(0,add);
    
    target.addChild(com);
}


function displayResultant(target, color){ //alert("displayResultant()");

    var xLength, yLength, rLength;
    var squared, radians, degrees, angle;
    var globalPt;
    
    //Shape
    stage.removeChild(resultant);   //remove old version if it exists
    resultant = new createjs.Shape();
    
    
    //convert force components (kN) into pixel lengths
    xLength = forceSummary.xComponent / 1000;
    yLength = forceSummary.yComponent / 1000;
    
    //calculate resultant length in pixels
    squared = Math.pow(xLength,2) + Math.pow(yLength,2);
    rLength = Math.sqrt(squared);
    
    //determine angle in radians
    radians = Math.atan(yLength/xLength) * -1;
    
    //determine angle in degrees
    degrees = radiansToDegrees(radians);
    
    //convert to CreateJS format
    angle = degrees + 90;

    globalPt = target.localToGlobal(target.regX, target.regY);
    //alert(globalPt);
    
    //properties
    resultant.x = globalPt.x;
    resultant.y = globalPt.y;
    resultant.regX = globalPt.x;
    resultant.regY = globalPt.y;
    resultant.name = "resultant";
    resultant.rotation = angle;
    
    //graphics
    resultant.graphics.setStrokeStyle(6, "round").beginStroke(color);
    resultant.graphics.moveTo(resultant.x, resultant.y).lineTo(resultant.x, resultant.y - rLength);
    resultant.graphics.moveTo(resultant.x-10, resultant.y - rLength + 10);
    resultant.graphics.lineTo(resultant.x, resultant.y - rLength);
    resultant.graphics.lineTo(resultant.x + 10, resultant.y - rLength + 10);
    
    stage.addChild(resultant);
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
            tinyFire: [15,19, "tinyFire", 0.3],
            smallFire: [0,4, "smallFire", 0.3],
            mediumFire: [5,9, "mediumFire", 0.3],
            largeFire: [10,14, "largeFire", 0.3]
        } //end animations
    }; //end data
    
    fire_sheet = new createjs.SpriteSheet(data);
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

