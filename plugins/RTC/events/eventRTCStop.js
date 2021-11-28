const id = "PT_EVENT_RTC_STOP";
const groups = ["Plugin Pak", "Real Time Clock"];
const name = "Stop Clock";

const fields = [
  {
    label: "Stop the Real Time Clock",
  },
];

const compile = (_input, helpers) => {
  const { appendRaw, _addComment } = helpers;

  _addComment("Stop Clock");

  appendRaw(`VM_RTC_START      .RTC_STOP`);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
