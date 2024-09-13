// --- PLUGIN CODE ---
// VRAM_BASE_START_TILE - the VRAM index where the tileset will be stored
// 128 is the first tile after the sprite block
const VRAM_BASE_START_TILE = 128;

// --- PLUGIN CODE ---
const scriptValueHelpers = require("shared/lib/scriptValue/helpers");

const wrap8Bit = (val) => (256 + (val % 256)) % 256;
const decHex = (dec) =>
  `0x${wrap8Bit(dec).toString(16).padStart(2, "0").toUpperCase()}`;

const id = "PT_EVENT_HUD_DRAW_LIFEBAR";
const groups = ["EVENT_GROUP_DIALOGUE", "Plugin Pak"];
const subGroups = {
  EVENT_GROUP_SCREEN: "HUD",
};
const name = "Draw Lifebar";

const fields = [
  {
    key: "__section",
    type: "tabs",
    defaultValue: "lifebar",
    variant: "eventSection",
    values: {
      lifebar: "Lifebar",
      presets: "Presets",
    },
  },
  {
    type: "group",
    conditions: [
      {
        key: "__section",
        in: ["lifebar", undefined],
      },
    ],
    fields: [
      {
        key: "x",
        label: "X",
        type: "value",
        min: 0,
        defaultValue: {
          type: "number",
          value: 0,
        },
        width: "50%",
      },
      {
        key: "y",
        label: "Y",
        type: "value",
        min: 0,
        defaultValue: {
          type: "number",
          value: 0,
        },
        width: "50%",
      },
    ],
  },
  {
    type: "group",
    conditions: [
      {
        key: "__section",
        in: ["lifebar", undefined],
      },
    ],
    fields: [
      {
        key: "tilesetId",
        type: "tileset",
        label: "Tileset",
        defaultValue: "LAST_TILESET",
        unitsField: "tileSize",
        unitsDefault: "8px",
        unitsAllowed: ["8px"],
      },
      {
        key: "tileIndex",
        label: "Tile",
        type: "value",
        min: 0,
        defaultValue: {
          type: "number",
          value: 0,
        },
      },
    ],
  },
  {
    type: "group",
    conditions: [
      {
        key: "__section",
        in: ["lifebar", undefined],
      },
    ],
    fields: [
      {
        key: "currentValue",
        label: "Value",
        type: "value",
        defaultValue: {
          type: "variable",
          value: "LAST_VARIABLE",
        },
        width: "50%",
      },
      {
        key: "maxValue",
        label: "Max Value",
        type: "value",
        min: 0,
        defaultValue: {
          type: "number",
          value: 100,
        },
        width: "50%",
      },
      {
        key: "steps",
        label: "Steps",
        type: "number",
        min: 1,
        max: 64,
        defaultValue: 5,
        width: "50%",
      },
    ],
  },
  {
    type: "presets",
    conditions: [
      {
        key: "__section",
        in: ["presets"],
      },
    ],
  },
];

const userPresetsGroups = [
  {
    id: "lifebar",
    label: "Lifebar",
    fields: [
      "x",
      "y",
      "tilesetId",
      "tileIndex",
      "currentValue",
      "maxValue",
      "steps",
    ],
    selected: true,
  },
];

const userPresetsIgnore = ["__section"];

