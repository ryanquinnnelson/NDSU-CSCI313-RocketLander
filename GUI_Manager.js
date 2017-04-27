/**
 * Created by Jack on 4/25/2017.
 */
/**
 * Created by Jack on 4/16/2017.
 */

(function () {

    function GUI_Manager(){

        this.DisplayObject_constructor();

        // Physics Text
        this.physText = new createjs.Container();
        var g = new createjs.Graphics().beginFill("#646464").drawRoundRect(0,0,250, 175, 5);
        var textBox = new createjs.Shape(g);
        textBox.alpha = 0.7;
        textBox.x = 900;
        textBox.y = 170;
        var newText = new createjs.Text("", "30px Arial", "#000000");
        newText.name = "newText";
        newText.x = textBox.x + 10;
        newText.y = textBox.y + 10;
        this.physText.addChild(textBox, newText);

        //Pause screen
        this.pauseScreen = new createjs.Container();
        // var g1 = new createjs.Graphics().beginFill("#d1d1d1").drawRoundRect(0,0,1180,1100,20);
        // //Background
        // var backBox = new createjs.Shape(g1);
        // backBox.x = backBox.y = 10;
        // backBox.alpha = 0.7;
        //Pause Text
        var pauseText = new createjs.Bitmap("Assets/PauseScreen2.png");
        pauseText.alpha = 0.8;
        pauseText.x = 200;
        pauseText.y = 250;

        this.pauseScreen.addChild(pauseText);
        this.pauseScreen.visible = false;

        //Fuel Bars
        this.bars = new createjs.Container();
        var monoBar = new window.objects.FuelBar(750, 50, "#FA0A20", "#000000");
        monoBar.name = "monoBar";
        monoBar.setLabel("Monopropellant");

        var fuelBar = new window.objects.FuelBar(750, 110, "#0A6FB4", "#000000");
        fuelBar.name = "fuelBar";
        fuelBar.setLabel("Rocket Fuel");
        this.bars.addChild(monoBar, fuelBar);


        this.landedText = new createjs.Text("LANDED!", "70px Impact", "#FF0911");
        this.landedText.set({x:500, y:500});
        this.landedText.visible = false;

    };

    var guim = createjs.extend(GUI_Manager, createjs.DisplayObject);

    window.objects.GUI_Manager = createjs.promote(GUI_Manager, "DisplayObject");



    guim.updatePhysText = function(input){
       this.physText.getChildByName("newText").text = input;
    };

    guim.updateBars = function(monoPercent, fuelPercent) {
        this.bars.getChildByName("monoBar").updateFill(monoPercent);
        this.bars.getChildByName("fuelBar").updateFill(fuelPercent);
    };

    guim.switchPauseScreen = function(){
        this.pauseScreen.visible = !this.pauseScreen.visible;
    };

<<<<<<< HEAD
}());
=======
    guim.showLandedText = function() {

        this.landedText.visible = true;
        console.log("Visible: " + this.landedText.visible, "X: " + this.landedText.x, "Y: " + this.landedText.y +"\n" + stage.children);

        createjs.Tween.get(this.landedText, ignoreGlobalPause)
            .to({alpha:.6}, 300)
            .wait(100)
            .to({alpha:1}, 300)
            .to({alpha:.6}, 300)
            .wait(100)
            .to({alpha:1}, 300)
            .to({alpha:.6}, 300)
            .wait(100)
            .to({alpha:1}, 300)
            .to({visible:false}, 0);


    };

}());
>>>>>>> master
