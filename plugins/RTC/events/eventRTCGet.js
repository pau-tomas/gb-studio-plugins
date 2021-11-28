const id = "PT_EVENT_RTC_GET";
const groups = ["Plugin Pak", "Real Time Clock"];
const name = "Store Clock Time In Variables";

const fields = [
  {
    key: "variableDays",
    label: "Days",
    type: "variable",
    width: "50%",
    defaultValue: "LAST_VARIABLE",
  },
  {
    key: "variableHours",
    label: "Hours",
    type: "variable",
    width: "50%",
    defaultValue: "LAST_VARIABLE",
  },
  {
    key: "variableMinutes",
    label: "Minutes",
    type: "variable",
    width: "50%",
    defaultValue: "LAST_VARIABLE",
  },
  {
    key: "variableSeconds",
    label: "Seconds",
    type: "variable",
    width: "50%",
    defaultValue: "LAST_VARIABLE",
  },
];

const compile = (input, helpers) => {
  const { appendRaw, getVariableAlias, _addComment } = helpers;

  const { variableDays, variableHours, variableMinutes, variableSeconds } =
    input;

  const daysVariableAlias = getVariableAlias(variableDays);
  const hoursVariableAlias = getVariableAlias(variableHours);
  const minutesVariableAlias = getVariableAlias(variableMinutes);
  const secondsVariableAlias = getVariableAlias(variableSeconds);

  _addComment("Clock: Store Clock Time In Variables");

  appendRaw(`
VM_RTC_LATCH
VM_RTC_GET        ${secondsVariableAlias}, .RTC_SECONDS 
VM_RTC_GET        ${minutesVariableAlias}, .RTC_MINUTES 
VM_RTC_GET        ${hoursVariableAlias}, .RTC_HOURS 
VM_RTC_GET        ${daysVariableAlias}, .RTC_DAYS`);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
