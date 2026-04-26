// Initialize KAPLAY
const k = kaplay({
    width: 400,
    height: 400,
    canvas: document.querySelector("canvas"),
    pixelDensity: 1,
});

// Set dark blue background
k.setBackground(0, 0, 200);

// Game configuration
const GRID_SIZE = 20;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;

// Game state
let gameState = {
    snake: [],
    nextDirection: "right",
    currentDirection: "right",
    apple: null,
    score: 0,
    gameOver: false,
    gameStarted: false,
    nextMoveTime: 0,
    moveInterval: 100, // milliseconds between moves
    snakeSprites: [],
    appleSprite: null,
};

// Direction vectors
const directionVectors = {
    right: { x: 1, y: 0 },
    left: { x: -1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
};

// Opposite directions (can't reverse directly)
const opposites = {
    right: "left",
    left: "right",
    up: "down",
    down: "up",
};

/**
 * Convert grid coordinates to pixel coordinates
 */
function gridToPixel(gridX, gridY) {
    return {
        x: gridX * GRID_SIZE + GRID_SIZE / 2,
        y: gridY * GRID_SIZE + GRID_SIZE / 2,
    };
}

/**
 * Initialize a new game
 */
function initGame() {
    // Clean up old sprites
    gameState.snakeSprites.forEach(sprite => sprite.destroy());
    gameState.snakeSprites = [];
    if (gameState.appleSprite) {
        gameState.appleSprite.destroy();
        gameState.appleSprite = null;
    }

    gameState.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
    ];
    gameState.nextDirection = "right";
    gameState.currentDirection = "right";
    gameState.score = 0;
    gameState.gameOver = false;
    gameState.gameStarted = false;
    gameState.nextMoveTime = k.time() + gameState.moveInterval / 1000;
    spawnApple();
    renderSnake();
    updateUI();
}

/**
 * Get rotation angle based on direction
 */
function getRotationForDirection(direction) {
    const rotations = {
        right: 0,
        down: 90,
        left: 180,
        up: 270,
    };
    return rotations[direction] || 0;
}

/**
 * Render the snake on screen
 */
function renderSnake() {
    // Clear old snake sprites
    gameState.snakeSprites.forEach(sprite => sprite.destroy());
    gameState.snakeSprites = [];

    // Create new sprites for each segment
    gameState.snake.forEach((segment, index) => {
        const x = segment.x * GRID_SIZE + GRID_SIZE / 2;
        const y = segment.y * GRID_SIZE + GRID_SIZE / 2;
        const isHead = index === 0;

        let sprite;
        if (isHead) {
            // Head is a trapezoid pointing in the direction of movement (snout)
            const trapezoidPoints = [
                k.vec2(-8, -8),   // back-top
                k.vec2(-8, 8),    // back-bottom
                k.vec2(10, 4),    // front-bottom
                k.vec2(10, -4),   // front-top
            ];
            const rotation = getRotationForDirection(gameState.currentDirection);
            sprite = k.add([
                k.polygon(trapezoidPoints),
                k.pos(x, y),
                k.color(0, 255, 0),
                k.rotate(rotation),
                { id: `snake-${index}` },
            ]);
        } else {
            // Body segments are circles (radius 10 so they touch)
            sprite = k.add([
                k.circle(10),
                k.pos(x, y),
                k.color(0, 153, 0),
                { id: `snake-${index}` },
            ]);
        }

        gameState.snakeSprites.push(sprite);
    });
}

/**
 * Render the apple on screen
 */
function renderApple() {
    if (gameState.appleSprite) {
        gameState.appleSprite.destroy();
    }

    const x = gameState.apple.x * GRID_SIZE;
    const y = gameState.apple.y * GRID_SIZE;
    gameState.appleSprite = k.add([
        k.circle((GRID_SIZE - 6) / 2),
        k.pos(x + GRID_SIZE / 2, y + GRID_SIZE / 2),
        k.color(255, 0, 0),
        { id: "apple" },
    ]);
}