const compile = (input, helpers) => {
  const {
    tilesets,
    appendRaw,
    writeAsset,
    getNextLabel,
    // Private methods
    _rpn,
    _performValueRPN,
    _performFetchOperations,
    _addComment,
    _declareLocal,
    _switchVariable,
    _addNL,
    _label,
    _jump,
    _if,
  } = helpers;

  const { precompileScriptValue, optimiseScriptValue } = scriptValueHelpers;

  const tilesetId = input.tilesetId;
  const tileIndexValue = input.tileIndex;
  const x = input.x;
  const y = input.y;
  const value = input.currentValue;
  const maxValue = input.maxValue;

  const steps = input.steps;

  const tileset = tilesets.find((t) => t.id === tilesetId) ?? tilesets[0];
  if (!tileset) {
    return;
  }

  const backgroundAssetSymbol = `pt_hud_lifebar_${tileset.symbol}_${steps}_steps`;
  const tilemapsAssetSymbol = `pt_hud_lifebar_${steps}_steps`;

  const startTile = VRAM_BASE_START_TILE;

  // Load the tileset in VRAM
  appendRaw(`
  VM_RPN
    .R_INT16 ${startTile} ; TARGET_TILE_IDX
    .R_INT16 0            ; START_IDX
    .R_STOP
  
  VM_REPLACE_TILE .ARG1, ___bank_${tileset.symbol}, _${
    tileset.symbol
  }, .ARG0, ${tileset.width * tileset.height}
  
  VM_POP 2
    `);

  writeAsset(
    `${backgroundAssetSymbol}.h`,
    compileLifebarBackgroundsHeader(backgroundAssetSymbol, steps + 1)
  );
  writeAsset(
    `${backgroundAssetSymbol}.c`,
    compileLifebarBackgrounds(
      backgroundAssetSymbol,
      tilemapsAssetSymbol,
      steps + 1
    )
  );

  writeAsset(
    `${tilemapsAssetSymbol}_tilemap.h`,
    compileLifebarTilemapsHeader(tilemapsAssetSymbol, steps + 1)
  );
  writeAsset(
    `${tilemapsAssetSymbol}_tilemap.c`,
    compileLifebarTilemaps(tilemapsAssetSymbol, steps + 1)
  );

  _addComment(`Draw Lifebar`);

  const tileIndex = _declareLocal("tile_index", 1, true);
  const targetTileIndex = _declareLocal("target_tile_index", 1, true);
  const tileX = _declareLocal("tile_x", 1, true);
  const tileY = _declareLocal("tile_y", 1, true);
  const fullItems = _declareLocal("full_items", 1, true);
  const emptyItems = _declareLocal("empty_items", 1, true);
  const currentStep = _declareLocal("current_step", 1, true);
  const currentValue = _declareLocal("current_value", 1, true);
  const max = _declareLocal("max_value", 1, true);

  const [rpnOpsX, fetchOpsX] = precompileScriptValue(optimiseScriptValue(x));
  const [rpnOpsY, fetchOpsY] = precompileScriptValue(optimiseScriptValue(y));
  const [rpnOpsTile, fetchOpsTile] = precompileScriptValue(
    optimiseScriptValue(tileIndexValue)
  );
  const [rpnOpsValue, fetchOpsValue] = precompileScriptValue(
    optimiseScriptValue(value)
  );
  const [rpnOpsMaxValue, fetchOpsMaxValue] = precompileScriptValue(
    optimiseScriptValue(maxValue)
  );

  const localsLookup = _performFetchOperations([
    ...fetchOpsTile,
    ...fetchOpsX,
    ...fetchOpsY,
    ...fetchOpsValue,
    ...fetchOpsMaxValue,
  ]);

  const rpn = _rpn();

  _performValueRPN(rpn, rpnOpsTile, localsLookup);
  rpn.refSet(tileIndex);

  _performValueRPN(rpn, rpnOpsX, localsLookup);
  rpn.refSet(tileX);

  _performValueRPN(rpn, rpnOpsY, localsLookup);
  rpn.refSet(tileY);

  _performValueRPN(rpn, rpnOpsValue, localsLookup);
  rpn.refSet(currentValue);

  _performValueRPN(rpn, rpnOpsMaxValue, localsLookup);
  rpn.refSet(max);

  rpn.ref(max);
  rpn.ref(currentValue);
  rpn.operator(".MIN");
  rpn.int8(steps);
  rpn.operator(".DIV");
  rpn.refSet(fullItems);

  rpn.ref(max);
  rpn.int8(steps);
  rpn.operator(".DIV");
  rpn.ref(fullItems);
  rpn.operator(".SUB");
  rpn.int8(1);
  rpn.operator(".SUB");
  rpn.int8(0);
  rpn.operator(".MAX");
  rpn.refSet(emptyItems);

  rpn.ref(currentValue);
  rpn.int8(steps);
  rpn.operator(".MOD");
  rpn.refSet(currentStep);

  rpn.int8(startTile);
  rpn.ref(tileIndex);
  rpn.operator(".ADD");
  rpn.refSet(targetTileIndex);

  rpn.stop();

  const caseKeys = Array(20).fill(0);
  const numCases = caseKeys.length;

  const fullCaseLabels = caseKeys.map(() => getNextLabel());
  const fullEndLabel = getNextLabel();

  _addComment(`Switch Variable`);
  _switchVariable(
    fullItems,
    fullCaseLabels.map((label, i) => [i + 1, `${label}$`]),
    0
  );
  _addNL();
  // Default case
  _jump(fullEndLabel);

  // Cases
  for (let i = 0; i < numCases; i++) {
    _addComment(`case ${i + 1}:`);
    _label(fullCaseLabels[i]);

    appendRaw(
      `VM_OVERLAY_SET_MAP ${targetTileIndex}, ${tileX}, ${tileY}, ___bank_${backgroundAssetSymbol}_full_${
        i + 1
      }, _${backgroundAssetSymbol}_full_${i + 1}`
    );
    _jump(fullEndLabel);
  }
  _label(fullEndLabel);

  appendRaw(`VM_RPN
    .R_REF ${tileX}
    .R_REF ${fullItems}
    .R_OPERATOR .ADD
    .R_REF_SET ${tileX}
    .R_STOP`);

  // PARTIAL ITEM
  const stepsCaseLabel = Array(steps)
    .fill(0)
    .map(() => getNextLabel());
  const stepsEndLabel = getNextLabel();

  // If the current value is already the max value skip rendering this tile
  _if(".GTE", currentValue, max, stepsEndLabel, 0);

  _addComment(`Switch Variable (STEP)`);
  _switchVariable(
    currentStep,
    stepsCaseLabel.map((label, i) => [i, `${label}$`]),
    0
  );
  _addNL();

  // Default
  appendRaw(
    `VM_OVERLAY_SET_MAP ${targetTileIndex}, ${tileX}, ${tileY}, ___bank_${backgroundAssetSymbol}_step_0, _${backgroundAssetSymbol}_step_0`
  );
  _jump(stepsEndLabel);

  // Cases
  for (let i = 0; i < steps; i++) {
    _addComment(`case ${i}:`);
    _label(stepsCaseLabel[i]);

    appendRaw(
      `VM_OVERLAY_SET_MAP ${targetTileIndex}, ${tileX}, ${tileY}, ___bank_${backgroundAssetSymbol}_step_${i}, _${backgroundAssetSymbol}_step_${i}`
    );
    _jump(stepsEndLabel);
  }
  _label(stepsEndLabel);

  // EMPTY ITEMS
  appendRaw(`VM_RPN
  .R_REF ${tileX}
  .R_INT8 1
  .R_OPERATOR .ADD
  .R_REF_SET ${tileX}
  .R_STOP`);

  const emptyCaseLabels = caseKeys.map(() => getNextLabel());
  const emptyEndLabel = getNextLabel();

  _addComment(`Switch Variable (EMPTY)`);
  _switchVariable(
    emptyItems,
    emptyCaseLabels.map((label, i) => [i + 1, `${label}$`]),
    0
  );
  _addNL();

  _jump(emptyEndLabel);

  // Cases
  for (let i = 0; i < numCases; i++) {
    _addComment(`case ${i + 1}:`);
    _label(emptyCaseLabels[i]);

    appendRaw(
      `VM_OVERLAY_SET_MAP ${targetTileIndex}, ${tileX}, ${tileY}, ___bank_${backgroundAssetSymbol}_empty_${
        i + 1
      }, _${backgroundAssetSymbol}_empty_${i + 1}`
    );
    _jump(emptyEndLabel);
  }
  _label(emptyEndLabel);

  _addNL();
};

