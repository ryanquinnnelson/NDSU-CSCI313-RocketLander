/**
 * Created by Jack on 4/16/2017.
 */

(function () {

    const SPACEBAR = 32;
    const LEFT_ARROW = 37;
    const UP_ARROW = 38;
    const RIGHT_ARROW = 39;
    const DOWN_ARROW = 40;
    const A_KEY = 65;
    const D_KEY = 68;
    const S_KEY = 83;
    const W_KEY = 87;

    function GameManager(){

        this.DisplayObject_constructor();

        this.wKeyDown = false;
        this.sKeyDown = false;
        this.dKeyDown = false;
        this.aKeyDown = false;
        this.paused = false;
        this.level = 0;
        this.gameover = false;
    }

    var gm = createjs.extend(GameManager, createjs.DisplayObject);

    window.objects.GameManager = createjs.promote(GameManager, "DisplayObject");

    gm.gameStep = function() {
        if (!createjs.Ticker.paused) {

            if (!gameManager.gameover) {
                updateGame();
                gameRender();
            }


            stage.update();
        }
    };

    gm.handleKeyDown = function(e){

        switch(e.keyCode) {
            case W_KEY:
                this.wKeyDown = true;
                break;
            case A_KEY:
                //rocket.fireLeftThruster();
                this.aKeyDown = true;
                break;
            case D_KEY:
                //rocket.fireRightThruster();
                this.dKeyDown = true;
                break;
            case UP_ARROW:
                window.rocket.increaseEngineLevel();
                break;
            case DOWN_ARROW:
                window.rocket.decreaseEngineLevel();
                break;
            case RIGHT_ARROW:
                this.switchLevel();      //changes game level
                break;
            case SPACEBAR:
                this.pauseGame();            //pauses the game
                break;
        }
    }

    gm.updateGame = function() {

        if(this.wKeyDown){
            window.rocket.fireEngine();
        }
        if(this.aKeyDown){
            window.rocket.fireLeftThruster();
        }
        if(this.dKeyDown){
            window.rocket.fireRightThruster();
        }

        rocket.update();
        window.Collider.update();

        window.rocket.render();

        stage.update();

    };


    gm.pauseGame = function() {
        createjs.Ticker.paused = !createjs.Ticker.paused;
        this.paused = !this.paused;
    };


    gm.reset = function() {
        rocket.reset();
    };

    gm.restartGame = function () {
            //wait 2 seconds, then reset game
            createjs.Tween.get(diagText).to({rotation: 0}, 2500).call(gameManager.reset);
    };

    gm.endGame = function() {};

    gm.switchLevel = function() {
        if(gm.paused){
            BackgroundManager.switchLevel();
        }

    };



}());