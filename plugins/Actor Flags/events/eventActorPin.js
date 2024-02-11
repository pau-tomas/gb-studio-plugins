const id = "PT_EVENT_ACTOR_PIN_TO_SCREEN";
const groups = ["Plugin Pak", "EVENT_GROUP_ACTOR"];
const name = "Pin Actor to Screen";

const fields = [].concat([
  {
    key: "actorId",
    label: "Actor",
    type: "actor",
  },
  {
    label:
      "⚠️ If the actor is pinned when this event is called its new position will be offset by the current scroll.",
  },
]);

const compile = (input, helpers) => {
  const { actorSetById, appendRaw, _declareLocal, _addComment, _addNL } =
    helpers;

  const actorRef = _declareLocal("actor", 4);
  const scrollRef = _declareLocal("scroll", 2, true);

  _addComment("Pin Actor to screen");
  console.log("ACTOR", input.actorId);
  actorSetById(input.actorId);

  appendRaw(`

VM_GET_INT16  ${scrollRef}, _scroll_x
VM_GET_INT16  ^/(${scrollRef} + 1)/, _scroll_y    

VM_ACTOR_GET_POS    ${actorRef}

VM_RPN
  .R_REF          ^/(${actorRef} + 1)/ ; X
  .R_REF          ${scrollRef}
  .R_INT16        16
  .R_OPERATOR     .MUL
  .R_OPERATOR     .SUB
  .R_REF_SET      ^/(${actorRef} + 1)/

  .R_REF          ^/(${actorRef} + 2)/ ; Y
  .R_REF          ^/(${scrollRef} + 1)/
  .R_INT16        16
  .R_OPERATOR     .MUL
  .R_OPERATOR     .SUB
  .R_REF_SET      ^/(${actorRef} + 2)/

  .R_STOP

VM_ACTOR_SET_POS  ${actorRef}

VM_ACTOR_SET_FLAGS ${actorRef}, ^/(.ACTOR_FLAG_PINNED)/, ^/(.ACTOR_FLAG_PINNED)/;
  `);

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
