//Rocket.js

(function () {
 
     //constants
     const THRUST_MAX = 100;       //force rocket generates at full power, in kN
     const TORQUE = 1;        //torque
     const START_FUEL = 5000;  //starting rocket fuel level for each attempt
     const START_MONO = 1000;  //starting monopropellant level for each attempt
     const START_VX = 0;      //starting horizontal velocity for each attempt
     const START_VY = 10;     //starting vertical velocity for each attempt
     const START_VA = 0;      //starting angular velocity for each attempt
 
 
     //create namespace
     window.objects = window.containers || {};
     
     //constructor
     function Rocket(rocket_sheet, fire_sheet, thruster_sheet){
 
        this.Container_constructor(); //superclass constructor

        this.regY = r.center_of_mass;
        this.name = "rocket";

         this.buildBody(rocket_sheet);
         this.buildLegs(rocket_sheet);
         this.buildFire(fire_sheet);
         this.buildThrusters(thruster_sheet);
         this.buildFirePts();
         this.buildThrusterPts();
    }
 
     //extend Container and return prototype of new class
     var r = createjs.extend(Rocket, createjs.Container);
 
     //promote overridden attributes and add new class to namespace
     window.objects.Rocket = createjs.promote(Rocket, "Container");
 
 
     //inject attributes (properties and methods)
     //==========================================================================//
     //                                Properties                                //
     //==========================================================================//
     //dimensions
     r.landing_width = 151;
     r.body_width = 39;
     r.center_of_mass = 351;
     r.height = 496;
     r.landingHeight = 529;
     r.centerToExtendedLegs = 328;
 
     //position
     r.nextX = 0;
     r.nextY = 0;
     r.nextA = 0;
     r.altitude = 0;
 
     //fuel
     r.fuel = START_FUEL;
     r.mono = START_MONO;
     r.engineLevel = 0;
     r.engineLevelChanged = false;
 
     //forces
     r.torque = 0;  //torque currently being applied on rocket
     r.thrust = 0;
 
     //velocity
     r.velocityX = START_VX;
     r.velocityY = START_VY;
     r.velocityA = START_VA;
 
     //event listeners
     r.onLeftThrusterFiring = []; //store functions to call
     r.onRightThrusterFiring = [];
     r.onEngineFiring = [];
 
     r.count = 0;
 
 
     //==========================================================================//
     //                                Child Creation                            //
     //==========================================================================//
 
     //children
     r.buildBody = function(spritesheet){
         var body;
         
         //Sprite
         body = new createjs.Sprite(spritesheet, "deployFins");
         
         //properties
         body.x = -184/2;    //relative to rocket container
         body.name = "body";
         
         //add to container
         this.addChild(body);
     }
 
     r.buildLegs = function(spritesheet){
         var legs;
         
         //Sprite
         legs = new createjs.Sprite(spritesheet, "deployLegs");
         
         //properties
         legs.x = -184/2;    //relative to rocket container
         legs.name = "legs";
         
         //add to container
         this.addChild(legs);
     }
 
     r.buildFire = function(spritesheet){
         var fire;
         
         //Sprite
         fire = new createjs.Sprite(spritesheet, "noFire");
         
         //properties
         fire.y = r.height - 5; //relative to rocket container
         fire.name = "fire";
         fire.regX = 25;
         
         //add to container behind other children
         this.addChildAt(fire,0);
     }
 
 
     r.buildThrusters = function(spritesheet){
         var thrusterL, thrusterR;
         
         //Sprite
         thrusterL = new createjs.Sprite(spritesheet, "noThrust");
         
         //properties
         thrusterL.y = 60;   //relative to rocket container
         thrusterL.x = -10;
         thrusterL.name = "thrusterL";
         thrusterL.rotation = 90;    //rotate spritesheet graphic
         
         
         //Sprite
         thrusterR = new createjs.Sprite(spritesheet, "noThrust");
         
         //properties
         thrusterR.y = 110; //relative to rocket container
         thrusterR.x = 10;
         thrusterR.name = "thrusterR";
         thrusterR.rotation = -90;   //rotate spritesheet graphic
         
         //add to container behind other children
         this.addChildAt(thrusterL,thrusterR,0);
     }
 
     r.buildFirePts = function(){
     
         var largePt, mediumPt, smallPt, tinyPt;
         
         //large flame
         largePt = new createjs.Shape();
         largePt.x = this.regX;
         largePt.y = this.regY + 65;
         largePt.name = "largePt";
         //largePt.graphics.beginFill("red").drawCircle(largePt.x, largePt.y, 5);
         
         //medium flame
         mediumPt = new createjs.Shape();
         mediumPt.x = this.regX;
         mediumPt.y = this.regY - 20;
         mediumPt.name = "mediumPt";
         //mediumPt.graphics.beginFill("blue").drawCircle(mediumPt.x, mediumPt.y, 5);
         
         //small flame
         smallPt = new createjs.Shape();
         smallPt.x = this.regX;
         smallPt.y = this.regY - 65;
         smallPt.name = "smallPt";
         //smallPt.graphics.beginFill("green").drawCircle(smallPt.x, smallPt.y, 5);
         
         //tiny flame
         tinyPt = new createjs.Shape();
         tinyPt.x = this.regX;
         tinyPt.y = this.regY - 75;
         tinyPt.name = "tinyPt";
         //tinyPt.graphics.beginFill("orange").drawCircle(tinyPt.x, tinyPt.y, 5);
         
         this.addChild(largePt, mediumPt, smallPt, tinyPt);
     }
 
     r.buildThrusterPts = function(){
     
         var right, left;
     
         //right thruster
         //Shape
         right = new createjs.Shape();
         right.x = this.regX+25; //relative to rocket container
         right.y = 42;
         right.name = "thrusterRPt";
         //right.graphics.beginFill("red").drawCircle(right.x, right.y, 5);
         
         //left thruster
         //Shape
         left = new createjs.Shape();
         left.x = this.regX-25; //relative to rocket container
         left.y = 42;
         left.name = "thrusterLPt";
         //left.graphics.beginFill("green").drawCircle(left.x, left.y, 5);
         
         this.addChild(right, left);
     }
 
     //==========================================================================//
     //                          Rocket Property Functions                       //
     //==========================================================================//
     //velocity
     r.getVX = function(){
         return r.velocityX;
     }
     
     r.getVY = function(){
         return r.velocityY;
     }
     
     r.setVX = function(vX){
         r.velocityX = vX;
     }
     
     r.setVY = function(vY){
         r.velocityY = vY;
     }
 
     //engineLevel
     r.getEngineLevel = function(){
        return r.thrustLevel;
     }
     
     r.setEngineLevel = function(n){
     
         if(n <= 4 && n >= 0){
             r.engineLevel = n;
         }
     }
 
     r.increaseEngineLevel = function(){
         if(r.engineLevel < 4){    //can't exceed 4
             r.engineLevel++;
             r.engineLevelChanged = true;
         }
     }
     
     r.decreaseEngineLevel = function(){
         if(r.engineLevel > 0){    //can't be lower than 0
             r.engineLevel--;
             r.engineLevelChanged = true;
         }
     }
 
     //fuels
     r.getMono = function(){
         return r.mono;
     }
     
     r.getFuel = function(){
         return r.fuel;
     }
     
     r.setMono = function(n){
         r.mono = n;
     }
     
     r.setFuel = function(n){
         r.fuel = n;
     }
     
     r.decreaseMono = function(){
         if(r.mono >= 1){  //fuel remaining
             r.mono -= 1;
         }
     }
     
     r.decreaseFuel = function(){
         if(r.fuel > 0){   //fuel remaining
             r.fuel -= r.engineLevel;
         }
         if(r.fuel < 0){   //to reset value if high thrust level brought fuel below 0
             r.fuel = 0;
         }
     }
 
    //forces
     r.getTorque = function(){
         return r.torque;
     }
     
     r.getThrust = function(){
         return r.thrust;
     }
 
     //altitude
     r.getAltitude = function(){
        return r.altitude;
     }
 
     r.setAltitude = function(n){
         r.altitude = n;
     }

 
     //==========================================================================//
     //                             Movement Functions                           //
     //==========================================================================//
     //position
     r.position = function(x, y, angle){
         this.x = x;
         this.y = y;
         this.rotation = angle;
     }
 
     r.update = function(){
         this.updateRotation();
         this.updatePosition();
     }
 
 
     //rotation
     r.updateRotation = function(){
         var nextAngle;
         nextAngle = this.rotation + r.torque;
         r.nextA = nextAngle;
     }
 
     r.updatePosition = function(){
         var nextX, nextY, angle, yThrust, xThrust;
         
         //horizontal position
         nextX = this.x;
         angle = 90 - this.rotation;
         xThrust = r.calcXThrust(angle);
         nextX += r.velocityX;
         r.velocityX = r.velocityX + xThrust/100;

 
         //vertical position
         nextY = this.y;
         angle = 90 - this.rotation;
         yThrust = r.calcYThrust(angle) * -1;
         nextY += r.velocityY;
         r.velocityY += (0.2 + yThrust/200);
 
         r.nextX = nextX;
         r.nextY = nextY;
     }
 
     r.calcXThrust = function(d){
         return r.thrust * Math.cos(r.degreesToRadians(d));
     }
 
     r.calcYThrust = function(d){
         return r.thrust * Math.sin(r.degreesToRadians(d));
     }
 
     r.degreesToRadians = function(d){
         return d * Math.PI / 180;
     }
 
     r.render = function(){
         this.x = r.nextX;
         this.y = r.nextY;
         this.rotation = r.nextA;
     }
 
     //==========================================================================//
     //                             Listener Functions                           //
     //==========================================================================//
     //add function definition to a particular Rocket event
     r.addToListener = function(event, func){
         switch(event){
             case "leftThrusterFiring":
                 r.onLeftThrusterFiring.push(func);
                 break;
             case "rightThrusterFiring":
                 r.onRightThrusterFiring.push(func);
                 break;
             case "engineFiring":
                 r.onEngineFiring.push(func);
                 break;
             case "leftThrusterCutout":
                 break;
             case "rightThrusterCutout":
                 break;
             case "engineCutout":
                 break;
         }
     }
 
     //==========================================================================//
     //                             Thruster Functions                           //
     //==========================================================================//
 
     //thrusters
     r.fireLeftThruster = function(){
         //update animation
         var isThrusting, child;
         
         child = this.getChildByName("thrusterL");
         isThrusting = child.currentAnimation === "thrust";
 
         if(!isThrusting && r.mono > 0){  //so change is made only once
             child.gotoAndPlay("thrust");
             r.torque += TORQUE;
         }
 
         //reduce remaining monopropellant
         r.decreaseMono();
 
 
         //run other functions added to this event
         for(i = 0; i < r.onLeftThrusterFiring.length; i++){
             r.onLeftThrusterFiring[i](); //call function stored
         }
     }
 
     r.fireRightThruster = function(){
         //update animation
         var isThrusting, child;
         
         child = this.getChildByName("thrusterR");
         isThrusting = child.currentAnimation === "thrust";
         
         if(!isThrusting && r.mono > 0){  //so change is made only once
             child.gotoAndPlay("thrust");
             r.torque -= TORQUE;
         }
 
         //reduce remaining monopropellant
         r.decreaseMono();
 
         
         //run other functions added to this event
         for(i = 0; i < r.onRightThrusterFiring.length; i++){
             r.onRightThrusterFiring[i](); //call function stored
         }
     }
 
     r.cutoutLeftThruster = function(){
         //update animation
         var isThrusting, child;
 
         child = this.getChildByName("thrusterL");
         isThrusting = child.currentAnimation === "thrust";
         
         //left thruster
         if(isThrusting){  //so change is made only once
             child.gotoAndPlay("noThrust");
             r.torque -= TORQUE;
         }
     }
 
     r.cutoutRightThruster = function(){
         //update animation
         var isThrusting, child;
         
         child = this.getChildByName("thrusterR");
         isThrusting = child.currentAnimation === "thrust";
         
         //left thruster
         if(isThrusting){  //so change is made only once
             child.gotoAndPlay("noThrust"); //set animation
             r.torque += TORQUE;    //set torque
         }
     }
 
     //==========================================================================//
     //                              Engine Functions                            //
     //==========================================================================//
 
     //engine
     r.fireEngine = function(){
         var child, isFiring;
     
         child = this.getChildByName("fire");
         isFiring =  r.isEngineFiring(child);
 
         if(!isFiring && r.fuel > 0){
             r.setFiringAnimation(r.engineLevel, child);  //set animation
             r.thrust = THRUST_MAX * (r.engineLevel/4); //set thrust
         }
         else if(r.engineLevelChanged && r.fuel > 0){
 
             r.engineLevelChanged = false;    //change once
             r.setFiringAnimation(r.engineLevel, child);  //set animation
             r.thrust = THRUST_MAX * (r.engineLevel/4); //set thrust
         }
 
         //reduce fuel remaining
         r.decreaseFuel();
 
         //run other functions added to this event
         for(i = 0; i < r.onEngineFiring.length; i++){
             r.onEngineFiring[i](); //call function stored
         }
     }
 
     r.cutoutEngine = function(){
         var child, isFiring;
         
         child = this.getChildByName("fire");
         isFiring =  r.isEngineFiring(child);
         
         if(isFiring){
             r.setCutoutAnimation(r.engineLevel, child);
             r.thrust = 0;
         }
     }
 
     r.isEngineFiring = function(child){
         
         //flag
         isFiring =  child.currentAnimation === "tinyFire"   ||
                     child.currentAnimation === "smallFire"  ||
                     child.currentAnimation === "mediumFire" ||
                     child.currentAnimation === "largeFire";
 
         return isFiring;
     }
 
     r.setFiringAnimation = function(level, child){
 
         switch(level){
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
     }
 
     r.setCutoutAnimation = function(level, child){
         switch(level){
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
         } //end switch
     }
 
     //==========================================================================//
     //                          Land or Crash Functions                         //
     //==========================================================================//
 
     r.crashedAnimation = function(){
         this.visible = false;
     }
 
     r.landedAnimation = function(){
         this.cutoutEngine();
         this.fireLeftThruster();
         this.fireRightThruster();
     }
    //==========================================================================//
    //                               Misc Functions                             //
    //==========================================================================//
 
     r.toString = function(){
 
         var child = this.getChildByName("fire");
         
         //flag
         isFiring =  child.currentAnimation === "tinyFire"   ||
         child.currentAnimation === "smallFire"  ||
         child.currentAnimation === "mediumFire" ||
         child.currentAnimation === "largeFire";
         var s;
 
         s = "Torque: " + rocket.torque +"\nThrust: " + r.thrust + "\nEngine Level: " + rocket.engineLevel + "\nEngine Level Changed: " + rocket.engineLevelChanged + "\nIs Firing: " + isFiring + "\nCount: " + r.count + "\nFuel: " + r.fuel + "\nMono: " + r.mono + "\nRotation: " + this.rotation + "\nNextA: " + r.nextA + "\nAltitude: " + r.altitude + "\nVelocityX: " + r.velocityX + "\nVelocityY: " + r.velocityY;
 
         return s;
     }
 
 }());
