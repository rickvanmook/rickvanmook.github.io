(function() {

	var World = Matter.World,
		Bodies = Matter.Bodies,
		Common = Matter.Common,
		Vertices = Matter.Vertices,
		Svg = Matter.Svg;


	var canvasEl = document.querySelector('.canvas');
		var engine = Matter.Engine,
			world = engine.world;

	// create a renderer
	var render = Matter.Render.create({
		canvas: canvasEl,
		element: canvasEl.parentElement,
		engine: engine,
		options: {
			showAngleIndicator: true,
			wireframes: true,
			width: canvasEl.width,
			height: canvasEl.height
		}
	});

		var svgs = [
			'iconmonstr-check-mark-8-icon',
			'iconmonstr-paperclip-2-icon',
			'iconmonstr-puzzle-icon',
			'iconmonstr-user-icon'
		];

		for (var i = 0; i < svgs.length; i += 1) {
			(function(i) {
				$.get('/images/svg/' + svgs[i] + '.svg').done(function(data) {
					var vertexSets = [],
						color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']);

					$(data).find('path').each(function(i, path) {
						var points = Svg.pathToVertices(path, 30);
						vertexSets.push(Vertices.scale(points, 0.4, 0.4));
					});

					World.add(world, Bodies.fromVertices(100 + i * 150, 200 + i * 50, vertexSets, {
						render: {
							fillStyle: color,
							strokeStyle: color
						}
					}, true));
				});
			})(i);
		}

		$.get('/images/svg/svg.svg').done(function(data) {
			var vertexSets = [],
				color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']);

			$(data).find('path').each(function(i, path) {
				vertexSets.push(Svg.pathToVertices(path, 30));
			});

			World.add(world, Bodies.fromVertices(400, 80, vertexSets, {
				render: {
					fillStyle: color,
					strokeStyle: color
				}
			}, true));
		});

		var renderOptions = render.options;
		renderOptions.showAngleIndicator = false;

})();