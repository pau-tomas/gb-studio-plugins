const id = "PT_EVENT_GROUP_UNLOCK";
const groups = ["Plugin Pak", "EVENT_GROUP_MISC"];
const name = "Unlocked Event Group";

const fields = [
  {
    key: "true",
    type: "events",
    label: "unlocked",
  },
];

const compile = (input, helpers) => {
  const { appendRaw, compileEvents } = helpers;

  appendRaw("VM_UNLOCK");
  compileEvents(input.true);
  appendRaw("VM_LOCK");
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
