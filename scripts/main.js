
var canvasEl = document.querySelector('.canvas');

window.addEventListener('resize', resizeCanvas, false);


// module aliases
var Engine = Matter.Engine,
	Render = Matter.Render,
	World = Matter.World,
	Body = Matter.Body,
	Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
	canvas: canvasEl,
	engine: engine,
	options: {
		width: canvasEl.width,
		height: canvasEl.height
	}
});

// create two boxes and a ground
var windowWidth = window.innerWidth,
	windowHeight = window.innerHeight,
	boxA = Bodies.rectangle(windowWidth/2 - 25, windowHeight/2-20, 80, 80),
	boxB = Bodies.rectangle(windowWidth/2 + 25, windowHeight/2-120, 80, 80),
	topWall,
	bottomWall,
	leftWall,
	rightWall;


// add all of the bodies to the world
World.add(engine.world, [boxA, boxB]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

createWalls(windowWidth, windowHeight);
resizeCanvas();



function resizeCanvas() {

	var newWidth = window.innerWidth,
		newHeight = window.innerHeight,
		offsetX = (newWidth - windowWidth)/2,
		offsetY = newHeight - windowHeight;

	canvasEl.width = newWidth;
	canvasEl.height = newHeight;

	Matter.Composite.translate(engine.world,{x:offsetX,y:offsetY});

	createWalls(newWidth, newHeight);

	windowWidth = newWidth;
	windowHeight = newHeight;
}

function createWalls(width, height) {

	var THICKNESS = 10,
		oldTopWall = topWall,
		oldBottomWall = bottomWall,
		oldLeftWall = leftWall,
		oldRightWall = rightWall;

	topWall = Bodies.rectangle(width / 2, -THICKNESS/2, width, THICKNESS, { isStatic: true });
	bottomWall = Bodies.rectangle(width / 2, height + THICKNESS/2, width, THICKNESS, { isStatic: true });
	leftWall = Bodies.rectangle(-THICKNESS/2, height  / 2, THICKNESS, height, { isStatic: true });
	rightWall = Bodies.rectangle(width + THICKNESS/2, height / 2, THICKNESS, height, { isStatic: true });

	World.add(engine.world, [
		bottomWall,
		topWall,
		leftWall,
		rightWall
	]);

	if(oldTopWall || oldBottomWall || oldLeftWall || oldRightWall) {

		Matter.Composite.remove(engine.world, [
			oldBottomWall,
			oldTopWall,
			oldLeftWall,
			oldRightWall
		]);
	}
}