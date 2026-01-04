# Combined Minecraft Bedrock Mod Pack

This repository contains a combined Minecraft Bedrock mod that merges three separate mods into a single, unified mod pack.

## Original Mods Combined

### 1. Morphing Bracelet
- **Functionality**: Allows players to morph into different mobs using a morphing bracelet
- **Features**: 80+ morphable entities with unique abilities
- **Author**: CookieDookie145

### 2. Shrink Ray
- **Functionality**: Allows players to shrink, grow, or return entities to normal size
- **Features**: Shrink ray, unshrink ray, and growth ray items
- **Author**: XBOXGAMER YT426

### 3. RealSitPickup (More Body Actions)
- **Functionality**: Adds sitting, laying, crawling, and pick-up/carry mechanics
- **Features**: Multiple body positions and object carrying
- **Author**: sirob

## Combined Mod Structure

### Behavior Pack (`behavior pack/`)
Located at the root of the repository, contains:
- **manifest.json**: Combined manifest with all dependencies
- **entities/player.json**: Merged player entity with properties from all three mods
- **scripts/**: Combined JavaScript functionality from all mods
- **items/**: All items from all three mods
- **animations/**, **animation_controllers/**: Merged animations
- **Other files**: blocks, recipes, loot_tables, functions

### Resource Pack (`resource pack/`)
Located at the root of the repository, contains:
- **manifest.json**: Combined resource pack manifest
- **textures/**: All textures from all three mods
- **entity/**: Merged entity definitions
- **animations/**, **animation_controllers/**: Merged animations
- **render_controllers/**: Merged render controllers
- **sounds/**: All sounds
- **ui/**: User interface elements

## File Conflicts Resolved

### player.json
The main conflict was the `player.json` file which existed in all three mods with different content:

**Resolution**: Created a merged `player.json` that:
- Uses Morphing Bracelet's extensive component groups and events as the base
- Adds `shrinkray:scale` property (float, range 0.1-10.0) for size scaling
- Adds RealSitPickup properties:
  - `sirob:state_last`: For sit/lay/crawl states
  - `sirob:vest_armoridle`: For armor position states
  - `sirob:saction_ytseus`: For carry/pick actions

### scripts/main.js
**Resolution**: Created a combined main.js that:
- Imports all Morphing Bracelet modules
- Includes Shrink Ray raycast and scaling logic
- RealSitPickup uses its own obfuscated script file (`.sirob_realsit_pickup.js`)

### Resource Pack Files
**Conflicts**:
- `texts/en_US.lang`: Merged all language entries
- `textures/item_texture.json`: Combined all item texture definitions
- `sounds.json`: RealSitPickup version used (more comprehensive)
- `entity/player.json`: Combined player entity definitions
- `render_controllers/player.render_controller.json`: Combined render controllers

## Properties Available

### Morphing Properties
- `morph:entity`: Current morphed entity (-1 for player, 0-80 for mobs)
- `morph:color`: Primary color variant (0-15)
- `morph:color2`: Secondary color variant (0-15)
- `morph:bee_has_nectar`: Boolean for bee nectar state
- `morph:armadillo_state`: Enum for armadillo rolled/unrolled state

### Shrink Ray Properties
- `shrinkray:scale`: Float value for entity scale (0.1 = tiny, 1.0 = normal, 10.0 = huge)

### RealSitPickup Properties
- `sirob:state_last`: Body position (default, sit, lay, crawl, crawl4, wallclimb states)
- `sirob:vest_armoridle`: Armor positioning (default, left, right)
- `sirob:saction_ytseus`: Action state (default, carrying, picking)

## Usage

### Installation
1. Copy the `behavior pack` folder to your Minecraft world's `behavior_packs` folder
2. Copy the `resource pack` folder to your Minecraft world's `resource_packs` folder
3. Activate both packs in your world settings

### Requirements
- Minecraft Bedrock Edition 1.21.70 or higher
- Enable "Beta APIs" in world settings
- Enable "Holiday Creator Features" if needed

## Items Available

### Morphing Bracelet
- Morphing Bracelet: Used to transform into mobs
- Scroll of Souls: Capture mob morphs
- Various projectile items (wither skull, llama spit, etc.)

### Shrink Ray
- Shrink Ray: Shrinks entities to 0.1x size
- Unshrink Ray: Returns entities to normal 1.0x size  
- Growth Ray: Grows entities to 10.0x size

### RealSitPickup
- Functions-based mechanics (use `/function` commands to configure)
- Sit, lay, and crawl positions
- Pick up and carry blocks/entities

## Technical Notes

### Namespace Conventions
- Morphing Bracelet: `morph:`
- Shrink Ray: `tiny:`
- RealSitPickup: `sirob:`

### Script Dependencies
All three mods use `@minecraft/server` API. The combined pack requires:
- `@minecraft/server` version 1.18.0 or higher
- `@minecraft/server-ui` version 2.1.0 or higher

### Obfuscation
RealSitPickup uses obfuscated code in its scripts. The obfuscated script files have been preserved and integrated into the combined pack.

## Credits

- **Morphing Bracelet**: Created by CookieDookie145
- **Shrink Ray**: Created by XBOXGAMER YT426
- **RealSitPickup**: Created by sirob
- **Combined Pack**: Merged by GitHub Copilot (2026)

## License

This combined pack respects the licenses of all original mods:
- Morphing Bracelet: As specified by CookieDookie145
- Shrink Ray: As specified by XBOXGAMER YT426  
- RealSitPickup: Closed-source, as specified by sirob

Please respect the original authors' wishes regarding usage and modification.

## Known Limitations

1. **Property Interactions**: Some combinations of properties may cause unexpected behavior (e.g., morphing while shrunk)
2. **Script Conflicts**: The three mods' scripts run independently and may have minor conflicts
3. **Performance**: Running all three mods simultaneously may impact performance on low-end devices

## Troubleshooting

### Issues with Morphing
- Ensure Beta APIs are enabled
- Check that you're using the morphing bracelet item correctly

### Issues with Size Scaling
- The shrink ray requires line-of-sight to the target
- Players can only be affected by using the ray on themselves (no target)

### Issues with Sit/Lay/Crawl
- These features are script-based and require the RealSitPickup scripts to be loaded
- Check that the obfuscated scripts are present in the behavior pack

## Future Improvements

Potential enhancements to the combined pack:
- Better integration between the three systems
- Unified UI for accessing all features
- Performance optimizations
- Additional documentation for modders

## Support

For issues specific to:
- **Morphing Bracelet**: Contact CookieDookie145
- **Shrink Ray**: Contact XBOXGAMER YT426
- **RealSitPickup**: Contact sirob
- **Combined Pack**: Open an issue in this repository
