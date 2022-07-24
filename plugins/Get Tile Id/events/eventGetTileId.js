const id = "PT_EVENT_GET_TILE_ID";
const groups = ["Plugin Pak", "Background Tiles"];
const name = "Store Background Tile Id In Variable";

const fields = [
  {
    key: "variable",
    type: "variable",
    defaultValue: "LAST_VARIABLE",
  },
  {
    type: "group",
    fields: [
      {
        key: "x",
        label: "X",
        type: "union",
        types: ["number", "variable", "property"],
        defaultType: "number",
        min: 0,
        max: 255,
        width: "50%",
        defaultValue: {
          number: 0,
          variable: "LAST_VARIABLE",
          property: "$self$:xpos",
        },
      },
      {
        key: "y",
        label: "Y",
        type: "union",
        types: ["number", "variable", "property"],
        defaultType: "number",
        min: 0,
        max: 255,
        width: "50%",
        defaultValue: {
          number: 0,
          variable: "LAST_VARIABLE",
          property: "$self$:xpos",
        },
      },
    ],
  },
];

const compile = (input, helpers) => {
  const {
    _addComment,
    appendRaw,
    getVariableAlias,
    variableFromUnion,
    temporaryEntityVariable,
  } = helpers;

  _addComment("Get Tile Id");

  const xVar = variableFromUnion(input.x, temporaryEntityVariable(0));
  const yVar = variableFromUnion(input.y, temporaryEntityVariable(1));

  const variableAlias = getVariableAlias(input.variable);
  const xVarAlias = getVariableAlias(xVar);
  const yVarAlias = getVariableAlias(yVar);

  appendRaw(`VM_GET_TILE_XY ${variableAlias}, ${xVarAlias}, ${yVarAlias}`);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  allowedBeforeInitFade: false,
};
