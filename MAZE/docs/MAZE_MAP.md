# Into the Abyss - Maze Navigation Map

This document contains the complete navigation structure of the "Into the Abyss" maze website at http://www.intotheabyss.net/

## Overview

The maze consists of 47 pages total:
- **Directions**: The entry point with rules and objective
- **Prologue**: Introduction to the maze
- **Rooms 1-45**: The main maze structure with interconnected rooms

Players navigate from the Directions page through the Prologue to Room-01, and must find their way to Room-45 (the center) and back to Room-01, ideally in 16 steps or fewer.

## Navigation Graph

```mermaid
graph TD
  Directions --> Prologue
  Prologue --> Room-01
  Room-01 --> Room-21
  Room-01 --> Room-41
  Room-01 --> Room-20
  Room-01 --> Room-26
  Room-02 --> Room-29
  Room-02 --> Room-22
  Room-02 --> Room-12
  Room-03 --> Room-33
  Room-03 --> Room-09
  Room-03 --> Room-18
  Room-04 --> Room-44
  Room-04 --> Room-29
  Room-04 --> Room-15
  Room-04 --> Room-11
  Room-04 --> Room-16
  Room-04 --> Room-24
  Room-04 --> Room-43
  Room-05 --> Room-43
  Room-05 --> Room-22
  Room-05 --> Room-30
  Room-05 --> Room-20
  Room-06 --> Room-40
  Room-07 --> Room-33
  Room-07 --> Room-36
  Room-07 --> Room-16
  Room-08 --> Room-31
  Room-08 --> Room-06
  Room-08 --> Room-29
  Room-08 --> Room-12
  Room-09 --> Room-03
  Room-09 --> Room-18
  Room-10 --> Room-34
  Room-10 --> Room-41
  Room-10 --> Room-14
  Room-11 --> Room-40
  Room-11 --> Room-24
  Room-12 --> Room-02
  Room-12 --> Room-21
  Room-12 --> Room-08
  Room-12 --> Room-39
  Room-13 --> Room-27
  Room-13 --> Room-18
  Room-13 --> Room-25
  Room-14 --> Room-10
  Room-14 --> Room-43
  Room-14 --> Room-24
  Room-15 --> Room-30
  Room-15 --> Room-37
  Room-15 --> Room-03
  Room-16 --> Room-36
  Room-16 --> Room-07
  Room-17 --> Room-06
  Room-17 --> Room-45
  Room-17 --> Room-33
  Room-18 --> Room-13
  Room-18 --> Room-03
  Room-19 --> Room-31
  Room-19 --> Room-11
  Room-20 --> Room-05
  Room-20 --> Room-27
  Room-20 --> Room-01
  Room-21 --> Room-44
  Room-21 --> Room-24
  Room-21 --> Room-31
  Room-22 --> Room-43
  Room-22 --> Room-38
  Room-23 --> Room-28
  Room-23 --> Room-08
  Room-23 --> Room-45
  Room-23 --> Room-19
  Room-25 --> Room-34
  Room-25 --> Room-13
  Room-25 --> Room-35
  Room-26 --> Room-30
  Room-26 --> Room-36
  Room-26 --> Room-38
  Room-26 --> Room-01
  Room-27 --> Room-13
  Room-27 --> Room-09
  Room-28 --> Room-23
  Room-28 --> Room-43
  Room-28 --> Room-45
  Room-28 --> Room-32
  Room-29 --> Room-40
  Room-29 --> Room-08
  Room-29 --> Room-35
  Room-29 --> Room-02
  Room-29 --> Room-17
  Room-30 --> Room-42
  Room-30 --> Room-34
  Room-30 --> Room-05
  Room-30 --> Room-15
  Room-31 --> Room-44
  Room-31 --> Room-19
  Room-31 --> Room-21
  Room-32 --> Room-11
  Room-32 --> Room-06
  Room-32 --> Room-28
  Room-32 --> Room-16
  Room-33 --> Room-03
  Room-33 --> Room-35
  Room-33 --> Room-07
  Room-34 --> Room-10
  Room-34 --> Room-25
  Room-35 --> Room-33
  Room-36 --> Room-07
  Room-36 --> Room-16
  Room-37 --> Room-15
  Room-37 --> Room-10
  Room-37 --> Room-42
  Room-37 --> Room-20
  Room-38 --> Room-40
  Room-38 --> Room-22
  Room-38 --> Room-43
  Room-39 --> Room-11
  Room-39 --> Room-04
  Room-39 --> Room-12
  Room-40 --> Room-11
  Room-40 --> Room-06
  Room-40 --> Room-38
  Room-41 --> Room-01
  Room-41 --> Room-35
  Room-41 --> Room-10
  Room-41 --> Room-38
  Room-42 --> Room-22
  Room-42 --> Room-30
  Room-42 --> Room-04
  Room-42 --> Room-25
  Room-42 --> Room-37
  Room-43 --> Room-22
  Room-43 --> Room-38
  Room-44 --> Room-21
  Room-44 --> Room-18
  Room-45 --> Room-28
  Room-45 --> Room-17
  Room-45 --> Room-36
  Room-45 --> Room-19
  Room-45 --> Room-23
```

## Key Observations

- **Entry Point**: Directions → Prologue → Room-01
- **Central Hub**: Room-45 is highly connected with 5 outgoing exits
- **Dead End**: Room-24 has no outgoing connections (though 2 rooms lead to it)
- **Highly Connected**: Room-04 has 7 different room exits
- **Cycles**: The maze contains many cyclical paths, allowing players to loop back to previously visited rooms
- **Low Connectivity**: Rooms 06, 17, 19, 24, 25, 35, and 36 have fewer than 3 exits

## Navigation Strategy

This graph structure creates an interesting puzzle where:
- Multiple paths can lead between the same rooms
- It's easy to get "lost" and end up revisiting rooms
- The shortest path from Room-01 to Room-45 and back requires careful navigation
- Clues in the artwork and text guide players toward the optimal path
