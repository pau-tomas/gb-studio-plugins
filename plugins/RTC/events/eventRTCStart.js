const id = "PT_EVENT_RTC_START";
const groups = ["Plugin Pak", "Real Time Clock"];
const name = "Start Clock";

const fields = [
  {
    label: "Start the Real Time Clock",
  },
];

const compile = (_input, helpers) => {
  const { appendRaw, _addComment } = helpers;

  _addComment("Start Clock");

  appendRaw(`VM_RTC_START      .RTC_START`);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
