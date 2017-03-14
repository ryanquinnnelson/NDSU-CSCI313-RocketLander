//=================================================================================//
//                                   Variables                                     //
//=================================================================================//
//SpaceX Falcon 9 first stage rocket data
const DRY_MASS = 26500; //kg
const RESIDUAL_PROPELLANT = 1000; //kg
const MOMENT_OF_INERTIA = 3.06 * Math.pow(10,6);    //kg * m^2
const PIXELS_PER_METER = 496 / 52;  //ratio of height in pixels vs. height in meters


var gravity = 9.81; // m/s/s




var stage, queue, rocket_sheet, fire_sheet, thruster_sheet;
var rocket;
var forces, accelerations;
var fsText, resultant;






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
    buildRocket(400,400,90);
    //buildRect(0,0,575,400,"red");
    
    
    
    //forces
    resetForces();
    resetAccelerations();
    setDefaultForces(rocket);

    
    
    //GUI
    displayStats("white");
    //displayResultant(rocket, "green");
    
    //ticker
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", run);
}


//=================================================================================//
//                                Game Mechanics                                   //
//=================================================================================//
function run(e){
    if(!e.paused){
        updateRocket();
        updateStats();
        stage.update();
    }
}

function pause(e){
    createjs.Ticker.paused = !createjs.Ticker.paused;
}


//=================================================================================//
//                                  Movement                                       //
//=================================================================================//

function updateRocket(){
    sumForces(rocket);
    calcAccelerations(rocket);
    calcNextPosition(rocket);
}
function calcNextPosition(target){
    
    //get acceleration values
    
    
    
    
    
    
}

//=================================================================================//
//                                   Physics                                       //
//=================================================================================//




function calcAccelerations(target){
    //linear acceleration = Force (kN) / Mass (kg)
    accelerations.horizontal = forces.xComponent / target.mass;
    accelerations.vertical = forces.yComponent / target.mass;
    
    //angular acceleration = Torque (kN * m) / Moment of Inertia (kg * m^2)
    accelerations.angular = forces.torque / target.moment_of_inertia;
}

function getAngularAcceleration(target){
    
    
}
/*
    Adding two forces due to gravity, one acting in the upper section and the second acting in the lower section. This results in a more natural rotation if the rocket is angled, rather than if a single gravity force was acting through the center of mass (resulting in no rotation).
 
 //distances are from the top of the target, downward
 */
function setDefaultForces(target){
    
    

    var gravityTop, gravityBottom, ratio;
    var topDistance, bottomDistance, remainder;
    
    //top gravitational force
    gravity1 = gravity * target.mass * 0.25;     //percent of gravity force for top
    length1 = target.center_of_mass / 2;        //middle of upper section
    
    //bottom gravitational force
    gravity2 = gravity * target.mass * 0.75; //percent for bottom
    remainder = (target.height - target.center_of_mass);
    length2 = remainder/2 + target.center_of_mass; //middle of lower section
    
    //add forces to target
    addForce(0, length1, gravity1, 270, target); //straight down
    addForce(0, length2, gravity2, 270, target); //straight down
}




/*
        x:      x-coordinate where force acts, relative to target
        y:      y-coordinate where force acts, relative to target
        m:      magnitude in kilonewtons (kN)
        dir:    direction of force vector in degrees, with 0 degrees according to standard geometry convention (horizontal). Degrees increase in counterclockwise fashion according to geometry convention as well.
 
        Note: location of 0 degrees differs from CreateJS (CreateJS has 0 degrees starting vertically). CreateJS follows the same convention for degree increase (counterclockwise).
 
        Note: moment arm is the perpendicular distance between the target's center of mass and the force vector acting on the target.
        Note: length of the moment arm in pixels
 */
function addForce(x,y, magnitude, direction, target){ //alert("addForce()");
    
    var force;
    
    //generic object
    force = new createjs.Shape();
    
    //createjs properties
    force.x = x;
    force.y = y;
    force.name = "force";
    force.graphics.beginFill("blue").drawCircle(0,0,2);
    
    //dynamically injected properties
    force.magnitude = magnitude;
    force.direction = direction;
    
    //add to container
    target.addChild(force);
}


function sumForces(target){
    
    var xTotal, yTotal, tTotal, current, xForce, yForce, xTorque, yTorque;
    
    //set initial values
    xTotal = yTotal = tTotal = 0;
    
    for(i = 0; i < target.children.length; i++){ //for each child in target
        
        current = target.children[i];
        
        if(current.name !== "force"){   //child is not a force
            continue;   //skip this iteration
        }
        
        //force
        //x component
        xForce = calcForceComponent(current, "x");
        xTotal += xForce;
        
        //y component
        yForce = calcForceComponent(current, "y");
        yTotal += yForce;
        
        //moment
        //x component
        xTorque = calcTorqueComponent(current, "x", {x: xForce, y: yForce});
        tTotal += xTorque;
        
        //y component
        yTorque = calcTorqueComponent(current, "y", {x: xForce, y: yForce});
        tTotal += yTorque;
    } //end for
    
    
    //simplify if close to zero
    if(Math.abs(xTotal) < 1){ //value is extremely small
        xTotal = 0;
    }
    if(Math.abs(yTotal) < 1){ //value is extremely small
        yTotal = 0;
    }
    if(Math.abs(tTotal) < 1){ //value is extremely small
        tTotal = 0;
    }
    
    //store values
    forces.xComponent = xTotal;
    forces.yComponent = yTotal;
    forces.torque = tTotal;
    //alert(forces.xComponent + "," + forces.yComponent + "," + forces.torque);
}

