const id = "PT_EVENT_SET_DIALOGUE_FRAME";
const groups = ["Plugin Pak", "EVENT_GROUP_DIALOGUE"];
const name = "Set Dialogue Frame";

const fields = [].concat([
  {
    label:
      "Select a 24x24 tileset to use as the dialogue frame until is set to a different one.",
  },
  {
    label: "Frame",
    type: "tileset",
    key: "tilesetId",
  },
]);

const compile = (input, helpers) => {
  const { appendRaw, _addComment, tilesets } = helpers;

  const tilesetId = input.tilesetId;

  const tileset = tilesets.find((t) => t.id === tilesetId) ?? tilesets[0];
  if (!tileset) {
    return;
  }

  if (tileset.imageWidth !== 24 || tileset.imageHeight !== 24) {
    throw new Error(
      `The selected tileset is ${tileset.imageWidth}x${tileset.imageHeight}px. Please select a 24x24 tileset.`
    );
  }
  const symbol = tileset.symbol;

  _addComment("Set dialogue frame");
  appendRaw(`
VM_PUSH_CONST 0
VM_PUSH_CONST .FRAME_TILE_ID

VM_REPLACE_TILE .ARG0, ___bank_${symbol}, _${symbol}, .ARG1, .FRAME_LENGTH

VM_POP 2
  `);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  waitUntilAfterInitFade: false,
};
