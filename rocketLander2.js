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














