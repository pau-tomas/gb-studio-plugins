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
    _compilePath,
    _label,
    _addNL,
  } = helpers;

  _addComment("Print screen background");

  const printStatusRef = _declareLocal("print_status", 1, true);
  const isCgbRef = _declareLocal("is_cgb", 1, true);

  const printSuccesfulLabel = getNextLabel();
  const colorNotSupportedLabelA = getNextLabel();
  const colorNotSupportedLabelB = getNextLabel();

  appendRaw(`; Copy the background tiles to the overlay
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

VM_POP  8
`);

  appendRaw(`; Fast CPU is to fast for printer. 
; If in Color supported set the CPU to slow. 

VM_SET_UINT8            ${isCgbRef}, __is_CGB
VM_IF_CONST             .NE, ${isCgbRef}, 1, ${colorNotSupportedLabelA}$, 0

VM_CALL_NATIVE 1, _cpu_slow
`);
  _label(colorNotSupportedLabelA);

  appendRaw(`; Detect printer and print
VM_PRINTER_DETECT       ${printStatusRef}, 30
VM_PRINT_OVERLAY        ${printStatusRef}, 0, 18, 0
`);

  appendRaw(`; Check status for error code
VM_RPN
  .R_REF      ${printStatusRef}
  .R_INT8     0xF0
  .R_OPERATOR .B_AND
  .R_STOP
VM_IF_CONST             .EQ, .ARG0, 0, ${printSuccesfulLabel}$, 1

VM_POP 1
`);

  _addNL();
  _compilePath(input.true);
  _label(printSuccesfulLabel);

  appendRaw(`; Set the CPU back to fast.
VM_SET_UINT8            ${isCgbRef}, __is_CGB
VM_IF_CONST             .NE, ${isCgbRef}, 1, ${colorNotSupportedLabelB}$, 0

VM_CALL_NATIVE 1, _cpu_fast
`);
  _label(colorNotSupportedLabelB);

  _addNL();
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
