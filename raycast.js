const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * Math.PI / 180;

const WALL_STRIP_WIDTH = 1;
const NUM_OF_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.2;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }


	hasWallAt(x, y) {
		// IF out of bounds return true. 
		if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT)
			return (true);
		var mapGridIndexX = Math.floor(x / TILE_SIZE);
		var mapGridIndexY = Math.floor(y / TILE_SIZE);
		// IF wall collision, return true
		if (this.grid[mapGridIndexY][mapGridIndexX] != 0)
			return (true);
		return (false);
	}

    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * TILE_SIZE; 
                var tileY = i * TILE_SIZE;
                var tileColor = (this.grid[i][j] == 1 ? "#222" : "#fff");
                stroke("#222");
                fill(tileColor);
                rect(
					MINIMAP_SCALE_FACTOR * tileX,
					MINIMAP_SCALE_FACTOR * tileY,
					MINIMAP_SCALE_FACTOR * TILE_SIZE,
					MINIMAP_SCALE_FACTOR * TILE_SIZE
					);
            }
        }
    }
}

class Player {
	constructor() {
		this.x = WINDOW_WIDTH / 2;
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 3;
		this.turnDirection = 0; // -1 if left, +1 if right
		this.walkDirection = 0; // -1 if out of screen, +1 if into screen.
		this.rotationAngle = Math.PI / 2;
		this.moveSpeed = 2.0; // 2 pixels per frame.
		this.rotationSpeed = 2 * Math .PI / 180; // 2 deg per frame converted to rads. 
	}

	update() {
		this.rotationAngle += this.turnDirection * this.rotationSpeed;
		var moveStep = this.walkDirection * this.moveSpeed;

		var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
		var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

		// Set new poistion if not colliding with map wall. 
		if (grid.hasWallAt(newPlayerX, newPlayerY) == 0) {
			this.x = newPlayerX;
			this.y = newPlayerY;
		}
	}

	render() {
		noStroke();
		fill("red");
		circle(
			MINIMAP_SCALE_FACTOR * this.x,
			MINIMAP_SCALE_FACTOR * this.y,
			MINIMAP_SCALE_FACTOR * this.radius
			);
		// stroke("red");
		// line(
		// 	this.x,
		// 	this.y,
		// 	this.x + Math.cos(this.rotationAngle) * 30,
		// 	this.y + Math.sin(this.rotationAngle) * 30
		// 	);
	}
}

class Ray {
	constructor(rayAngle) {
		this.rayAngle = normalizeAngle(rayAngle);
		this.wallHitX = 0;
		this.wallHitY = 0;
		this.distance = 0;
		this.wasHitVertical = false;

		this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
		this.isRayFacingUp = !this.isRayFacingDown;
		this.isRayFacingRight = this.rayAngle < Math.PI * 0.5 || this.rayAngle > 1.5 * Math.PI;
		this.isRayFacingLeft = !this.isRayFacingRight;

	}

	cast() {
		var xstep;
		var ystep;
		var xintercept;
		var yintercept;

		//////////////////////////////////////////////
		// Horizintal ray grid intersection code.
		//////////////////////////////////////////////
		var foundHorizWallHit = false;
		var horzWallHitX = 0;
		var horzWallHitY = 0;

		// Find the y-coordinate of the closet horizontal grid intersection.  
		yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
		yintercept += (this.isRayFacingDown ? TILE_SIZE : 0);

		// Find the x coordinate of the closest horizontal grid intersection
		xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

		// Calculate the increment for xstep and ystep.
		ystep = TILE_SIZE;
		ystep *= (this.isRayFacingUp ? -1 : 1);
		xstep = TILE_SIZE / Math.tan(this.rayAngle);
		xstep *= ((this.isRayFacingLeft && xstep > 0) ? -1 : 1);
		xstep *= ((this.isRayFacingRight && xstep < 0) ? -1 : 1);
		// Ask is that a wall for each ystep and xstep, if yes, get the distance, but there
		// is a catch....
		var nextHorzTouchX = xintercept;
		var nextHorzTouchY = yintercept;

		// This is in the if statement in the while loop. 
		// if (this.isRayFacingUp)
		// 	nextHorzTouchY--;

		//Inc xstep and ystep until wall is found
		while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0
			&& nextHorzTouchY <= WINDOW_HEIGHT) {
			if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))) {
				foundHorizWallHit = true;
				horzWallHitX = nextHorzTouchX;
				horzWallHitY = nextHorzTouchY;
				break ;
			} else {
				nextHorzTouchX += xstep;
				nextHorzTouchY += ystep;
			}
		}
		//////////////////////////////////////////////
		// Vertical ray grid intersection code.
		//////////////////////////////////////////////
		var foundVertWallHit = false;
		var vertWallHitX = 0;
		var vertWallHitY = 0;

		// Find the x-coordinate of the closet vertical grid intersection.  
		xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
		xintercept += (this.isRayFacingRight ? TILE_SIZE : 0);

		// Find the y coordinate of the closest vertical grid intersection
		yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

		// Calculate the increment for xstep and ystep.
		xstep = TILE_SIZE;
		xstep *= (this.isRayFacingLeft ? -1 : 1);
		ystep = TILE_SIZE * Math.tan(this.rayAngle);
		ystep *= ((this.isRayFacingUp && ystep > 0) ? -1 : 1);
		ystep *= ((this.isRayFacingDown && ystep < 0) ? -1 : 1);
		// Ask is that a wall for each ystep and xstep, if yes, 
		// get the distance, but there is a catch....
		var nextVertTouchX = xintercept;
		var nextVertTouchY = yintercept;

		// This is in the if statement in the while loop. 
		// if (this.isRayFacingLeft)
		// 	nextVertTouchX--;
		
		//Inc xstep and ystep until wall is found
		while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH &&
			nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
			if (grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)) {
				foundVertWallHit = true;
				vertWallHitX = nextVertTouchX;
				vertWallHitY = nextVertTouchY;
				break ;
			} else {
				nextVertTouchX += xstep;
				nextVertTouchY += ystep;
			}
		}




		// Calculate both horizontal and vertical distances and choose the smaller.
		var horzHitDistance = ((foundHorizWallHit)
			? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
			: Number.MAX_VALUE);

		var vertHitDistance = ((foundVertWallHit)
			? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
			: Number.MAX_VALUE);

			// Only store the smallest of the distances and x and y. 
		if (vertHitDistance < horzHitDistance) {
			this.wallHitX = vertWallHitX;
			this.wallHitY = vertWallHitY;
			this.distance = vertHitDistance;
			this.wasHitVertical = true;
		} else {
			this.wallHitX = horzWallHitX;
			this.wallHitY = horzWallHitY;
			this.distance = horzHitDistance;
			this.wasHitVertical = false;
		}
	}

	render(){
		stroke("rgba(255, 0, 0, 0.3)");
		line(
			MINIMAP_SCALE_FACTOR * player.x,
			MINIMAP_SCALE_FACTOR * player.y,
			MINIMAP_SCALE_FACTOR * this.wallHitX,
			MINIMAP_SCALE_FACTOR * this.wallHitY
		);
	}
}

