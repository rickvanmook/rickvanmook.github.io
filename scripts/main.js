
var canvasEl = document.querySelector('.canvas');

window.addEventListener('resize', resizeCanvas, false);


// module aliases
var World = Matter.World,
	Bodies = Matter.Bodies,
	Body = Matter.Body,
	Engine = Matter.Engine,
	Render = Matter.Render,
	Composite = Matter.Composite,
	Composites = Matter.Composites,
	Constraint = Matter.Constraint,
	MouseConstraint = Matter.MouseConstraint,
	engine = Engine.create(),
	world = engine.world;


// create a renderer
var render = Render.create({
	canvas: canvasEl,
	engine: engine,
	options: {
		showAngleIndicator: true,
		wireframes: true,
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

init();

function init() {

	// add all of the bodies to the world
	World.add(engine.world, [boxA, boxB]);

	// add a mouse controlled constraint
	var mouseConstraint = MouseConstraint.create(engine);
	World.add(engine.world, mouseConstraint);

	// run the engine
	Engine.run(engine);

	// run the renderer
	Render.run(render);


	createWalls(windowWidth, windowHeight);
	resizeCanvas();
	createRope();
}


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

function createRope() {

	var group = Body.nextGroup(true);

	var ropeA = Composites.stack(
		130, //xx
		100, //yy
		5, //columns
		1, //rows
		20, //columnGap
		0, //rowGap
		function(x, y) {//callback
		return Bodies.rectangle(x, y, 50, 20, {isStatic: false});
	});

	Composites.chain(
		ropeA,//composite
		0.5,//xOffsetA
		0,//yOffsetA
		-0.5,//xOffsetB
		0,//yOffsetB
		{ stiffness: 1, length: 20 }//options
	);

	Composite.add(ropeA, Constraint.create({
		bodyB: ropeA.bodies[0],
		pointA: { x: 110, y: 110 },
		pointB: { x: -25, y: 0 },
		stiffness: 0.5
	}));

	World.add(world, ropeA);
}