# Kaplayjs Framework Reference

This is a comprehensive reference for the Kaplayjs game library API. Use this alongside the [official Kaplayjs docs](https://kaplayjs.com/docs/api) for detailed information on each function and component.

**Related:** See [patterns.md](patterns.md) for proven patterns, gotchas, and best practices from actual development.

**Table of Contents**
- [Initialization](#initialization)
- [Game Objects](#game-objects)
- [Components](#components)
  - [Transform & Positioning](#transform--positioning)
  - [Rendering](#rendering)
  - [Physics & Collisions](#physics--collisions)
  - [Behaviors & Utilities](#behaviors--utilities)
- [Input & Events](#input--events)
- [Physics System](#physics-system)
- [Camera & Canvas](#camera--canvas)
- [Audio](#audio)
- [Math & Geometry](#math--geometry)
- [Drawing](#drawing)
- [Scenes & Layers](#scenes--layers)
- [Data & Debugging](#data--debugging)
- [Assets & Loading](#assets--loading)

---

## Initialization

### `kaplay(options?)`
Initializes a Kaplayjs game. Must be called before anything else.

**Common options:**
- `width`: Canvas width (default: 1280)
- `height`: Canvas height (default: 720)
- `background`: Background color (color name or hex, e.g., `"darkSalmon"` or `"#333"`)
- `debug`: Enable debug mode (default: false)
- `canvas`: DOM element to mount to
- `audioListener`: Boolean to enable audio (default: true)

**Example:**
```js
kaplay({
  width: 800,
  height: 600,
  background: "darkblue",
  debug: true,
});
```

### `quit()`
Stops the game and cleans up resources.

---

## Game Objects

### `add(components[])`
Creates and adds a game object to the scene.

**Returns:** `GameObj` - The created game object

**Parameters:**
- `components`: Array of components (position, sprite, body, etc.)

**Example:**
```js
const player = add([
  sprite("player"),
  pos(100, 100),
  area(),
  body(),
  health(100),
  "player", // tag
]);
```

### `make(components[])`
Creates a game object **without** adding it to the scene.

**Returns:** `GameObj`

### `readd(obj)`
Re-adds a previously destroyed object back to the scene.

### `destroy(obj)` or `obj.destroy()`
Removes an object from the scene and destroys it.

### `destroyAll(tag?)`
Destroys all objects with a specific tag (or all if no tag).

### `get(tag)`
Returns array of all objects with a specific tag.

**Example:**
```js
const enemies = get("enemy");
```

### `query(tags, not_tags?)`
Returns objects matching specific tags (with optional exclusions).

---

## Components

Components are the building blocks of game objects. You add them to objects using `add()`.

### Transform & Positioning

#### `pos(x, y)` / `pos([x, y])`
Sets the position of an object. Returns `PosComp`.

**Key methods/properties:**
- `obj.pos` - Get/set position as `Vec2`
- `obj.move(dx, dy)` - Move relative to current position
- `obj.moveTo(x, y, speed)` - Move towards a position
- `obj.moveBy(dx, dy)` - Alias for `move()`

**Example:**
```js
const player = add([
  pos(100, 200),
]);
player.moveTo(500, 300, 100); // Move to (500,300) at speed 100/frame
```

#### `anchor(origin)`
Sets the anchor point for rotation/scaling. Options: `"center"`, `"topleft"`, `"topright"`, etc.

#### `z(layer)`
Sets the draw order (higher = drawn on top).

#### `scale(sx, sy?)` / `scale([sx, sy])`
Scales the object. Single value scales uniformly.

**Example:**
```js
add([pos(100, 100), scale(2)]); // 2x scale
add([pos(100, 100), scale(2, 1)]); // 2x width, 1x height
```

#### `rotate(angle)`
Sets rotation angle in **degrees**.

**Example:**
```js
const obj = add([rotate(45)]);
obj.angle = 90; // Change rotation
```

#### `follow(target, offset?)`
Makes object follow another object. Returns `FollowComp`.

**Example:**
```js
const camera_follower = add([
  pos(0, 0),
  follow(player), // Follow player
]);
```

### Rendering

#### `sprite(name, options?)`
Renders a sprite. Must be loaded first with `loadSprite()`.

**Options:**
- `anim`: Animation name to play
- `frame`: Starting frame number
- `flipX`: Flip horizontally (boolean)
- `flipY`: Flip vertically (boolean)
- `width`: Override sprite width
- `height`: Override sprite height

**Example:**
```js
const player = add([
  sprite("player", { anim: "idle" }),
]);
```

#### `text(content, options?)`
Renders text.

**Options:**
- `size`: Font size (default: 16)
- `font`: Font name
- `align`: Text alignment (`"left"`, `"center"`, `"right"`)
- `width`: Wrap width
- `lineSpacing`: Space between lines

**Example:**
```js
add([
  text("Score: 100", { size: 24, font: "sans-serif" }),
  color(1, 1, 1),
]);
```

#### `color(r, g, b, a?)`
Sets the tint color. Values 0-1 (or use predefined colors like `RED`, `GREEN`, `BLUE`, etc.).

**Example:**
```js
add([sprite("bean"), color(0.5, 1, 0.2)]); // Greenish tint
add([sprite("bean"), color(RED)]); // Red tint
```

#### `opacity(value)`
Sets transparency (0 = invisible, 1 = opaque).

#### `rect(width, height, options?)`
Draws a rectangle shape.

**Example:**
```js
add([
  rect(100, 50, { radius: 5 }), // Rounded corners
  color(0, 1, 0),
]);
```

#### `circle(radius, options?)`
Draws a circle.

**Example:**
```js
add([
  circle(20),
  color(BLUE),
]);
```

#### `polygon(points)`
Draws a polygon from an array of points.

**Example:**
```js
add([
  polygon([
    [0, 0],
    [50, 0],
    [25, 50],
  ]),
  color(1, 0, 0),
]);
```

#### `outline(width, color?)`
Adds a border/outline to the object.

**Example:**
```js
add([
  rect(100, 100),
  color(YELLOW),
  outline(3, BLUE),
]);
```

#### `shader(name, uniform?)`
Applies a shader effect.

### Physics & Collisions

#### `body(options?)`
Adds physics (gravity, velocity, etc.). Returns `BodyComp`.

**Key properties:**
- `obj.vel` - Velocity as `Vec2`
- `obj.mass` - Object mass
- `obj.useGravity` - Whether affected by gravity (default: true)
- `obj.isStatic` - Immovable object (default: false)

**Methods:**
- `obj.applyForce(force)` - Apply force to object
- `obj.jump()` - Make object jump (if on ground)

**Example:**
```js
const player = add([
  pos(100, 100),
  body(),
  area(),
]);

player.vel = vec2(0, 0); // Set velocity
```

#### `area(options?)`
Adds collision detection. Returns `AreaComp`.

**Key methods:**
- `obj.isColliding(tag)` - Check collision with tag
- `obj.overlaps(other)` - Check overlap with another object
- `obj.resolve()` - Resolve physics collision

**Example:**
```js
const player = add([
  sprite("player"),
  area(),
]);
```

#### `onCollide(tag, callback)`
Triggers when object collides with objects of a tag.

**Callback signature:** `(obj, collision) => {}`

**Example:**
```js
player.onCollide("spike", (spike) => {
  player.hurt(10);
  shake(5);
});
```

#### `onCollideUpdate(tag, callback)`
Triggers every frame while colliding.

#### `onCollideEnd(tag, callback)`
Triggers when collision ends.

#### `onHover(callback)` / `onHoverUpdate(callback)` / `onHoverEnd(callback)`
Triggers on mouse hover interactions.

#### `health(hp)`
Adds health system. Returns `HealthComp`.

**Methods:**
- `obj.hurt(damage)` - Take damage
- `obj.heal(amount)` - Restore health
- `obj.die()` - Set health to 0

**Example:**
```js
player.onHurt(() => {
  shake(10);
});
```

#### `move(options?)`
Simple movement component. Returns `MoveComp`.

**Example:**
```js
const obj = add([
  pos(100, 100),
  move(LEFT, 200), // Move left at 200 px/frame
]);
```

#### `doubleJump()`
Enables double jump (when used with `body()`).

**Methods:**
- `obj.doubleJump()` - Perform double jump

### Behaviors & Utilities

#### `animate(property, frames, options?)`
Animates an object property over time.

**Options:**
- `duration`: Animation duration in frames
- `easing`: Easing function (e.g., `easings.easeOutQuad`)
- `loop`: Loop animation (boolean)

**Example:**
```js
obj.animate("opacity", [1, 0.5, 1], { duration: 60 });
```

#### `lifespan(time)`
Automatically destroys the object after `time` frames.

#### `timer()`
Provides timing utilities. Returns `TimerComp`.

**Methods:**
- `obj.wait(time, callback)` - Wait then callback
- `obj.loop(time, callback)` - Loop callback at interval

**Example:**
```js
player.loop(30, () => {
  console.log("Every 30 frames");
});
```

#### `state(initial, states)`
Adds state machine functionality. Returns `StateComp`.

**Parameters:**
- `initial`: Initial state name (string)
- `states`: Object mapping state names to state logic

**State object structure:**
```js
{
  enter() { }, // Called when entering state
  update() { }, // Called every frame in state
  exit() { }, // Called when leaving state
}
```

**Example:**
```js
const player = add([
  state("idle", {
    "idle": {
      enter() { this.play("idle"); },
      update() {
        if (isKeyPressed("right")) this.changeState("run");
      },
    },
    "run": {
      enter() { this.play("run"); },
      update() {
        if (!isKeyPressed("right")) this.changeState("idle");
      },
    },
  }),
]);

player.changeState("run"); // Switch state
```

#### `named(name)`
Assigns a name to the object for easy access.

**Example:**
```js
const player = add([named("player"), sprite("player")]);
// Later: get("player")[0]
```

#### `stay()`
Keeps object in scene when switching scenes.

#### `fixed()`
Keeps object in fixed screen position (UI layer).

#### `fadeIn(duration?)`
Fades in the object.

#### `particles(options?)`
Particle emitter component. Returns `ParticlesComp`.

#### `tile(id)`
Marks object as tile for level systems.

#### `agent()`
Pathfinding agent (used with `pathfinder()`).

#### `patrol(points, options?)`
Makes object patrol between waypoints.

**Example:**
```js
add([
  sprite("guard"),
  pos(0, 100),
  patrol(
    [vec2(0, 100), vec2(200, 100), vec2(100, 50)],
    { speed: 100, loop: true }
  ),
]);
```

---

## Input & Events

### Keyboard Input

#### `onKeyDown(key, callback)`
Triggered when a key is pressed down and held.

**Common keys:** `"space"`, `"enter"`, `"up"`, `"down"`, `"left"`, `"right"`, `"a"`, `"d"`, etc.

**Example:**
```js
onKeyDown("space", () => {
  player.jump();
});
```

#### `onKeyPress(key, callback)`
Triggered once when key is first pressed (frame it becomes pressed).

#### `onKeyRelease(key, callback)`
Triggered when key is released.

#### `isKeyDown(key)` / `isKeyPressed(key)` / `isKeyReleased(key)`
Check key state.

**Example:**
```js
onUpdate(() => {
  if (isKeyDown("left")) player.move(-100, 0);
});
```

### Mouse Input

#### `onClick(callback)`
Triggered on mouse click.

#### `onMouseDown(callback)` / `onMousePress(callback)` / `onMouseRelease(callback)`
Mouse button state changes.

#### `onMouseMove(callback)`
Triggered every frame mouse moves.

#### `mousePos()`
Get current mouse position as `Vec2`.

#### `isMouseDown()` / `isMousePressed()` / `isMouseReleased()`
Check mouse state.

### Touch Input

#### `onTouchStart(callback)` / `onTouchMove(callback)` / `onTouchEnd(callback)`
Touch events.

#### `isTouchscreen()`
Check if device is touchscreen.

### Button Bindings

#### `setButton(button, binding)`
Bind game buttons to keys (for flexible input mapping).

**Example:**
```js
setButton("jump", {
  keyboard: ["space", "w"],
  gamepad: ["north"],
});

onButtonPress("jump", () => {
  player.jump();
});
```

#### `onButtonPress(button, callback)` / `onButtonDown(button, callback)` / `onButtonRelease(button, callback)`
Button state events.

### Gamepad Input

#### `onGamepadConnect(callback)` / `onGamepadDisconnect(callback)`
Gamepad connection events.

#### `onGamepadButtonPress(gamepadIdx, button, callback)`
Gamepad button press.

#### `onGamepadStick(gamepadIdx, stick, callback)`
Gamepad analog stick movement (stick: `"left"` or `"right"`).

---

## Physics System

### `setGravity(gravity)`
Sets gravity strength (default: 0).

**Example:**
```js
setGravity(1000); // Downward gravity
```

### `getGravity()`
Get current gravity value.

### `setGravityDirection(direction)`
Sets gravity direction (default: DOWN).

**Example:**
```js
setGravityDirection(vec2(0, 1)); // Downward
```

### Physics Components

#### `surfaceEffector(options?)`
One-way platform effect.

#### `platformEffector(options?)`
Platform physics (one-way collisions from above).

#### `buoyancyEffector(options?)`
Buoyancy/water physics.

#### `constantForce(force, mode?)`
Applies constant force to object.

---

## Camera & Canvas

### `setCamPos(x, y)` / `setCamPos([x, y])`
Set camera center position.

**Example:**
```js
setCamPos(player.pos);
```

### `getCamPos()`
Get camera position as `Vec2`.

### `setCamScale(scale)`
Set camera zoom level.

### `getCamScale()`
Get zoom level.

### `setCamRot(angle)`
Set camera rotation in degrees.

### `getCamRot()`
Get camera rotation.

### `shake(intensity, duration?)`
Screen shake effect.

**Example:**
```js
shake(10); // 10 pixel shake
shake(5, 0.1); // 5px for 0.1 seconds
```

### `flash(color, duration?)`
Screen flash effect.

**Example:**
```js
flash(RED, 0.2); // Red flash for 0.2s
```

### `toScreen(pos)`
Convert world coordinates to screen coordinates.

### `toWorld(pos)`
Convert screen coordinates to world coordinates.

### `width()` / `height()`
Get canvas width and height.

### `center()`
Get canvas center as `Vec2`.

---

## Audio

### Asset Loading

#### `loadSound(name, src)`
Load a sound effect.

**Example:**
```js
loadSound("jump", "sounds/jump.mp3");
```

#### `loadMusic(name, src)`
Load background music (loops by default).

#### `getSound(name)` / `getMusic(name)`
Get loaded audio asset.

### Playing Audio

#### `play(name, options?)`
Play a sound or music.

**Options:**
- `volume`: Volume level (0-1)
- `speed`: Playback speed
- `loop`: Loop audio (boolean)
- `paused`: Start paused (boolean)

**Returns:** `AudioPlay` handle for control

**Example:**
```js
play("jump");
const music = play("bg-music", { loop: true, volume: 0.5 });
music.stop(); // Stop playing
```

### Audio Control

#### `setVolume(volume)`
Set global volume (0-1).

#### `getVolume()`
Get current volume.

#### `burp(options?)`
Play a "burp" sound (debug/fun sound).

---

## Math & Geometry

### Vectors

#### `vec2(x, y)` / `vec2([x, y])`
Create a 2D vector.

**Vector methods:**
- `v.add(other)` - Add vectors
- `v.sub(other)` - Subtract vectors
- `v.scale(scalar)` - Scale vector
- `v.dot(other)` - Dot product
- `v.cross(other)` - Cross product
- `v.len()` - Vector length
- `v.dist(other)` - Distance to another vector
- `v.normalize()` - Normalize to unit length
- `v.lerp(other, t)` - Linear interpolation (t: 0-1)
- `v.rotate(angle)` - Rotate by angle (degrees)
- `v.angleTo(other)` - Angle between vectors

**Constants:**
- `LEFT` = `vec2(-1, 0)`
- `RIGHT` = `vec2(1, 0)`
- `UP` = `vec2(0, -1)`
- `DOWN` = `vec2(0, 1)`

**Example:**
```js
const v1 = vec2(10, 20);
const v2 = vec2(5, 5);
const sum = v1.add(v2); // vec2(15, 25)
const dist = v1.dist(v2); // Distance between points
```

### Colors

#### `rgb(r, g, b)` / `rgba(r, g, b, a)`
Create color (values 0-1).

**Example:**
```js
const red = rgb(1, 0, 0);
const transparent = rgba(0, 0, 1, 0.5);
```

#### Color Constants
- `RED`, `GREEN`, `BLUE`, `YELLOW`, `MAGENTA`, `CYAN`
- `WHITE`, `BLACK`

### Math Functions

#### `lerp(start, end, t)`
Linear interpolation (t: 0-1).

#### `tween(from, to, duration, easing?)`
Smooth animation between values. Returns `TweenController`.

**Example:**
```js
tween(0, 100, 1, easings.easeOutQuad).then(val => {
  console.log(val); // 0 to 100
});
```

#### `easings`
Easing functions:
- `easingLinear`
- `easings.easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- `easings.easeInCubic`, `easeOutCubic`, etc.
- Custom cubic bezier: `easingCubicBezier(p1x, p1y, p2x, p2y)`

#### `deg2rad(degrees)` / `rad2deg(radians)`
Angle conversion.

#### `clamp(value, min, max)`
Clamp value between min and max.

#### `map(value, inMin, inMax, outMin, outMax)`
Map value from one range to another.

#### `chance(probability)`
Random chance (0-1). Returns boolean.

**Example:**
```js
if (chance(0.5)) { // 50% chance
  // Do something
}
```

#### `rand(min, max)` / `randi(min, max)`
Random number (`rand`) or random integer (`randi`).

#### `choose(array)` / `chooseMultiple(array, count)`
Pick random element(s) from array.

#### `shuffle(array)`
Shuffle array in place.

#### `raycast(origin, direction, distance?)`
Cast a ray from a point. Returns `RaycastResult`.

#### Geometry Tests
- `testLinePoint(line, point)`
- `testLineLine(line1, line2)`
- `testRectRect(rect1, rect2)`
- `testCirclePolygon(circle, polygon)`

---

## Drawing

### Draw Primitives

#### `drawSprite(options?)`
Draw a sprite at specified location.

#### `drawRect(x, y, width, height, options?)`
Draw a rectangle.

#### `drawCircle(x, y, radius, options?)`
Draw a circle.

#### `drawLine(from, to, options?)`
Draw a line.

#### `drawLines(points, options?)`
Draw connected lines.

#### `drawPolygon(points, options?)`
Draw a polygon.

#### `drawTriangle(p1, p2, p3, options?)`
Draw a triangle.

#### `drawText(text, options?)`
Draw text.

### Transform Stack

#### `pushTransform()` / `popTransform()`
Save/restore transformation matrix.

#### `pushTranslate(x, y)` / `pushScale(scale)` / `pushRotate(angle)`
Transform shortcuts (auto-pop after draw).

#### `drawMasked(drawFunc, maskFunc)`
Draw with mask (only draw where mask is opaque).

#### `drawSubtracted(drawFunc, subtractFunc)`
Subtract mask from draw.

---

## Scenes & Layers

### `scene(name, sceneDef)`
Define a new scene.

**Example:**
```js
scene("game", () => {
  const player = add([
    sprite("player"),
    pos(100, 100),
  ]);
  
  onUpdate(() => {
    // Game logic
  });
});
```

### `go(sceneName, ...args)`
Switch to a scene (with optional arguments).

**Example:**
```js
go("game", { difficulty: "hard" });
```

### `getSceneName()`
Get current scene name.

### `onSceneLeave(sceneName, callback)`
Trigger when leaving a scene.

### `layer(name, defaultZ?)`
Define a rendering layer.

**Example:**
```js
const layers = ["bg", "game", "ui"];
setLayers(layers);
layer("ui"); // Draw subsequent objects on UI layer
```

### `setLayers(layers, defaultLayer?)`
Set layer rendering order.

### `getLayers()` / `getDefaultLayer()`
Get layer info.

---

## Events

### Global Events

#### `onUpdate(callback)`
Triggered every frame.

#### `onFixedUpdate(callback)`
Triggered at fixed timestep.

#### `onDraw(callback)`
Triggered every frame before drawing.

#### `onLoad(callback)`
Triggered when resources finish loading.

#### `onResize(callback)`
Triggered when window resizes.

### Object Events

#### `onAdd(callback)` / `onDestroy(callback)`
Triggered when object added/destroyed.

#### `onUse()` / `onUnuse()`
Components use/unuse lifecycle.

#### `onTag(tag)` / `onUntag(tag)`
Tags added/removed from object.

#### `onHide()` / `onShow()`
Object visibility changed.

### Custom Events

#### `trigger(event, ...args)`
Emit custom event.

#### `on(event, callback)`
Listen for custom event.

**Example:**
```js
player.on("special-move", (speed) => {
  console.log("Speed:", speed);
});

player.trigger("special-move", 500);
```

---

## Data & Debugging

### `debug`
Global debug object.

**Methods:**
- `debug.log(msg)` - Log to debug console
- `debug.paused` - Pause game
- `debug.inspect(obj)` - Inspect object

### Screen Info

#### `time()`
Get elapsed time in seconds since game start.

#### `dt()`
Get delta time (time since last frame) in seconds.

#### `isFocused()`
Check if window is focused.

### Canvas

#### `canvas()`
Get underlying HTML canvas element.

### Data Storage

#### `getData(key)` / `setData(key, value)`
Store/retrieve game data.

**Example:**
```js
setData("score", 100);
const score = getData("score");
```

### Utilities

#### `download(image)` / `downloadText(text, filename)` / `downloadJSON(data, filename)`
Download data/images.

#### `screenshot()`
Take screenshot and download.

#### `record(seconds)`
Record game video. Returns `Recording` object.

---

## Assets & Loading

### Sprites

#### `loadSprite(name, src, options?)`
Load sprite image.

**Options:**
- `width`: Tile width (for sprite sheets)
- `height`: Tile height
- `sliceX`: Horizontal tiles
- `sliceY`: Vertical tiles
- `anim`: Animation definitions

**Example:**
```js
loadSprite("player", "sprites/player.png", {
  sliceX: 4,
  sliceY: 4,
  anim: {
    "idle": { from: 0, to: 3, speed: 10, loop: true },
    "run": { from: 4, to: 7, speed: 10, loop: true },
  },
});
```

#### `loadSpriteAtlas(dataUrl, spriteDataUrl)`
Load sprite atlas with JSON data.

#### `loadAseprite(name, imageUrl, dataUrl)`
Load Aseprite sprite.

#### `loadPedit(name, imageUrl, dataUrl)`
Load Pico-8 editor sprite.

#### `loadJSON(name, src)`
Load JSON file.

#### `loadFont(name, src, options?)`
Load custom font.

#### `loadBitmapFont(name, imageUrl, dataUrl)`
Load bitmap font.

#### `loadShader(name, vertCode, fragCode)` / `loadShaderURL(name, vertUrl, fragUrl)`
Load GLSL shader.

### Root Path

#### `loadRoot(path)`
Set root path for all asset loading.

**Example:**
```js
loadRoot("assets/");
loadSprite("player", "sprites/player.png"); // Loads from "assets/sprites/player.png"
```

### Generic Load

#### `load(asyncFunc)`
Wait for async operation to complete before scene starts.

**Example:**
```js
load(async () => {
  const data = await fetch("/api/data").then(r => r.json());
  setData("gameData", data);
});
```

#### `loadProgress()`
Get load progress as value 0-1.

---

## Utility Functions

### `wait(seconds)`
Wait for specified seconds. Returns `Promise`.

**Example:**
```js
onAdd(() => {
  wait(1).then(() => {
    console.log("1 second passed");
  });
});
```

### `loop(seconds, callback)`
Call callback at interval (global, not object method).

### `cancel(handle)`
Cancel a timer or event handle.

### `plug(plugin)`
Use a Kaplayjs plugin.

### `addLevel(levelData, options?)`
Add a level from level data (strings/tiles).

### `isConvex(polygon)`
Check if polygon is convex.

### `triangulate(polygon)`
Triangulate polygon.

---

## Common Patterns

### Game Loop Structure

```js
kaplay({ width: 800, height: 600, background: "black" });

loadSprite("player", "sprites/player.png");
loadSound("jump", "sounds/jump.mp3");

const player = add([
  sprite("player"),
  pos(100, 100),
  area(),
  body(),
  health(100),
]);

onKeyDown("space", () => {
  if (player.isGrounded?.()) {
    player.jump();
    play("jump");
  }
});

onUpdate(() => {
  if (isKeyDown("left")) player.vel.x = -200;
  if (isKeyDown("right")) player.vel.x = 200;
});

onDraw(() => {
  drawText(`HP: ${player.health}`, 10, 10);
});
```

### Player State Machine

```js
const player = add([
  state("idle", {
    "idle": {
      enter() { player.play("idle"); },
      update() {
        if (isKeyPressed("w")) this.changeState("jump");
        if (isKeyDown("d")) this.changeState("run");
      },
    },
    "run": {
      enter() { player.play("run"); },
      update() {
        player.vel.x = 200;
        if (!isKeyDown("d")) this.changeState("idle");
      },
    },
  }),
]);
```

### Simple Collision

```js
const bullet = add([
  circle(5),
  pos(100, 100),
  move(RIGHT, 500),
  area(),
  "bullet",
]);

bullet.onCollide("enemy", (enemy) => {
  destroy(bullet);
  enemy.hurt(10);
  shake(5);
});
```

---

## Tips & Gotchas

1. **Physics requires both `body()` and `area()`** - You need both components for collisions to work with physics
2. **Sprites must be loaded before use** - Use `loadSprite()` before creating objects with `sprite()`
3. **Components return specific types** - Check the return types when adding components (e.g., `pos()` returns `PosComp`)
4. **Events are object-specific** - `onCollide()` is called on the object, not globally
5. **Coordinate system** - (0,0) is top-left; Y increases downward
6. **Angles in degrees** - All angle functions use degrees, not radians (except raw math)
7. **Use `ease.js` functions** - Import easing functions for smooth animations
8. **Always initialize kaplay first** - `kaplay()` must be called before any other API call
