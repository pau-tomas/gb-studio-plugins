const id = "PT_PRINT_BACKGROUND";
const groups = ["Plugin Pak", "Printer"];
const name = "Print Screen Background";

const fields = [
  {
    key: "__scriptTabs",
    type: "tabs",
    defaultValue: "save",
    values: {
      save: "On Error",
    },
  },
  {
    key: "true",
    label: "On Error",
    type: "events",
  },
];

const compile = (input, helpers) => {
  const {
    appendRaw,
    getNextLabel,
    _declareLocal,
    _addComment,
    _ifConst,
    _compilePath,
    _label,
    _addNL,
  } = helpers;

  _addComment("Print screen background");

  const hasPrintErrorRef = _declareLocal("print_error", 1, true);
  const printSuccesfulLabel = getNextLabel();

  appendRaw(`
VM_PUSH_CONST 0
VM_PUSH_CONST 0
VM_GET_INT16  .ARG1, _scroll_x
VM_GET_INT16  .ARG0, _scroll_y      

VM_RPN
.R_INT8 0
.R_INT8 0
.R_INT8 20
.R_INT8 18

.R_INT8 0
.R_REF  .ARG1
.R_INT16 8
.R_OPERATOR  .DIV
.R_OPERATOR .MAX

.R_INT8 0
.R_REF  .ARG0
.R_INT16 8
.R_OPERATOR  .DIV
.R_OPERATOR .MAX

.R_STOP

VM_OVERLAY_SET_SUBMAP_EX  .ARG5

VM_POP  6
`);

  appendRaw(`
VM_PRINTER_DETECT       ${hasPrintErrorRef}, 30
VM_PRINT_OVERLAY        ${hasPrintErrorRef}, 0, 18
`);

  _ifConst(".EQ", hasPrintErrorRef, 0, printSuccesfulLabel, 0);
  _addNL();
  _compilePath(input.true);
  _label(printSuccesfulLabel);
  _addNL();
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
