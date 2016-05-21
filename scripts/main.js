
var IS_DEBUG = false,
	FILL_COLOR = '#f3866e',
	canvasEl = document.querySelector('.canvas'),
	context = canvasEl.getContext('2d');

window.addEventListener('resize', resizeCanvas, false);


// module aliases
var World = Matter.World,
	Bodies = Matter.Bodies,
	Body = Matter.Body,
	Engine = Matter.Engine,
	Render = Matter.Render,
	Composite = Matter.Composite,
	Composites = Matter.Composites,
	Common = Matter.Common,
	Constraint = Matter.Constraint,
	MouseConstraint = Matter.MouseConstraint,
	Mouse = Matter.Mouse,
	Vertices = Matter.Vertices,
	engine = Engine.create(),
	world = engine.world;


var points = [

	//{x:40, y:0},
	//{x:40, y:20},
	//{x:100, y:20},
	//{x:100, y:80},
	//{x:40, y:80},
	//{x:40, y:100},
	//{x:0, y:50}

	{x:0,y:0},
	{x:100,y:0},

	{x:125,y:50},

	{x:100,y:100},
	{x:0,y:100}
];

var customShapePath = '',
	point,
	i = 0;

for(i; i < points.length; i++) {

	point = points[i];

	customShapePath += point.x + ',' + point.y + ' ';
}

var customShape = Vertices.fromPath(customShapePath);


// create a renderer
var render = Matter.Render.create({
	canvas: canvasEl,
	element: canvasEl.parentElement,
	engine: engine,
	options: {
		lineWidth: 0,
		showAngleIndicator: false,
		wireframes: false,
		width: canvasEl.width,
		height: canvasEl.height,

		background: '#fafafa',
		wireframeBackground: '#222',
		hasBounds: false,
		enabled: true,
		showSleeping: true,
		showDebug: false,
		showBroadphase: false,
		showBounds: false,
		showVelocity: false,
		showCollisions: false,
		showSeparations: false,
		showAxes: false,
		showPositions: false,
		showIds: false,
		showShadows: false,
		showVertexNumbers: false,
		showConvexHulls: false,
		showInternalEdges: false,
		showMousePosition: false
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

	// add a mouse controlled constraint

	var mouse = MouseConstraint.create(engine, {
		mouse: Mouse.create(canvasEl),
		element: canvasEl,
		constraint: {stiffness: 0.9}
	});

	// add all of the bodies to the world
	World.add(engine.world, [mouse]);


	// run the engine
	Engine.run(engine);

	if(IS_DEBUG) {
		// run the renderer
		Render.run(render);
	} else {

		redraw();
	}


	createWalls(windowWidth, windowHeight);
	resizeCanvas();
	createRope();


	var stack = Composites.stack(windowWidth/2, windowHeight/2, 2, 2, 100, 100, function(x, y) {
		return Bodies.fromVertices(x, y, customShape);
	});

	World.add(engine.world, [stack]);
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

	var THICKNESS = 1000,
		oldTopWall = topWall,
		oldBottomWall = bottomWall,
		oldLeftWall = leftWall,
		oldRightWall = rightWall;

	topWall = Bodies.rectangle(width / 2, -THICKNESS/2, width*2, THICKNESS, { isStatic: true });
	bottomWall = Bodies.rectangle(width / 2, height + THICKNESS/2, width*2, THICKNESS, { isStatic: true });

	leftWall = Bodies.rectangle(-THICKNESS/2, height  / 2, THICKNESS, height*2, { isStatic: true });

	rightWall = Bodies.rectangle(width + THICKNESS/2, height / 2, THICKNESS, height*2, { isStatic: true });

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
		return Bodies.rectangle(x, y, 50, 50, {isStatic: false});
	});

	//Composites.chain(
	//	ropeA,//composite
	//	0.5,//xOffsetA
	//	0,//yOffsetA
	//	-0.5,//xOffsetB
	//	0,//yOffsetB
	//	{ stiffness: 0.8, length: 25 }//options
	//);

	//Composite.add(ropeA, Constraint.create({
	//	bodyB: ropeA.bodies[0],
	//	pointA: { x: 110, y: 110 },
	//	pointB: { x: -25, y: 0 },
	//	stiffness: 0.5
	//}));

	World.add(world, ropeA);
}

function redraw() {

	var allBodies = Composite.allBodies(world);

	// clear the canvas with a transparent fill, to allow the canvas background to show
	context.globalCompositeOperation = 'source-in';
	context.fillStyle = "transparent";
	context.fillRect(0, 0, canvasEl.width, canvasEl.height);
	context.globalCompositeOperation = 'source-over';

	drawBodies(allBodies, context);

	requestAnimationFrame(redraw);
}

function drawBodies(bodies, context) {
	var c = context,
		showInternalEdges = false,
		body,
		part,
		i,
		k;

	for (i = 0; i < bodies.length; i++) {
		body = bodies[i];

		if (!body.render.visible)
			continue;

		// handle compound parts
		for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
			part = body.parts[k];

			if (!part.render.visible)
				continue;

			if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {
				// part sprite
				var sprite = part.render.sprite,
					texture = _getTexture(render, sprite.texture);

				c.translate(part.position.x, part.position.y);
				c.rotate(part.angle);

				c.drawImage(
					texture,
					texture.width * -sprite.xOffset * sprite.xScale,
					texture.height * -sprite.yOffset * sprite.yScale,
					texture.width * sprite.xScale,
					texture.height * sprite.yScale
				);

				// revert translation, hopefully faster than save / restore
				c.rotate(-part.angle);
				c.translate(-part.position.x, -part.position.y);
			} else {
				// part polygon
				if (part.circleRadius) {
					c.beginPath();
					c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
				} else {
					c.beginPath();
					c.moveTo(part.vertices[0].x, part.vertices[0].y);

					for (var j = 1; j < part.vertices.length; j++) {
						if (!part.vertices[j - 1].isInternal || showInternalEdges) {
							c.lineTo(part.vertices[j].x, part.vertices[j].y);
						} else {
							c.moveTo(part.vertices[j].x, part.vertices[j].y);
						}

						if (part.vertices[j].isInternal && !showInternalEdges) {
							c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
						}
					}

					c.lineTo(part.vertices[0].x, part.vertices[0].y);
					c.closePath();
				}

				c.fillStyle = FILL_COLOR;
				c.fill();
			}

			c.globalAlpha = 1;
		}
	}
}