var stage,canvas;
    var card_container = new createjs.Container();
    var order_container = new createjs.Container();
    var horizontal_count =13;
    var stage_param = {width:1200,height:700};

    var card_center = {x:10,y:70};

    var user_card_array = {1:[],2:[],3:[],4:[]};
    var right_card_array = {1:[],2:[],3:[],4:[]};

    var arr_sort_count = {1:0,2:0,3:0,4:0};
    var blurFilter = new createjs.BlurFilter(5, 5, 2);
    var deal_button;

    var sprite_data = {
      images: ["images/classic-playing-cards.png"],
      frames: {width:73, height:98,count: 52},
      animations: {front:0, back:1,}
    };

    var map_card_value ={
      1:1,
      2:0,
      3:3,
      4:2
    };

    
    function getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    function sort_complete(card_array_index){
      console.log(card_array_index);
      arr_sort_count[card_array_index]++;
      if (arr_sort_count[card_array_index] == 13){
        arr_sort_count[card_array_index] = 0;
        console.log("completed");
        for(var i=0 ; i< user_card_array[card_array_index].length;i++){
          target = card_container.getChildByName(user_card_array[card_array_index][i].name);
          console.log(target);
          console.log(user_card_array[card_array_index][i].x);
          //refresh order
          card_container.addChild(target); 
        }
        stage.update();
      }
    }

    function move_completed(card_array_index){

    }

    function process_draw_by_order(is_order){

      for (var k =1 ;k <=4 ; k++ ){
        var temp_array = user_card_array[k];

        if (is_order){
          temp_array = _.sortBy(user_card_array[k],function(item){ return item.card_value; });
        }
      
        for(var i=0 ; i< temp_array.length;i++){
          var item = temp_array[i];
          //update new x
          vertical_index = (i % horizontal_count);
          item.x  =  card_center.x + ( vertical_index* (sprite_data.frames.width-20) );

          target = card_container.getChildByName(item.name);
          createjs.Tween.get(target).to({x:item.x,y:item.y}, 700,createjs.Ease.sineIn ).
            call(sort_complete,[k]);
        }
        user_card_array[k] = temp_array;
      }
    }


    function update_canvas_width(){
      canvas.width = 480; 
      canvas.height = 640;
      stage_param.width = canvas.width;
      stage_param.height = canvas.height;
    }

    function init () {
      canvas = document.getElementById("game");
      update_canvas_width();


      stage = new createjs.Stage("game");
      stage.enableMouseOver(20);  
      

      var bg = new createjs.Bitmap("images/bg.jpg");
      stage.addChild(bg);

      stage.addChild(card_container);
      

      var spriteSheet_button = new createjs.SpriteSheet({
        images: ["images/3buttons.png"],
        frames: {width:100, height:45,count: 3}
      });

      deal_button = new createjs.Sprite(spriteSheet_button); 
      deal_button.x = stage_param.width - 110;
      deal_button.y = 5;
      deal_button.start_timer = 0;
      deal_button.cursor = 'pointer';

      deal_button.addEventListener('mousedown',function(evt){
        //Process order card
        
        for(var i=1; i<=4;i++){
          for(var j=user_card_array[i].length-1;j>=0;j--){
            var item = user_card_array[i][j];
            if (item.popY){

              card_obj = card_container.getChildByName(user_card_array[i][j].name);
              
              //Unregister old event              
              card_obj.removeEventListener("rollover", mouseRollOverLeftImage);
              card_obj.removeEventListener("rollout", mouseRollOutLeftImage);
              card_obj.removeEventListener("mousedown", mousedownLeftImage );
              //Register new event
              card_obj.addEventListener("mousedown",mousedownRightImage);
              card_obj.addEventListener("pressup", pressupRightImage);
              card_obj.addEventListener('pressmove',pressmoveRightImage);


              createjs.Tween.get(card_obj).
              to({x:stage_param.width-100,y:user_card_array[i][j].y}, 1000,createjs.Ease.quintOut).
              call(move_completed,[i]);
              right_card_array[i].push(user_card_array[i][j]);
              user_card_array[i] = _.without(user_card_array[i],user_card_array[i][j]);
            }
          }
          console.log(user_card_array[i].length);
        }

        console.log(right_card_array);
        process_draw_by_order(false);

      });

      stage.addChild(deal_button);



      var highlight = new createjs.Shape();
      highlight.graphics.beginLinearGradientFill(["#000","#FFF"], [0, 1], 0, 10, 0, 30).drawRect(-50,-5,100,30);
      highlight.x = stage_param.width-200;
      highlight.y = 10;
      order_container.addChild(highlight);

      var order_button = new createjs.Text("Arrange", "bold 20px Arial","#fff");
      order_button.textAlign = "center";
      order_button.x =  stage_param.width-200;
      order_button.y = 8;
      order_container.addChild(order_button);
      order_container.cursor = "pointer";

      order_container.addEventListener('mousedown',function(evt){
        //Process order card
        process_draw_by_order(true);
      });

      stage.addChild(order_container);

      var spriteSheet  = new createjs.SpriteSheet(sprite_data);

      var first = new createjs.Sprite(spriteSheet);

      first.x =card_center.x;
      first.y =card_center.y;

      createjs.Ticker.addEventListener("tick", tick);

      var card_order = [];
      for (var i=0; i< sprite_data.frames.count;i++){
        card_order.push({index:i,position:i});
      }

      card_order = _.sortBy(card_order,function(item){
        return getRandomInt(0,52);
      });

      for (var i=0; i< card_order.length;i++){
        var image = first.clone();
        var index_arr = Math.ceil( (i+1)/13); 
        var index_card_horizontal = Math.ceil( (card_order[i].index)/13); 
        var real_vertical_index = (card_order[i].index % horizontal_count);

        image.name = "card"+card_order[i].index;

                
        vertical_index = (i % horizontal_count);
        image.x += ( vertical_index* (sprite_data.frames.width-20) );
        
        image.gotoAndStop(card_order[i].index);
        //custom properties
        image.originX = image.x;
        image.originY = image.y;
        image.insideArrayIndex = index_arr;
        
        if (real_vertical_index <2){
          real_vertical_index +=13;
        }
        
        var card_value = real_vertical_index* ((real_vertical_index -1)*4) + index_card_horizontal;
        
        user_card_array[index_arr].push({
          name:image.name,
          index:card_order[i].index,
          x: image.x,
          y: image.y,
          card_value: card_value
        });
        image.addEventListener("rollover", mouseRollOverLeftImage);
        image.addEventListener("rollout", mouseRollOutLeftImage);
        image.addEventListener("mousedown", mousedownLeftImage );
        
        card_container.addChild(image); 

        if ( (i+1) % 13 == 0){
          first.y += sprite_data.frames.height +45;
        }
      }


      stage.addChild(card_container);
      stage.update();

    }
    function tick() {

      deal_button.start_timer++;
      switch (deal_button.start_timer){
        case 20:deal_button.gotoAndStop(0);break;
        case 40:deal_button.gotoAndStop(1);break;
        case 60:deal_button.gotoAndStop(2); deal_button.start_timer = 0;break;
      }
      
      
      stage.update();
    }

    function mouseRollOutLeftImage(evt){
      evt.target.shadow = null;
      evt.target.skewX += 2;
    }
    function mouseRollOverLeftImage(evt){
      evt.target.shadow = new createjs.Shadow("#333", 2, 2, 20);
      evt.target.skewX -= 2;
      evt.target.cursor = "pointer";
    }

    function mousedownLeftImage(evt){

      console.log("onmouse down1");
      var target = evt.target;
      var popY = null;

      if (target.y == target.originY){
        target.y -=40;
        popY = target.y;
      }
      else{
        target.y += 40;
      }
      for(var i=0; i< user_card_array[target.insideArrayIndex].length;i++){
        if (user_card_array[target.insideArrayIndex][i].name == target.name){
          user_card_array[target.insideArrayIndex][i].popY = popY;
          console.log("got it");
          break;
        }
      }
      stage.update();
    }

    
    function mousedownRightImage(evt){
      target = evt.target;
      target.offset = {x:target.x-evt.stageX, y:target.y-evt.stageY};
      target.filters = [blurFilter];
      target.cache(0,0,sprite_data.frames.width,sprite_data.frames.height);
      stage.addChild(target);
    }
    function pressupRightImage(evt){
      target.filters = [];
      target.cache(0,0,sprite_data.frames.width,sprite_data.frames.height);
    }
    function pressmoveRightImage(evt){
      target = evt.target;
      
      //target.alpha = 0.6;
      target.x  = evt.stageX + target.offset.x;
      target.y  =evt.stageY + target.offset.y;
    }
    
  