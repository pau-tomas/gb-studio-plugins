const id = "PT_EVENT_SMOOTH_FADE";
const groups = ["Plugin Pak", "EVENT_GROUP_SCREEN", "EVENT_GROUP_CAMERA"];
const name = "Smooth Fade";

const STEPS = {
  1: 8,
  2: 8,
  3: 16,
  4: 24,
  5: 32,
  6: 32,
};

const DMG_PALETTE = {
  id: "dmg",
  name: "DMG (GB Default)",
  colors: ["E8F8E0", "B0F088", "509878", "202850"],
};

const hexDec = (hex) => parseInt(hex, 16);

const getPalette = (palettes, id, fallbackId) => {
  if (id === "dmg") {
    return DMG_PALETTE;
  }
  return (
    palettes.find((p) => p.id === id) ||
    palettes.find((p) => p.id === fallbackId) ||
    DMG_PALETTE
  );
};

const parseR = (hex) => Math.floor(hexDec(hex.substring(0, 2)) * (32 / 256));
const parseG = (hex) => Math.floor(hexDec(hex.substring(2, 4)) * (32 / 256));
const parseB = (hex) =>
  Math.max(1, Math.floor(hexDec(hex.substring(4, 6)) * (32 / 256)));

const fields = [
  {
    type: "group",
    fields: [
      {
        key: "direction",
        type: "select",
        options: [
          ["in", "Fade In"],
          ["out", "Fade Out"],
        ],
        defaultValue: "in",
        width: "100%",
      },
      {
        key: "color",
        type: "select",
        options: [
          ["black", "From Black"],
          ["white", "From White"],
        ],
        defaultValue: "white",
        conditions: [
          {
            key: "direction",
            eq: "in",
          },
        ],
      },
      {
        key: "color",
        type: "select",
        options: [
          ["black", "To Black"],
          ["white", "To White"],
        ],
        defaultValue: "white",
        conditions: [
          {
            key: "direction",
            eq: "out",
          },
        ],
      },
    ],
  },
  {
    key: "speed",
    type: "fadeSpeed",
    defaultValue: "3",
  },
  {
    key: "__scriptTabs",
    type: "tabs",
    defaultValue: "background",
    values: {
      background: "Background",
      sprites: "Sprites",
    },
  },
].concat(
  Array(8)
    .fill()
    .map((_, i) => ({
      key: `bgPalette${i}`,
      type: "palette",
      defaultValue: "keep",
      paletteType: "background",
      paletteIndex: i,
      canKeep: true,
      width: "100%",
      conditions: [
        {
          key: "__scriptTabs",
          eq: "background",
        },
      ],
    })),
  Array(8)
    .fill()
    .map((_, i) => ({
      key: `sprPalette${i}`,
      type: "palette",
      defaultValue: "keep",
      paletteType: "sprite",
      paletteIndex: i,
      canKeep: true,
      width: "100%",
      conditions: [
        {
          key: "__scriptTabs",
          eq: "sprites",
        },
      ],
    }))
);

