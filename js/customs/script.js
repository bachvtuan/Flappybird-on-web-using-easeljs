var stage,canvas,loader,ground, flappy_bird =null,score_text;
var author_text;
var welcome_container = new createjs.Container();


var game_size = {width:390, height:520};
var house_size = {width:287,height:515};
var tip_size = {width:114,height:107};
var ready_size = {width:194,height:54};

function init () {
  canvas = document.getElementById("game");
  canvas.width = game_size.width; 
  canvas.height = game_size.height;
  
  stage = new createjs.Stage("game");
  stage.options = {stage:'init'};
  stage.enableMouseOver(20);  
  
  stage.addChild(welcome_container);

  createjs.Ticker.setInterval(10);
  createjs.Ticker.addEventListener("tick", tick);
  
  var manifest = [
      {src:"images/atlas.png", id:"main_sprite"},
      {src:"images/ground.png", id:"ground"},
      {src:"images/red_bird.png", id:"red_bird"},
      {src:"images/yellow_bird.png", id:"yellow_bird"},
      {src:"images/blue_bird.png", id:"blue_bird"},
      //Sound segment
      {src:"sounds/sfx_wing.ogg", id:"wing"},
      {src:"sounds/sfx_die.ogg", id:"die"},
      {src:"sounds/sfx_hit.ogg", id:"hit"},
      {src:"sounds/sfx_point.ogg", id:"point"},
      {src:"sounds/sfx_swooshing.ogg", id:"swooshing"},
      
    ];
  init_black_bg();
  loader = new createjs.LoadQueue(true);
  loader.installPlugin(createjs.Sound);
  loader.addEventListener("complete", init_sprite_sheet);
  loader.loadManifest(manifest);
  
  stage.update();
}

function init_sprite_sheet(){
  stage.removeChild(author_text);

  /*
  1:bright
  2:dark
  */
  var selected_house_bg =  random(1,2);
  if (selected_house_bg == 1)
    stage.addChild(create_bg('#4ec0ca'));
  else
    stage.addChild(create_bg('#008793'));
  
  //Init house and tree
  var house_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
  house_bit.name = "house_bitmap";
  var segment_x = (selected_house_bg == 1) ? 0 : 292;
  house_bit.sourceRect = new createjs.Rectangle(segment_x,0,house_size.width, house_size.height);
  house_bit.y = game_size.height - house_size.height;
  

  //Scretch image to fullwidth
  house_bit.scaleX= game_size.width / house_size.width;
  house_bit.scaleY= game_size.height / house_size.height;
  stage.addChild(house_bit);

  //init tip
  var tip_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
  
  tip_bit.sourceRect = new createjs.Rectangle(580,170,tip_size.width, tip_size.height);
  tip_bit.x = Math.round((game_size.width - tip_size.width)/2);
  tip_bit.y = Math.round((game_size.height - tip_size.height)/2);
  welcome_container.addChild(tip_bit);

  //Init ready text

  var ready_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
  ready_bit.sourceRect = new createjs.Rectangle(580,116,ready_size.width, ready_size.height);
  ready_bit.x = Math.round((game_size.width - ready_size.width)/2);
  ready_bit.y = tip_bit.y - ready_size.height -20;

  welcome_container.addChild(ready_bit);
  
  //Init ground
  var groundImg = loader.getResult("ground");
  ground = new createjs.Shape();
  ground.name ='ground';

  ground.graphics.beginBitmapFill(groundImg).drawRect(-groundImg.width, 0, game_size.width+groundImg.width, groundImg.height);
  ground.tileW = groundImg.width;
  ground.y = game_size.height-groundImg.height;
  ground.delay_x =0;
  stage.addChild(ground);
  stage.options.stage = "welcome";

  //Init main_bird 

  /*
  Random selected bird:
  1:red
  2:yellow
  3:blue
  */
  var random_selected_bird = random(1,3);
  var selected_bird_source = 'red_bird';

  if (random_selected_bird == 2)
    selected_bird_source = 'yellow_bird';
  else if (random_selected_bird == 3)
    selected_bird_source = 'blue_bird';

  var bird_spriteSheet_data ={
    images: [loader.getResult(selected_bird_source)],
    frames: {width:34, height:24,count: 3}
  };

  var spriteSheet_bird = new createjs.SpriteSheet(bird_spriteSheet_data);

  flappy_bird = new createjs.Sprite(spriteSheet_bird);
  flappy_bird.name = "flappy_bird";
  flappy_bird.regX = bird_spriteSheet_data.frames.width/2;
  flappy_bird.regY = bird_spriteSheet_data.frames.height/2;
  flappy_bird.options = {status:'rest'};

  flappy_bird.start_timer = 1;
  flappy_bird.fly_welcome = {value:1,is_up:true};
  

  flappy_bird.x = tip_bit.x - 0;
  flappy_bird.y = tip_bit.y + 50;
  flappy_bird.options.origin_y = flappy_bird.y;

  stage.addChild(flappy_bird);
  

  //Init score text

  score_text = new createjs.Text("0", "bold 40px Sanidana", "#fff");
  score_text.name = 'score_text';
  score_text.x =  Math.round((game_size.width - score_text.getMeasuredWidth())/2);
  score_text.y =  ready_bit.y - score_text.getMeasuredHeight()- 20;
  
  stage.addChild(score_text);
  stage.addChild(welcome_container);


  stage.addEventListener('mousedown',stage_mouse_down);
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
