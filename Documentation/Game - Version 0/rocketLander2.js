const A_KEY = 65;
const D_KEY = 68;
var rotation_speed = 1;

var queue, stage, rContainer, rocket, diagText;
var counter = 0;
var speed = 40;
var direction = 1;
var aKeyDown = dKeyDown = false;

//rocket size: 417
//Center of Mass:

function init(){//alert("init()");
    
    queue = new createjs.LoadQueue(false);
    queue.addEventListener("complete", load);
    queue.loadManifest( [
         {id: "falcon", src: "assets/Body/Falcon4.png"},
         {id: "falcon5", src: "assets/Body/Falcon5.png"},
         {id: "falconfire1", src: "assets/Body/FalconFire1.png"},
         {id: "falconfire2", src: "assets/Body/FalconFire2A2.png"},
         {id: "falconfire2B", src: "assets/Body/FalconFire2B2.png"},
         {id: "falconfire2C", src: "assets/Body/FalconFire2C2.png"},
         {id: "falconfire2D", src: "assets/Body/FalconFire2D2.png"},
         {id: "falconfire2E", src: "assets/Body/FalconFire2E2.png"},
         {id: "ads2", src: "assets/Drone Ship/ADS2.png"},
         {id: "sky", src: "assets/Background/Sky4B.png"},
         {id: "falconlegA", src: "assets/Body/FalconLegA.png"},
         {id: "falconlegB", src: "assets/Body/FalconLegB.png"},
         {id: "falconlegC", src: "assets/Body/FalconLegC.png"},
         {id: "falconlegD", src: "assets/Body/FalconLegD.png"},
         {id: "falconlegE", src: "assets/Body/FalconLegE.png"},
    ]);
    
}

function load(){
    
    stage = new createjs.Stage("canvas");
    //stage.scaleX = stage.scaleY = 0.5;
    
    buildBackground("sky", 0,0);
    buildDiagText(10,10);
    buildADS("ads2");
    loadContainer();
    window.setInterval(rock, 2000);
    window.setInterval(rock, 1000);
    window.setInterval(landingLegs, 200);
    window.onkeydown = detectKey;
    window.onkeyup = removeKey;

    //Ticker
    createjs.Ticker.framerate = 24;
    createjs.Ticker.addEventListener("tick", run);
}

function buildDiagText(x,y){
    diagText = new createjs.Text("aKeyDown: " + aKeyDown + "\ndKeyDown: " + dKeyDown, "12px Arial", "white");
    diagText.x = x;
    diagText.y = y;
    stage.addChild(diagText);
}

function updateDiagText(){
    
    diagText.text ="aKeyDown: " + aKeyDown + "\ndKeyDown: " + dKeyDown;
}

function detectKey(e){
    e = !e ? window.event : e;
    switch(e.keyCode){
        case A_KEY:
            aKeyDown = true;    //flag for movement
            break;
        case D_KEY:
            dKeyDown = true;    //flag for movement
            break;
    }
}

function removeKey(e){
    e = !e ? window.event : e;
    switch(e.keyCode){
        case A_KEY:
            aKeyDown = false;    //flag for movement
            break;
        case D_KEY:
            dKeyDown = false;    //flag for movement
            break;
    }
    rotation_speed = 1;
}



function buildADS(name){
    var image = queue.getResult(name);

    ship = new createjs.Bitmap(image);
    ship.x = 150;
    ship.y = 1100;
    ship.name = name;
    ship.scaleX = ship.scaleY = 1.2;
    ship.shadow = new createjs.Shadow("black", 10, 5, 1);
    //alert(ship);
    stage.addChild(ship);
    stage.update();
}

function rock(){
    
    
    if(ship.x < 100){
        direction = 1;
    }else if (ship.x > 190){
        direction = -1;
    }
    ship.x += (direction * Math.floor(Math.random()*5));
}

