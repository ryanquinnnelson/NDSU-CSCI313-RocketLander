//FuelBar.js
//Fuel bar is a loading bar with text that is used to visualize remaining fuel

(function () {

     //create namespace
     window.objects = window.objects || {};
     
     //constructor
     function FuelBar(x,y,fillColor, strokeColor){

        this.Container_constructor(); //superclass constructor
 
        //set properties
        this.x = x;
        this.y = y;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
 
        //add children
        this.drawBar();
    }
 
     //extend Container and return prototype of new class
     var f = createjs.extend(FuelBar, createjs.Container);
 
     //promote overridden attributes and add new class to namespace
     window.objects.FuelBar = createjs.promote(FuelBar, "Container");

     //injected properties
     f.width = 400;
     f.height = 40;
     f.fillColor;
     f.strokeColor;
     f.bar;
     f.label;
 
     //initializes all children and adds them to FuelBar container
     f.drawBar = function(){
 
         //outline
         var outline = new createjs.Shape();
         outline.graphics.beginStroke(this.strokeColor);
         outline.graphics.drawRect(0,0,this.width, this.height);
         
         //fill bar
         this.bar = new createjs.Shape();
         this.bar.graphics.beginFill(this.fillColor);
         this.bar.graphics.drawRect(0,0,this.width, this.height);
         this.bar.scaleX = 1;
 
         //text
         this.label = new createjs.Text("", "24px Arial", this.strokeColor);
         this.label.x = 10;
         this.label.y = 5;
 
         //add to container
         this.addChild(this.bar, outline, this.label);
     }
 
     //updates the fill visualization and the text
     f.update = function(){
 
        this.updateBar();
        this.updateText();
     }
 
     //updates the fill visualization based on the percentage of fuel remaining
     //rather than redraw the fill rectangle, only the horizontal scale of the fill
     //bar is altered
     f.updateFill = function(percentRemaining){
 
         if(percentRemaining <= 1 && percentRemaining >= 0){ //in range
 
             this.bar.scaleX = percentRemaining;
         }
     }
 
     //updates the text of the FillBar given the type, current fuel level and starting fuel level
     f.updateText = function(type, current, start){
 
         var m;
         
         switch(type){
             case "fuel":
                 m = "rocket Fuel: ";
                 break;
             case "mono":
                 m = "Monopropellant: ";
                 break;
         }
     
     
         m = m + current.toFixed(2) + " / " + start.toFixed(2);
         
         this.label.text = m;
     }//end updateText
 
 }()); //end IIFE



