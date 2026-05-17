# Kaplayjs Development Patterns & Best Practices

This document tracks verified patterns, gotchas, and solutions discovered during actual Kaplayjs development.

**Related:** See [reference.md](reference.md) for the comprehensive API reference covering all functions and components.

## Quick Function Reference

| Function | Purpose | Common Issue |
|----------|---------|--------------|
| `add([...])` | Create & add object | Must include components like `area()`, `body()` |
| `pos()` | Set position | Returns `PosComp` with `.move()` method |
| `body()` / `area()` | Physics/collisions | **BOTH required** for collision detection |
| `onCollide()` | Collision events | Called on the object, not globally |
| `sprite()` | Render sprite | Must `loadSprite()` first |
| `state()` | State machine | Use `this.changeState()` to switch |
| `play()` | Animation/sound | Check if animation exists before calling |
| `animate()` | Property animation | Useful for tweens/fades |
| `wait()` | Async delay | Returns Promise |
| `onUpdate()` | Game loop | Use `dt()` for frame-independent movement |

## Critical Patterns

### Physics + Collisions
```js
// ✅ CORRECT: Both body() and area() required
add([
  sprite("player"),
  pos(100, 100),
  body(),      // Physics
  area(),      // Collision detection
]);

// ❌ WRONG: No collisions work without both
add([sprite("player"), pos(100, 100), body()]); // Missing area()
```

### Velocity vs Position
```js
// ✅ Use velocity for physics-based movement
player.vel = vec2(100, 0);

// ✅ Use pos() for instant movement (no physics)
player.pos = vec2(500, 200);

// ✅ Use move() for relative movement
player.move(10, 0);
```

### State Machine Pattern
```js
const player = add([
  state("idle", {
    idle: {
      enter() { /* Called when entering state */ },
      update() { /* Called every frame in state */ },
      exit() { /* Called when leaving state */ },
    },
    run: { /* ... */ },
  }),
]);

player.changeState("run"); // Switch states
```

### Animation on Sprite
```js
loadSprite("player", "sprites/player.png", {
  sliceX: 4,
  sliceY: 2,
  anim: {
    idle: { from: 0, to: 3, speed: 10, loop: true },
    run: { from: 4, to: 7, speed: 10, loop: true },
  },
});

player.play("idle"); // Start animation
player.play("run");  // Switch animation
```

### Event Handling
```js
// ✅ Collision on object
player.onCollide("spike", (spike) => {
  player.hurt(10);
});

// ✅ Keyboard input (global)
onKeyDown("space", () => {
  player.jump();
});

// ✅ Custom events
player.on("custom-event", (data) => { /* ... */ });
player.trigger("custom-event", someData);
```

### Frame-Independent Movement
```js
// ✅ Multiply by dt() for frame-independent speed
onUpdate(() => {
  if (isKeyDown("right")) {
    player.vel.x = 200 * dt(); // Correct
  }
});

// ❌ Fixed pixel movement varies with framerate
onUpdate(() => {
  if (isKeyDown("right")) {
    player.move(5, 0); // Framerate-dependent!
  }
});
```

## Known Gotchas

### 1. Collision Detection Requires Both `body()` and `area()`
Without both components, collision events won't fire.

### 2. `onCollide()` vs `isColliding()`
- `onCollide()` - Fires the first frame of collision
- `onCollideUpdate()` - Fires every frame while colliding
- `isColliding()` - Check collision state (returns boolean)

### 3. Animation Names Are Case-Sensitive
```js
player.play("Idle");  // ❌ Won't work if defined as "idle"
player.play("idle");  // ✅ Correct
```

### 4. Sprite Must Be Loaded Before Use
```js
// ❌ This will crash
add([sprite("player")]); // Not loaded yet

// ✅ Do this first
loadSprite("player", "sprites/player.png");
add([sprite("player")]);
```

### 5. Physics Objects Fall Off Screen by Default
Objects with `body()` fall due to gravity. Use `useGravity: false` or `isStatic: true` if needed.

### 6. `dt()` Varies Each Frame
Don't rely on `dt()` being exactly the same every frame. Use it for multipliers, not exact timing.

### 7. Destroying Object During Event
If you destroy an object in an event (like `onCollide`), make sure the object isn't used again in the same frame.

### 8. Camera Position
Setting `setCamPos()` every frame can look smooth, but consider damping:
```js
// Smooth camera follow
const target = player.pos;
const current = getCamPos();
setCamPos(current.lerp(target, 0.1)); // Lerp for smooth follow
```

## Component Combinations

### Clickable UI Button
```js
add([
  rect(100, 50),
  color(BLUE),
  area(),
  "button",
]);

get("button")[0].onClick(() => {
  console.log("Clicked!");
});
```

### Floating Text (Damage Numbers)
```js
add([
  text("-10", { size: 20 }),
  pos(player.pos),
  color(RED),
  lifespan(1), // Disappear after 1 second
  move(UP, 100), // Float upward
]);
```

### Particle Explosion
```js
add([
  particles({
    max: 20,
    lifetime: 1,
    direction: () => rand(0, 360),
    speed: () => rand(100, 300),
    spread: 360,
    size: 4,
    color: YELLOW,
  }),
  pos(explosionX, explosionY),
]);
```

### Patrolling Enemy
```js
add([
  sprite("guard"),
  pos(100, 100),
  area(),
  body(),
  patrol(
    [vec2(100, 100), vec2(300, 100), vec2(200, 200)],
    { speed: 100, loop: true }
  ),
  "enemy",
]);
```

## Performance Tips

1. **Avoid large object counts** - Use pooling for bullets/particles
2. **Cache `get()` results** - Don't call `get("enemy")` every frame
3. **Use `fixed()`** - For UI elements to avoid expensive transforms
4. **Limit particle count** - Use `max` in particle emitter options
5. **Profile with `debug`** - Use debug mode to identify bottlenecks

## Common Mistakes & Fixes

| Mistake | Fix |
|---------|-----|
| Object doesn't collide | Add both `body()` and `area()` |
| Animation stutters | Use `loop: true` in animation definition |
| Object disappears | Check `z()` layering or camera position |
| Input doesn't work | Make sure to call inside scene, not global |
| Sprite not showing | Verify sprite is loaded & name matches |
| Physics broken | Check `useGravity` and `mass` values |

## Next Steps for Future Projects

- [ ] Test particle systems for performance
- [ ] Verify sound pooling for many simultaneous sounds
- [ ] Document custom component patterns when discovered
- [ ] Test multiplayer networking with Colyseus (if needed)
- [ ] Benchmark sprite sheet optimization techniques
