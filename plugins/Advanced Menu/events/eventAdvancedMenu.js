const id = "PT_EVENT_ADVANCED_MENU";
const groups = ["Plugin Pak", "EVENT_GROUP_DIALOGUE"];
const name = "Display Advanced Menu";

const MAX_OPTIONS = 16;

const wrap8Bit = (val) => (256 + (val % 256)) % 256;

const decOct = (dec) => wrap8Bit(dec).toString(8).padStart(3, "0");

const fields = [].concat(
  [
    {
      key: "variable",
      label: "Set Variable",
      type: "variable",
      defaultValue: "LAST_VARIABLE",
    },
    {
      key: "__scriptTabs",
      type: "tabs",
      defaultValue: "items",
      values: {
        items: "Items",
        text: "Layout",
      },
    },
  ],
  // Layout tab
  [
    {
      key: `width`,
      label: "Width",
      type: "number",
      min: 1,
      max: 20,
      width: "50%",
      defaultValue: 20,
      conditions: [
        {
          key: "__scriptTabs",
          in: ["text"],
        },
      ],
    },
    {
      key: `height`,
      label: "Height",
      type: "number",
      min: 1,
      max: 18,
      width: "50%",
      defaultValue: 5,
      conditions: [
        {
          key: "__scriptTabs",
          in: ["text"],
        },
      ],
    },
    {
      key: `from`,
      label: "Appear from",
      type: "select",
      options: [
        ["bottom", "↑ Bottom"],
        ["right", "← Right"],
      ],
      defaultValue: "bottom",
      conditions: [
        {
          key: "__scriptTabs",
          in: ["text"],
        },
      ],
    },
  ],
  // Items tab
  [
    {
      key: "items",
      label: "Number of options",
      type: "number",
      min: 2,
      max: MAX_OPTIONS,
      defaultValue: 2,
      conditions: [
        {
          key: "__scriptTabs",
          in: ["items"],
        },
      ],
    },
    {
      type: "break",
      conditions: [
        {
          key: "__scriptTabs",
          in: ["items"],
        },
      ],
    },
    ...Array(MAX_OPTIONS)
      .fill()
      .reduce((arr, _, i) => {
        const idx = i + 1;
        arr.push(
          {
            type: "break",
            conditions: [
              {
                key: "items",
                gte: idx,
              },
              {
                key: "__scriptTabs",
                in: ["items"],
              },
            ],
          },
          {
            key: `option_${idx}_text`,
            type: "text",
            label: `Set to '${idx}' if`,
            placeholder: `Item ${idx}`,
            defaultValue: "",
            flexBasis: "100%",
            conditions: [
              {
                key: "items",
                gte: idx,
              },
              {
                key: "__scriptTabs",
                in: ["items"],
              },
            ],
          },
          {
            key: `option${idx}_x`,
            label: "X",
            type: "number",
            min: 0,
            max: 20,
            width: "50%",
            defaultValue: 0,
            conditions: [
              {
                key: "items",
                gte: idx,
              },
              {
                key: "__scriptTabs",
                in: ["items"],
              },
            ],
          },
          {
            key: `option${idx}_y`,
            label: "Y",
            type: "number",
            min: 0,
            max: 18,
            width: "50%",
            defaultValue: 0,
            conditions: [
              {
                key: "items",
                gte: idx,
              },
              {
                key: "__scriptTabs",
                in: ["items"],
              },
            ],
          },
          {
            type: "break",
            conditions: [
              {
                key: "items",
                gte: idx,
              },
              {
                key: "__scriptTabs",
                in: ["items"],
              },
            ],
          },
          {
            key: `option${idx}_l`,
            label: "On Left move to",
            type: "number",
            min: 0,
            max: MAX_OPTIONS,
            width: "50%",
            defaultValue: 0,
            conditions: [
              {
                key: "items",
                gte: idx,
              },
              {
                key: "__scriptTabs",
                in: ["items"],
              },
            ],
          },
          {
            key: `option${idx}_r`,
            label: "On Right move to",
            type: "number",
            min: 0,
            max: MAX_OPTIONS,
            width: "50%",
            defaultValue: 0,
            conditions: [
              {
                key: "items",
                gte: idx,
              },
              {
                key: "__scriptTabs",
                in: ["items"],
              },
            ],
          },
          {
            key: `option${idx}_u`,
            label: "On Up move to",
            type: "number",
            min: 0,
            max: MAX_OPTIONS,
            width: "50%",
            defaultValue: 0,
            conditions: [
              {
                key: "items",
                gte: idx,
              },
              {
                key: "__scriptTabs",
                in: ["items"],
              },
            ],
          },
          {
            key: `option${idx}_d`,
            label: "On Down move to",
            type: "number",
            min: 0,
            max: MAX_OPTIONS,
            width: "50%",
            defaultValue: 0,
            conditions: [
              {
                key: "items",
                gte: idx,
              },
              {
                key: "__scriptTabs",
                in: ["items"],
              },
            ],
          }
        );
        return arr;
      }, []),
  ]
);

