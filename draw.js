function drawSpaceship(ctx, spaceship, keys, camera, time) {
    ctx.save();
    ctx.translate(spaceship.x + spaceship.width / 2, spaceship.y - camera.y + spaceship.height / 2);

    ctx.strokeStyle = 'white'; 
    ctx.fillStyle = 'black';
    ctx.lineWidth = 2;

    // Draw spaceship body
    ctx.beginPath();
    ctx.ellipse(0, 0, spaceship.width / 2, spaceship.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw windows
    ctx.fillStyle = 'white';
    for (let i = -1; i <= 1; i++) { 
        ctx.beginPath();
        ctx.arc(i * 10, 0, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw antenna
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -spaceship.height / 2);
    ctx.lineTo(0, -spaceship.height / 2 - 10);
    ctx.stroke();

    // Draw engine flames
    if (keys.ArrowUp && spaceship.fuel > 0) {
        drawFlame(ctx, {x: 0, y: spaceship.height / 2}, 30, 15, time, spaceship.verticalSpeed);
    }
    if (keys.ArrowLeft && spaceship.fuel > 0) {
        drawFlame(ctx, {x: 10, y: spaceship.height / 2}, 20, 10, time, spaceship.speed);
    }
    if (keys.ArrowRight && spaceship.fuel > 0) {
        drawFlame(ctx, {x: -10, y: spaceship.height / 2}, 20, 10, time, spaceship.speed);
    }

    ctx.restore();
}

function drawFlame(ctx, position, length, width, time, speed) {
    const baseGradient = ctx.createLinearGradient(position.x, position.y, position.x, position.y + length);
    baseGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    baseGradient.addColorStop(0.3, 'rgba(255, 200, 0, 1)');
    baseGradient.addColorStop(0.6, 'rgba(255, 100, 0, 1)');
    baseGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    // Add glow effect
    drawGlow(ctx, position, length, width, 'rgba(255, 200, 0, 0.5)', speed);

    // Draw flame trail
    drawFlameTrail(ctx, position, length, width, time, speed);

    // Draw main flame
    for (let i = 0; i < 15; i++) {
        const offset = Math.sin(time * 0.1 + i) * width / 4;
        const flameLength = length + Math.sin(time * 0.2 + i * 0.5) * 10;
        const rotation = (Math.sin(time * 0.05 + i * 0.1) * Math.PI) / 16; // Slight rotation

        ctx.save();
        ctx.translate(position.x + offset, position.y + flameLength / 2);
        ctx.rotate(rotation);

        ctx.beginPath();
        ctx.moveTo(0, flameLength / 2);
        ctx.lineTo(-width / 2, -flameLength / 2);
        ctx.lineTo(width / 2, -flameLength / 2);
        ctx.closePath();

        const particleGradient = ctx.createLinearGradient(0, -flameLength / 2, 0, flameLength / 2);
        particleGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        particleGradient.addColorStop(0.5, `rgba(255, ${200 - speed * 10}, 0, 1)`);
        particleGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = particleGradient;
        ctx.globalAlpha = 0.7 + Math.sin(time * 0.3 + i * 0.2) * 0.3;
        ctx.fill();

        ctx.restore();
    }
    ctx.globalAlpha = 1;
}

function drawGlow(ctx, position, length, width, color, speed) {
    const radius = Math.max(length, width) * 0.75;
    const gradient = ctx.createRadialGradient(
        position.x, position.y + length / 2, 0,
        position.x, position.y + length / 2, radius
    );
    gradient.addColorStop(0, `rgba(255, ${200 - speed * 10}, 0, 0.8)`);
    gradient.addColorStop(0.5, `rgba(255, ${100 - speed * 5}, 0, 0.4)`);
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(position.x, position.y + length / 2, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawFlameTrail(ctx, position, flameLength, width, time, speed) {
    const trailSegments = 5;
    const fadeStep = 1 / trailSegments;

    for (let i = 0; i < trailSegments; i++) {
        const trailPos = {
            x: position.x,
            y: position.y + i * (flameLength / trailSegments)
        };
        const trailWidth = width * (1 - i * 0.1);
        const trailLength = flameLength * (1 - i * 0.1);

        ctx.globalAlpha = 1 - i * fadeStep;
        
        const trailGradient = ctx.createLinearGradient(trailPos.x, trailPos.y, trailPos.x, trailPos.y + trailLength);
        trailGradient.addColorStop(0, `rgba(255, ${200 - speed * 10}, 0, ${0.7 - i * 0.1})`);
        trailGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.ellipse(trailPos.x, trailPos.y, trailWidth / 2, trailLength / 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

function drawPlanetSurface(ctx, cave, camera) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    const surfaceY = PLANET_SURFACE_HEIGHT - camera.y;
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    ctx.lineTo(cave.leftWall, surfaceY);
    ctx.moveTo(cave.rightWall, surfaceY);
    ctx.lineTo(canvas.width, surfaceY);
    ctx.stroke();

    // Pre-generate surface details positions
    if (!cave.surfaceDetails) {
        cave.surfaceDetails = {
            leftSegments: [],
            rightSegments: []
        };

        for (let i = 0; i < 20; i++) {
            cave.surfaceDetails.leftSegments.push({
                x: Math.random() * cave.leftWall,
                height: Math.random() * 20 + 5
            });
        }

        for (let i = 0; i < 20; i++) {
            cave.surfaceDetails.rightSegments.push({
                x: Math.random() * (canvas.width - cave.rightWall) + cave.rightWall,
                height: Math.random() * 20 + 5
            });
        }
    }

    // Draw surface details using pre-generated positions
    ctx.lineWidth = 1;
    cave.surfaceDetails.leftSegments.forEach(detail => {
        ctx.beginPath();
        ctx.moveTo(detail.x, surfaceY);
        ctx.lineTo(detail.x, surfaceY - detail.height);
        ctx.stroke();
    });

    cave.surfaceDetails.rightSegments.forEach(detail => {
        ctx.beginPath();
        ctx.moveTo(detail.x, surfaceY);
        ctx.lineTo(detail.x, surfaceY - detail.height);
        ctx.stroke();
    });
}

function drawCave(ctx, cave, camera) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    cave.segments.forEach((segment, index) => {
        if (index === 0) {
            ctx.moveTo(segment.leftWall, Math.max(segment.y - camera.y, PLANET_SURFACE_HEIGHT - camera.y));
        } else {
            ctx.lineTo(segment.leftWall, segment.y - camera.y);
        }
    });
    ctx.stroke();

    ctx.beginPath();
    cave.segments.forEach((segment, index) => {
        if (index === 0) {
            ctx.moveTo(segment.rightWall, Math.max(segment.y - camera.y, PLANET_SURFACE_HEIGHT - camera.y));
        } else {
            ctx.lineTo(segment.rightWall, segment.y - camera.y);
        }
    });
    ctx.stroke();
    
    cave.segments.forEach(segment => {
        segment.details.forEach(detail => {
            if (detail.y >= PLANET_SURFACE_HEIGHT) {
                ctx.beginPath();
                ctx.arc(detail.x, detail.y - camera.y, detail.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
    });
}

function drawTutorial(ctx, spaceship, tutorialStep) {
    if (spaceship.y < PLANET_SURFACE_HEIGHT) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;

        switch (tutorialStep) {
            case 0:
                ctx.fillText('Use Left and Right Arrow keys to move', canvas.width / 2, 50);
                break;
            case 1:
                ctx.fillText('Use Up Arrow key to slow your descent', canvas.width / 2, 50);
                break;
            case 2:
                ctx.fillText('Falling fast regenerates fuel', canvas.width / 2, 50);
                break;
        }

        ctx.shadowBlur = 0;
    }
}

function drawGameOver(ctx, score) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 50);
}
