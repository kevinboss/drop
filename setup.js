const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const fuelLevelDisplay = document.getElementById('fuelLevel');
const fuelBar = document.getElementById('fuelBar');
const scoreDisplay = document.getElementById('scoreDisplay');

function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => resizeCanvas(canvas));
resizeCanvas(canvas);

const camera = { y: 0 };
let gameOver = false;
let tutorialStep = 0;
let score = 0;
