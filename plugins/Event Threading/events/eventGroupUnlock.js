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
  const { appendRaw, compileEvents, warnings } = helpers;

  warnings(
    '"Unlocked Event Group" is deprecated and will be removed from the Plugin Pak in the future. Use the "Script Unlock" event instead.'
  );

  appendRaw("VM_UNLOCK");
  compileEvents(input.true);
  appendRaw("VM_LOCK");
};

module.exports = {
  // deprecated: true,
  id,
  name,
  groups,
  fields,
  compile,
};
