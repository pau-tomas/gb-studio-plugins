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
  const { appendRaw, compileEvents, warnings } = helpers;

  warnings(
    '"Locked Event Group" is deprecated and will be removed from the Plugin Pak in the future. Use the "Script Lock" event instead.'
  );

  appendRaw("VM_LOCK");
  compileEvents(input.true);
  appendRaw("VM_UNLOCK");
};

module.exports = {
  deprecated: true,
  id,
  name,
  groups,
  fields,
  compile,
};
