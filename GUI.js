//GUI.js

(function () {
 
 window.objects = window.objects || {};

    //constructor
    function GUI(image){

         this.Container_constructor();   //superclass constructor
         this.x = this.y = 0;

         this.buildPhysicsBox();
         this.buildPauseScreen(image);
         this.buildFuelBars();
    }
 
    //extend Container and return prototype of new class
    var g = createjs.extend(GUI, createjs.Container);

 
    //promote overridden attributes and add new class to namespace
    window.objects.GUI = createjs.promote(GUI, "Container");

 
    //injected properties
     g.physBox;
     g.pauseScreen;
     g.monoBar;
     g.fuelBar;
     
     
     g.buildPhysicsBox = function(){
 
         var t, box, text;
 
         //container
         this.physBox = new createjs.Container();
         this.physBox.y = this.physBox.x = 0;
 
         //graphics object
         t = new createjs.Graphics().beginStroke("black").beginFill("#646464");
         t.drawRoundRect(0,0,250, 275, 5);
 
         //Shape
         box = new createjs.Shape(t);
 
         //Shape properties
         box.alpha = 0.7;
         box.x = 900;
         box.y = 200;
 
         //Text
         text = new createjs.Text("", "28px Arial", "#000000");
 
         //Text properties
         text.name = "text";
         text.x = box.x + 10;
         text.y = box.y + 10;
 
         //add objects to physBox container
         this.physBox.addChild(box, text);
 
         //add physBox container to GUI container
         this.addChild(this.physBox);
     }
 
     g.buildPauseScreen = function(image){
     
         //var image;

         //Container
         this.pauseScreen = new createjs.Bitmap(image);
         //this.pauseScreen.x = this.pauseScreen.y = 0;

         //Pause Text
         //image = new createjs.Bitmap("Assets/PauseScreen2.png");
         //image.alpha = 0.6;
         this.pauseScreen.x = 200;
         this.pauseScreen.y = 250;
 
         //add objects to pauseScreen container
         //this.pauseScreen.addChild(image);
         this.pauseScreen.visible = false;
 
         //add pauseScreen to GUI container
         this.addChild(this.pauseScreen);
     }
 
     g.buildFuelBars = function(){
     
         this.monoBar = new objects.FuelBar(750,50,"green", "black");
         this.fuelBar = new objects.FuelBar(750,100, "green", "black");
 
         //add objects to GUI container
         this.addChild(this.monoBar, this.fuelBar);
     }
 
     g.togglePauseScreen = function(){
        this.pauseScreen.visible = !this.pauseScreen.visible;
     }
 
     g.update = function(){
        this.updateText();
        this.updateBars();
     }
 
     g.updateBars = function(){
         this.monoBar.updateText("mono", rocket.getMono(), rocket.getStartMono());
         this.monoBar.updateFill(rocket.getMono() / rocket.getStartMono() );
         this.fuelBar.updateText("fuel", rocket.getFuel(), rocket.getStartFuel());
         this.fuelBar.updateFill(rocket.getFuel() / rocket.getStartFuel() );
     }
 
     g.updateText = function(){
 
         var t, message, altitude;
         
         altitude = this.convertToMeters(1141.20 - collider.getRocketAltitude());
 
         message = "Torque: " + rocket.getTorque() +
                   "\nThrust: " + rocket.getThrust() +
                   "\nRotation: " + rocket.rotation +
                    "\n\nVelocity(x): " + rocket.getVX().toFixed(2)  +
                   "\nVelocity(y): " + rocket.getVY().toFixed(2)  +
                   "\nAltitude: " + altitude.toFixed(2) +
                   "\n\nEngine Level: " + rocket.getEngineLevel();
 
        t = this.physBox.getChildByName("text");
        t.text = message;
     }
 
     g.convertToMeters = function(altitude){
     
        const PIXELS_PER_METER = 496 / 52;
        return altitude / PIXELS_PER_METER;
     }
 
}()); //end IIFE












