const id = "PT_EVENT_CAMERA_FIELD_STORE";
const groups = ["Plugin Pak", "EVENT_GROUP_CAMERA", "EVENT_GROUP_VARIABLES"];
const name = "Store Camera Field In Variable";

const fields = [
  {
    key: "field",
    label: "Field",
    type: "select",
    defaultValue: "scroll_x",
    options: [
      ["scroll_x", "Scroll X"],
      ["scroll_y", "Scroll Y"],
      ["camera_x", "Camera X"],
      ["camera_y", "Camera Y"],
      ["camera_deadzone_x", "Camera Deadzone X"],
      ["camera_deadzone_y", "Camera Deadzone Y"],
      ["camera_offset_x", "Camera Offset X"],
      ["camera_offset_y", "Camera Offset Y"],
    ],
  },
  {
    key: "variable",
    type: "variable",
    defaultValue: "LAST_VARIABLE",
  },
];

const compile = (input, helpers) => {
  const { appendRaw, getVariableAlias, _addComment } = helpers;

  const fieldVarTypeLookup = {
    scroll_x: "INT16",
    scroll_y: "INT16",
    camera_x: "INT16",
    camera_y: "INT16",
    camera_deadzone_x: "UINT8",
    camera_deadzone_y: "UINT8",
    camera_offset_x: "UINT8",
    camera_offset_y: "UINT8",
  };

  const fieldName = `_${input.field}`;
  const variableAlias = getVariableAlias(input.variable);

  _addComment("Store camera field in variable");
  appendRaw(
    `VM_GET_${fieldVarTypeLookup[input.field]} ${variableAlias}, ${fieldName}`
  );
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  allowedBeforeInitFade: true,
};
