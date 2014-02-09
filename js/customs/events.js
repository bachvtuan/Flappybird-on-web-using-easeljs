function stage_mouse_down (event) {
  switch (stage.options.stage){
    case 'welcome':
      stage_welcome_mouse_down(event);
      break;
    case 'playing':
      stage_playing_mouse_down(event);
      break;
  }
}

function stage_welcome_mouse_down(event){
  wrap_cylinder_container = new createjs.Container();
  wrap_cylinder_container.name = "wrap_cylinder_container";
  /*stage.addChild(wrap_cylinder_container);*/

  /*build_green_box();*/
  stage.options.stage = "playing";
  createjs.Ticker.addEventListener("tick", ticker_flapply_playing);

  stage_playing_mouse_down(event);

  createjs.Tween.get(welcome_container).to({alpha:0}, 900,createjs.Ease.sineIn ).call(function(){
    //Do stuff  
    welcome_container.removeAllChildren();
  });
}

function stage_playing_mouse_down (event) {
  log("playing");
  createjs.Sound.play("wing");
  var next_y = flappy_bird.y - 60;
  next_y = (next_y >= 0) ? next_y: 0;
  flappy_bird.options.status = 'in_up';
  flappy_bird.options.next_y = next_y;
  
}

var bird_number_ticker = 0;
var general_number_ticker = 0;
function tick(event) {
  var stage_name = stage.options.stage;
  general_number_ticker++;

  if (stage.getChildByName('ground') != null && stage_name !='gameover'){
    ground.delay_x  +=0.2; 
    if (ground.delay_x ==1){
      ground.delay_x = 0;
    }
    ground.x =  Math.round(ground.x+ground.delay_x) % ground.tileW;
  }

  if (stage.getChildByName('flappy_bird') != null && stage_name != 'gameover'){
    bird_number_ticker++;

      if (bird_number_ticker % 2 ==0){
        if (flappy_bird.fly_welcome.is_up){
          flappy_bird.fly_welcome.value++;
          if (flappy_bird.fly_welcome.value > 15){
            flappy_bird.fly_welcome.is_up = false;
          }
        }
        else{
          flappy_bird.fly_welcome.value--;
          if (flappy_bird.fly_welcome.value == 0){
            flappy_bird.fly_welcome.is_up = true;
          }
        }
      }

      if (stage_name == 'welcome'){
        var extra_y = (flappy_bird.fly_welcome.value - 7);
        
        flappy_bird.y = flappy_bird.options.origin_y + extra_y;
        
      }
      switch (bird_number_ticker){
        case 10:
          flappy_bird.gotoAndStop(0); 
          break;

        case 20:
          flappy_bird.gotoAndStop(1);
          break;
        case 30:
          flappy_bird.gotoAndStop(2); 
          bird_number_ticker = 1;
          break;
      }
  }
  stage.update();
}



function ticker_flapply_playing (event) {
  log("playing_tick");
  //Move box
  var wrap_cylinder_container = stage.getChildByName('wrap_cylinder_container');

  if (wrap_cylinder_container){
    for ( var i=0; i < wrap_cylinder_container.getNumChildren(); i++ ){
      var vertical_cylinder_container = wrap_cylinder_container.getChildAt(i);
      vertical_cylinder_container.current_x -= 1.5;
      var top_cylinder = vertical_cylinder_container.getChildAt(0);
      top_cylinder.x = Math.round(vertical_cylinder_container.current_x);
      vertical_cylinder_container.child_offset.top = build_point_param(top_cylinder.x,0,top_cylinder.end_y);

      var bottom_cylinder = vertical_cylinder_container.getChildAt(1);
      bottom_cylinder.x =  Math.round(vertical_cylinder_container.current_x);
      vertical_cylinder_container.child_offset.bottom = build_point_param(bottom_cylinder.x,bottom_cylinder.y,bottom_cylinder.end_y);

      if (! vertical_cylinder_container.bird_passed){
        if ( flappy_bird.x - half_bird_width > vertical_cylinder_container.child_offset.top.top_right.x ){
          vertical_cylinder_container.bird_passed = true;
          //play passed sound
          createjs.Sound.play("point");
          score_text.value++;
          score_text.text = score_text.value;
        }
        check_game_over(vertical_cylinder_container.child_offset);
      }
    }
  }

  if (general_number_ticker % 100 == 0){
    build_green_box();
  }
  

  if (flappy_bird.options.status == 'rest' ){
    /*flappy_bird.options.status = 'is_down';*/
    var next_y = flappy_bird.y + 3;
    
    next_y = (next_y > edge_ground_y) ? edge_ground_y: next_y;
    flappy_bird.y = next_y;

    var next_rotation = flappy_bird.rotation + 3;
    next_rotation = (next_rotation >= 90 ) ? 90:  next_rotation;
    flappy_bird.rotation = next_rotation;
    /*createjs.Tween.get(flappy_bird).to({rotation:90,y:ground.y-10}, 600,createjs.Ease.sineIn ).call(function(){
    });*/
  }

  if (flappy_bird.options.status == 'in_up'){
    flappy_bird.y -= 2;
    if (flappy_bird.y < flappy_bird.options.next_y){
      //when move up done
      flappy_bird.options.status = 'rest';
    }
    //Rotation bird to -20 degree
    if (flappy_bird.rotation > -20){
      flappy_bird.rotation -= 15;
    }
  }


  if (flappy_bird.y == edge_ground_y){
    log('gameover');
    stage.options.stage = 'gameover';

    //Set ground is front of flappy_bird
    stage.addChild(ground);
    createjs.Ticker.removeEventListener("tick", ticker_flapply_playing);

    stage.removeChild(score_text);

    createjs.Sound.play("hit");

    setTimeout(function(){
      show_gameOver_board();
    },300);
  }
}

