var joystick = 
{
	FPS:30,
	stageX:0,
	stageY:0,
	intervalStart:0,
	intervalCounter:0,
	intervalUpdate:0,
	TIME_COUNTER_START:3,
	TIME_COUNTER:30,
	counterStartNum:this.TIME_COUNTER_START,
	counterNum:this.TIME_COUNTER,
	
	init:function()
	{
		var scope = this;
		this.joystickDiv = document.getElementById ("joystick");
		this.base = document.createElement ("div");
		this.base.id = "joystickBase";
		this.joystickDiv.appendChild (this.base);
		
		this.ball.init();
		this.base.appendChild (this.ball.div);
		
		this.btCatch = document.createElement ("div");
		this.btCatch.id = "btCatch";
		this.joystickDiv.appendChild (this.btCatch);
		
		this.textCounterStart = document.createElement ("div");
		this.textCounterStart.id = "textCounterStartGame"
		this.joystickDiv.appendChild (this.textCounterStart);
		
		this.counterStart = document.createElement ("div");
		this.counterStart.className = "counterStyle";
		this.counterStart.id = "counterStartGame";
		this.textCounterStart.appendChild (this.counterStart);
		
		this.textCounter = document.createElement ("div");
		this.textCounter.id = "textCounterGame";
		this.joystickDiv.appendChild (this.textCounter);
		
		this.counter = document.createElement ("div");
		this.counter.className = "counterStyle";
		this.counter.id = "counterGame";
		this.joystickDiv.appendChild (this.counter);
		
		
		
		this.btCatch[eventClick] = function (e){
			scope.endGame();
		}
		
		document.body[eventMove] = function(e){
			e.preventDefault(); e.stopPropagation();
			joystick.stageX = e.touches ? e.touches[0].pageX : e.pageX;
			joystick.stageY = e.touches ? e.touches[0].pageY : e.pageY;
		}
		
		
	},
	
	startGame:function()
	{
		log ("startGame");
		request.send ("s");
		
		this.textCounterStart.style.display = "none";
		
		var scope = this;
		clearInterval (this.intervalUpdate);
		this.intervalUpdate = setInterval (function(){
			scope.update();
		}, 1000/this.FPS);
		
		clearInterval (this.intervalCounter);
		this.intervalCounter = setInterval (function(){
			scope.counterNum--;
			scope.counter.innerHTML = digitalFormat(scope.counterNum, 2);
			if (scope.counterNum == 0)
			{
				clearInterval (scope.intervalCounter);
				scope.endGame();
			}
		}, 1000)
	},
	
	endGame:function()
	{
		log ("endGame");
		clearInterval (this.intervalUpdate);
		clearInterval (this.intervalCounter);
		clearInterval (this.intervalStart);
		request.send ("e");
		ViewsNavigator.go ("gameover");
	},
	
	show:function()
	{
		this.counterStartNum = this.TIME_COUNTER_START;
		this.counterNum = this.TIME_COUNTER;
		this.counter.innerHTML = digitalFormat (this.TIME_COUNTER, 2);
		this.counterStart.innerHTML = digitalFormat (this.TIME_COUNTER_START, 2);
		
		this.textCounterStart.style.display = "block";
		
		this.ball.reset();
		
		var scope = this;
		clearInterval (this.intervalStart);
		this.intervalStart = setInterval (function(){
			scope.counterStartNum--;
			scope.counterStart.innerHTML = digitalFormat(scope.counterStartNum, 2);
			if (scope.counterStartNum == 0)
			{
				clearInterval (scope.intervalStart);
				scope.startGame();
			}
		}, 1000)
	},
	
	hide:function()
	{
		clearInterval (this.intervalUpdate);
		clearInterval (this.intervalCounter);
		clearInterval (this.intervalStart);
		//log ("joystick hide: " + this.ball);
	},
	
	update:function()
	{
		this.ball.update();
	},
	
	ball:
	{
		init:function()
		{
			this.RADIUS_DRAG = 75;
			this.LOCK_RADIAN = 45 * Math.PI / 180;
			this.LOCK_RADIAN_HALF = this.LOCK_RADIAN/2;
			this.MIN_RADIUS_REQ = 15;
			this.currentDirection = "";
			this.directions = ["r", "dr", "d", "dl", "l", "ul", "u", "ur"];
			this.x = this.xInit = 91;
			this.y = this.yInit = 80;
			this.dragOffsetX = 0;
			this.dragOffsetY = 0;
			this.dragging = false;
			this.div = document.createElement ("div");
			this.div.id = "joystickBall";
			
			var scope = this;
			this.div[eventStart] = function(e)
			{
				e.preventDefault(); e.stopPropagation();				
				joystick.stageX = e.touches ? e.touches[0].pageX : e.pageX;
				joystick.stageY = e.touches ? e.touches[0].pageY : e.pageY;
			
				scope.dragOffsetX = joystick.stageX - scope.x;
				scope.dragOffsetY = joystick.stageY - scope.y;
				scope.dragging = true;
			}
			document.body[eventEnd] = this.div[eventEnd] = function(e)
			{
				if (!scope.dragging) return;
				scope.dragging = false;
				request.send (null);
			}
			
		},
		reset:function()
		{
			this.x = this.xInit;
			this.y = this.yInit;
			this.updateTransform();
		},
		
		update:function()
		{
			var xEnd;
			var yEnd;
			if (this.dragging)
			{
				var dx = joystick.stageX - this.xInit - this.dragOffsetX;
				var dy = joystick.stageY - this.yInit - this.dragOffsetY;
				var d = Math.sqrt (dx * dx + dy * dy);
				this.currentRadius = d < this.RADIUS_DRAG ? d : this.RADIUS_DRAG
				var angle = Math.atan2 (dy, dx);
				
				xEnd = this.xInit + Math.cos (angle) * this.currentRadius;
				yEnd = this.yInit + Math.sin (angle) * this.currentRadius;
			}
			else
			{
				xEnd = this.x + (this.xInit - this.x) * 0.5;
				yEnd = this.y + (this.yInit - this.y) * 0.5;
			}
			
			this.x = xEnd;
			this.y = yEnd;
			
			
			
			var quadrant = Math.floor((angle + this.LOCK_RADIAN_HALF) / this.LOCK_RADIAN);
			if (quadrant < 0) quadrant += this.directions.length;
			this.currentDirection = this.directions[quadrant];
			
			//log ("currentDirection: " + this.currentDirection);
			if (this.currentRadius > this.MIN_RADIUS_REQ)
			{
				//log (this, "SEND REQ");
				request.send (this.currentDirection);
			}
			else
			{
				//request.send (null);
			}
			
			this.updateTransform();
		},
		updateTransform:function()
		{
			this.div.style.left = this.x + "px";
			this.div.style.top = this.y + "px";
			var transform = "translateZ(0)";
			this.div.style.transform = transform;
			this.div.style.WebkitTransform = transform;
			this.div.style.MozTransform = transform;
			this.div.style.OTransform = transform;
			this.div.style.msTransform = transform;
		}
	}
}
