var fieldHeight = 0;
var fieldWidth = 0;
var context = null;
var actors = {};
var collectables = 2;
var score = 0;
var scoreArea = 25;
var level = 1;
var background = '#559955';
var altBackground = '#555599';
var lives = 2;

var library = {
  "select": {"Volume":{"Sustain":0.1,"Decay":0.15,"Punch":0.55}},
  "long": {"Volume":{"Sustain":0.1,"Decay":0.5,"Punch":1}},
  "apple":{"Generator":{"Func":"sine","A":0,"B":0},"Volume":{"Attack":0,"Sustain":0.07,"Decay":0.19,"Punch":0.26,"Master":0.32},"Filter":{"LP":1,"LPSlide":-0.45,"LPResonance":0},"Frequency":{"Min":983,"Max":1428,"Slide":0.37,"DeltaSlide":0.62,"RepeatSpeed":1.57,"Start":828,"ChangeAmount":1,"ChangeSpeed":0.24},"Vibrato":{"Depth":0.29,"DepthSlide":-0.17,"Frequency":34.01,"FrequencySlide":-0.24},"Phaser":{"Offset":0.01,"Sweep":-0.01}},
  "death":{"Frequency":{"Start":30,"Min":122,"Max":973,"DeltaSlide":0.03,"Slide":-1},"Volume":{"Master":0.46,"Attack":0,"Sustain":0.12,"Punch":2.95,"Decay":0.15},"Generator":{"Func":"saw","ASlide":-0.18,"BSlide":0.65},"Vibrato":{"Depth":0.85,"DepthSlide":-0.49,"Frequency":13.01,"FrequencySlide":-0.67},"Phaser":{"Offset":-0.59,"Sweep":0.48}}
};

var sfx = jsfx.Sounds(library);

$(document).ready(function(){
  context = setupField();
  createActors();
  createListeners();
  setInterval(redraw, 50);
});

function redraw(){
  checkCollisions(context, actors);
  checkEndOfLevel(context, actors);
  clearField(context); 
  drawActors(context,actors);
  updateScore(context, score);

};

function checkEndOfLevel(field, actors){
  if (actors.player.hide === true)
  {
    // game over
  }

  for(var a in actors)
  {
    var actor = actors[a];
    if (actor.value > 0 && actor.hide === false) return;
  }

  // end of level!
  advanceLevel(actors);
  var t = background;
  background = altBackground;
  altBackground = t;
  setTimeout(function(){
    t = background;
    background = altBackground;
    altBackground = t;
    setTimeout(function(){
      t = background;
      background = altBackground;
      altBackground = t;
      setTimeout(function(){
        t = background;
        background = altBackground;
        altBackground = t;
      }, 300);
    }, 300);
  }, 300);
};

function resetLevel(field, actors)
{
  for(var a in actors){
    var actor = actors[a];
    if (actor.value > 0)
      actor.hide = false;
  }

  actors.player.x = 0;
  actors.player.y = fieldHeight - scoreArea-15;
  actors.arnak.x = fieldWidth-15;
  actors.arnak.y = 0 
}

function advanceLevel(actors){
  for(var a in actors){
    var actor = actors[a];
    if (actor.value > 0)
      actor.hide = false;

    var x = Math.floor(Math.random() * fieldWidth - 10);
    var y = Math.floor(Math.random() * fieldHeight - 10);
    actor.x = x;
    actor.y = y;

  }

  actors.player.x = 0;
  actors.player.y = fieldHeight - scoreArea;
  actors.arnak.x = fieldWidth-15;
  actors.arnak.y = 0
  level++;
  if (collectables < 10){
    var x = Math.floor(Math.random() * fieldWidth - 10);
    var y = Math.floor(Math.random() * fieldHeight - 10);
    actors['apple' + collectables] = {hide:false, value:10, harm: 0, x:x, y:y, width:10, height:10, speed:0, data:{}, tick: function(){}, draw: drawApple};
    collectables++;
  } 
};

function updateScore(field, score){
  field.beginPath();
  field.lineStyle = '#000000';
  field.fillStyle = '#000000';
  field.font = '10px Verdana';
  field.fillText('Score: ' + score, 5, fieldHeight + 10);
  field.fillText('Day:   ' + level, 5, fieldHeight + 20);
  field.fillText('Lives: ' + lives, fieldWidth/2, fieldHeight + 10);
  field.closePath();
};

