const id = "PT_EVENT_BACKGROUND_TEXT";
const groups = ["Plugin Pak", "EVENT_GROUP_DIALOGUE"];
const name = "Display Background Text";

const wrap8Bit = (val) => (256 + (val % 256)) % 256;

const decOct = (dec) => wrap8Bit(dec).toString(8).padStart(3, "0");

const fields = [
  {
    key: "text",
    type: "text",
    placeholder: "",
    multiple: false,
    defaultValue: "",
    flexBasis: "100%",
  },
  {
    key: `x`,
    label: "X",
    type: "number",
    min: 0,
    max: 19,
    width: "50%",
    defaultValue: 1,
  },
  {
    key: `y`,
    label: "Y",
    type: "number",
    min: 0,
    max: 17,
    width: "50%",
    defaultValue: 1,
  },
];

const compile = (input, helpers) => {
  const {
    appendRaw,
    _addComment,
    _loadStructuredText,
    _displayText,
    _overlayWait,
    _addNL,
  } = helpers;

  const x = decOct(1 + input.x);
  const y = decOct(1 + input.y);

  _addComment("Background Text");

  appendRaw(`VM_PUSH_CONST 0
VM_GET_UINT8 .ARG0, _overlay_priority
VM_SET_CONST_UINT8 _overlay_priority, 0`);

  appendRaw(`VM_SWITCH_TEXT_LAYER .TEXT_LAYER_BKG`);

  _loadStructuredText(`\\003\\${x}\\${y}${input.text}`);

  _displayText();

  _overlayWait(false, [".UI_WAIT_TEXT"]);

  _addNL();

  appendRaw(`VM_SWITCH_TEXT_LAYER .TEXT_LAYER_WIN`);

  appendRaw(`VM_SET_UINT8 _overlay_priority, .ARG0
VM_POP 1`);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  waitUntilAfterInitFade: true,
};
