# Magic Meadow

A 3D open world hide and seek game. The unicorn and pegasus collect stars and hide in caves. The wolf tries to eat them.

**Game design by Coco, age 4.**

**Play it now: https://amyleesterling.github.io/cocos-mythic-meadow/**

## How to play

- Pick your character: unicorn, pegasus, or wolf.
- **Unicorn and pegasus:** collect every star in the meadow. When the wolf howls, run to a glowing cave pad. The wolf cannot get you there.
- **Wolf:** catch the unicorn and the pegasus before time runs out. They will hide in caves, so wait for them to come out, then pounce!

### Controls

| Key | Action |
| --- | --- |
| WASD or arrows | Move |
| Space | Unicorn: jump (press twice for a double jump). Pegasus: hold to fly. Wolf: pounce |
| Shift | Speed boost |
| Mouse drag | Look around |
| Scroll | Zoom camera |
| Esc | Pause |

## Ten levels

Sunny Meadow, Buttercup Hills, Rose Valley, Lavender Woods, Crystal Springs, Golden Cliffs, Twilight Meadow, Cotton Candy Peaks, Starlight Forest, and Rainbow Summit. Two of them happen at dusk and under the stars.

## Run it

No build step. Serve the folder with any static server:

```
python -m http.server 3462
```

Then open http://localhost:3462

Three.js loads from a CDN, so you need to be online.

## Tech

- Three.js, toon shading, everything modeled from primitives (no downloaded assets)
- WebAudio synth for all sound (no audio files)
- Progress saved in localStorage
