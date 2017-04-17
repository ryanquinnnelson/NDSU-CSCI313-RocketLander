/**
 * Created by Jack on 4/16/2017.
 */

(function () {

    function gameManager(){
        this.DisplayObject_constructor();
    }

    var gm = createjs.extend(gameManager, createjs.DisplayObject);

    gm.startGame = function() {

        //Ticker object
        createjs.Ticker.framerate = 60;
        createjs.Ticker.addEventListener("tick", gameManager.gameStep);

        //listen for key up and key down
        //TODO
        // window.onkeydown = *some controlManager function*
        // window.onkeyup = *some controlManager function*
    };


    gm.updateGame = function(e) {

        if(wKeyDown){
            rocket.fireEngine();
        }
        if(aKeyDown){
            rocket.fireLeftThruster();
        }
        if(dKeyDown){
            rocket.fireRightThruster();
        }
        rocket.update();
        collider.update();

        //temporary
        tempBar.updateText("mono", rocket.getMono(), rocket.getStartMono());
        tempBar.updateFill(rocket.getMono() / rocket.getStartMono() );
        diagText.text = rocket.toString();

        rocket.render();

    };


    gm.pauseGame = function() {
        createjs.Ticker.paused = !createjs.Ticker.paused;
    };


    gm.resetGame = function() {};
    gm.endGame = function() {};



}());