function checkCollisions(field, actors){
  // Has the player collided with anything?
  var player = actors.player;
  for(var a in actors){
    var actor = actors[a];

    if (actor.hide === true) continue;

    // Ensure no actor moves off of the field.
    if (actor.x + actor.width > fieldWidth){
      actor.x = fieldWidth - actor.width-1;
    }
    else if (actor.x < 1)
    {
      actor.x = 1;
    }
    else if (actor.y + actor.height > fieldHeight){
      actor.y = fieldHeight-actor.height-1;
    }
    else if(actor.y < 1)
    {
      actor.y = 1;
    }

    // Check for a collision with other actors
    if (actor.name !== player.name &&
      player.x + player.width > actor.x && 
      player.x < actor.x + actor.width &&
      player.y+player.height > actor.y &&
      player.y < actor.y + actor.height){

      if (actor.value > 0)
      { 
        score += actor.value;
        actor.hide = true;
        sfx.apple();
      }
      else if (actor.harm > 0)
      {
        sfx.death();
        lives--;
        if (lives ===0){
         alert('Game over.');
         return; 
       }

       resetLevel(field, actors);
     }
   }

 }

};

function createActors(){
  actors.player = {hide: false, name: 'player', value:0, harm: 0, x:0, y:fieldHeight-scoreArea,width:15,height:15,speed:10,data:{lastX:0, lastY:0}, tick: function(field){}, draw: drawPlayer};
  actors.arnak  = {hide: false, name: 'arnak', value:0, harm: 1, x:fieldWidth, y:0,width:15,height:15,speed:10,data:{lastX:0, lastY:0}, tick: function(field){}, draw: drawArnak};
  for(var c = 0; c < collectables; c++){
    var x = Math.floor(Math.random() * fieldWidth - 10);
    var y = Math.floor(Math.random() * fieldHeight - 10);
    actors['apple' + c] = {hide:false, value:10, harm: 0, x:x, y:y, width:10, height:10, speed:0, data:{}, tick: function(){}, draw: drawApple};

  }
};

function createListeners(){
  $(window).keydown(function(e){
    if (e.keyCode === 37){
      actors.player.x-=actors.player.speed;
    }
    else if(e.keyCode === 38){
      actors.player.y-=actors.player.speed;
    }
    else if (e.keyCode === 39)
    {
      actors.player.x+=actors.player.speed;
    }
    else if (e.keyCode === 40)
    {
      actors.player.y+=actors.player.speed;
    }

  });
};

function setupField(){
  var field = $('#field');
  fieldHeight = field.height() - scoreArea;
  fieldWidth = field.width();
  var context = field[0].getContext('2d');
  return context;
};

function clearField(context)
{
  context.clearRect(0,0,fieldWidth, fieldHeight + scoreArea);
  context.fillStyle = background;
  context.fillRect(0,0,fieldWidth, fieldHeight);
}

function drawActors(field, actors){
  for(var a in actors){
    var actor = actors[a];
    if (actor.hide !== true){
      actor.draw(field);
    }
  }
  
};

function drawApple(field)
{
  this.tick(field);
  field.beginPath();
  field.moveTo(this.x + this.width*(1/12), this.y + this.height*(4/12));
  field.lineTo(this.x + this.width*(3/12), this.y + this.height*(3/12));
  field.lineTo(this.x + this.width*(4/12), this.y + this.height*(3/12));
  field.lineTo(this.x + this.width*(6/12), this.y + this.height*(4/12));
  field.lineTo(this.x + this.width*(8/12), this.y + this.height*(3/12));
  field.lineTo(this.x + this.width*(9/12), this.y + this.height*(3/12));
  field.lineTo(this.x + this.width*(11/12), this.y + this.height*(4/12));
  field.lineTo(this.x + this.width*(12/12), this.y + this.height*(6/12));
  field.lineTo(this.x + this.width*(11/12), this.y + this.height*(10/12));
  field.lineTo(this.x + this.width*(10/12), this.y + this.height);
  field.lineTo(this.x + this.width*(2/12), this.y + this.height);
  field.lineTo(this.x + this.width*(1/12), this.y + this.height*(10/12));
  field.lineTo(this.x, this.y + this.height*(6/12));
  field.lineTo(this.x + this.height*(1/12), this.y + this.height*(4/12));
  field.strokeStyle = '#000000';
  field.fillStyle = '#990000';
  field.stroke();
  field.fill();
  field.closePath();

  // draw the stalk
  field.beginPath();
  field.moveTo(this.x + this.width*(6/12), this.y + this.height*(4/12));
  field.lineTo(this.x + this.width*(7/12), this.y + this.height*(3/12));
  field.lineTo(this.x + this.width*(6/12), this.y + this.height*(2/12));
  field.lineTo(this.x + this.width*(5/12), this.y + this.height*(1/12));
  field.strokeStyle = '#997777';
  field.stroke();
  field.closePath();
}