const compile = (input, helpers) => {
  const { palettes, settings, wait, _paletteLoad, _paletteColor, _addComment } =
    helpers;

  const bgPaletteIds = [
    input.bgPalette0,
    input.bgPalette1,
    input.bgPalette2,
    input.bgPalette3,
    input.bgPalette4,
    input.bgPalette5,
    input.bgPalette6,
    input.bgPalette7,
  ];

  const sprPaletteIds = [
    input.sprPalette0,
    input.sprPalette1,
    input.sprPalette2,
    input.sprPalette3,
    input.sprPalette4,
    input.sprPalette5,
    input.sprPalette6,
    input.sprPalette7,
  ];

  let bgMask = 0;
  const bgFadePalettes = [];
  for (let i = 0; i < bgPaletteIds.length; i++) {
    const paletteId = bgPaletteIds[i];
    const defaultPaletteId = settings.defaultBackgroundPaletteIds[i];
    if (paletteId === "keep") {
      continue;
    }
    bgMask += 1 << i;
    bgFadePalettes.push(getPalette(palettes, paletteId, defaultPaletteId));
  }
  let sprMask = 0;
  const sprFadePalettes = [];
  for (let i = 0; i < sprPaletteIds.length; i++) {
    const paletteId = sprPaletteIds[i];
    const defaultPaletteId = settings.defaultSpritePaletteIds[i];
    if (paletteId === "keep") {
      continue;
    }
    sprMask += 1 << i;
    sprFadePalettes.push(getPalette(palettes, paletteId, defaultPaletteId));
  }

  const delta = input.color === "black" ? -1 : 1;

  const speed = input.speed || 3;
  const maxSteps = STEPS[speed];
  const shade = shadeFn(maxSteps);

  const bgFadeSteps = [];
  const sprFadeSteps = [];
  for (let i = 0; i < maxSteps; i++) {
    const newBgFadeStep = [];
    for (const bgPalette of bgFadePalettes) {
      newBgFadeStep.push([
        shade(bgPalette.colors[0], delta * i),
        shade(bgPalette.colors[1], delta * i),
        shade(bgPalette.colors[2], delta * i),
        shade(bgPalette.colors[3], delta * i),
      ]);
    }
    bgFadeSteps.push(newBgFadeStep);

    const newSprFadeStep = [];
    for (const sprPalette of sprFadePalettes) {
      newSprFadeStep.push([
        shade(sprPalette.colors[0], delta * i),
        shade(sprPalette.colors[1], delta * i),
        shade(sprPalette.colors[2], delta * i),
        shade(sprPalette.colors[3], delta * i),
      ]);
    }
    sprFadeSteps.push(newSprFadeStep);
  }

  const bgSteps =
    input.direction === "in" ? bgFadeSteps.reverse() : bgFadeSteps;
  const sprSteps =
    input.direction === "in" ? sprFadeSteps.reverse() : sprFadeSteps;

  _addComment(`Smooth fade ${input.direction} (${maxSteps} steps)`);

  console.log(input, helpers);
  for (let i = 0; i < maxSteps; i++) {
    const bgFadeStep = bgSteps[i];
    _paletteLoad(bgMask, ".PALETTE_BKG", true);
    for (const colors of bgFadeStep) {
      _paletteColor(
        parseR(colors[0]),
        parseG(colors[0]),
        parseB(colors[0]),
        parseR(colors[1]),
        parseG(colors[1]),
        parseB(colors[1]),
        parseR(colors[2]),
        parseG(colors[2]),
        parseB(colors[2]),
        parseR(colors[3]),
        parseG(colors[3]),
        parseB(colors[3])
      );
    }

    const sprFadeStep = sprSteps[i];
    _paletteLoad(sprMask, ".PALETTE_SPRITE", true);
    for (const colors of sprFadeStep) {
      _paletteColor(
        parseR(colors[0]),
        parseG(colors[0]),
        parseB(colors[0]),
        parseR(colors[0]),
        parseG(colors[0]),
        parseB(colors[0]),
        parseR(colors[1]),
        parseG(colors[1]),
        parseB(colors[1]),
        parseR(colors[3]),
        parseG(colors[3]),
        parseB(colors[3])
      );
    }
    wait(speed * 2);
  }
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  waitUntilAfterInitFade: true,
};

const shadeFn = (maxSteps) => (rgb, step) => {
  const clamp = (value, min, max) => {
    return Math.min(max, Math.max(min, value));
  };

  const [r, g, b] = rgb.match(/.{2}/g);
  const d = step * Math.floor(256 / maxSteps);

  const nr = clamp(parseInt(r, 16) + d, 0, 255)
    .toString(16)
    .padStart(2, "0");
  const ng = clamp(parseInt(g, 16) + d, 0, 255)
    .toString(16)
    .padStart(2, "0");
  const nb = clamp(parseInt(b, 16) + d, 0, 255)
    .toString(16)
    .padStart(2, "0");

  return `${nr}${ng}${nb}`;
};
