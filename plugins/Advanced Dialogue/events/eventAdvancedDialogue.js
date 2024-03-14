const id = "PT_EVENT_ADVANCED_DIALOGUE";
const groups = ["Plugin Pak", "EVENT_GROUP_DIALOGUE"];
const name = "Display Advanced Dialogue";

const wrap8Bit = (val) => (256 + (val % 256)) % 256;

const decOct = (dec) => wrap8Bit(dec).toString(8).padStart(3, "0");

const fields = [].concat(
  [
    {
      key: "__scriptTabs",
      type: "tabs",
      defaultValue: "text",
      values: {
        text: "Text",
        layout: "Layout",
      },
    },
  ],
  // Layout tab
  [
    {
      type: "group",
      conditions: [
        {
          key: "__scriptTabs",
          in: ["layout"],
        },
      ],
      fields: [
        {
          key: `minHeight`,
          label: "Min Height",
          type: "number",
          min: 1,
          max: 18,
          width: "50%",
          defaultValue: 4,
        },
        {
          key: `maxHeight`,
          label: "Max Height",
          type: "number",
          min: 1,
          max: 18,
          width: "50%",
          defaultValue: 7,
        },
      ],
    },
    {
      key: `position`,
      label: "Position",
      type: "select",
      defaultValue: "bottom",
      options: [
        ["bottom", "Bottom"],
        ["top", "Top"],
      ],
      conditions: [
        {
          key: "__scriptTabs",
          in: ["layout"],
        },
      ],
    },
    {
      label:
        "⚠️ Displaying the dialogue on top won't work in scenes with parallax.",
      conditions: [
        {
          key: "__scriptTabs",
          in: ["layout"],
        },
        {
          key: "position",
          eq: "top",
        },
      ],
    },
    {
      key: `boxWidth`,
      label: "Width",
      type: "select",
      defaultValue: "100-full",
      options: [
        ["100-full", "Full"],
        ["50-left", "50% Left Aligned"],
        ["50-right", "50% Right Aligned"],
        ["75-left", "75% Left Aligned"],
        ["75-right", "75% Right Aligned"],
      ],
      conditions: [
        {
          key: "__scriptTabs",
          in: ["layout"],
        },
      ],
    },
    {
      type: "group",
      conditions: [
        {
          key: "__scriptTabs",
          in: ["layout"],
        },
      ],
      fields: [
        {
          key: `showBorder`,
          label: "Show Border",
          type: "checkbox",
          defaultValue: "true",
          width: "50%",
          conditions: [
            {
              key: "__scriptTabs",
              in: ["layout"],
            },
          ],
        },
        {
          key: `clearPrevious`,
          label: "Clear Previous Content",
          type: "checkbox",
          defaultValue: true,
          width: "50%",
          conditions: [
            {
              key: "__scriptTabs",
              in: ["layout"],
            },
          ],
        },
      ],
    },
    {
      type: "group",
      conditions: [
        {
          key: "__scriptTabs",
          in: ["layout"],
        },
      ],
      fields: [
        {
          key: `textX`,
          label: "Text X",
          type: "number",
          min: 0,
          max: 20,
          defaultValue: 1,
        },
        {
          key: `textY`,
          label: "Text Y",
          type: "number",
          min: 0,
          max: 18,
          defaultValue: 1,
        },
        {
          key: `textHeight`,
          label: "Text Max Height",
          type: "number",
          min: 1,
          max: 18,
          defaultValue: 3,
        },
      ],
    },
    {
      key: `closeWhen`,
      label: "Close When...",
      type: "select",
      defaultValue: "key",
      options: [
        ["key", "Button Pressed"],
        ["text", "Text Finishes"],
        ["notModal", "Never (Non-Modal)"],
      ],
      conditions: [
        {
          key: "__scriptTabs",
          in: ["layout"],
        },
      ],
    },
    {
      label:
        '⚠️ Don\'t forget to reset "overlay_cut_scanline" after manually closing a non-modal dialogue displaying on top.',
      conditions: [
        {
          key: "__scriptTabs",
          in: ["layout"],
        },
        {
          key: "position",
          eq: "top",
        },
        {
          key: "closeWhen",
          eq: "notModal",
        },
      ],
    },
    {
      key: "closeButton",
      type: "togglebuttons",
      options: [
        ["a", "A"],
        ["b", "B"],
        ["any", "Any"],
      ],
      allowNone: false,
      defaultValue: "a",
      conditions: [
        {
          key: "__scriptTabs",
          in: ["layout"],
        },
        {
          key: "closeWhen",
          eq: "key",
        },
      ],
    },
  ],
  // Text tab
  [
    {
      key: "text",
      type: "textarea",
      placeholder: "Text...",
      multiple: true,
      defaultValue: "",
      flexBasis: "100%",
      conditions: [
        {
          key: "__scriptTabs",
          in: ["text"],
        },
      ],
    },
    {
      key: "avatarId",
      type: "avatar",
      toggleLabel: "Add Avatar",
      label: "Avatar",
      defaultValue: "",
      optional: true,
      conditions: [
        {
          key: "__scriptTabs",
          in: ["text"],
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
    _displayText,
    appendRaw,
    _addNL,
    _stackPop,
  } = helpers;

  const maxHeight = input.maxHeight || 7;
  const minHeight = input.minHeight || 4;
  const textX = input.textX === null ? 1 : input.textX;
  const textY = input.textY === null ? 1 : input.textY;
  const textHeight = input.textHeight === null ? 3 : input.textHeight;
  const renderOnTop = input.position === "top";
  const renderWidth = input.boxWidth || "100-full";
  const renderOverlay = {
    xOffset: 0,
    width: 20,
  };
  const isModal = input.closeWhen !== "notModal";

  console.log(input);
  console.log(maxHeight, minHeight, textX, textY, textHeight);

  const speedIn = `.OVERLAY_IN_SPEED`;
  const speedOut = `.OVERLAY_OUT_SPEED`;

  const textInputs = Array.isArray(input.text) ? input.text : [input.text];
  const avatarId = input.avatarId;

  const initialNumLines = textInputs.map(
    (textBlock) => textBlock.split("\n").length
  );

  console.log(input);
  const minNumLines = Math.min(
    maxHeight,
    Math.max.apply(null, initialNumLines)
  );

  console.log(minHeight, minNumLines, maxHeight);

  switch (renderWidth) {
    case "100-full":
      renderOverlay.xOffset = 0;
      renderOverlay.width = 20;
      break;
    case "50-left":
      renderOverlay.xOffset = 0;
      renderOverlay.width = 10;
      break;
    case "50-right":
      renderOverlay.xOffset = 10;
      renderOverlay.width = 10;
      break;
    case "75-left":
      renderOverlay.xOffset = 0;
      renderOverlay.width = 15;
      break;
    case "75-right":
      renderOverlay.xOffset = 5;
      renderOverlay.width = 15;
      break;
  }

  const textBoxHeight = Math.max(minNumLines, minHeight);
  const textBoxY = renderOnTop ? 0 : 18 - textBoxHeight;

  const x = decOct(1 + textX + (avatarId ? 3 : 0));
  const y = decOct(1 + textY);
  const textPosSequence = `\\003\\${x}\\${y}`;

  _addComment("Advanced Text Dialogue");

  if (renderOnTop) {
    appendRaw(`; Set overlay scanline cut
VM_PUSH_CONST 0
VM_GET_UINT8 .ARG0, _overlay_cut_scanline
VM_SET_CONST_UINT8 _overlay_cut_scanline, ${textBoxHeight * 8 - 1}`);
  }

  textInputs.forEach((text, textIndex) => {
    let avatarIndex = undefined;
    if (avatarId) {
      const { avatars } = helpers;
      avatarIndex = avatars.findIndex((a) => a.id === avatarId);
      if (avatarIndex < 0) {
        avatarIndex = undefined;
      }
    }

    let endDelaySequence = "";
    if (input.closeWhen === "text") {
      endDelaySequence = `\\001\\${decOct(8)}\\001\\${decOct(6)}`;
    } else if (textIndex !== textInputs.length - 1) {
      endDelaySequence = `\\001\\${decOct(7)}`;
    }
    _loadStructuredText(
      `${textPosSequence}${text}${endDelaySequence}`,
      avatarIndex,
      textHeight
    );

    if (input.clearPrevious) {
      _overlayClear(
        0,
        0,
        renderOverlay.width,
        textBoxHeight,
        ".UI_COLOR_WHITE",
        input.showBorder
      );
    }

    // If there's an offset then we need to offset the starting position of the overlay.
    // Use -3 for speed to instantly move the overlay to just below the screen with the correct offsets.
    // If we don't do this then the overlay will move in from the bottom left across the screen instead of straight up
    if (textIndex === 0 && renderOverlay.xOffset > 0) {
      _overlayMoveTo(renderOverlay.xOffset, 18, -3);
    }

    // Now push the overlay up with the correct offsets
    if (textIndex === 0) {
      _overlayMoveTo(renderOverlay.xOffset, textBoxY, speedIn);
    }

    appendRaw(
      `VM_OVERLAY_SET_SCROLL   ${textX + (avatarId ? 3 : 0)}, ${textY}, ${
        (input.showBorder ? 19 : 20) -
        (avatarId ? 3 : 0) -
        textX -
        renderOverlay.xOffset
      }, ${textHeight}, .UI_COLOR_WHITE`
    );

    _displayText();

    if (isModal) {
      const waitFlags = [".UI_WAIT_WINDOW", ".UI_WAIT_TEXT"];
      if (input.closeWhen === "key") {
        console.log("BUTTON", input.closeButton);
        if (input.closeButton === "a") {
          waitFlags.push(".UI_WAIT_BTN_A");
        }
        if (input.closeButton === "b") {
          waitFlags.push(".UI_WAIT_BTN_B");
        }
        if (input.closeButton === "any") {
          waitFlags.push(".UI_WAIT_BTN_ANY");
        }
      }
      _overlayWait(isModal, waitFlags);
    }

    if (textIndex === textInputs.length - 1) {
      if (isModal) {
        _overlayMoveTo(renderOverlay.xOffset, 18, speedOut);
        _overlayWait(isModal, [".UI_WAIT_WINDOW", ".UI_WAIT_TEXT"]);
      }
    }
  });

  if (isModal && renderOnTop) {
    appendRaw(`; Reset overlay scanline cut
VM_IDLE
VM_SET_UINT8 _overlay_cut_scanline, .ARG0`);
  }

  if (renderOnTop) {
    appendRaw(`VM_POP 1`);
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
