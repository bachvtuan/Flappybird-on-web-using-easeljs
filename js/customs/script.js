var stage,canvas,loader,ground, flappy_bird =null;
var author_text;
var bg_container = new createjs.Container();

var game_size = {width:390, height:520};



function init () {
  canvas = document.getElementById("game");
  canvas.width = game_size.width; 
  canvas.height = game_size.height;
  
  stage = new createjs.Stage("game");
  stage.options = {stage:'init'};
  stage.enableMouseOver(20);  
  
  createjs.Ticker.setInterval(90);
  createjs.Ticker.addEventListener("tick", tick);
  

  stage.addChild(bg_container);
  
  manifest = [
      {src:"images/atlas.png", id:"main_sprite"},
      {src:"images/ground.png", id:"ground"},
      {src:"images/red_bird.png", id:"red_bird"}
    ];
  init_black_bg();
  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", init_sprite_sheet);
  loader.loadManifest(manifest);
  
  stage.update();
}

function init_sprite_sheet(){
  stage.removeChild(author_text);
  
  stage.addChild(create_bg('#4ec0ca'));
  
  //Init house and tree
  var house_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
  var home_size = {width:287,height:515};
  house_bit.sourceRect = new createjs.Rectangle(0,0,home_size.width, home_size.height);
  house_bit.y = game_size.height - home_size.height;
  stage.addChild(house_bit);

  //Scretch image to fullwidth
  house_bit.scaleX= game_size.width / home_size.width;
  house_bit.scaleY= game_size.height / home_size.height;

  //init tip
  var tip_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
  var tip_size = {width:114,height:107};
  tip_bit.sourceRect = new createjs.Rectangle(580,170,tip_size.width, tip_size.height);
  tip_bit.x = Math.round((game_size.width - tip_size.width)/2);
  tip_bit.y = Math.round((game_size.height - tip_size.height)/2);
  stage.addChild(tip_bit);

  //Init ground
  var groundImg = loader.getResult("ground");
  ground = new createjs.Shape();
  ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, game_size.width+groundImg.width, groundImg.height);
  ground.tileW = groundImg.width;
  ground.y = game_size.height-groundImg.height;
  stage.addChild(ground);
  stage.options.stage = "welcome";

  //Init main_bird 
  var spriteSheet_bird = new createjs.SpriteSheet({
    images: [loader.getResult("red_bird")],
    frames: {width:34, height:24,count: 3}
  });

  flappy_bird = new createjs.Sprite(spriteSheet_bird);
  flappy_bird.start_timer = 1;
  stage.addChild(flappy_bird);

  flappy_bird.x = tip_bit.x - 30;
  flappy_bird.y = tip_bit.y + 30;

  //Init ready text

  var ready_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
  var ready_size = {width:194,height:54};
  ready_bit.sourceRect = new createjs.Rectangle(580,116,ready_size.width, ready_size.height);
  ready_bit.x = Math.round((game_size.width - ready_size.width)/2);
  ready_bit.y = tip_bit.y - ready_size.height -20;

  stage.addChild(ready_bit);

  //Init score text

  var score_text = new createjs.Text("0", "bold 36px Sanidana", "#fff");
  score_text.x =  Math.round((game_size.width - score_text.getMeasuredWidth())/2);
  score_text.y =  ready_bit.y - score_text.getMeasuredHeight()- 20;
  
  stage.addChild(score_text);

  log("bag");
}

//Init black background at firt run
function init_black_bg(){
  
  stage.addChild(create_bg('#000'));

  //Add author text
  author_text = new createjs.Text("DETHOIMA.COM", "36px Sanidana", "#00a300");
  author_text.x =  Math.round((game_size.width - author_text.getMeasuredWidth())/2);
  author_text.y =  Math.round((game_size.height - author_text.getMeasuredHeight())/2);
  author_text.alpha = 0;
  stage.addChild(author_text);
  createjs.Tween.get(author_text).to({alpha:1}, 500,createjs.Ease.sineIn ).call(function(){
    //Do stuff  
  });
  
}

function create_bg(color){
  var g = new createjs.Graphics();
  g.beginFill(color).drawRect(0, 0, game_size.width, game_size.height).endFill();
  var bg = new createjs.Shape(g);
  return bg;
}


function tick(event) {
  var deltaS = event.delta/1000;
  
  if (stage.options.stage == 'welcome'){
    ground.x = (ground.x-deltaS*200) % ground.tileW;
  }
  tick_bird();
  stage.update();
}

function tick_bird(){
  if (!flappy_bird) return;
  log("go now");
  flappy_bird.start_timer++;
      switch (flappy_bird.start_timer){
        case 3:flappy_bird.gotoAndStop(0); flappy_bird.y-=4; break;
        case 5:
          flappy_bird.y+=2;
          flappy_bird.gotoAndStop(1);
          break;
        case 7:
          flappy_bird.gotoAndStop(2); 
          flappy_bird.start_timer = 1;
          flappy_bird.y+=2;
          break;
      }
}

