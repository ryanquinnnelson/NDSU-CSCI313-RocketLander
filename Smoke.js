//Smoke.js

(function () {

     //create namespace
     window.objects = window.objects || {};
     
     //constructor
     function Smoke(image){

        this.Container_constructor(); //superclass constructor




        //calculate random values for use with positioning
        randomDirection = Math.random() > 0.5 ? -1 : 1; //50% chance either direction
        randomX = Math.floor(Math.random() * 30);
        randomShift = randomX * randomDirection;

        this.x = x - this.image.width/2 + randomShift;    //center horizontally
        this.y = y - b.image.height/2;                 //center vertically
        this.alpha = 0.5;                              //slightly transparent
        //this.addEventListener("added", s.fadeout);       //triggers when added


        alert(this.parent);

    }
 
     //extend Container and return prototype of new class
     var s = createjs.extend(Smoke, createjs.Bitmap);
 
     //promote overridden attributes and add new class to namespace
     window.objects.Smoke = createjs.promote(Smoke, "Bitmap");

 /*
     s.fadeout = function(e){
 
         var randomMS, target;
 
         target = e.target;
 
         //calculate random amount of time to add to standard fadeout time
         randomMS = Math.floor(Math.random() * 500);    //0 - 500
         
         //uses tween to fade target while also moving it upward
         //calls for sprite to be removed after completing this animation
         createjs.Tween.get(target).to({target.alpha: 0, y: target.y - 150}, randomMS + 3000).call(s.smokeComplete);
     }
 
     s.smokeComplete = function(e){
        this.removeChild(e.target);
     }
*/
 
 }());