function calcTorqueComponent(force, type, components){
    var parent, momentArm, torque;
    
    //get container of force
    parent = force.parent;

    //get current x,y of parent center of mass, relative to stage
    centerPt = parent.localToGlobal(parent.regX, parent.regY);
    
    //get force x,y relative to stage
    forcePt = force.localToGlobal(force.regX,force.regY);

    switch(type){
        case "x":
            //calculate moment arm as difference in the y's of target, child
            //convert from pixels into meters
            momentArm = (centerPt.y - forcePt.y) / PIXELS_PER_METER;
            torque = components.x * momentArm;
            break;
            
        case "y":
            //calculate moment arm as difference in the x's of target, child
            //convert from pixels into meters
            momentArm = (forcePt.x - centerPt.x) / PIXELS_PER_METER;
            torque = components.y * momentArm;
            break;
    }
    return torque;
}


function calcForceComponent(force,type){

    var radians, component;
    
    radians = degreesToRadians(force.direction);
    
    switch(type){
        case "x":
            component = Math.cos(radians) * force.magnitude;
            break;
        case "y":
            component = Math.sin(radians) * force.magnitude;
            break;
    }
    
    return component;
}



function degreesToRadians(degrees){
    
    return degrees * Math.PI / 180;
}

function radiansToDegrees(radians){
    
    return radians * 180 / Math.PI;
}

function resetForces(){
    
    forces = {xComponent: 0, yComponent: 0, torque: 0};
}
function resetAccelerations(){
    
    accelerations = {horizontal: 0, vertical: 0, angular: 0};
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
    rocket.mass = DRY_MASS + RESIDUAL_PROPELLANT;
    rocket.moment_of_inertia = MOMENT_OF_INERTIA;
    
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
    fire = new createjs.Sprite(fire_sheet, "mediumFire");
    
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
    thrusterL = new createjs.Sprite(thruster_sheet, "thrust");
    
    //properties
    thrusterL.y = 60;
    thrusterL.x = -10;
    thrusterL.name = "thrusterL";
    thrusterL.rotation = 90;
    
    
    //Sprite
    thrusterR = new createjs.Sprite(thruster_sheet, "thrust");
    
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



//add arrowhead to vector
function displayResultant(target, color){ //alert("displayResultant()");

    var xLength, yLength, rLength, xDiff, Diff;
    var radians, degrees, angle;
    var globalPt, endPt;
    
    //Shape
    stage.removeChild(resultant);   //remove old version if it exists
    resultant = new createjs.Shape();
    
    
    //convert force components (kN) into pixel lengths
    xLength = forces.xComponent / 1000;
    yLength = forces.yComponent / 1000;

    //determine x,y of target center of mass, relative to stage
    globalPt = target.localToGlobal(target.regX, target.regY);
    
    //determine x,y of endpoint of line, relative to stage
    endPt = new createjs.Point(xLength, yLength*-1);
    
    //calculate rotation for arrowhead, based on these points
    xDiff = endPt.x - globalPt.x;
    yDiff = endPt.y - globalPt.y;
    radians = Math.atan(yDiff/xDiff);
    //alert(radiansToDegrees(radians));

    
    //properties
    resultant.x = globalPt.x;
    resultant.y = globalPt.y;
    resultant.name = "resultant";
    
    //graphics
    resultant.graphics.setStrokeStyle(6, "round").beginStroke(color);
    resultant.graphics.moveTo(0, 0);
    resultant.graphics.lineTo(endPt.x, endPt.y);

    
    stage.addChild(resultant);
}

function displayStats(color){
    var m;
    
    m ="Mass: " + rocket.mass
    + " kg\n\n------------------------------"
    + "\n\nForce (x): " + Math.round(forces.xComponent)
    + " kN\n\nForce (y):  " + Math.round(forces.yComponent)
    + " kN\n\nTorque:  " + Math.round(forces.torque)
    + " kN*m\n\n------------------------------"
    + "\n\nAcceleration (x): " + Math.round(accelerations.horizontal)
    + " m/s/s\n\nAcceleration (y): " + Math.round(accelerations.vertical)
    + " m/s/s\n\nAcceleration (angular): " + Math.round(accelerations.angular)
    + " rad/s/s";
    
    fsText = new createjs.Text( m, "20px Arial", color);
    fsText.x = stage.canvas.width - 350;
    fsText.y = 50;
    
    stage.addChild(fsText);
}

function updateStats(){
    var m;
    
    m ="Mass: " + rocket.mass
    + " kg\n\n------------------------------"
    + "\n\nForce (x): " + Math.round(forces.xComponent)
    + " kN\n\nForce (y):  " + Math.round(forces.yComponent)
    + " kN\n\nTorque:  " + Math.round(forces.torque)
    + " kN*m\n\n------------------------------"
    + "\n\nAcceleration (x): " + Math.round(accelerations.horizontal)
    + " m/s/s\n\nAcceleration (y): " + Math.round(accelerations.vertical)
    + " m/s/s\n\nAcceleration (angular): " + Math.round(accelerations.angular)
    + " rad/s/s";
    
    fsText.text = m;
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