function loadContainer(){
    rContainer = new createjs.Container();
    rContainer.x = 300;
    rContainer.y = 100;
    
    loadBitmap("falcon5",0,0);
    loadBitmap("falconfire2", 0,0);
    loadBitmap("falconfire2B", 0,0);
    loadBitmap("falconfire2C", 0,0);
    loadBitmap("falconfire2D", 0,0);
    loadBitmap("falconfire2E", 0,0);
    
    rContainer.getChildByName("falconfire2").visible = true;
    
    
    loadBitmap("falconlegA", 0,0);
    loadBitmap("falconlegB", 0,0);
    loadBitmap("falconlegC", 0,0);
    loadBitmap("falconlegD", 0,0);
    loadBitmap("falconlegE", 0,0);
    
    rContainer.getChildByName("falconlegA").visible = true;
    
    
    
    stage.addChild(rContainer);
}

function buildBackground(name,x,y){
    var image = queue.getResult(name);
    
    var sky = new createjs.Bitmap(image);
    sky.x = x;
    sky.y = y;
    stage.addChild(sky);
    stage.update();
}

function loadBitmap(name,x,y){
    var image = queue.getResult(name);
    
    rocket = new createjs.Bitmap(image);
    rocket.x = x;
    rocket.y = y;
    rocket.regX = 100;
    rocket.regY = 313;
    rocket.visible = false;
    rocket.name = name;
    rocket.scaleX = rocket.scaleY = 0.5;
    rContainer.addChild(rocket);
    stage.update();
}

function switchDirection(){
    //alert(stage.children);
    //createjs.Tween.get(rocket).to({rotation:rocket.rotation+15}, 200);
}

function switchSpeed(){

}

function run(e){
    fall();
    rotate();
    updateDiagText();
    if(rContainer.getChildByName("falconfire2").visible){
        rContainer.getChildByName("falconfire2").visible = false;
        rContainer.getChildByName("falconfire2B").visible = true;
    }
    else if(rContainer.getChildByName("falconfire2B").visible){
        rContainer.getChildByName("falconfire2B").visible = false;
        rContainer.getChildByName("falconfire2C").visible = true;
    }
    else if(rContainer.getChildByName("falconfire2C").visible){
        rContainer.getChildByName("falconfire2C").visible = false;
        rContainer.getChildByName("falconfire2D").visible = true;
    }
    else if(rContainer.getChildByName("falconfire2D").visible){
        rContainer.getChildByName("falconfire2D").visible = false;
        rContainer.getChildByName("falconfire2E").visible = true;
    }
    else if(rContainer.getChildByName("falconfire2E").visible){
        rContainer.getChildByName("falconfire2E").visible = false;
        rContainer.getChildByName("falconfire2").visible = true;
    }
    stage.update();
}

function landingLegs(){
    
    if(rContainer.getChildByName("falconlegA").visible){
        rContainer.getChildByName("falconlegA").visible = false;
        rContainer.getChildByName("falconlegB").visible = true;
    }
    else if(rContainer.getChildByName("falconlegB").visible){
        rContainer.getChildByName("falconlegB").visible = false;
        rContainer.getChildByName("falconlegC").visible = true;
    }
    else if(rContainer.getChildByName("falconlegC").visible){
        rContainer.getChildByName("falconlegC").visible = false;
        rContainer.getChildByName("falconlegD").visible = true;
    }
    else if(rContainer.getChildByName("falconlegD").visible){
        rContainer.getChildByName("falconlegD").visible = false;
        rContainer.getChildByName("falconlegE").visible = true;
    }

}

function fall(){
    var nextY = rContainer.y + speed;
    
    if(nextY > stage.canvas.height - 117){
        nextY = stage.canvas.height - 117;
        
        speed--;
    }
    if(speed <= 0){
        speed = 0;
        
    }
    else{
        speed--;
    }
    
    rContainer.y = nextY;
}

function rotate(){
    if(aKeyDown){
        rContainer.rotation += rotation_speed;
        rotation_speed += 0.25;

    }
    else if(dKeyDown){
        rContainer.rotation -= rotation_speed;
        rotation_speed += 0.25;
    }
    
    else if(rContainer.rotation < 0){
        rContainer.rotation -= rotation_speed*0.5;

    }
    else if(rContainer.rotation > 0){
        rContainer.rotation += rotation_speed*0.5;
    }
}