const compile = (input, helpers) => {
  const {
    _addComment,
    _overlayMoveTo,
    _loadStructuredText,
    _overlayClear,
    _overlayWait,
    _choice,
    _menuItem,
    _displayText,
    getVariableAlias,
    _addNL,
  } = helpers;

  let str = "";
  Array(input.items)
    .fill()
    .map((_, i) => {
      const idx = i + 1;
      const itemText = input[`option_${idx}_text`];
      const fieldX = input[`option${idx}_x`] || 0;
      const fieldY = input[`option${idx}_y`] || 0;

      const x = decOct(2 + fieldX);
      const y = decOct(1 + fieldY);

      if (itemText) {
        str += `\\003\\${x}\\${y}${itemText}`;
      }
    });

  const menuWidth = input.width || 20;
  const menuHeight = input.height || 5;

  const variableAlias = getVariableAlias(input.variable);

  const initialPosition = {
    x: input.from === "right" ? 20 : 20 - menuWidth,
    y: input.from === "right" ? 18 - menuHeight : 18,
  };

  const speedIn = `.OVERLAY_IN_SPEED`;
  const speedOut = `.OVERLAY_OUT_SPEED`;

  const instantTextSpeedCode = `\\001\\1`;

  _addComment("Advanced Menu");

  _overlayMoveTo(
    initialPosition.x,
    initialPosition.y,
    ".OVERLAY_SPEED_INSTANT"
  );

  _loadStructuredText(`${instantTextSpeedCode}${str}`);

  _overlayClear(0, 0, menuWidth, menuHeight, ".UI_COLOR_WHITE", true);

  _overlayMoveTo(20 - menuWidth, 18 - menuHeight, speedIn);

  _displayText();

  _overlayWait(true, [".UI_WAIT_WINDOW", ".UI_WAIT_TEXT"]);

  _choice(variableAlias, [".UI_MENU_CANCEL_B"], input.items);

  Array(input.items)
    .fill()
    .map((_, i) => {
      const clampItem = (i) => Math.min(i || 0, input.items);

      const idx = i + 1;
      const fieldX = input[`option${idx}_x`] || 0;
      const fieldY = input[`option${idx}_y`] || 0;
      const left = clampItem(input[`option${idx}_l`]);
      const right = clampItem(input[`option${idx}_r`]);
      const up = clampItem(input[`option${idx}_u`]);
      const down = clampItem(input[`option${idx}_d`]);

      _menuItem(fieldX, fieldY, left, right, up, down);
    });

  _overlayMoveTo(initialPosition.x, initialPosition.y, speedOut);
  _overlayWait(true, [".UI_WAIT_WINDOW", ".UI_WAIT_TEXT"]);

  _overlayMoveTo(0, 18, ".OVERLAY_SPEED_INSTANT");

  _addNL();
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  waitUntilAfterInitFade: true,
};
