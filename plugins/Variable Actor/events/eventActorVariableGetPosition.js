const id = "EVENT_ACTOR_VAR_GET_POSITION";
const groups = ["Plugin Pak", "EVENT_GROUP_ACTOR", "EVENT_GROUP_VARIABLES"];
const name = "Store Variable Actor Position In Variables";

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
        key: "vectorX",
        type: "variable",
        label: "X",
        defaultValue: "LAST_VARIABLE",
        width: "50%",
        unitsField: "units",
        unitsDefault: "tiles",
        unitsAllowed: ["tiles", "pixels"],
      },
      {
        key: "vectorY",
        type: "variable",
        label: "Y",
        defaultValue: "LAST_VARIABLE",
        width: "50%",
        unitsField: "units",
        unitsDefault: "tiles",
        unitsAllowed: ["tiles", "pixels"],
      },
    ],
  },
];

const compile = (input, helpers) => {
  const { getVariableAlias, actorGetPosition, _set, _declareLocal } = helpers;

  const variableAlias = getVariableAlias(input.actorId);
  const actorRef = _declareLocal("actor", 4);
  _set(actorRef, variableAlias);

  actorGetPosition(input.vectorX, input.vectorY, input.units);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
