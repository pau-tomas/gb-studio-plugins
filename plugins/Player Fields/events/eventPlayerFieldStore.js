const id = "PT_EVENT_PLAYER_FIELD_STORE";
const groups = ["Plugin Pak", "Player Fields", "EVENT_GROUP_VARIABLES"];
const name = "Store Player Field In Variable";

const fields = [
  {
    key: "field",
    label: "Field",
    type: "select",
    defaultValue: "pl_vel_x",
    options: [
      ["pl_vel_x", "Player Velocity X"],
      ["pl_vel_y", "Player Velocity Y"],
      ["grounded", "Player is in the ground"],
      ["on_ladder", "Player is on ladder"],
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
    pl_vel_x: "INT16",
    pl_vel_y: "INT16",
    grounded: "UINT8",
    on_ladder: "UINT8",
  };

  const fieldName = `_${input.field}`;
  const variableAlias = getVariableAlias(input.variable);

  _addComment("Store player field in variable");
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
