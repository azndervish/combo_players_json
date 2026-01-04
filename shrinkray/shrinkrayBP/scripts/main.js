import { world, system, ItemStack } from "@minecraft/server";

/* ===============================
   CONFIG
   =============================== */
const SHRINK_SCALE = 0.1;
const NORMAL_SCALE = 1.0;
const GROW_SCALE   = 10.0;

const RAY_DISTANCE = 8;

// Shrink effects (mobs only)
const SLOWNESS_LEVEL = 3;
const SLOWNESS_DURATION = 200;

// Grow effects (everything)
const SPEED_LEVEL = 3;
const JUMP_LEVEL  = 3;
const GROW_EFFECT_DURATION = 200;

/* Track shrunk players so scale doesn't reset */
const shrunkPlayers = new Set();

/* ===============================
   GIVE ITEMS ON SPAWN
   =============================== */
world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;

  system.run(() => {
    const inv = player.getComponent("minecraft:inventory").container;

    inv.addItem(new ItemStack("tiny:shrink_ray", 1));
    inv.addItem(new ItemStack("tiny:unshrink_ray", 1));
    inv.addItem(new ItemStack("tiny:growth_ray", 1));

    player.sendMessage("§bShrink, Unshrink & Growth Rays added!");
  });
});

/* ===============================
   RAYCAST HELPER
   =============================== */
function getRayTarget(player) {
  const start = player.getHeadLocation();
  const direction = player.getViewDirection();

  const hits = player.dimension.getEntitiesFromRay(start, direction, {
    maxDistance: RAY_DISTANCE,
    excludeTypes: ["minecraft:player"]
  });

  return hits.length > 0 ? hits[0].entity : null;
}

/* ===============================
   USE ITEM (RAYCAST LOGIC)
   =============================== */
world.afterEvents.itemUse.subscribe((event) => {
  const { itemStack, source } = event;
  if (!itemStack) return;

  if (
    itemStack.typeId !== "tiny:shrink_ray" &&
    itemStack.typeId !== "tiny:unshrink_ray" &&
    itemStack.typeId !== "tiny:growth_ray"
  ) return;

  system.run(() => {
    const target = getRayTarget(source);

    /* ===== SHRINK ===== */
    if (itemStack.typeId === "tiny:shrink_ray") {
      if (target && target.hasComponent("minecraft:scale")) {
        target.getComponent("minecraft:scale").value = SHRINK_SCALE;

        // Slowness for shrunk mobs
        if (target.typeId !== "minecraft:player") {
          target.addEffect("slowness", SLOWNESS_DURATION, {
            amplifier: SLOWNESS_LEVEL - 1,
            showParticles: false
          });

          target.removeEffect("speed");
          target.removeEffect("jump_boost");
        }
      } else {
        shrunkPlayers.add(source.id);
        source.getComponent("minecraft:scale").value = SHRINK_SCALE;

        source.removeEffect("speed");
        source.removeEffect("jump_boost");

        source.sendMessage("§aYou are now tiny!");
      }
    }

    /* ===== UNSHRINK ===== */
    if (itemStack.typeId === "tiny:unshrink_ray") {
      if (target && target.hasComponent("minecraft:scale")) {
        target.getComponent("minecraft:scale").value = NORMAL_SCALE;

        target.removeEffect("slowness");
        target.removeEffect("speed");
        target.removeEffect("jump_boost");
      } else {
        shrunkPlayers.delete(source.id);
        source.getComponent("minecraft:scale").value = NORMAL_SCALE;

        source.removeEffect("slowness");
        source.removeEffect("speed");
        source.removeEffect("jump_boost");

        source.sendMessage("§eYou are back to normal!");
      }
    }

    /* ===== GROW (10x + BUFFS) ===== */
    if (itemStack.typeId === "tiny:growth_ray") {
      if (target && target.hasComponent("minecraft:scale")) {
        target.getComponent("minecraft:scale").value = GROW_SCALE;

        target.addEffect("speed", GROW_EFFECT_DURATION, {
          amplifier: SPEED_LEVEL - 1,
          showParticles: false
        });

        target.addEffect("jump_boost", GROW_EFFECT_DURATION, {
          amplifier: JUMP_LEVEL - 1,
          showParticles: false
        });

        target.removeEffect("slowness");
      } else {
        shrunkPlayers.delete(source.id);
        source.getComponent("minecraft:scale").value = GROW_SCALE;

        source.addEffect("speed", GROW_EFFECT_DURATION, {
          amplifier: SPEED_LEVEL - 1,
          showParticles: false
        });

        source.addEffect("jump_boost", GROW_EFFECT_DURATION, {
          amplifier: JUMP_LEVEL - 1,
          showParticles: false
        });

        source.removeEffect("slowness");

        source.sendMessage("§6You are now HUGE!");
      }
    }
  });
});

/* ===============================
   KEEP PLAYERS SHRUNK (ENGINE FIX)
   =============================== */
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (!shrunkPlayers.has(player.id)) continue;

    const scale = player.getComponent("minecraft:scale");
    if (scale.value !== SHRINK_SCALE) {
      scale.value = SHRINK_SCALE;
    }
  }
}, 1);