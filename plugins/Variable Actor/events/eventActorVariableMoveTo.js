const id = "EVENT_ACTOR_VAR_MOVE_TO";
const groups = ["Plugin Pak", "EVENT_GROUP_ACTOR"];
const name = "Move Variable Actor To";

const fields = [
  {
    key: "actorId",
    label: "Actor",
    type: "variable",
    defaultValue: "0",
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
        unitsField: "units",
        unitsDefault: "tiles",
        unitsAllowed: ["tiles", "pixels"],
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
        unitsField: "units",
        unitsDefault: "tiles",
        unitsAllowed: ["tiles", "pixels"],
        defaultValue: {
          number: 0,
          variable: "LAST_VARIABLE",
          property: "$self$:ypos",
        },
      },
    ],
  },
  {
    key: "moveType",
    label: "Move Type",
    hideLabel: true,
    type: "moveType",
    defaultValue: "horizontal",
    flexBasis: 30,
    flexGrow: 0,
  },
  {
    key: "useCollisions",
    label: "Use Collisions",
    width: "50%",
    alignCheckbox: true,
    type: "checkbox",
    defaultValue: false,
  },
];

const compile = (input, helpers) => {
  const {
    actorMoveTo,
    actorMoveToVariables,
    variableFromUnion,
    temporaryEntityVariable,
    _declareLocal,
    _set,
    _addComment,
    getVariableAlias,
  } = helpers;

  const variableAlias = getVariableAlias(input.actorId);

  _addComment("Move Active Actor to Position");
  if (input.x.type === "number" && input.y.type === "number") {
    // If all inputs are numbers use fixed implementation

    const actorRef = _declareLocal("actor", 4);
    _set(actorRef, variableAlias);

    actorMoveTo(
      input.x.value,
      input.y.value,
      input.useCollisions,
      input.moveType,
      input.units
    );
  } else {
    // If any value is not a number transfer values into variables and use variable implementation
    const xVar = variableFromUnion(input.x, temporaryEntityVariable(0));
    const yVar = variableFromUnion(input.y, temporaryEntityVariable(1));

    const actorRef = _declareLocal("actor", 4);
    _set(actorRef, variableAlias);

    actorMoveToVariables(
      xVar,
      yVar,
      input.useCollisions,
      input.moveType,
      input.units
    );
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
