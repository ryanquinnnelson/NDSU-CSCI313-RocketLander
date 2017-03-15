var currentKey = 0;
var statistics = {
    xForce: 0,
    yForce: 0,
    torque: 0,
    xAcceleration: 0,
    yAcceleration: 0,
    aAcceleration: 0,
    xVelocity: 0,
    yVelocity: 0,
    aVelocity: 0,
    xDisplacement: 0,
    yDisplacement: 0,
    aDisplacement: 0
}

//=================================================================================//
//                                    Rocket                                       //
//=================================================================================//

function init(){
    var array = [];
    
    
}

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


//=================================================================================//
//                                Physics Engine                                   //
//=================================================================================//

/*
Force
-   direction: in degrees, based on standard geometric convention
-   magnitude: in kiloNewtons (kN)
-   relative: whether direction is relative to object or absolute
-   key: reference to point on the object that the force acts through


*/

function addForce(x,y, m, d, relative){
    var s, force;
    
    //Force object
    force = {magnitude: m, direction: d, relative: relative, key: currentKey};
    
    //Shape object
    s = new createjs.Shape();
    
    //createjs properties
    s.x = x;
    s.y = y;
    s.graphics.beginFill("blue").drawCircle(0,0,2);
    
    //dynamically injected properties
    s.key = currentKey;
    
    //increment currentKey by 1 to ensure key linking force to shape is unique
    currentKey++;
    
    //add Shape to rocket
    rocket.addChild(s);
    
    //add Force to rocket array
    rocket.forces.push(force);
}

function sumForces(){
    
    xTotal = yTotal = tTotal = 0;
    
    for(i = 0; i < target.forces.length; i++){ //for each force in array
        
        current = target.forces[i];
        
        //force
        //x component
        xForce = calcForceComponent(current, "x");
        xTotal += xForce;
        
        //y component
        yForce = calcForceComponent(current, "y");
        yTotal += yForce;
        
        
        //torque
        
    }
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














