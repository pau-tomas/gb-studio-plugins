const id = "PT_EVENT_GROUP_LOCK";
const groups = ["Plugin Pak", "EVENT_GROUP_MISC"];
const name = "Locked Event Group";

const fields = [
  {
    key: "true",
    type: "events",
    label: "locked",
  },
];

const compile = (input, helpers) => {
  const { appendRaw, compileEvents } = helpers;

  appendRaw("VM_LOCK");
  compileEvents(input.true);
  appendRaw("VM_UNLOCK");
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
