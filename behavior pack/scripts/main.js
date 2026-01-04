// Combined main.js from Morphing Bracelet, Shrink Ray, and RealSitPickup mods

// Import morphing bracelet modules
import "abilityIndicator.js";
import "customComponents.js";
import "eventManager.js";
import "foodEaten.js";
import "healthPercentage.js";
import "isSolid.js";
import "itemAbilities.js";
import "mobSounds.js";
import "morphingBracelet.js";
import "onHit.js";
import "updater.js";

import "abilities/creeper.js";
import "abilities/enderman.js";
import "abilities/fox.js";
// import "abilities/bee.js";
import "abilities/frog.js";
import "abilities/shulker.js";
import "abilities/enderDragon.js";
import "abilities/breeze.js";

import { world, system, Container, ItemStack } from "@minecraft/server";

// ===============================
// Morphing Bracelet Initialization
// ===============================
if (!world.getDynamicProperty("initialized")) {
  world.gameRules.showTags = false;
  world.setDynamicProperty("initialized", true);
};

// system.beforeEvents.watchdogTerminate.subscribe(data => { data.cancel = true; });

const holidayCreatorFeatures = system.runInterval(() => {
  for (const player of world.getPlayers()) {
    try { player.triggerEvent("morph:holiday_creator_features"); }
    catch { system.clearRun(holidayCreatorFeatures); };
  };
});

Container.prototype.hasItem = function(identifier) {
  for (let slot = 0; slot < this.size; slot++) {
    const itemStack = this.getItem(slot);
    if (itemStack != undefined && itemStack.typeId == identifier) {
      return true;
    };
  };
  return false;
};

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (player.getProperty("morph:entity") == -1) { player.triggerEvent("morph:player.raw"); };
    if (player.getProperty("morph:entity") != 0) {
      if (player.nameTag != "") { player.nameTag = ""; };
    } else {
      if (player.nameTag != player.name) { player.nameTag = player.name; };
    };
  };
});

world.afterEvents.playerGameModeChange.subscribe(data => {
  const { player, toGameMode } = data;
  switch (toGameMode) {
    case "adventure":
      player.runCommand("ability @s mayfly false");
      break;
    case "creative":
      player.runCommand("ability @s mayfly true");
      player.getComponent("minecraft:health").resetToDefaultValue();
      break;
    case "spectator":
      player.runCommand("ability @s mayfly true");
      player.triggerEvent("morph:player.raw");
      break;
    case "survival":
      player.runCommand("ability @s mayfly false");
      break;
  };
});

// ===============================
// Shrink Ray Configuration
// ===============================
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

// ===============================
// Shrink Ray: Give Items on Spawn
// ===============================
world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;

  system.run(() => {
    const inv = player.getComponent("minecraft:inventory").container;

    // Give shrink ray items
    inv.addItem(new ItemStack("tiny:shrink_ray", 1));
    inv.addItem(new ItemStack("tiny:unshrink_ray", 1));
    inv.addItem(new ItemStack("tiny:growth_ray", 1));

    player.sendMessage("§bShrink, Unshrink & Growth Rays added!");
  });
});

// ===============================
// Shrink Ray: Raycast Helper
// ===============================
function getRayTarget(player) {
  const start = player.getHeadLocation();
  const direction = player.getViewDirection();

  const hits = player.dimension.getEntitiesFromRay(start, direction, {
    maxDistance: RAY_DISTANCE,
    excludeTypes: ["minecraft:player"]
  });

  return hits.length > 0 ? hits[0].entity : null;
}

// ===============================
// Shrink Ray: Use Item Logic
// ===============================
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

// ===============================
// Shrink Ray: Keep Players Shrunk
// ===============================
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (!shrunkPlayers.has(player.id)) continue;

    const scale = player.getComponent("minecraft:scale");
    if (scale.value !== SHRINK_SCALE) {
      scale.value = SHRINK_SCALE;
    }
  }
}, 1);
