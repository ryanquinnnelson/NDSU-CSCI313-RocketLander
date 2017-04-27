//GUIManager2.js

(function () {
 
 window.objects = window.objects || {};

    //constructor
    function GUIManager2(){

         this.Container_constructor();   //superclass constructor
         this.x = this.y = 0;

         this.buildPhysicsBox();
         this.buildPauseScreen();
         this.buildFuelBars();
    }
 
    //extend Container and return prototype of new class
    var g = createjs.extend(GUIManager2, createjs.Container);

 
    //promote overridden attributes and add new class to namespace
    window.objects.GUIManager2 = createjs.promote(GUIManager2, "Container");

 
    //injected properties
     g.physBox;
     g.pauseScreen;
     g.monoBar;
     g.fuelBar;
     
     
     g.buildPhysicsBox = function(){
 
         var t, textBox, newText;
 
         //container
         this.physBox = new createjs.Container();
         this.physBox.y = this.physBox.x = 0;
 
         //graphics object
         t = new createjs.Graphics().beginFill("#646464");
         t.drawRoundRect(0,0,250, 175, 5);
 
         //Shape
         textBox = new createjs.Shape(t);
 
         //Shape properties
         textBox.alpha = 0.7;
         textBox.x = 900;
         textBox.y = 200;
 
         //Text
         newText = new createjs.Text("", "30px Arial", "#000000");
 
         //Text properties
         newText.name = "newText";
         newText.x = textBox.x + 10;
         newText.y = textBox.y + 10;
 
         //add objects to physBox container
         this.physBox.addChild(textBox, newText);
 
         //add physBox container to GUIManager container
         this.addChild(physBox);
     }
 
     g.buildPauseScreen = function(){
     
         var image;

         //Container
         this.pauseScreen = new createjs.Container();
         this.pauseScreen.x = this.pauseScreen.y = 0;

         //Pause Text
         image = new createjs.Bitmap("Assets/PauseScreen2.png");
         image.alpha = 0.6;
         image.x = 200;
         image.y = 250;
 
         //add objects to pauseScreen container
         this.pauseScreen.addChild(image);
         this.pauseScreen.visible = false;
 
         //add pauseScreen to GUIManager container
         this.addChild(pauseScreen);
     }
 
     g.buildFuelBars = function(){
     
         this.monoBar = new objects.FuelBar(700, 100, "#000000", "#000000");
         this.fuelBar = new objects.FuelBar(700, 150, "#000000", "#000000");
 
         //add objects to GUIManager container
         this.addChild(this.monoBar, this.fuelBar);
     }
 
 
 
 
 
 
 
 
}()); //end IIFE

/*

 
 
 
 
 
 
 this.loadScreen = new createjs.Container();

 
 
 guim.updatePhysText = function(input){
 this.physText.getChildByName("newText").text = input;
 };
 
 guim.updateBars = function() {
 
 };
 
 guim.switchPauseScreen = function(){
 this.pauseScreen.visible = !this.pauseScreen.visible;
 };
 


*/
