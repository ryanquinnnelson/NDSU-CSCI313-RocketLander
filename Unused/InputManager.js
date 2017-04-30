/**
 * Created by Jack on 4/22/2017.
 */
const SPACEBAR = 32;
const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const A_KEY = 65;
const D_KEY = 68;
const S_KEY = 83;
const W_KEY = 87;

(function () {

    function inputManager(){
        this.DisplayObject_constructor();

    }

    var im = createjs.extend(inputManager, createjs.DisplayObject);

    im.handleKeyDown = function (e) {
        
    };

    im.handleKeyUp = function (e) {

    };

}());