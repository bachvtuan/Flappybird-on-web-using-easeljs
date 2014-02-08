function log (message) {
  console.log(message);
}

function create_bg(color){
  var g = new createjs.Graphics();
  g.beginFill(color).drawRect(0, 0, game_size.width, game_size.height).endFill();
  var bg = new createjs.Shape(g);
  return bg;
}

function random(min,max){
  return Math.floor((Math.random()*max)+min);
}