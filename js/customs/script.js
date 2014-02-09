var stage,canvas,loader,ground, flappy_bird =null,score_text, wrap_cylinder_container;
var welcome_container = new createjs.Container();

var game_size = {width:390, height:520};
var house_size = {width:287,height:515};
var tip_size = {width:114,height:107};
var ready_size = {width:194,height:54};
var gameOver_title_size = {width:200,height:50};
var cylinder_size = {width:52,height:320};
var bird_size = {width:34, height:24};

var half_bird_width = Math.round((bird_size.width-3)/2);
var half_bird_height = Math.round((bird_size.height-2)/2);
var edge_ground_y;

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
  
  stage.removeChild(stage.getChildByName('author_text'));
  stage.removeChild(stage.getChildByName('loading_text'));
  stage.removeChild(stage.getChildByName('author_text'));
  
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
  edge_ground_y = ground.y -10;

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
    frames: {width:bird_size.width, height:bird_size.height,count: 3}
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

  score_text = new createjs.Text("0", "bold 50px Sanidana", "#fff");
  score_text.value = 0;
  score_text.name = 'score_text';
  score_text.x =  Math.round((game_size.width - score_text.getMeasuredWidth())/2);
  score_text.y =  ready_bit.y - score_text.getMeasuredHeight()- 20;
  score_text.shadow = new createjs.Shadow("#000000", 5, 5, 15);
  
  stage.addChild(score_text);
  stage.addChild(welcome_container);


  stage.addEventListener('mousedown',stage_mouse_down);
}

//Init black background at firt run
function init_black_bg(){
  
  stage.addChild(create_bg('#000'));

  //Add author text
  var game_title = new createjs.Text("FlappyBirdPC", "bold 40px Sanidana", "#00a300");
  game_title.name = "game_title";
  game_title.x =  Math.round((game_size.width - game_title.getMeasuredWidth())/2);
  game_title.y =  Math.round((game_size.height - game_title.getMeasuredHeight())/2) -100;
  game_title.alpha = 0;
  stage.addChild(game_title);

  
  loading_text = new createjs.Text("Please wait, loading asserts", "20px Sanidana", "#fafafa");
  loading_text.name = "loading_text";
  loading_text.x =  Math.round((game_size.width - loading_text.getMeasuredWidth())/2);
  loading_text.y =  Math.round((game_size.height - loading_text.getMeasuredHeight())/2)+ 30;

  stage.addChild(loading_text);

  author_text = new createjs.Text("http://dethoima.com", "15px Sanidana", "blue");
  author_text.name = "author_text";
  author_text.x =  Math.round((game_size.width - author_text.getMeasuredWidth())/2);
  author_text.y =  Math.round((game_size.height - author_text.getMeasuredHeight())/2)+ 60;
  
  stage.addChild(author_text);

  createjs.Tween.get(game_title).to({alpha:1}, 500,createjs.Ease.sineIn ).call(function(){
    //Do stuff  
  });
  
}

function build_green_box(){

  var start_x = 400;
  var random_y = -random(50,200);

  log(random_y);

  var vertical_cylinder_container = new createjs.Container();
  vertical_cylinder_container.bird_passed = false;
  vertical_cylinder_container.current_x = start_x;
  vertical_cylinder_container.name = "single_cylinder_vertical";
  var top_cylinder = new createjs.Bitmap(loader.getResult("main_sprite"));
  top_cylinder.name ="top_cylinder";
  top_cylinder.sourceRect = new createjs.Rectangle(112,646,cylinder_size.width, cylinder_size.height);
  top_cylinder.x = vertical_cylinder_container.current_x;
  top_cylinder.y = random_y;
  top_cylinder.end_y = cylinder_size.height + random_y;
  vertical_cylinder_container.addChild(top_cylinder);

  vertical_cylinder_container.child_offset ={};

  vertical_cylinder_container.child_offset.top = build_point_param(start_x,0,top_cylinder.end_y);


  var bottom_cylinder = new createjs.Bitmap(loader.getResult("main_sprite"));
  //The height of space between 2 cylinder = 100px
  var start_bottom_cylinder_y = top_cylinder.end_y+ 100;
  bottom_cylinder.name = "bottom_cylinder";
  bottom_cylinder.sourceRect = new createjs.Rectangle(168,645,cylinder_size.width, cylinder_size.height);
  bottom_cylinder.x = vertical_cylinder_container.current_x;
  bottom_cylinder.y = start_bottom_cylinder_y;
  bottom_cylinder.end_y = game_size.height;
  vertical_cylinder_container.addChild(bottom_cylinder);

  vertical_cylinder_container.child_offset.bottom = build_point_param(start_x,start_bottom_cylinder_y,bottom_cylinder.end_y);

  log(vertical_cylinder_container.child_offset);
  /*stage.addChild(vertical_cylinder_container);*/
  wrap_cylinder_container.addChild(vertical_cylinder_container);

  stage.addChild(wrap_cylinder_container);
  stage.addChild(ground);
  stage.addChild(score_text);
}

function  build_point_param(start_x,start_y, end_y){
  return {
    top_left:{x:start_x,y:start_y},
    top_right:{x:start_x+cylinder_size.width,y:start_y},
    bottom_left:{x:start_x,y:end_y},
    bottom_right:{x:start_x+cylinder_size.width,y:end_y}
  }
}