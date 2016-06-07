
var lineColor = "black";
var canvasWidth = Math.min(600, screen.availWidth-20);
var canvasHeight = canvasWidth;
var mousedown = false;
var lastPosition;
var lastTimestamp;
var lastLineWidth;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

canvas.width = canvasWidth;
canvas.height = canvasHeight;

var controller = document.querySelector(".controller");
controller.style.display = "block";
controller.style.width = canvasWidth+"px";

drawGrid(context);

var clear = document.querySelector(".btn-clear");
clear.onclick = function(){
	canvas.width = canvasWidth;
	drawGrid(context);
}

function drawGrid(ctx){
	ctx.save();

	ctx.strokeStyle = "rgb(230,11,9)";

	ctx.beginPath();
	ctx.moveTo(3,3);
	ctx.lineTo(canvasWidth-3,3);
	ctx.lineTo(canvasWidth-3,canvasHeight-3);
	ctx.lineTo(3,canvasHeight-3);
	ctx.closePath();

	ctx.lineWidth = 6;
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(canvasWidth,canvasHeight);
	ctx.moveTo(canvasWidth,0);
	ctx.lineTo(0,canvasHeight);
	ctx.moveTo(canvasWidth/2,0);
	ctx.lineTo(canvasWidth/2,canvasHeight);
	ctx.moveTo(0,canvasHeight/2);
	ctx.lineTo(canvasWidth,canvasHeight/2);
	ctx.closePath();

	ctx.setLineDash([canvasWidth/100,canvasWidth/50]);
	ctx.lineWidth = 1;
	ctx.stroke();

	ctx.restore();
}

var colorpickers = document.querySelectorAll(".btn");
for (var i = 0, len = colorpickers.length; i < len; i++) {
	colorpickers[i].onclick = function(){
		for (var j = 0; j < len; j++) {
			colorpickers[j].classList.contains("on");
			colorpickers[j].classList.remove("on");
		}
		this.classList.add("on");
		lineColor = getStyle(this,"background-color");
	}
}

function getStyle(ele, style){
	return (ele.currentStyle ? ele.currentStyle :window.getComputedStyle(ele))[style];
}

var on = function(ele,event,fn){
	ele.addEventListener(event,_handleFn(fn));
}

var _handleFn = function(fn){
	return function(e){
		e.preventDefault();
		fn(e);
	}
}

// for Mouse Devices
on(canvas,"mousedown",function(e){
	beginStroke(e);
})
on(canvas,"mousemove",function(e){
	if (mousedown) {
		moveStroke(context,e);
	}
})
on(canvas,"mouseup",function(){
	endStroke();
})
on(canvas,"mouseout",function(){
	endStroke();
})

// for Touch Devices
on(canvas,"touchstart",function(e){
	beginStroke(e.touches[0]);
})
on(canvas,"touchmove",function(e){
	if (mousedown) {
		moveStroke(context,e.touches[0]);
	}
})
on(canvas,"touchsend",function(e){
	endStroke();
})

function beginStroke(e){
	mousedown = true;
	lastPosition = page2canvas(e);
	lastTimestamp = new Date().getTime();
}

function moveStroke(ctx,e){
	var currentPosition = page2canvas(e);
	var currentTimestamp = new Date().getTime();
	var s = calcDistance(lastPosition,currentPosition);
	var t = currentTimestamp - lastTimestamp;

	ctx.beginPath();
	ctx.moveTo(lastPosition.x,lastPosition.y);
	ctx.lineTo(currentPosition.x,currentPosition.y);
	ctx.strokeStyle = lineColor;
	ctx.lineWidth = calcLineWidth(t,s);
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.stroke();

	lastPosition = currentPosition;
	lastTimestamp = currentTimestamp;
}

function endStroke(){
	mousedown = false;
}

function page2canvas(e){
	var x = e.pageX || e.clientX;
	var y = e.pageY || e.clientY;
	var offset = canvas.getBoundingClientRect();
	var left = Math.round(offset.left);
	var top = Math.round(offset.top);
	return {x:x-left,y:y-top};
}

function calcDistance(p1,p2){
	return Math.sqrt(Math.pow((p1.x-p2.x),2)+Math.pow((p1.y-p2.y),2))
}

var maxLineWidth = 20;
var minLineWidth = 1;
var maxVelocity = 15;
var minVelocity = 0.1;

function calcLineWidth(t,s){
	var v = s/t;
	var currentLineWidth;
	if (v < minVelocity) {
		currentLineWidth = maxLineWidth;
	} else if (v > maxVelocity) {
		currentLineWidth = minLineWidth;
	} else {
		currentLineWidth = maxLineWidth-(v-minVelocity)*((maxLineWidth-minLineWidth)/(maxVelocity-minVelocity));
	}
	if (lastLineWidth === undefined) {
		return currentLineWidth;
	}
	return lastLineWidth*0.618+currentLineWidth*0.382;
}
