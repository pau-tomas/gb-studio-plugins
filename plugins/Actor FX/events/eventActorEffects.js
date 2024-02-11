const id = "PT_EVENT_ACTOR_EFFECTS";
const groups = ["Plugin Pak", "EVENT_GROUP_ACTOR"];
const name = "Actor FX";

const fields = [
  {
    key: "effect",
    type: "select",
    options: [
      ["split_in", "Split In"],
      ["split_out", "Split Out"],
    ],
    defaultValue: "split_in",
    width: "100%",
  },
  {
    key: "actorId",
    label: "Actor",
    type: "actor",
    defaultValue: "$self$",
    width: "100%",
  },
  {
    label: "Distance",
    key: "distance",
    type: "number",
    min: 1,
    max: 80,
    defaultValue: 20,
    unitsField: "units",
    unitsDefault: "pixels",
    unitsAllowed: ["tiles", "pixels"],
    conditions: [
      {
        key: "effect",
        in: ["split_in", "split_out"],
      },
    ],
    width: "50%",
  },
  {
    key: "speed",
    label: "Speed",
    type: "moveSpeed",
    allowNone: false,
    defaultValue: 2,
    conditions: [
      {
        key: "effect",
        in: ["split_in", "split_out"],
      },
    ],
    width: "50%",
  },
];

const compile = (input, helpers) => {
  const {
    appendRaw,
    _declareLocal,
    _addComment,
    _addNL,
    actorSetById,
    actorHide,
    actorShow,
    getNextLabel,
  } = helpers;

  const waitArgsRef = _declareLocal("wait_args", 1, true);
  const loopVarRef = _declareLocal("loop", 1);
  const actorFinalXRef = _declareLocal("final_x", 1);

  const actorRef = _declareLocal("actor", 4);
  _addComment("Sprite FX");
  actorSetById(input.actorId);
  _addNL();

  const distance = input.distance * (input.units === "pixels" ? 1 : 8);
  const steps = Math.floor(distance / input.speed);
  const subpixelDistance = distance * 16;

  const loopLabel = `${getNextLabel()}$`;

  switch (input.effect) {
    case "split_in":
      actorShow(input.actorId);

      appendRaw(`
VM_SET_CONST        ${loopVarRef}, ${steps}
VM_SET_CONST        ${waitArgsRef}, 1

VM_ACTOR_GET_POS    ${actorRef}
VM_SET              ${actorFinalXRef}, ^/(${actorRef} + 1)/

${loopLabel}: ; start_loop

  VM_RPN
    .R_REF          ${actorFinalXRef} ; X
    .R_REF          ${loopVarRef}
    .R_INT16        ${Math.floor(subpixelDistance / steps)}
    .R_OPERATOR     .MUL
    .R_OPERATOR     .ADD
    .R_REF_SET      ^/(${actorRef} + 1)/
    .R_STOP

  VM_ACTOR_SET_POS  ${actorRef}

  ; Wait 1 Frames
  VM_INVOKE         b_wait_frames, _wait_frames, 0, ${waitArgsRef}

  VM_RPN
    .R_REF          ${actorFinalXRef} ; X
    .R_REF          ${loopVarRef}
    .R_INT16        ${Math.floor(subpixelDistance / steps)}
    .R_OPERATOR     .MUL
    .R_OPERATOR     .SUB
    .R_REF_SET      ^/(${actorRef} + 1)/
    .R_STOP

  VM_ACTOR_SET_POS  ${actorRef}

  ; Wait 1 Frames
  VM_INVOKE         b_wait_frames, _wait_frames, 0, ${waitArgsRef}

VM_LOOP ${loopVarRef}, ${loopLabel}, 0
  `);
      break;
    case "split_out":
      appendRaw(`
VM_SET_CONST        ${loopVarRef}, ${steps}
VM_SET_CONST        ${waitArgsRef}, 1

VM_ACTOR_GET_POS    ${actorRef}
VM_SET              ${actorFinalXRef}, ^/(${actorRef} + 1)/

${loopLabel}: ; start_loop

  VM_RPN
    .R_REF          ${actorFinalXRef} ; X
    .R_INT16        ${steps}
    .R_REF          ${loopVarRef}
    .R_OPERATOR     .SUB
    .R_INT16        ${Math.floor(subpixelDistance / steps)}
    .R_OPERATOR     .MUL
    .R_OPERATOR     .ADD
    .R_REF_SET      ^/(${actorRef} + 1)/
    .R_STOP

  VM_ACTOR_SET_POS  ${actorRef}

  ; Wait 1 Frames
  VM_INVOKE         b_wait_frames, _wait_frames, 0, ${waitArgsRef}

  VM_RPN
    .R_REF          ${actorFinalXRef} ; X
    .R_INT16        ${steps}
    .R_REF          ${loopVarRef}
    .R_OPERATOR     .SUB
    .R_INT16        ${Math.floor(subpixelDistance / steps)}
    .R_OPERATOR     .MUL
    .R_OPERATOR     .SUB
    .R_REF_SET      ^/(${actorRef} + 1)/
    .R_STOP

  VM_ACTOR_SET_POS  ${actorRef}

  ; Wait 1 Frames
  VM_INVOKE         b_wait_frames, _wait_frames, 0, ${waitArgsRef}

VM_LOOP ${loopVarRef}, ${loopLabel}, 0
  `);

      actorHide(input.actorId);

      break;
  }
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  waitUntilAfterInitFade: true,
};