const compileLifebarBackgroundsHeader = (backgroundAssetSymbol, steps) => {
  const upperCaseSymbol = backgroundAssetSymbol.toUpperCase();

  return `#ifndef ${upperCaseSymbol}_H
#define ${upperCaseSymbol}_H  

// Created by "${name}" plugin

#include "gbs_types.h"

// Background structs with n full tile items
${Array(20)
  .fill(0)
  .map(
    (_, i) => `BANKREF_EXTERN(${backgroundAssetSymbol}_full_${i + 1})
extern const struct background_t ${backgroundAssetSymbol}_full_${i + 1};`
  )
  .join("\n")}

// Background structs with n empy tile items
${Array(20)
  .fill(0)
  .map(
    (_, i) => `BANKREF_EXTERN(${backgroundAssetSymbol}_empty_${i + 1})
extern const struct background_t ${backgroundAssetSymbol}_empty_${i + 1};`
  )
  .join("\n")}

// Background struct for Partial Item with ${steps} steps
${Array(steps - 1)
  .fill(0)
  .map(
    (_, i) => `BANKREF_EXTERN(${backgroundAssetSymbol}_step_${i + 1})
extern const struct background_t ${backgroundAssetSymbol}_step_${i + 1};`
  )
  .join("\n")}
  
#endif`;
};

