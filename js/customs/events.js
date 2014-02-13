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
  flappy_bird.options.start_y = flappy_bird.y;
  
}


function tick(event) {
  var stage_name = stage.options.stage;
  general_number_ticker++;

  if (stage.getChildByName('ground') != null && stage_name !='gameover'){
    ground.delay_x  +=0.25; 
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
  
  var wrap_cylinder_container = stage.getChildByName('wrap_cylinder_container');

  if (wrap_cylinder_container && wrap_cylinder_container.getNumChildren() >0){
    for ( var i=wrap_cylinder_container.getNumChildren()-1; i >0; i-- ){
      var cylinder_container = wrap_cylinder_container.getChildAt(i);

      //Remove old cylinder, prevent overheat cpu
      if (cylinder_container.current_x < -cylinder_size.width ){
        wrap_cylinder_container.removeChild(cylinder_container);
        continue;
      }
      cylinder_container.current_x -= 1.5;
      var top_cylinder = cylinder_container.getChildAt(0);
      top_cylinder.x = Math.round(cylinder_container.current_x);
      cylinder_container.child_offset.top = build_point_param(top_cylinder.x,0,top_cylinder.end_y);

      var bottom_cylinder = cylinder_container.getChildAt(1);
      bottom_cylinder.x =  Math.round(cylinder_container.current_x);
      cylinder_container.child_offset.bottom = build_point_param(bottom_cylinder.x,bottom_cylinder.y,bottom_cylinder.end_y);

      if (! cylinder_container.bird_passed){
        if ( flappy_bird.x - half_bird_width > cylinder_container.child_offset.top.top_right.x ){
          cylinder_container.bird_passed = true;
          //play passed sound
          createjs.Sound.play("point");
          score_text.value++;
          score_text.text = score_text.value;
        }
        if ((flappy_bird.x + half_bird_width ) > cylinder_container.child_offset.top.top_left.x 
          && (flappy_bird.x - half_bird_width) < cylinder_container.child_offset.top.top_right.x ){
          check_game_over(cylinder_container.child_offset);
        }
        
      }
    }
  }

  if (general_number_ticker % 110 == 0){
    build_green_cylinder();
  }
  
  console.log("x "+flappy_bird.x);
  console.log("y " +flappy_bird.y);

  if (flappy_bird.options.status == 'rest' ){
    /*flappy_bird.options.status = 'is_down';*/
    var param = ( flappy_bird.y - flappy_bird.options.start_y ) / ( edge_ground_y - flappy_bird.options.start_y );
    param = param * 3.14/2;
    log(edge_ground_y - flappy_bird.options.start_y );
    log(flappy_bird.y);
    log(edge_ground_y - flappy_bird.options.start_y);
    log(param);
    var increase = Math.round( 8 * Math.sin(param)  );
    if (increase < 1)
      increase = 1;
    
    var next_y = flappy_bird.y +  increase ;
    
    next_y = (next_y > edge_ground_y) ? edge_ground_y: next_y;
    flappy_bird.y = next_y;

    var next_rotation = flappy_bird.rotation + increase ;
    
    next_rotation = (next_rotation >= 90 ) ? 90:  next_rotation;
    if ( next_rotation - flappy_bird.rotation <= 3)
      flappy_bird.rotation ++;
    else
    flappy_bird.rotation = next_rotation;
  }

  if (flappy_bird.options.status == 'in_up' ){
    var param =(flappy_bird.y - flappy_bird.options.start_y)/ ( flappy_bird.options.next_y - flappy_bird.options.start_y );
    
    flappy_bird.y -=  Math.round(3 * Math.cos(param));
    
    if (flappy_bird.y <= flappy_bird.options.next_y){
      //when move up done
      flappy_bird.options.status = 'rest';
      flappy_bird.options.start_y = flappy_bird.y - 1;
    }
    //Rotation bird to -20 degree
    if (flappy_bird.rotation > -20){
      flappy_bird.rotation -= 10;
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
        stage.removeChild(score_text);
        createjs.Ticker.removeEventListener("tick", ticker_flapply_playing);
        stage.addChild(flappy_bird);
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

  general_number_ticker = 0;
  bird_number_ticker = 0;
  log("show game over board");
  createjs.Sound.play("swooshing");
  var gameOver_container = new createjs.Container();
  gameOver_container.name = "gameOver_container";
  stage.addChild(gameOver_container);
  stage.addChild(flappy_bird);
  stage.addChild(ground);

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

      current_score_text = new createjs.Text( score_text.value, "bold 20px Sanidana", "#fff");
      current_score_text.name = 'current_score_text';
      
      current_score_text.x =  medal_board_bit.x + 205 - current_score_text.getMeasuredWidth();
      current_score_text.y =  215;
      
      log(score_text.value);
      current_score_text.shadow = new createjs.Shadow("#000000", 0,0, 5);
      gameOver_container.addChild(current_score_text);


      var best_score = get_best_score();
      log("best_score yeah");
      log(best_score);
      log(score_text.value);

      if (score_text.value > best_score ){
        
        best_score = score_text.value;
        set_best_score(best_score);

        log("show new score_text");

        var new_best_score_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
        new_best_score_bit.sourceRect = new createjs.Rectangle(new_best_score_offset.x,new_best_score_offset.y,
        new_best_score_size.width, new_best_score_size.height);
        new_best_score_bit.x = medal_board_bit.x + 135;
        new_best_score_bit.y = 240;
        gameOver_container.addChild(new_best_score_bit);

      }

      best_score_text = new createjs.Text(best_score, "bold 20px Sanidana", "#fff");
      best_score_text.value = 0;
      best_score_text.name = 'best_score_text';
      best_score_text.x =  medal_board_bit.x + 205 - best_score_text.getMeasuredWidth()
      best_score_text.y =  260;
      best_score_text.shadow = new createjs.Shadow("#000000", 0,0, 5);
      
      gameOver_container.addChild(best_score_text);

      if (score_text.value > 10 ){
        var medal_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
        var selected_medal_offset = score_text.value > 20 ? platium_medal_offset : gold_medal_offset;
        
        medal_bit.sourceRect = new createjs.Rectangle(selected_medal_offset.x,selected_medal_offset.y,
        medal_size.width, medal_size.height);
        medal_bit.x = medal_board_bit.x + 27;
        medal_bit.y = medal_board_bit.y +43;
        
        gameOver_container.addChild(medal_bit);
      }

      //Add play button
      var play_button_bit = new createjs.Bitmap(loader.getResult("main_sprite"));
      
      play_button_bit.sourceRect = new createjs.Rectangle(play_button_offset.x,play_button_offset.y,
      play_button_size.width, play_button_size.height);
      play_button_bit.x = Math.round((game_size.width - play_button_size.width)/2);
      play_button_bit.y = medal_board_bit.y +150;

      play_button_bit.addEventListener("click", function(){
        stage.removeChild(stage.getChildByName('gameOver_container'));
        stage.removeChild(stage.getChildByName('wrap_cylinder_container'));
        stage.removeChild(stage.getChildByName('score_text'));
        stage.removeChild(stage.getChildByName('ground'));
        stage.removeChild(stage.getChildByName('house_bitmap'));


        
        ready_stage();
      });
      
      gameOver_container.addChild(play_button_bit);
      log("done play button");
      
    });
  });
}