function check_game_over(child_offset){
  var edge_x = flappy_bird.x;
  var edge_y = flappy_bird.y;
  

  var list_edges = [
    {
      x:flappy_bird.x - half_bird_width,
      y:flappy_bird.y - half_bird_height
    },
    {
      x:flappy_bird.x + half_bird_width,
      y:flappy_bird.y -half_bird_height
    },
    {
      x:flappy_bird.x - half_bird_width,
      y:flappy_bird.y + half_bird_height
    },
    {
      x:flappy_bird.x + half_bird_width,
      y:flappy_bird.y + half_bird_height
    }
  ];

  for (var i=0; i < list_edges.length; i++){
    var edge_x = list_edges[i].x;
    var edge_y = list_edges[i].y;

    if (edge_x > child_offset.top.top_left.x && edge_x < child_offset.top.top_right.x ){
      if (edge_y < child_offset.top.bottom_left.y || edge_y > child_offset.bottom.top_left.y ){
        createjs.Sound.play("hit");
        stage.addChild(flappy_bird);
        stage.options.stage = 'gameover';
        createjs.Ticker.removeEventListener("tick", ticker_flapply_playing);
        createjs.Tween.get(flappy_bird).to({y:edge_ground_y, rotation:90}, 500,createjs.Ease.sineIn ).call(function(){
          stage.addChild(ground);
          setTimeout(function(){
            show_gameOver_board();
          },500);
          
        });
        
      }
    }
  }
}

function show_gameOver_board(){
  log("show game over board");
  createjs.Sound.play("swooshing");
  var gameOver_container = new createjs.Container();
  gameOver_container.name = "gameOver_container";
  stage.addChild(gameOver_container);

  //Init ready text

  var gameOver_title_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
  gameOver_title_bit.sourceRect = new createjs.Rectangle(788,114,gameOver_title_size.width, gameOver_title_size.height);
  gameOver_title_bit.x = Math.round((game_size.width - gameOver_title_size.width)/2);
  gameOver_title_bit.y = 100;
  gameOver_title_bit.alpha = 0;
  
  gameOver_container.addChild(gameOver_title_bit);
  
  createjs.Tween.get(gameOver_title_bit).to({alpha:1,y:gameOver_title_bit.y-5}, 300,createjs.Ease.sineIn ).call(function(){
    //Do stuff  
    
    createjs.Sound.play("swooshing");
    var medal_board_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
    medal_board_bit.sourceRect = new createjs.Rectangle(5,516,medal_board_size.width, medal_board_size.height);
    medal_board_bit.x = Math.round((game_size.width - medal_board_size.width)/2);
    medal_board_bit.y = game_size.height;
    gameOver_container.addChild(medal_board_bit);
    createjs.Tween.get(medal_board_bit).to({y:180}, 300,createjs.Ease.backInOut  ).call(function(){

      current_score_text = new createjs.Text(score_text.value, "bold 20px Sanidana", "#fff");
      current_score_text.value = 0;
      current_score_text.name = 'current_score_text';
      current_score_text.x =  medal_board_bit.x + 205 - current_score_text.getMeasuredWidth();
      current_score_text.y =  215;
      current_score_text.shadow = new createjs.Shadow("#000000", 0,0, 5);
      
      gameOver_container.addChild(current_score_text);

      best_score_text = new createjs.Text(50, "bold 20px Sanidana", "#fff");
      best_score_text.value = 0;
      best_score_text.name = 'best_score_text';
      best_score_text.x =  medal_board_bit.x + 205 - best_score_text.getMeasuredWidth()
      best_score_text.y =  260;
      best_score_text.shadow = new createjs.Shadow("#000000", 0,0, 5);
      
      gameOver_container.addChild(best_score_text);

      if (score_text.value > 10 || 1==1){
        var medal_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
        var selected_medal_offset = score_text.value > 20 ? platium_medal_offset : gold_medal_offset;
        selected_medal_offset = platium_medal_offset;
        medal_bit.sourceRect = new createjs.Rectangle(selected_medal_offset.x,selected_medal_offset.y,
        medal_size.width, medal_size.height);
        medal_bit.x = medal_board_bit.x + 27;
        medal_bit.y = medal_board_bit.y +43;
        
        gameOver_container.addChild(medal_bit);
      }
      
      


    });
  });
}

