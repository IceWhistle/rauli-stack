#!/bin/bash
# Download all item icons from the Deadlock wiki

ICON_DIR="$(dirname "$0")/../data/icons"
mkdir -p "$ICON_DIR"
cd "$ICON_DIR"

# Key items to download (most important for counter-building)
ITEMS=(
  "Metal_Skin"
  "Healbane"
  "Leech"
  "Colossus"
  "Glass_Cannon"
  "Silencer"
  "Unstoppable"
  "Debuff_Remover"
  "Spirit_Resilience"
  "Bullet_Resilience"
  "Ethereal_Shift"
  "Phantom_Strike"
  "Boundless_Spirit"
  "Refresher"
  "Toxic_Bullets"
  "Inhibitor"
  "Return_Fire"
  "Tankbuster"
  "Knockdown"
  "Curse"
  "Warp_Stone"
  "Majestic_Leap"
  "Counterspell"
  "Spellbreaker"
  "Witchmail"
  "Armor_Piercing_Rounds"
  "Slowing_Bullets"
  "Tesla_Bullets"
  "Ricochet"
  "Echo_Shard"
)

echo "Downloading ${#ITEMS[@]} item icons..."

for item in "${ITEMS[@]}"; do
  filename="${item,,}.png"  # lowercase
  if [ ! -f "$filename" ]; then
    echo "Downloading $item..."
    curl -sL "https://deadlock.wiki/images/thumb/${item:0:1}/${item}.png/64px-${item}.png" -o "$filename" 2>/dev/null || \
    curl -sL "https://deadlock.wiki/images/${item}.png" -o "$filename" 2>/dev/null
  fi
done

echo "Done! Icons in $ICON_DIR:"
ls -la *.png 2>/dev/null | wc -l