const compileLifebarBackgrounds = (
  backgroundAssetSymbol,
  tilemapsAssetSymbol,
  steps
) => {
  return `#pragma bank 255

// Lifebar Background: ${backgroundAssetSymbol}
// Created by "${name}" plugin

#include "gbs_types.h"
#include "data/${tilemapsAssetSymbol}_tilemap.h"

// Background struct with n full tile items
${Array(20)
  .fill(0)
  .map(
    (_, i) => `
BANKREF(${backgroundAssetSymbol}_full_${i + 1})
const struct background_t ${backgroundAssetSymbol}_full_${i + 1} = {
  .width = ${i + 1},
  .height = 1,
  .tileset = { NULL, NULL }, 
  .cgb_tileset = { NULL, NULL },
  .tilemap = TO_FAR_PTR_T(${tilemapsAssetSymbol}_full_${i + 1}_tilemap),
  .cgb_tilemap_attr = { NULL, NULL }
};`
  )
  .join("\n")}

// Background struct with n empty tile items
${Array(20)
  .fill(0)
  .map(
    (_, i) => `
BANKREF(${backgroundAssetSymbol}_empty_${i + 1})
const struct background_t ${backgroundAssetSymbol}_empty_${i + 1} = {
  .width = ${i + 1},
  .height = 1,
  .tileset = { NULL, NULL }, 
  .cgb_tileset = { NULL, NULL },
  .tilemap = TO_FAR_PTR_T(${tilemapsAssetSymbol}_empty_${i + 1}_tilemap),
  .cgb_tilemap_attr = { NULL, NULL }
};`
  )
  .join("\n")}

// Background struct for partial Item with ${steps} steps
${Array(steps)
  .fill(0)
  .map(
    (_, i) => `
BANKREF(${backgroundAssetSymbol}_step_${i})
const struct background_t ${backgroundAssetSymbol}_step_${i} = {
  .width = 1,
  .height = 1,
  .tileset = { NULL, NULL }, 
  .cgb_tileset = { NULL, NULL },
  .tilemap = TO_FAR_PTR_T(${tilemapsAssetSymbol}_step_${i}_tilemap),
  .cgb_tilemap_attr = { NULL, NULL }
};`
  )
  .join("\n")}
  `;
};

const compileLifebarTilemaps = (tilesetAssetFilename, steps) => {
  return `#pragma bank 255

// Lifebar Tilemap: ${tilesetAssetFilename}
// Created by "${name}" plugin

#define EMPTY     0x00
#define FULL      ${decHex(steps - 1)}
${Array(steps)
  .fill(0)
  .map((_, i) => `#define STEP_${i}    ${decHex(i)}`)
  .join("\n")}

// Tilemap ${tilesetAssetFilename}_tilemap

#include "gbs_types.h"

${Array(20)
  .fill(0)
  .map(
    (_, i) => `
BANKREF(${tilesetAssetFilename}_full_${i + 1}_tilemap)
const unsigned char ${tilesetAssetFilename}_full_${i + 1}_tilemap[] = {
  ${Array(i + 1)
    .fill(0)
    .map(() => `FULL`)
    .join(", ")}
};`
  )
  .join("\n")}

${Array(20)
  .fill(0)
  .map(
    (_, i) => `
BANKREF(${tilesetAssetFilename}_empty_${i + 1}_tilemap)
const unsigned char ${tilesetAssetFilename}_empty_${i + 1}_tilemap[] = {
${Array(i + 1)
  .fill(0)
  .map(() => `EMPTY`)
  .join(", ")}
};`
  )
  .join("\n")}

${Array(steps)
  .fill(0)
  .map(
    (_, i) => `
BANKREF(${tilesetAssetFilename}_step_${i}_tilemap)
const unsigned char ${tilesetAssetFilename}_step_${i}_tilemap[] = {
  STEP_${i}
};`
  )
  .join("\n")}
`;
};

const compileLifebarTilemapsHeader = (tilesetAssetFilename, steps) => {
  const upperCaseSymbol = tilesetAssetFilename.toUpperCase();

  return `#ifndef ${upperCaseSymbol}_TILEMAP_H
#define ${upperCaseSymbol}_TILEMAP_H

// Lifebar Tilemap: ${tilesetAssetFilename}
// Created by "${name}" plugin

#include "gbs_types.h"

${Array(20)
  .fill(0)
  .map(
    (_, i) => `BANKREF_EXTERN(${tilesetAssetFilename}_full_${i + 1}_tilemap)
extern const unsigned char ${tilesetAssetFilename}_full_${i + 1}_tilemap[];`
  )
  .join("\n")}

${Array(20)
  .fill(0)
  .map(
    (_, i) => `BANKREF_EXTERN(${tilesetAssetFilename}_empty_${i + 1}_tilemap)
extern const unsigned char ${tilesetAssetFilename}_empty_${i + 1}_tilemap[];`
  )
  .join("\n")}

${Array(steps)
  .fill(0)
  .map(
    (_, i) => `BANKREF_EXTERN(${tilesetAssetFilename}_step_${i}_tilemap)
extern const unsigned char ${tilesetAssetFilename}_step_${i}_tilemap[];`
  )
  .join("\n")}

#endif`;
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  subGroups,
  userPresetsGroups,
  userPresetsIgnore,
};
