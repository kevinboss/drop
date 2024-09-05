let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && gameOver) {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});
