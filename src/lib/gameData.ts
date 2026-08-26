export const FRUITS = [
  "Blade",
  "Blizzard",
  "Bomb",
  "Buddha",
  "Control",
  "Creation",
  "Dark",
  "Diamond",
  "Dough",
  "Dragon",
  "Eagle",
  "Flame",
  "Gas",
  "Ghost",
  "Gravity",
  "Ice",
  "Kitsune",
  "Light",
  "Lightning",
  "Love",
  "Magma",
  "Mammoth",
  "Pain",
  "Phoenix",
  "Portal",
  "Quake",
  "Rocket",
  "Rubber",
  "Sand",
  "Shadow",
  "Smoke",
  "Sound",
  "Spider",
  "Spike",
  "Spin",
  "Spirit",
  "Spring",
  "T-Rex",
  "Tiger",
  "Venom",
  "Yeti"
].sort();

export const FRUIT_OPTIONS = FRUITS.map(fruit => ({
  value: fruit.toLowerCase(),
  label: fruit
}));

export const SWORDS = [

  // Legendary
  "Bisento", "TTK", "Hallow Scythe", "Dark Blade", "Buddy Sword", "Canvander", "Cursed Dual Katana", "Dark Dagger", "Dog Blade", "Dragon Trident",
  "Dragonheart", "Fox Lamp", "Gravity Blade", "Koko", "Midnight Blade", "Oroshi",
  "Pole (2nd Form)", "Rengoku", "Saddi", "Shark Anchor", "Shisui", "Tushita", "Wando", "Yama",
  // Rare
  "Dual-Headed Blade", "Flail", "Longsword", "Pipe", "Pole (1st Form)", "Saber",
  "Saishi", "Shizu", "Soul Cane", "Spikey Trident", "Trident", "Warden's Sword",
  // Uncommon
  "Iron Mace", "Shark Saw", "Triple Katana", "Twin Hooks",
  // Common
  "Cutlass", "Dual Katana", "Katana", "Steel Blade"
].sort();

export const SWORD_OPTIONS = SWORDS.map(sword => ({
  value: sword.toLowerCase(),
  label: sword
}));

export const MELEES = [
  "Combat", "Dark Step", "Dragon Breath", "Dragon Talon", "Death Step", "Electric",
  "Electric Claw", "Godhuman", "Sanguine Art", "Sharkman Karate", "Superhuman", "Water Kung Fu"
].sort();

export const MELEE_OPTIONS = MELEES.map(melee => ({
  value: melee.toLowerCase(),
  label: melee
}));

export const GUNS = [
  "Acidum Rifle", "Bazooka", "Bizarre Revolver", "Cannon", "Dragonstorm", "Flintlock",
  "Kabucha", "Musket", "Refined Flintlock", "Refined Musket", "Refined Slingshot",
  "Serpent Bow", "Slingshot", "Soul Guitar"
].sort();

export const GUN_OPTIONS = GUNS.map(gun => ({
  value: gun.toLowerCase(),
  label: gun
}));

export const MACRO_TYPE_OPTIONS = [
  { value: 'one shot', label: 'One Shot' },
  { value: 'infinite combo', label: 'Infinite Combo' },
];