function drawPlayer(field)
{
  this.tick(field);

  // Draw hat
  field.beginPath();
  field.moveTo(this.x + this.width*(3/5),this.y);
  field.lineTo(this.x + this.width*(3/4), this.y+this.height*(4/12))
  field.lineTo(this.x + this.width, this.y+this.height*(5/12));
  field.lineTo(this.x, this.y+this.height*(5/12));
  field.lineTo(this.x + this.width*(1/4), this.y+this.height*(4/12));
  field.strokeStyle = '#000000';
  field.stroke();
  field.fillStyle = '#337733';
  field.fill();

  // draw body
  field.moveTo(this.x + this.width*(1/4), this.y+this.height*(7/12));
  field.lineTo(this.x + this.width*(1/2), this.y+this.height*(8/12));
  field.lineTo(this.x + this.width*(3/4), this.y+this.height*(7/12));
  field.lineTo(this.x + this.width*(5/6), this.y+this.height*(9/12));
  field.lineTo(this.x + this.width, this.y+this.height*(9/10));
  field.lineTo(this.x, this.y + this.height*(9/10));
  field.lineTo(this.x + this.width*(1/5), this.y+this.height*(9/12));
  field.lineTo(this.x + this.width*(1/4), this.y + this.height*(7/12));
  field.stroke();
  field.fill();
  field.closePath();

  // draw feet
  field.beginPath();
  field.moveTo(this.x + this.width*(1/5), this.y + this.height*(9/10));
  field.lineTo(this.x + this.width*(1/6), this.y + this.height);
  field.lineTo(this.x + this.width*(2/5), this.y + this.height);
  field.lineTo(this.x + this.width*(2/5), this.y + this.height*(9/10));
  field.moveTo(this.x + this.width*(3/5), this.y + this.height*(9/10));
  field.lineTo(this.x + this.width*(3/5), this.y + this.height);
  field.lineTo(this.x + this.width*(5/6), this.y + this.height);
  field.lineTo(this.x + this.width*(4/5), this.y + this.height*(9/10));
  field.fillStyle = '#333333';
  field.stroke();
  field.fill();
  field.closePath();

  // draw head
  field.beginPath();
  field.moveTo(this.x + this.width*(1/5), this.y + this.height*(5/12));
  field.lineTo(this.x + this.width*(1/4), this.y + this.height*(7/12));
  field.lineTo(this.x + this.width*(1/2), this.y + this.height*(8/12));
  field.lineTo(this.x + this.width*(3/4), this.y + this.height*(7/12));
  field.lineTo(this.x + this.width*(4/5), this.y + this.height*(5/12));
  field.fillStyle = '#CCBBBB';
  field.stroke();
  field.fill();
  field.closePath();
};

function drawArnak(field){
  // Draw body
  field.beginPath();
  field.moveTo(this.x + this.width*(6/12), this.y);
  field.lineTo(this.x + this.width*(8/12), this.y + this.height*(2/12));
  field.lineTo(this.x + this.width*(9/12), this.y + this.height*(6/12));
  field.lineTo(this.x + this.width*(10/12), this.y + this.height*(8/12));
  field.lineTo(this.x + this.width*(12/12), this.y + this.height*(12/12));
  field.lineTo(this.x, this.y + this.height*(12/12));
  field.lineTo(this.x + this.width*(2/12), this.y + this.height*(8/12));
  field.lineTo(this.x + this.width*(3/12), this.y + this.height*(6/12));
  field.lineTo(this.x + this.width*(4/12), this.y + this.height*(2/12));
  field.lineTo(this.x + this.width*(6/12), this.y);
  field.fillStyle = '#CCCCCC';
  field.fill();
  field.stroke();
  field.closePath();

  // Draw head
  field.beginPath();
  field.moveTo(this.x + this.width*(4/12), this.y + this.height*(2/12));
  field.lineTo(this.x + this.width*(2/12), this.y + this.height*(3/12));
  field.lineTo(this.x + this.width*(2/12), this.y + this.height*(5/12));
  field.lineTo(this.x + this.width*(1/12), this.y + this.height*(6/12));
  field.lineTo(this.x + this.width*(3/12), this.y + this.height*(6/12));
  field.fillStyle = '#BBBBBB';
  field.fill();
  field.stroke();
  field.closePath();
};