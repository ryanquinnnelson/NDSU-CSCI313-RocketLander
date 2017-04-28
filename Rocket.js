//Rocket.js
//Rocket object encapsulated in an IIFE (Immediately Invoked Functional Expression)
//IIFE contains all behavior and objects that compose the rocket

(function () {
 
     //constants
     const THRUST_MAX = 100;  //magnitude of force engine generates at full power
     const TORQUE = 1;        //magnitude of torque thruster generates when firing
     const START_FUEL = 1000; //starting rocket fuel level for each attempt
     const START_MONO = 100;  //starting monopropellant level for each attempt
     const START_VX = 0;      //starting horizontal velocity for each attempt
     const START_VY = 10;     //starting vertical velocity for each attempt
     const START_VA = 0;      //starting angular velocity for each attempt
 
 
     //create namespace
     window.objects = window.objects || {};
     
     //constructor
     function Rocket(rocket_sheet, fire_sheet, thruster_sheet){
 
        this.Container_constructor(); //superclass constructor

        //properties
        this.regY = r.center_of_mass;   //vertical registration pt as center of mass
        this.name = "rocket";
        this.visible = true;
 
        //build children
        this.buildBody(rocket_sheet);       //grid fins and rocket body
        this.buildLegs(rocket_sheet);       //landing legs
        this.buildFire(fire_sheet);         //flame animation for engine
        this.buildThrusters(thruster_sheet);//thrust animation for thrusters
        this.buildFirePts();                //end pts of each flame animation
        this.buildThrusterPts();            //ends pts of each thrust animation
    }
 
     //extend Container and return prototype of new class
     var r = createjs.extend(Rocket, createjs.Container);
 
     //promote overridden attributes and add new class to namespace
     window.objects.Rocket = createjs.promote(Rocket, "Container");
 
 
     //inject attributes (properties and methods)
     //==========================================================================//
     //                                Properties                                //
     //==========================================================================//
     //dimensions in pixels
     r.landing_width = 151; //from outside of left landing leg to outside of right
     r.body_width = 39;     //width of rocket body
     r.center_of_mass = 351;//distance of center of mass from top of image
     r.height = 496;        //total height of rocket
     r.landingHeight = 529; //total height of rocket with landing legs extended
     //r.centerToExtendedLegs = 328;
     r.centerToExtendedLegs = 179;  //center of mass to bottom of landing legs
 
     //position
     r.nextX = 0;   //horizontal
     r.nextY = 0;   //vertical
     r.nextA = 0;   //angle (rotation)

     //fuel
     r.fuel = START_FUEL;
     r.mono = START_MONO;
     r.engineLevel = 0;            //controls how much thrust is produced
     r.engineLevelChanged = false; //flag if level changed since firing began
 
     //forces
     r.torque = 0;  //torque currently being applied on rocket
     r.thrust = 0;  //thrust currently being applied on rocket
 
     //velocity
     r.velocityX = START_VX;    //horizontal velocity
     r.velocityY = START_VY;    //vertical velocity
     //r.velocityA = START_VA;    //angular velocity (currently unused)
 
     //event listeners
     r.onLeftThrusterFiring = []; //store functions to call when left thruster fires
     r.onRightThrusterFiring = [];
     r.onEngineFiring = [];
 
 
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
 
         //Left thruster
         //Sprite
         thrusterL = new createjs.Sprite(spritesheet, "noThrust");
         
         //properties
         thrusterL.y = 60;   //relative to rocket container
         thrusterL.x = -10;
         thrusterL.name = "thrusterL";
         thrusterL.rotation = 90;    //rotate spritesheet graphic
         
         //Right thruster
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
 
     //points represent the location of the tip of the flame for each flame size
     //by storing them in the rocket container, they will always retain the exact
     //same position relative to the rocket. If the rocket rotates, the points move
     //with it.
     //points are used for smoke generation
     //points are not intended to be visible
     r.buildFirePts = function(){
     
         var largePt, mediumPt, smallPt, tinyPt;
         
         //large flame
         largePt = new createjs.Shape();
         largePt.x = this.regX;             //relative to rocket container
         largePt.y = this.regY + 65;
         largePt.name = "largePt";
         //largePt.graphics.beginFill("red").drawCircle(largePt.x, largePt.y, 5);
         
         //medium flame
         mediumPt = new createjs.Shape();
         mediumPt.x = this.regX;             //relative to rocket container
         mediumPt.y = this.regY - 20;
         mediumPt.name = "mediumPt";
         //mediumPt.graphics.beginFill("blue").drawCircle(mediumPt.x, mediumPt.y, 5);
         
         //small flame
         smallPt = new createjs.Shape();
         smallPt.x = this.regX;             //relative to rocket container
         smallPt.y = this.regY - 65;
         smallPt.name = "smallPt";
         //smallPt.graphics.beginFill("green").drawCircle(smallPt.x, smallPt.y, 5);
         
         //tiny flame
         tinyPt = new createjs.Shape();
         tinyPt.x = this.regX;             //relative to rocket container
         tinyPt.y = this.regY - 75;
         tinyPt.name = "tinyPt";
         //tinyPt.graphics.beginFill("orange").drawCircle(tinyPt.x, tinyPt.y, 5);
 
         //add to container
         this.addChild(largePt, mediumPt, smallPt, tinyPt);
     }
 
     //points represent the location of the tip of the thrust for each thruster
     //points are used for smoke generation
     //points are not intended to be visible
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
 
         //add to container
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
 
     //sets engine level
     //engine level is limited to values between 0 and 4
     r.setEngineLevel = function(n){
     
         if(n <= 4 && n >= 0){ //within range
             r.engineLevel = n;
         }
     }
 
     //increases engine level by single unit
     r.increaseEngineLevel = function(){
         if(r.engineLevel < 4){    //can't exceed 4
             r.engineLevel++;
             r.engineLevelChanged = true;
         }
     }
 
     //decreases engine level by single unit
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

     r.getMonoPercent = function() {
         return (r.mono / START_MONO);
     }
     
     r.getFuel = function(){
         return r.fuel;
     }

     r.getFuelPercent = function() {
         return (r.fuel / START_FUEL);
     }
 
     r.getStartFuel = function(){   //added
         return START_FUEL;
     }
     
     r.getStartMono = function(){   //added
         return START_MONO;
     }
  
     r.setMono = function(n){
         r.mono = n;
     }
     
     r.setFuel = function(n){
         r.fuel = n;
     }
 
     //decreases monopropellant level by a single unit each time
     r.decreaseMono = function(){
 
         if(r.mono >= 1){  //there is fuel remaining
             r.mono -= 1;
         }
     }
 
     //decreases rocket fuel level by unit proportional to engine level
     //higher engine level decreases fuel level more quickly
     r.decreaseFuel = function(){
 
         if(r.fuel > 0){   //there is fuel remaining
             r.fuel -= r.engineLevel;
         }
 
         //to reset value if high thrust level brought fuel below 0
         if(r.fuel < 0){
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

 
     //overall reset of all variable values except event listeners
     //used when rocket is being repositioned
     //does not reset event listeners because rocket is only being repositioned
     //(the same events would need to be reapplied otherwise)
     r.reset = function(){
 
         //position
         r.nextX = 0;
         r.nextY = 0;
         r.nextA = 0;
         
         //fuel
         r.fuel = START_FUEL;
         r.mono = START_MONO;
         r.engineLevel = 0;
         r.engineLevelChanged = false;
         
         //forces
         r.torque = 0;
         r.thrust = 0;
         
         //velocity
         r.velocityX = START_VX;
         r.velocityY = START_VY;
         //r.velocityA = START_VA;
 
         //visibility
         this.visible = true;
 
         //event listeners
         //r.onLeftThrusterFiring = []; //store functions to call
         //r.onRightThrusterFiring = [];
         //r.onEngineFiring = [];
     }
 
     //==========================================================================//
     //                             Movement Functions                           //
     //==========================================================================//
 
     //sets horizontal and vertical positions of the rocket as well as its rotation
     //rotation is based on CreateJS standard (0 degrees is vertical)
     r.position = function(x, y, angle){
         this.x = x;
         this.y = y;
         this.rotation = angle;
     }
 
     //updates rocket rotation and position
     r.update = function(){
         this.updateRotation();
         this.updatePosition();
     }
 
 
     //rotation
     //updates rotation of rocket based on current torque being applied
     r.updateRotation = function(){
         var nextAngle;
         nextAngle = this.rotation + r.torque;
         r.nextA = nextAngle;
     }
 
     //position
     //updates position of rocket based on horizontal and vertical forces on rocket
     /*
      For both horizontal and vertical positions, current angle of rocket is used to determine amount of total thrust being applied horizontally or vertically (the more horizontal the rocket, the more thrust is applied horizontally).
      
      The resulting horizontal thrust vector is added to the current horizontal velocity of the rocket. This simulates momentum - the rocket will not stop moving to the right if its thrust suddenly is to the left. The rocket will first slow down (reduce its current velocity), and then switch directions. If the rocket is moving horizontally and no thrust is being applied, the rocket will continue to move in the same direction at the same speed.
      
      The resulting vertical thrust vector is added to a value representing the force of gravity. If there is no vertical thrust, the rocket will continue to accelerate downward. If there is thrust, it must overcome the force of gravity.
      
      
      Note:
      There is a need to convert rotation from CreateJS standard to math standard.
      
      CreateJS standard is that 0 degrees = vertical
      math standard is that 0 degrees = right horizontal
      */
     r.updatePosition = function(){
 
         var nextX, nextY, angle, yThrust, xThrust;
         
         //horizontal position
         nextX = this.x;
         angle = 90 - this.rotation;
         xThrust = r.calcXThrust(angle);          //horizontal thrust
         nextX += r.velocityX;                    //revise position
         r.velocityX = r.velocityX + xThrust/100; //update current velocity

         //vertical position
         nextY = this.y;
         angle = 90 - this.rotation;
         yThrust = r.calcYThrust(angle) * -1;   //-1 because y-values are inverted
         nextY += r.velocityY;
         r.velocityY += (0.2 + yThrust/200);
 
         //store calculated values
         r.nextX = nextX;
         r.nextY = nextY;
     }//end updatePosition
 
     //takes current angle in degrees and returns horizontal thrust vector
     r.calcXThrust = function(d){
         return r.thrust * Math.cos(r.degreesToRadians(d));
     }
 
     //takes current angle in degrees and returns vertical thrust vector
     r.calcYThrust = function(d){
         return r.thrust * Math.sin(r.degreesToRadians(d));
     }
 
     //takes degrees and returns radians
     r.degreesToRadians = function(d){
         return d * Math.PI / 180;
     }
 
     //takes future position, angle values; uses them to change the actual position
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
             case "leftThrusterCutout": //currently unavailable
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
 
     //update sprite animation, torque values for firing left thruster
     r.fireLeftThruster = function(){
 
         var isThrusting, child, endPt;
 
         //check whether this thruster is currently firing
         child = this.getChildByName("thrusterL");
         isThrusting = child.currentAnimation === "thrust";
 
         //determine what animation to play and how to revise the torque based on
         //whether thruster is firing and fuel remains
         if(!isThrusting && r.mono > 0){  //so change is made only once
             child.gotoAndPlay("thrust");
             r.torque += TORQUE;
         }
         else if(isThrusting && r.mono <= 0){
             child.gotoAndPlay("noThrust");
             r.torque = 0;
         }//end if
 
         //reduce remaining monopropellant
         r.decreaseMono();
 
         //get tip of thrusting animation
         endPt = this.getThrusterFiringPt(child);

         //event listener for "left thruster firing"
         //run functions added to this event
         //each function call is given the parameter of endPt
         for(i = 0; i < r.onLeftThrusterFiring.length; i++){
 
             r.onLeftThrusterFiring[i](endPt); //call function stored
         }//end for
 
     }//end fireLeftThruster
 
     //update sprite animation, torque values for firing right thruster
     r.fireRightThruster = function(){
 
         var isThrusting, child, endPt;
 
         //check whether this thruster is currently firing
         child = this.getChildByName("thrusterR");
         isThrusting = child.currentAnimation === "thrust";
 
         //determine what animation to play and how to revise the torque based on
         //whether thruster is firing and fuel remains
         if(!isThrusting && r.mono > 0){  //so change is made only once
             child.gotoAndPlay("thrust");
             r.torque -= TORQUE;
         }
         else if(isThrusting && r.mono <= 0){
             child.gotoAndPlay("noThrust");
             r.torque = 0;
         }//end if
 
         //reduce remaining monopropellant
         r.decreaseMono();
 
         //get tip of thrusting animation
         endPt = this.getThrusterFiringPt(child);
 
         //event listener for "right thruster firing"
         //run functions added to this event
         //each function call is given the parameter of endPt
         for(i = 0; i < r.onRightThrusterFiring.length; i++){
 
             r.onRightThrusterFiring[i](endPt); //call function stored
         }//end for
 
     }//end fireRightThruster
 
     //update sprite animation, torque values for cutout left thruster
     r.cutoutLeftThruster = function(){
 
         var isThrusting, child;
 
         //check if thruster is firing
         child = this.getChildByName("thrusterL");
         isThrusting = child.currentAnimation === "thrust";
         
         //update animation and torque
         if(isThrusting){  //so change is made only once
             child.gotoAndPlay("noThrust");
             r.torque -= TORQUE;
         }
     }//end cutoutLeftThruster
 
 
     //update sprite animation, torque values for cutout right thruster
     r.cutoutRightThruster = function(){
 
         var isThrusting, child;
 
         //check if thruster is firing
         child = this.getChildByName("thrusterR");
         isThrusting = child.currentAnimation === "thrust";
         
         //update animation and torque
         if(isThrusting){  //so change is made only once
             child.gotoAndPlay("noThrust"); //set animation
             r.torque += TORQUE;    //set torque
         }
     }//end cutoutRightThruster
 
     //returns reference to hidden shape object stored at tip of thrust animation
     r.getThrusterFiringPt = function(child){
         if(child.name === "thrusterL"){
             return this.getChildByName("thrusterLPt");
         }
         else{
             return this.getChildByName("thrusterRPt");
         }
     }
 
 
 
     //==========================================================================//
     //                              Engine Functions                            //
     //==========================================================================//
 
     //update engine animation, thrust values for engine firing
     r.fireEngine = function(){
 
         var child, isFiring, endPt;
 
         //check if engine is firing
         child = this.getChildByName("fire");
         isFiring =  r.isEngineFiring(child);
 
         //determine what animation to play and how to revise the thrust based on
         //whether engine is firing, current engine level, and if fuel remains
         if(!isFiring && r.fuel > 0){
             r.setFiringAnimation(r.engineLevel, child);
             r.thrust = THRUST_MAX * (r.engineLevel/4);
         }
         else if(isFiring && r.fuel <= 0){
             r.setCutoutAnimation(r.engineLevel, child);
             r.thrust = 0;
         }
         else if(r.engineLevelChanged && r.fuel > 0){
             r.engineLevelChanged = false;    //change once
             r.setFiringAnimation(r.engineLevel, child);  //set animation
             r.thrust = THRUST_MAX * (r.engineLevel/4); //set thrust
         }
 
         //reduce fuel remaining
         r.decreaseFuel();
 
         //get tip of current flame animation
         endPt = this.getEngineFiringPt(child);

         //event listener for "engine firing"
         //run functions added to this event
         //each function call is given the parameter of endPt
         for(i = 0; i < r.onEngineFiring.length; i++){
 
             r.onEngineFiring[i](endPt); //call function stored
         }//end for
     }//end fireEngine
 
     //update engine animation, thrust values for engine cutout
     r.cutoutEngine = function(){
         var child, isFiring;
 
         //check if engine is firing
         child = this.getChildByName("fire");
         isFiring =  r.isEngineFiring(child);
 
         //determine what animation to play and how to revise thrust
         if(isFiring){
             r.setCutoutAnimation(r.engineLevel, child);
             r.thrust = 0;
         }
     }//end cutoutEngine
 
     //helper function returns true if engine is firing
     r.isEngineFiring = function(child){
         
         //flag
         isFiring =  child.currentAnimation === "tinyFire"   ||
                     child.currentAnimation === "smallFire"  ||
                     child.currentAnimation === "mediumFire" ||
                     child.currentAnimation === "largeFire";
 
         return isFiring;
     }
 
     //helper function determines which engine animation to play based on
     //given engine level and sprite
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
 
     //helper function determines which cutout animation to play based on given
     //engine level and sprite
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
 
     //helper function returns the end point corresponding to the current flame
     //animation size
     r.getEngineFiringPt = function(child){
 
         switch(child.currentAnimation){
             case "tinyFire":
                return this.getChildByName("tinyPt");
                break;
             case "smallFire":
                return this.getChildByName("smallPt");
                break;
             case "mediumFire":
                return this.getChildByName("mediumPt");
                break;
             case "largeFire":
                return this.getChildByName("largePt");
                break;
         }
     }
 
     //==========================================================================//
     //                          Land or Crash Functions                         //
     //==========================================================================//
 
     //performs all operations necessary for rocket to land
     //updates animation for rocket
     //updates its vertical position to correspond to the landingSite it landed on
     //revises velocity vectors so rocket does not keep moving
     r.land = function(finalY){
         this.landedAnimation();
         r.nextY = finalY - (r.landingHeight - r.center_of_mass);
         r.velocityX = r.velocityY = 0;
     }
 
     //performs all operations necessary for rocket to crash
     //hides the rocket from view
     //updates animation for rocket
     //updates its vertical position to correspond to the landingSite it landed on
     //revises velocity vectors so rocket does not keep moving
     r.crash = function(finalY){
         this.visible = false;
         this.crashedAnimation();
         r.nextY = finalY - (r.landingHeight - r.center_of_mass);
         r.velocityX = r.velocityY = 0;
     }
 
     //performs all animations required to simulate a rocket crash
     r.crashedAnimation = function(){
         this.cutoutEngine();
         this.cutoutLeftThruster();
         this.cutoutRightThruster();
     }
 
     //performs all animations required to simulate a rocket landing
     r.landedAnimation = function(){
         this.cutoutEngine();
         this.fireLeftThruster();
         this.fireRightThruster();
     }
    //==========================================================================//
    //                               Misc Functions                             //
    //==========================================================================//
 
     //for debugging purposes
     r.toString = function(){
 
         var child = this.getChildByName("fire");
         
         //flag
         isFiring =  child.currentAnimation === "tinyFire"   ||
         child.currentAnimation === "smallFire"  ||
         child.currentAnimation === "mediumFire" ||
         child.currentAnimation === "largeFire";
         var s;
 
     s = "Torque: " + rocket.torque +"\nThrust: " + r.thrust + "\nEngine Level: " + r.engineLevel + "\nEngine Level Changed: " + r.engineLevelChanged + "\nIs Firing: " + isFiring + "\nFuel: " + r.fuel + "\nMono: " + r.mono + "\nRotation: " + this.rotation + "\nNextA: " + r.nextA + "\nVelocityX: " + r.velocityX + "\nVelocityY: " + r.velocityY + "\nFire Animation: " + this.getChildByName("fire").currentAnimation + "\nY: " + this.y + "\nregY: " + this.regY;
 
         return s;
     }

     r.getPhysText = function() {

         return "Velocity(x): " + Number(rocket.velocityX).toFixed(2) +"\nVelocity(y): "
             + (-Number(rocket.velocityY).toFixed(2)) + "\nRotation: " + r.nextA + "\nAltitude: "
         + convertToMeters(1000 - r.nextY - 28).toFixed(2) + "m" + "\nThrust: " + r.engineLevel + "/4";
     };

     function convertToMeters(altitude){
         const PIXELS_PER_METER = 496 / 52;
         return altitude / PIXELS_PER_METER;
     }
 
 }()); //end of IIFE
