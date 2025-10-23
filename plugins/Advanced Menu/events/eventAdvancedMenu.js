const id = "PT_EVENT_ADVANCED_MENU";
const groups = ["Plugin Pak", "EVENT_GROUP_DIALOGUE"];
const name = "Display Advanced Menu";

const MAX_OPTIONS = 16;

const wrap8Bit = (val) => (256 + (val % 256)) % 256;

const decOct = (dec) => wrap8Bit(dec).toString(8).padStart(3, "0");

const convertSpeed = (value) => {
  if (value > 0) {
    return value - 1;
  }
  if (value === 0) {
    return -3;
  }
  return -1;
};

const fields = [].concat(
  [
    {
      key: "__scriptTabs",
      type: "tabs",
      defaultValue: "items",
      variant: "eventSection",
      values: {
        items: "Items",
        text: "Layout",
        behavior: "Behavior",
      },
    },
  ],
  // Layout tab
  [
    {
      type: "group",
      wrapItems: true,
      conditions: [
        {
          key: "__scriptTabs",
          in: ["text"],
        },
      ],
      fields: [
        {
          key: "width",
          label: "Width",
          type: "number",
          min: 1,
          max: 20,
          width: "50%",
          defaultValue: 20,
        },
        {
          key: "height",
          label: "Height",
          type: "number",
          min: 1,
          max: 18,
          width: "50%",
          defaultValue: 5,
        },
      ],
    },
    {
      key: "position",
      label: "Position",
      type: "select",
      defaultValue: "bottom",
      width: "100%",
      options: [
        ["bottom", "⬓ Bottom"],
        ["top", "⬒ Top"],
      ],
      conditions: [
        {
          key: "__scriptTabs",
          in: ["text"],
        },
        {
          parallaxEnabled: false,
        },
      ],
    },
    {
      key: "from",
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
    {
      type: "group",
      wrapItems: true,
      conditions: [
        {
          key: "__scriptTabs",
          in: ["text"],
        },
      ],
      fields: [
        {
          type: "checkbox",
          label: "Clear previous",
          key: "clearPrevious",
          width: "50%",
          defaultValue: true,
          conditions: [
            {
              key: "__scriptTabs",
              in: ["text"],
            },
          ],
        },
        {
          type: "checkbox",
          label: "Show frame",
          key: "showFrame",
          width: "50%",
          defaultValue: true,
          conditions: [
            {
              key: "__scriptTabs",
              in: ["text"],
            },
            {
              key: "clearPrevious",
              in: [true, undefined],
            },
          ],
        },
      ],
    },
  ],
  // Behavior tab
  [
    {
      type: "group",
      alignBottom: true,
      conditions: [
        {
          key: "__scriptTabs",
          in: ["behavior"],
        },
      ],
      fields: [
        {
          label: "Text Open Speed",
          key: "speedIn",
          type: "cameraSpeed",
          defaultValue: -1,
          width: "50%",
          allowDefault: true,
          conditions: [
            {
              key: "__scriptTabs",
              in: ["behavior"],
            },
          ],
        },
        {
          label: "Text Close Speed",
          key: "speedOut",
          type: "cameraSpeed",
          defaultValue: -1,
          width: "50%",
          allowDefault: true,
          conditions: [
            {
              key: "__scriptTabs",
              in: ["behavior"],
            },
          ],
        },
      ],
    },
  ],
  {
    label: "Keep visible after selection",
    key: "keepVisible",
    type: "checkbox",
    width: "100%",
    conditions: [
      {
        key: "__scriptTabs",
        in: ["behavior"],
      },
    ],
  },
  // Items tab
  [
    {
      type: "group",
      wrapItems: true,
      conditions: [
        {
          key: "__scriptTabs",
          in: ["items"],
        },
      ],
      fields: [
        {
          key: "variable",
          label: "Set Variable",
          type: "variable",
          defaultValue: "LAST_VARIABLE",
          width: "50%",
        },
        {
          type: "checkbox",
          label: "Use as default item",
          key: "setStartValue",
          defaultValue: false,
          width: "50%",
        },
      ],
    },
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
    },
    {
      type: "group",
      wrapItems: true,
      conditions: [
        {
          key: "__scriptTabs",
          in: ["items"],
        },
      ],
      fields: [
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
                ],
              },
              {
                key: `option_${idx}_text`,
                type: "textarea",
                singleLine: true,
                label: `Set to '${idx}' if`,
                placeholder: `Item ${idx}`,
                defaultValue: "",
                flexBasis: "100%",
                conditions: [
                  {
                    key: "items",
                    gt: idx,
                  },
                ],
              },
              {
                key: `option_${idx}_text`,
                type: "textarea",
                singleLine: true,
                label: `Set to '${idx}' if`,
                placeholder: `Item ${idx}`,
                defaultValue: "",
                flexBasis: "100%",
                conditions: [
                  {
                    key: "items",
                    eq: idx,
                  },
                  {
                    key: "cancelOnLastOption",
                    ne: true,
                  },
                ],
              },

              {
                key: `option_${idx}_text`,
                type: "textarea",
                singleLine: true,
                label: `Set to '0' if`,
                placeholder: `Item ${idx}`,
                defaultValue: "",
                flexBasis: "100%",
                conditions: [
                  {
                    key: "items",
                    eq: idx,
                  },
                  {
                    key: "cancelOnLastOption",
                    eq: true,
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
                ],
              },
              {
                type: "break",
                conditions: [
                  {
                    key: "items",
                    gte: idx,
                  },
                ],
              },
              {
                type: "group",
                wrapItems: false,
                conditions: [
                  {
                    key: "items",
                    gte: idx,
                  },
                ],
                fields: [
                  {
                    key: `option${idx}_l`,
                    label: "On Left move to",
                    type: "number",
                    min: 0,
                    max: MAX_OPTIONS,
                    width: "25%",
                    defaultValue: 0,
                  },
                  {
                    key: `option${idx}_r`,
                    label: "On Right move to",
                    type: "number",
                    min: 0,
                    max: MAX_OPTIONS,
                    width: "25%",
                    defaultValue: 0,
                  },
                  {
                    key: `option${idx}_u`,
                    label: "On Up move to",
                    type: "number",
                    min: 0,
                    max: MAX_OPTIONS,
                    width: "25%",
                    defaultValue: 0,
                  },
                  {
                    key: `option${idx}_d`,
                    label: "On Down move to",
                    type: "number",
                    min: 0,
                    max: MAX_OPTIONS,
                    width: "25%",
                    defaultValue: 0,
                  },
                ],
              }
            );
            return arr;
          }, []),
      ],
    },
    {
      type: "group",
      wrapItems: true,
      conditions: [
        {
          key: "__scriptTabs",
          in: ["items"],
        },
      ],
      fields: [
        {
          type: "checkbox",
          label: "Last option sets to '0'",
          key: "cancelOnLastOption",
          width: "50%",
        },
        {
          type: "checkbox",
          label: "Set to '0' if 'B' is pressed",
          key: "cancelOnB",
          defaultValue: true,
          width: "50%",
        },
      ],
    },
  ],
  // Warnings
  [
    {
      label:
        'To manually close a menu positioned at the top of the screen, you can use a "Close Non-Modal Dialogue" event or you will need to manually reset the overlay scanline cutoff with a "Set Overlay Scanline Cutoff" event.',
      labelVariant: "warning",
      flexBasis: "100%",
      conditions: [
        {
          key: "__scriptTabs",
          in: ["text", "behavior"],
        },
        {
          key: "position",
          eq: "top",
        },
        {
          key: "keepVisible",
          eq: true,
        },
        {
          parallaxEnabled: false,
        },
      ],
    },
    {
      type: "group",
      wrapItems: true,
      conditions: [
        {
          key: "__scriptTabs",
          in: ["text", "behavior"],
        },
        {
          key: "position",
          eq: "top",
        },
        {
          key: "keepVisible",
          eq: true,
        },
        {
          parallaxEnabled: false,
        },
      ],
      fields: [
        {
          type: "addEventButton",
          hideLabel: true,
          label: "Close Non-Modal Dialogue",
          defaultValue: {
            id: "EVENT_DIALOGUE_CLOSE_NONMODAL",
          },
          width: "50%",
        },
        {
          type: "addEventButton",
          hideLabel: true,
          label: "Set Overlay Scanline Cutoff",
          defaultValue: {
            id: "EVENT_OVERLAY_SET_SCANLINE_CUTOFF",
            values: {
              y: { type: "number", value: 150 },
              units: "pixels",
            },
          },
          width: "50%",
        },
      ],
    },
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
    _stackPushConst,
    _getMemUInt8,
    _setConstMemUInt8,
    _setMemUInt8,
    _idle,
    _stackPop,
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

  const menuWidth = input.width ?? 20;
  const menuHeight = input.height ?? 5;
  const renderOnTop = input.position === "top" && !helpers.scene.parallax;
  const textBoxY = renderOnTop ? 0 : 18 - menuHeight;
  const clearPrevious = input.clearPrevious ?? true;
  const showFrame = input.showFrame ?? true;
  const cancelOnLastOption = input.cancelOnLastOption ?? false;
  const cancelOnB = input.cancelOnB ?? true;
  const setStartValue = input.setStartValue ?? false;

  const variableAlias = getVariableAlias(input.variable);

  const initialPosition = {
    x: input.from === "right" ? 20 : 20 - menuWidth,
    y: input.from === "right" ? textBoxY : renderOnTop ? menuHeight : 18,
  };

  const speedIn = convertSpeed(input.speedIn);
  const speedOut = convertSpeed(input.speedOut);

  const instantTextSpeedCode = `\\001\\1`;

  _addComment("Advanced Menu");

  if (renderOnTop) {
    _stackPushConst(0);
    _getMemUInt8(".ARG0", "overlay_cut_scanline");
    _setConstMemUInt8("overlay_cut_scanline", menuHeight * 8 - 1);
  }

  if (!input.keepVisible) {
    _overlayMoveTo(
      initialPosition.x,
      initialPosition.y,
      ".OVERLAY_SPEED_INSTANT"
    );
  }

  _loadStructuredText(`${instantTextSpeedCode}${str}`);

  if (clearPrevious) {
    _overlayClear(0, 0, menuWidth, menuHeight, ".UI_COLOR_WHITE", showFrame);
  }

  _overlayMoveTo(20 - menuWidth, textBoxY, speedIn);

  _displayText();

  _overlayWait(true, [".UI_WAIT_WINDOW", ".UI_WAIT_TEXT"]);

  const choiceFlags = [];
  if (cancelOnLastOption) {
    choiceFlags.push(".UI_MENU_LAST_0");
  }
  if (cancelOnB) {
    choiceFlags.push(".UI_MENU_CANCEL_B");
  }
  if (setStartValue) {
    choiceFlags.push(".UI_MENU_SET_START");
  }

  _choice(variableAlias, choiceFlags, input.items);

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

  if (!input.keepVisible) {
    _overlayMoveTo(initialPosition.x, initialPosition.y, speedOut);
    _overlayWait(true, [".UI_WAIT_WINDOW", ".UI_WAIT_TEXT"]);
    _overlayMoveTo(0, 18, ".OVERLAY_SPEED_INSTANT");
  }

  // Reset scanline when rendering on top (as long as it wasn't non-modal)
  if (!input.keepVisible && renderOnTop) {
    _idle();
    _setMemUInt8("overlay_cut_scanline", ".ARG0");
  }

  if (renderOnTop) {
    _stackPop(1);
  }

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
