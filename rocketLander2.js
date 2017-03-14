var stage, queue, rocket_sheet, fire_sheet;
var rocket, body, legs, fire;
var resultant;

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
    
    buildRect(0,0,400,400,"red");
    
    
    
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", run);
}












//=================================================================================//
//                                Game Mechanics                                   //
//=================================================================================//
function run(e){
    stage.update();
}


//=================================================================================//
//                                     Graphics                                    //
//=================================================================================//

function showCenterOfMass(target, color, radius){
    var COM = new createjs.Shape();
    //alert(target.regX +"," + target.regY);
    var x = target.x + target.regX;
    var y = target.y + target.regY;
    COM.graphics.beginStroke(color).drawCircle(x, y, radius);
    stage.addChild(COM);
    stage.update();
}


//=================================================================================//
//                                      Physics                                    //
//=================================================================================//

function degreesToRadians(degrees){
    return degrees * Math.PI / 180;
}

function radiansToDegrees(radians){
    return radians * 180 / Math.PI;
}

function resetResultant(){
    resultant = {xComponent: 0, yComponent: 0, moment: 0};
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
function addForce(x,y, m, dir, target){ //alert("addForce()");
    
    var force;
    
    
    
    
    
    
    force = {magnitude: m, direction: dir, moment_arm: 0};
    //alert(force.magnitude + "," + force.direction +"," + force.moment_arm);
    target.forces.push(force);
}


function sumForces(target){
 
    var i, xTotal, yTotal, moment, momentTotal, xForce, yForce;
    
    xTotal = yTotal = momentTotal = 0;
    
    for(i = 0; i < target.forces.length; i++){
        
        current = target.forces[i];
        
        //x component
        xForce = getXComponent(current);
        xTotal += xForce;
        
        //y component
        yForce = getYComponent(current);
        yTotal += yForce;
        
        moment = getMoment(current);
        momentTotal += moment;
        
        //alert("xForce: " + xForce + ", yForce: " + yForce + ", moment: " + moment);
    }
    resultant.xComponent = xTotal;
    resultant.yComponent = yTotal;
    resultant.moment = momentTotal;
}



function getXComponent(force){
    //alert(force);
    var angle;
    
    angle = degreesToRadians(force.direction);
    
    //alert(Math.sin(angle));
    return Math.sin(angle) * force.magnitude;
}

function getYComponent(force){
    //alert(force);
    var angle;
    
    angle = degreesToRadians(force.direction);
    
    //alert(Math.sin(angle));
    return Math.cos(angle) * force.magnitude;
}

function getMoment(force){
    return force.magnitude * force.moment_arm;
}

//=================================================================================//
//                                   Game Objects                                  //
//=================================================================================//

function buildRocket(regX, regY, angle){
    
    rocket = new createjs.Container();
    
    //dynamically injected properties
    rocket.landing_width = 151;
    rocket.body_width = 39;
    rocket.center_of_mass = 351;
    rocket.height = 496;
    rocket.forces = []; //forces acting on rocket
    
    //properties
    rocket.regX = 0;
    rocket.regY = rocket.center_of_mass;
    rocket.x = regX;
    rocket.y = regY;
    rocket.rotation = angle;
    rocket.name = "rocket";
    
    
    //children for container
    buildBody();
    buildLegs();
    buildFire();
    
    //add to stage
    stage.addChild(rocket);
    stage.update();
}

function buildBody(){ //alert("buildRocket()");
    body = new createjs.Sprite(rocket_sheet, "deployFins");
    
    //properties
    body.x = -184/2;
    body.y = 0;
    body.name = "body";
    body.regX = 0;
    body.regY = 0;
    
    //add to container
    rocket.addChild(body);
}

function buildLegs(){
    legs = new createjs.Sprite(rocket_sheet, "deployLegs");
    legs.x = -184/2;
    legs.y = 0;
    legs.name = "legs";
    legs.regX = 0;
    legs.regY = 0;
    
    //add to container
    rocket.addChild(legs);
}


function buildFire(){
    fire = new createjs.Sprite(fire_sheet, "largeFire");
    fire.x = 0;
    fire.y = rocket.height - 5;
    fire.name = "fire";
    fire.regX = 25;
    fire.regY = 0;
    
    //add to container
    rocket.addChildAt(fire,0);
}

//=================================================================================//
//                                   Animations                                    //
//=================================================================================//
function buildSpriteSheets(){ //alert("buildSpriteSheet()");
    var image = queue.getResult("falcon9");
    
    var data = {
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
            smallFire: [11,15, "mediumFire", 0.3],
            mediumFire: [16,20, "largeFire", 0.3],
            largeFire: [21,25, "smallFire", 0.3]
        } //end animations
    }; //end data
    
    rocket_sheet = new createjs.SpriteSheet(data);
    
    //for fire
    image = queue.getResult("falcon9fire");
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
    var rect = new createjs.Shape();
    rect.graphics.beginStroke(color).drawRect(x,y,width,height);
    rect.x = rect.y = 0;
    
    stage.addChild(rect);
    stage.update();
}

