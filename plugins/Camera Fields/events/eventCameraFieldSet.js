const id = "PT_EVENT_CAMERA_FIELD_SET";
const groups = ["Plugin Pak", "EVENT_GROUP_CAMERA", "EVENT_GROUP_VARIABLES"];
const name = "Camera Field Update";

const fields = [
  {
    key: "field",
    label: "Field",
    type: "select",
    defaultValue: "scroll_x",
    options: [
      ["camera_deadzone_x", "Camera Deadzone X"],
      ["camera_deadzone_y", "Camera Deadzone Y"],
      ["camera_offset_x", "Camera Offset X"],
      ["camera_offset_y", "Camera Offset Y"],
    ],
  },
  {
    type: "group",
    width: "50%",
    fields: [
      {
        key: "variable",
        type: "variable",
        defaultValue: "LAST_VARIABLE",
        conditions: [
          {
            key: "type",
            eq: "variable",
          },
        ],
      },
      {
        key: "value",
        type: "number",
        defaultValue: 0,
        min: -32768,
        max: 32767,
        conditions: [
          {
            key: "type",
            eq: "number",
          },
        ],
      },
      {
        key: "type",
        type: "selectbutton",
        options: [
          ["variable", "variable"],
          ["number", "number"],
        ],
        inline: true,
        defaultValue: "number",
      },
    ],
  },
];

const compile = (input, helpers) => {
  const {
    _addComment,
    _addNL,
    _setConstMemInt16,
    _setMemInt16ToVariable,
    _setConstMemInt8,
    _setMemInt8ToVariable,
  } = helpers;

  const fieldVarTypeLookup = {
    camera_deadzone_x: "UINT8",
    camera_deadzone_y: "UINT8",
    camera_offset_x: "UINT8",
    camera_offset_y: "UINT8",
  };

  if (input.type === "variable") {
    _addComment("Camera Field Set To Variable");
    if (fieldVarTypeLookup[input.field] === "INT16") {
      _setMemInt16ToVariable(input.field, input.variable);
    } else {
      _setMemInt8ToVariable(input.field, input.variable);
    }
  } else {
    _addComment("Camera Field Set To Value");
    if (fieldVarTypeLookup[input.field] === "INT16") {
      _setConstMemInt16(input.field, input.value);
    } else {
      _setConstMemInt8(input.field, input.value);
    }
  }
  _addNL();
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  allowedBeforeInitFade: true,
};
