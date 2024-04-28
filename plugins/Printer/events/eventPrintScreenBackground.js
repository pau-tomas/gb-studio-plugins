const id = "PT_PRINT_BACKGROUND";
const groups = ["Plugin Pak", "Printer"];
const name = "Print Screen Background";

const fields = [
  {
    label:
      "Prints the content of the current scene background. Requires a connected GB Printer.",
  },
  {
    key: "__collapse",
    label: "If Print Successful",
    type: "collapsable",
    defaultValue: true,
  },

  {
    key: "false",
    label: "On Success",
    type: "events",
  },
  {
    key: "__collapseElse",
    label: "Else",
    type: "collapsable",
    defaultValue: true,
    conditions: [
      {
        key: "__disableElse",
        ne: true,
      },
    ],
  },
  {
    key: "true",
    label: "On Error",
    type: "events",
    conditions: [
      {
        key: "__collapseElse",
        ne: true,
      },
      {
        key: "__disableElse",
        ne: true,
      },
    ],
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
    _jump,
    _addNL,
  } = helpers;

  _addComment("Print screen background");

  const printStatusRef = _declareLocal("print_status", 1, true);
  const isCgbRef = _declareLocal("is_cgb", 1, true);

  const printSuccessfulLabel = getNextLabel();
  const printEndLabel = getNextLabel();
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
VM_IDLE  
VM_PRINTER_DETECT       ${printStatusRef}, 30
VM_PRINT_OVERLAY        ${printStatusRef}, 0, 18, 0
`);

  appendRaw(`; Check status for error code
VM_RPN
  .R_REF      ${printStatusRef}
  .R_INT8     0xF0
  .R_OPERATOR .B_AND
  .R_STOP
VM_IF_CONST             .EQ, .ARG0, 0, ${printSuccessfulLabel}$, 1

VM_POP 1
`);

  appendRaw(`; Set the CPU back to fast.
VM_SET_UINT8            ${isCgbRef}, __is_CGB
VM_IF_CONST             .NE, ${isCgbRef}, 1, ${colorNotSupportedLabelB}$, 0

VM_CALL_NATIVE 1, _cpu_fast
`);
  _label(colorNotSupportedLabelB);

  _addNL();
  _compilePath(input.true);
  _jump(printEndLabel);
  _label(printSuccessfulLabel);
  _compilePath(input.false);
  _label(printEndLabel);

  _addNL();
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
