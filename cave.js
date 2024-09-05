const cave = {
    leftWall: (canvas.width - CAVE_ENTRANCE_WIDTH) / 2,
    rightWall: (canvas.width + CAVE_ENTRANCE_WIDTH) / 2,
    segments: [],
    segmentHeight: canvas.height / 6 // Reduced for more frequent variations
};

function initializeCave() {
    cave.segments = [];
    for (let i = 0; i < SEGMENTS_TO_RENDER; i++) {
        cave.segments.push(generateCaveSegment(PLANET_SURFACE_HEIGHT + i * cave.segmentHeight));
    }
}

function isValidObstaclePosition(x, y, radius, segment, pathWidth) {
    const minDistanceFromWall = MIN_OBSTACLE_DISTANCE;
    if (x - radius < segment.leftWall + minDistanceFromWall || x + radius > segment.rightWall - minDistanceFromWall) {
        return false;
    }
    
    // Ensure there is always a path through the cave
    const pathLeft = (segment.leftWall + segment.rightWall) / 2 - pathWidth / 2;
    const pathRight = (segment.leftWall + segment.rightWall) / 2 + pathWidth / 2;

    if (x >= pathLeft && x <= pathRight) {
        return false;
    }

    for (let obstacle of segment.details) {
        const dx = x - obstacle.x;
        const dy = y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < radius + obstacle.radius + MIN_OBSTACLE_DISTANCE) {
            return false;
        }
    }
    return true;
}

function generateCaveSegment(startY) {
    const segment = {
        y: startY,
        leftWall: cave.leftWall + (Math.random() - 0.5) * WALL_VARIATION * 1.5, // Increased wall variation for more curvature
        rightWall: cave.rightWall + (Math.random() - 0.5) * WALL_VARIATION * 1.5,
        details: []
    };

    const pathWidth = 50; // Width of the maneuvering path

    for (let i = 0; i < MAX_OBSTACLES_PER_SEGMENT; i++) {
        let attempts = 0;
        while (attempts < 50) {
            const x = Math.random() * (segment.rightWall - segment.leftWall) + segment.leftWall;
            const y = segment.y + Math.random() * cave.segmentHeight;
            const radius = Math.random() * 10 + 5; // Smaller obstacles

            if (isValidObstaclePosition(x, y, radius, segment, pathWidth)) {
                segment.details.push({ x, y, radius });
                // Add more ruggedness by clustering smaller obstacles around the main obstacle.
                const extraObstacles = Math.floor(Math.random() * 3); // Add up to 3 smaller obstacles nearby
                for (let j = 0; j < extraObstacles; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 10 + 5;
                    const extraX = x + Math.cos(angle) * distance;
                    const extraY = y + Math.sin(angle) * distance;
                    const extraRadius = Math.random() * 5 + 2.5;
                    if (isValidObstaclePosition(extraX, extraY, extraRadius, segment, pathWidth)) {
                        segment.details.push({ x: extraX, y: extraY, radius: extraRadius });
                    }
                }
                break;
            }
            attempts++;
        }
    }

    return segment;
}

function updateCave(spaceship, camera) {
    while (spaceship.y + canvas.height > cave.segments[cave.segments.length - 1].y) {
        cave.segments.push(generateCaveSegment(cave.segments[cave.segments.length - 1].y + cave.segmentHeight));
    }
    while (cave.segments.length > SEGMENTS_TO_RENDER && cave.segments[0].y + cave.segmentHeight < camera.y) {
        cave.segments.shift();
    }
}