/**
 * Spawn apple at random location not occupied by snake
 */
function spawnApple() {
    const snakeSet = new Set(gameState.snake.map((s) => `${s.x},${s.y}`));
    let apple;
    do {
        apple = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT),
        };
    } while (snakeSet.has(`${apple.x},${apple.y}`));
    gameState.apple = apple;
    renderApple();
}

/**
 * Move the snake
 */
function moveSnake() {
    const head = gameState.snake[0];
    const direction = gameState.nextDirection;
    const vector = directionVectors[direction];

    // Calculate new head position
    const newHead = {
        x: head.x + vector.x,
        y: head.y + vector.y,
    };

    // Check wall collision
    if (
        newHead.x < 0 ||
        newHead.x >= GRID_WIDTH ||
        newHead.y < 0 ||
        newHead.y >= GRID_HEIGHT
    ) {
        endGame();
        return;
    }

    // Check self collision
    if (gameState.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
        endGame();
        return;
    }

    // Add new head
    gameState.snake.unshift(newHead);
    gameState.currentDirection = direction;

    // Check if apple eaten
    if (
        gameState.apple.x === newHead.x &&
        gameState.apple.y === newHead.y
    ) {
        gameState.score += 10;
        spawnApple();
        updateUI();
    } else {
        // Remove tail if no apple eaten
        gameState.snake.pop();
    }

    // Re-render the snake
    renderSnake();
}

/**
 * End the game
 */
function endGame() {
    gameState.gameOver = true;
    gameState.gameStarted = false;
    updateUI();
}

/**
 * Update UI display
 */
function updateUI() {
    document.getElementById("score").textContent = `Score: ${gameState.score}`;
    if (gameState.gameOver) {
        document.getElementById("status").textContent =
            "Game Over! Press SPACE to play again";
    } else if (!gameState.gameStarted) {
        document.getElementById("status").textContent =
            "Press SPACE to start";
    } else {
        document.getElementById("status").textContent = "Playing...";
    }
}

// Input handling

// Touch tracking for swipe gestures
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const minSwipeDistance = 30;
    
    // Determine swipe direction
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
        // Horizontal swipe
        const newDirection = diffX > 0 ? "right" : "left";
        if (newDirection !== opposites[gameState.currentDirection]) {
            gameState.nextDirection = newDirection;
        }
    } else if (Math.abs(diffY) > minSwipeDistance) {
        // Vertical swipe
        const newDirection = diffY > 0 ? "down" : "up";
        if (newDirection !== opposites[gameState.currentDirection]) {
            gameState.nextDirection = newDirection;
        }
    }
});

k.onKeyDown((key) => {
    if (key === "space") {
        if (!gameState.gameStarted) {
            if (gameState.gameOver) {
                initGame();
            }
            gameState.gameStarted = true;
            updateUI();
        }
    } else if (key === "r") {
        initGame();
    }

    // Direction input (arrow keys)
    const directionMap = {
        up: "up",
        down: "down",
        left: "left",
        right: "right",
    };

    if (key in directionMap) {
        const newDirection = directionMap[key];
        // Prevent reversing direction
        if (newDirection !== opposites[gameState.currentDirection]) {
            gameState.nextDirection = newDirection;
        }
    }
});

// Canvas click handler for mobile start/restart
document.querySelector("canvas").addEventListener("click", () => {
    if (!gameState.gameStarted) {
        if (gameState.gameOver) {
            initGame();
        }
        gameState.gameStarted = true;
        updateUI();
    }
});

// Game loop
k.onUpdate(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
        if (k.time() >= gameState.nextMoveTime) {
            moveSnake();
            gameState.nextMoveTime = k.time() + gameState.moveInterval / 1000;
        }
    }
});

// Initialize on start
initGame();
updateUI();
