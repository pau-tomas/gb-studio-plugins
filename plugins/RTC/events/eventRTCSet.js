const id = "PT_EVENT_RTC_SET";
const groups = ["Plugin Pak", "Real Time Clock"];
const name = "Set Clock Time";

const timeField = (
  label,
  variableFieldKey,
  valueFieldKey,
  typeFieldKey,
  min,
  max
) => {
  return {
    type: "group",
    width: "50%",
    fields: [
      {
        key: variableFieldKey,
        label: label,
        type: "variable",
        defaultValue: "LAST_VARIABLE",
        conditions: [
          {
            key: typeFieldKey,
            eq: "variable",
          },
        ],
      },
      {
        key: valueFieldKey,
        label: label,
        type: "number",
        defaultValue: 0,
        min: min,
        max: max,
        conditions: [
          {
            key: typeFieldKey,
            eq: "number",
          },
        ],
      },
      {
        key: typeFieldKey,
        type: "selectbutton",
        options: [
          ["variable", "variable"],
          ["number", "number"],
        ],
        inline: true,
        defaultValue: "number",
      },
    ],
  };
};

const fields = [
  timeField("Days", "variableDays", "valueDays", "typeDays", 0, 512),
  timeField("Hours", "variableHours", "valueHours", "typeHours", 0, 23),
  timeField("Minutes", "variableMinutes", "valueMinutes", "typeMinutes", 0, 59),
  timeField("Seconds", "variableSeconds", "valueSeconds", "typeSeconds", 0, 59),
];

const compile = (input, helpers) => {
  const {
    appendRaw,
    getVariableAlias,
    _isArg,
    _stackPushConst,
    _addComment,
    _stackPop,
    _stackPush,
    _stackPushInd,
    _stackOffset,
  } = helpers;

  const {
    variableDays,
    variableHours,
    variableMinutes,
    variableSeconds,
    valueDays,
    valueHours,
    valueMinutes,
    valueSeconds,
    typeDays,
    typeHours,
    typeMinutes,
    typeSeconds,
  } = input;

  const daysVariableAlias = getVariableAlias(variableDays);
  const hoursVariableAlias = getVariableAlias(variableHours);
  const minutesVariableAlias = getVariableAlias(variableMinutes);
  const secondsVariableAlias = getVariableAlias(variableSeconds);

  _addComment("Clock: Set Clock Time");

  if (typeSeconds === "number") {
    _stackPushConst(valueSeconds, "Seconds");
  } else {
    if (_isArg(secondsVariableAlias)) {
      _stackPushInd(_stackOffset(secondsVariableAlias), "Seconds");
    } else {
      _stackPush(secondsVariableAlias, "Seconds");
    }
  }

  if (typeMinutes === "number") {
    _stackPushConst(valueMinutes, "Minutes");
  } else {
    if (_isArg(minutesVariableAlias)) {
      _stackPushInd(_stackOffset(minutesVariableAlias), "Minutes");
    } else {
      _stackPush(minutesVariableAlias, "Minutes");
    }
  }

  if (typeHours === "number") {
    _stackPushConst(valueHours, "Hours");
  } else {
    if (_isArg(hoursVariableAlias)) {
      _stackPushInd(_stackOffset(hoursVariableAlias), "Hours");
    } else {
      _stackPush(hoursVariableAlias, "Hours");
    }
  }

  if (typeDays === "number") {
    _stackPushConst(valueDays, "Days");
  } else {
    if (_isArg(daysVariableAlias)) {
      _stackPushInd(_stackOffset(daysVariableAlias), "Days");
    } else {
      _stackPush(daysVariableAlias, "Days");
    }
  }

  appendRaw(`
VM_RTC_LATCH
VM_RTC_SET        .ARG3, .RTC_SECONDS 
VM_RTC_SET        .ARG2, .RTC_MINUTES 
VM_RTC_SET        .ARG1, .RTC_HOURS 
VM_RTC_SET        .ARG0, .RTC_DAYS`);

  _stackPop(4);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
