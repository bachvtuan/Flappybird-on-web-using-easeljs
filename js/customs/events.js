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
  stage.options.stage = "playing";
  createjs.Ticker.addEventListener("tick", tick_flappy_rest);
  
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


function tick(event) {
  var stage_name = stage.options.stage;
  if (stage.getChildByName('ground') != null && stage_name !='gameover'){
    ground.delay_x  +=0.5; 
    if (ground.delay_x ==1){
      ground.delay_x = 0;
    }
    ground.x =  Math.round(ground.x+ground.delay_x) % ground.tileW;
  }

  if (stage.getChildByName('flappy_bird') != null && stage_name != 'gameover'){
    flappy_bird.start_timer++;

      if (flappy_bird.start_timer % 2 ==0){
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
      switch (flappy_bird.start_timer){
        case 10:
          flappy_bird.gotoAndStop(0); 
          break;

        case 20:
          flappy_bird.gotoAndStop(1);
          break;
        case 30:
          flappy_bird.gotoAndStop(2); 
          flappy_bird.start_timer = 1;
          break;
      }
  }
  stage.update();
}


function tick_flappy_rest (event) {
  switch (stage.options.stage){
    case 'playing':
      playing_tick(event);
      break;
  }

  stage.update();
}

function playing_tick (event) {
  var ground_y = ground.y -10;

  if (flappy_bird.options.status == 'rest' ){
    log("take down");
    /*flappy_bird.options.status = 'is_down';*/
    var next_y = flappy_bird.y + 3;
    
    next_y = (next_y > ground_y) ? ground_y: next_y;
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


  if (flappy_bird.y == ground_y){
    log('gameover');
    stage.options.stage = 'gameover';

    //Set ground is front of flappy_bird
    stage.addChild(ground);
    createjs.Ticker.removeEventListener("tick", tick_flappy_rest);

    stage.removeChild(score_text);

    createjs.Sound.play("hit");

    setTimeout(function(){
      createjs.Sound.play("swooshing");
    },300);
  }
}