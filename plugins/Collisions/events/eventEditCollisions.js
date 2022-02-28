const id = "PT_EVENT_EDIT_COLLISION";
const groups = ["Plugin Pak", "Collision"];
const name = "Edit Collisions";

export const COLLISION_TOP = 0x1;
export const COLLISION_BOTTOM = 0x2;
export const COLLISION_LEFT = 0x4;
export const COLLISION_RIGHT = 0x8;
export const COLLISION_ALL = 0xf;
export const TILE_PROP_LADDER = 0x10;
export const TILE_PROPS = 0xf0;

const updateCollisionTypes = (newValue, field, args) => {
  const remove = (newValue, item) => {
    const index = newValue.indexOf(item);
    if (index > -1) {
      newValue.splice(index, 1);
    }
  };
  const add = (newValue, item) => {
    if (!newValue.includes(item)) {
      newValue.push(item);
    }
  };
  const prevValue = args[field.key] || [];
  console.log(newValue, prevValue, field.label, args);
  if (prevValue.includes(COLLISION_ALL) && !newValue.includes(COLLISION_ALL)) {
    remove(newValue, COLLISION_TOP);
    remove(newValue, COLLISION_BOTTOM);
    remove(newValue, COLLISION_LEFT);
    remove(newValue, COLLISION_RIGHT);
    return newValue;
  }
  if (!prevValue.includes(COLLISION_ALL) && newValue.includes(COLLISION_ALL)) {
    add(newValue, COLLISION_TOP);
    add(newValue, COLLISION_BOTTOM);
    add(newValue, COLLISION_LEFT);
    add(newValue, COLLISION_RIGHT);
    return newValue;
  }
  if (
    !newValue.includes(COLLISION_ALL) &&
    newValue.includes(COLLISION_TOP) &&
    newValue.includes(COLLISION_BOTTOM) &&
    newValue.includes(COLLISION_LEFT) &&
    newValue.includes(COLLISION_RIGHT)
  ) {
    add(newValue, COLLISION_ALL);
    return newValue;
  }
  if (
    newValue.includes(COLLISION_ALL) &&
    (!newValue.includes(COLLISION_TOP) ||
      !newValue.includes(COLLISION_BOTTOM) ||
      !newValue.includes(COLLISION_LEFT) ||
      !newValue.includes(COLLISION_RIGHT))
  ) {
    remove(newValue, COLLISION_ALL);
    return newValue;
  }
  return newValue;
};

const fields = [].concat(
  [
    {
      key: `x`,
      label: "X",
      type: "number",
      min: 0,
      max: 255,
      width: "50%",
      defaultValue: 0,
    },
    {
      key: `y`,
      label: "Y",
      type: "number",
      min: 0,
      max: 255,
      width: "50%",
      defaultValue: 0,
    },
    {
      key: `width`,
      label: "Width",
      type: "number",
      min: 1,
      max: 255,
      width: "50%",
      defaultValue: 1,
    },
    {
      key: `height`,
      label: "Height",
      type: "number",
      min: 1,
      max: 255,
      width: "50%",
      defaultValue: 1,
    },
  ],
  [
    {
      key: "collision",
      label: "Collisions",
      type: "togglebuttons",
      options: [
        [COLLISION_ALL, "All"],
        [COLLISION_TOP, "Top"],
        [COLLISION_BOTTOM, "Bottom"],
        [COLLISION_LEFT, "Left"],
        [COLLISION_RIGHT, "Right"],
      ],
      updateFn: updateCollisionTypes,
      allowMultiple: true,
      allowNone: true,
      defaultValue: [],
    },
  ]
);

const toHex = (n) => "0x" + n.toString(16).toUpperCase().padStart(2, "0");

const compile = (input, helpers) => {
  const {
    writeAsset,
    appendRaw,
    _addComment,
    _addDependency,
    _getAvailableSymbol,
  } = helpers;

  const { x, y, width, height } = input;

  const newSceneSymbol = _getAvailableSymbol(`${helpers.scene.symbol}_alt`);
  const newCollisionsBank = `___bank_${newSceneSymbol}_collisions`;
  const newCollisionsPtr = `_${newSceneSymbol}_collisions`;

  const newSceneCollisions = [...helpers.scene.collisions].map((v) => toHex(v));

  const collisionValue = input.collision.reduce((i, v) => i | v, 0);

  const sceneWidth = helpers.scene.width;
  const sceneHeight = helpers.scene.height;

  if (width - x >= sceneWidth)
    throw "Collision box width too big or out of bounds";
  if (height - y >= sceneHeight)
    throw "Collision box height too big or out of bounds";

  for (let i = x; i <= width; i++) {
    for (let j = y; j <= height; j++) {
      newSceneCollisions[20 * j + i] = toHex(collisionValue);
    }
  }

  writeAsset(
    `${newSceneSymbol}_collisions.c`,
    collisionC(newSceneSymbol, newSceneCollisions, helpers.scene.name)
  );
  writeAsset(
    `${newSceneSymbol}_collisions.h`,
    collisionH(newSceneSymbol),
    helpers.scene.name
  );

  _addComment("Edit Collision");

  _addDependency("collision_bank");
  _addDependency("collision_ptr");

  appendRaw(`VM_SET_CONST_INT16  _collision_bank, ${newCollisionsBank}`);
  appendRaw(`VM_SET_CONST_INT8   _collision_ptr, ${newCollisionsPtr}`);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};

const collisionC = (symbol, collisionValues, sceneName) => {
  return `#pragma bank 255

// Scene: ${sceneName}
// Collisions

#include "gbs_types.h"

BANKREF(${symbol}_collisions)

const unsigned char ${symbol}_collisions[] = {
${chunk(collisionValues, 20)
  .map((r) => " ".repeat(4) + r.join(", "))
  .join(",\n")}
};
`;
};

const collisionH = (symbol, sceneName) => {
  return `#ifndef ${symbol.toUpperCase()}_COLLISIONS_H
#define ${symbol.toUpperCase()}_COLLISIONS_H

// Scene: ${sceneName}
// Collisions

#include "gbs_types.h"

BANKREF_EXTERN(${symbol}_collisions)
extern const unsigned char ${symbol}_collisions[];

#endif
`;
};

const chunk = (arr, len) => {
  const chunks = [];
  let i = 0;
  const n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
};
