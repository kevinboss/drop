const spaceship = {
    x: canvas.width / 2,
    y: PLANET_SURFACE_HEIGHT - 100, // Start just above the planet surface
    width: 40,
    height: 20,
    speed: 3,
    fuel: 100,
    verticalSpeed: 0
};

function updateSpaceship(keys, score, cave, camera, gameOver) {
    if (keys.ArrowLeft && spaceship.fuel > 0) {
        spaceship.x -= spaceship.speed;
        spaceship.fuel -= 0.1;
    }
    if (keys.ArrowRight && spaceship.fuel > 0) {
        spaceship.x += spaceship.speed;
        spaceship.fuel -= 0.1;
    }
    if (keys.ArrowUp && spaceship.fuel > 0) {
        spaceship.verticalSpeed = Math.max(spaceship.verticalSpeed - 0.2, 0.5);
        spaceship.fuel -= 0.2;
    } else {
        spaceship.verticalSpeed = Math.min(spaceship.verticalSpeed + ACCELERATION, EARTH_TERMINAL_VELOCITY);
    }

    spaceship.y += spaceship.verticalSpeed * PIXEL_PER_METER / 60;

    score = Math.floor((spaceship.y - PLANET_SURFACE_HEIGHT) / 10);

    if (spaceship.verticalSpeed > EARTH_TERMINAL_VELOCITY * 0.75) {
        const regenerationRate = 0.05;
        spaceship.fuel = Math.min(100, spaceship.fuel + regenerationRate);
    }

    if (spaceship.y >= PLANET_SURFACE_HEIGHT) {
        const currentSegment = cave.segments.find(seg => seg.y <= spaceship.y && seg.y + cave.segmentHeight > spaceship.y);
        if (currentSegment) {
            if (spaceship.x < currentSegment.leftWall || spaceship.x + spaceship.width > currentSegment.rightWall) {
                gameOver = true;
            }

            currentSegment.details.forEach(detail => {
                const dx = (spaceship.x + spaceship.width / 2) - detail.x;
                const dy = (spaceship.y + spaceship.height / 2) - detail.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < (spaceship.width / 2 + detail.radius)) {
                    gameOver = true;
                }
            });
        }
    }

    spaceship.x = Math.max(cave.leftWall, Math.min(spaceship.x, cave.rightWall - spaceship.width));
    spaceship.fuel = Math.max(0, spaceship.fuel);

    if (spaceship.y < PLANET_SURFACE_HEIGHT / 3 && tutorialStep === 0) {
        tutorialStep = 1;
    } else if (spaceship.y < PLANET_SURFACE_HEIGHT * 2 / 3 && tutorialStep === 1) {
        tutorialStep = 2;
    } else if (spaceship.y >= PLANET_SURFACE_HEIGHT && tutorialStep === 2) {
        tutorialStep = 3;
    }
}
