function updateCamera(camera, spaceship, canvas) {
    camera.y = Math.max(0, spaceship.y - canvas.height / 2);
}

function updateHUD(fuelLevelDisplay, fuelBar, scoreDisplay, spaceship, score) {
    fuelLevelDisplay.textContent = Math.round(spaceship.fuel);
    fuelBar.style.width = `${spaceship.fuel}%`;
    scoreDisplay.textContent = score;
}
