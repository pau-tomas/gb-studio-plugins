const id = "PT_EVENT_PLAYER_FIELD_SET";
const groups = ["Plugin Pak", "Player Fields", "EVENT_GROUP_VARIABLES"];
const name = "Player Field Update";

const fields = [
  {
    key: "field",
    label: "Field",
    type: "select",
    defaultValue: "pl_vel_x",
    options: [
      ["pl_vel_x", "Player Velocity X"],
      ["pl_vel_y", "Player Velocity Y"],
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
  const { _addComment, _addNL, _setConstMemInt16, _setMemInt16ToVariable } =
    helpers;

  if (input.type === "variable") {
    _addComment("Player Field Set To Variable");
    _setMemInt16ToVariable(input.field, input.variable);
  } else {
    _addComment("Player Field Set To Value");
    _setConstMemInt16(input.field, input.value);
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
