function resetGame() {
    gameOver = false;
    tutorialStep = 0;
    score = 0;
    spaceship.x = canvas.width / 2;
    spaceship.y = PLANET_SURFACE_HEIGHT - 100;
    spaceship.fuel = 100;
    spaceship.verticalSpeed = 0;
    camera.y = 0;
    initializeCave();
}

function updateSpaceship(keys, spaceship, cave, camera) {
    try {
        if (keys.ArrowLeft && spaceship.fuel > 0) {
            spaceship.x -= spaceship.speed;
            spaceship.fuel -= 0.1;
        }
        if (keys.ArrowRight && spaceship.fuel > 0) {
            spaceship.x += spaceship.speed;
            spaceship.fuel -= 0.1;
        }
        if (keys.ArrowUp && spaceship.fuel > 0) {
            spaceship.verticalSpeed = Math.max(spaceship.verticalSpeed - 0.2, -5); // Limit upward speed
            spaceship.fuel -= 0.2;
        } else {
            spaceship.verticalSpeed = Math.min(spaceship.verticalSpeed + ACCELERATION, EARTH_TERMINAL_VELOCITY);
        }

        spaceship.y += spaceship.verticalSpeed * PIXEL_PER_METER / 60;

        score = Math.max(score, Math.floor((spaceship.y - PLANET_SURFACE_HEIGHT) / 10));
        scoreDisplay.textContent = score;

        if (spaceship.verticalSpeed > EARTH_TERMINAL_VELOCITY * 0.75) {
            const regenerationRate = 0.05;
            spaceship.fuel = Math.min(100, spaceship.fuel + regenerationRate);
        }

        if (spaceship.y >= PLANET_SURFACE_HEIGHT && tutorialStep === 0) {
            tutorialStep = 1;
        } else if (spaceship.y < PLANET_SURFACE_HEIGHT * 2 / 3 && tutorialStep === 1) {
            tutorialStep = 2;
        } else if (spaceship.y >= PLANET_SURFACE_HEIGHT && tutorialStep === 2) {
            tutorialStep = 3;
        }

        spaceship.x = Math.max(cave.leftWall, Math.min(spaceship.x, cave.rightWall - spaceship.width));
        spaceship.fuel = Math.max(0, spaceship.fuel);

        // Prevent spaceship from going above the canvas
        spaceship.y = Math.max(spaceship.y, 0);

    } catch (error) {
        console.error("Error in updateSpaceship:", error);
    }
}

function checkCollision() {
    try {
        const currentSegment = cave.segments.find(seg => seg.y <= spaceship.y && seg.y + cave.segmentHeight > spaceship.y);
        if (currentSegment) {
            const spaceshipCenterX = spaceship.x + spaceship.width / 2;
            const spaceshipCenterY = spaceship.y + spaceship.height / 2;
            const collisionRadius = Math.min(spaceship.width, spaceship.height) / 2;
            const buffer = 2; // Small buffer to account for visual discrepancies

            // Wall collision
            if (spaceshipCenterX - collisionRadius + buffer < currentSegment.leftWall || 
                spaceshipCenterX + collisionRadius - buffer > currentSegment.rightWall) {
                gameOver = true;
                return;
            }

            // Obstacle collision
            for (let detail of currentSegment.details) {
                const dx = spaceshipCenterX - detail.x;
                const dy = spaceshipCenterY - detail.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < (collisionRadius + detail.radius)) {
                    gameOver = true;
                    return;
                }
            }
        }
    } catch (error) {
        console.error("Error in checkCollision:", error);
    }
}

function gameLoop(timestamp) {
    try {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!gameOver) {
            updateSpaceship(keys, spaceship, cave, camera);
            updateCamera(camera, spaceship, canvas);
            updateCave(spaceship, camera);
            drawPlanetSurface(ctx, cave, camera);
            drawCave(ctx, cave, camera);
            drawSpaceship(ctx, spaceship, keys, camera, timestamp);
            updateHUD(fuelLevelDisplay, fuelBar, scoreDisplay, spaceship, score);
            drawTutorial(ctx, spaceship, tutorialStep);
            checkCollision();
        } else {
            drawPlanetSurface(ctx, cave, camera);
            drawCave(ctx, cave, camera);
            drawSpaceship(ctx, spaceship, keys, camera, timestamp);
            drawGameOver(ctx, score);
        }

        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error("Error in gameLoop:", error);
    }
}

initializeCave();
requestAnimationFrame(gameLoop);