var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed() {
	if (keyCode == UP_ARROW)
		player.walkDirection = +1;
	else if (keyCode == DOWN_ARROW)
		player.walkDirection = -1;
	else if (keyCode == RIGHT_ARROW)
		player.turnDirection = +1;
	else if (keyCode == LEFT_ARROW)
		player.turnDirection = -1;
}

function keyReleased() {
	if (keyCode == UP_ARROW)
		player.walkDirection = 0;
	else if (keyCode == DOWN_ARROW)
		player.walkDirection = 0;
	else if (keyCode == RIGHT_ARROW)
		player.turnDirection = 0;
	else if (keyCode == LEFT_ARROW)
		player.turnDirection = 0;
}

function castAllRays() {

	// start first ray subtracti half of the FOV
	var rayAngle = player.rotationAngle - FOV_ANGLE / 2;

	rays = [];

	// loop of colums cating the rays
	for (var col = 0; col < NUM_OF_RAYS; col++) {
		var ray = new Ray(rayAngle);
		ray.cast();
		rays.push(ray);
		rayAngle += FOV_ANGLE / NUM_OF_RAYS;
	}
}

function renderCeiling() {
	noStroke();
	fill('#414141');
	rect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT/2);
}

function renderFloor() {
	noStroke();
	fill('#818181');
	rect(0, WINDOW_HEIGHT/2, WINDOW_WIDTH, WINDOW_HEIGHT);
}

function render3DProjectedWalls() {
	renderCeiling();
	renderFloor();
	// for every ray in the array or rays.
	for (var i = 0; i < NUM_OF_RAYS; i++) {
		var ray = rays[i];

		// Ray distance. 
		var correctWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

		// Distance to the projection plane. 
		var distanceProjectionPlane = ((WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2));

		// Projected wall height.
		var wallStripHeight = (TILE_SIZE / correctWallDistance * distanceProjectionPlane);


		// Compute the transparancy based on the the wall distance. 
		var alpha =  1; //200 / correctWallDistance;
		
		var colourR = 255;
		var colourG = 255;
		var colourB = 255;

		if (ray.isRayFacingDown && !ray.wasHitVertical)
			colourR = 0;
		if (ray.isRayFacingUp && !ray.wasHitVertical)
			colourG = 0;
		if (ray.isRayFacingLeft && ray.wasHitVertical)
			colourB = 0;
		if (ray.isRayFacingRight && ray.wasHitVertical) {
			colourR = 0;
			colourG = 0;
		}

		// var colour = ray.wasHitVertical ? 255 : 180;

		// Render a rectangle wit the caluclated wall height. 
		fill("rgba(" +
		colourR + "," +
		colourG + "," +
		colourB + "," +
		alpha + ")"
		);

			
		
		noStroke();
		rect(
			i * WALL_STRIP_WIDTH,
			WINDOW_HEIGHT / 2 - wallStripHeight / 2,
			WALL_STRIP_WIDTH,
			wallStripHeight
		);
	}
}

function normalizeAngle(angle) {
	angle = angle % (2 * Math.PI);
	if (angle < 0) {
		angle += (2 * Math.PI);
	}
	return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2) {
	return (Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
	player.update();
	castAllRays();
}

function draw() {
	clear("#212121");
	update();
	
	render3DProjectedWalls();

    grid.render();
	for (ray of rays) {
		ray.render();
	}
    player.render();
}
