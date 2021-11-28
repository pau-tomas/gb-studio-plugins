const id = "PT_EVENT_MUTE_CHANNEL";
const groups = ["Plugin Pak", "EVENT_GROUP_MUSIC"];
const name = "Mute Channel";

const channels = ["Duty 1", "Duty 2", "Wave", "Noise"];

const fields = [
  {
    key: "channels",
    label: "Channel",
    type: "togglebuttons",
    options: [
      [0, "Duty 1"],
      [1, "Duty 2"],
      [2, "Wave"],
      [3, "Noise"],
    ],
    allowMultiple: true,
    allowNone: true,
  },
];

const compile = (input, helpers) => {
  const { appendRaw, _addComment } = helpers;

  const channels = input.channels || [];

  let channelMask = "0x0f";
  channelMask += channels.indexOf(0) > -1 ? " & 0x0e" : "";
  channelMask += channels.indexOf(1) > -1 ? " & 0x0d" : "";
  channelMask += channels.indexOf(2) > -1 ? " & 0x0b" : "";
  channelMask += channels.indexOf(3) > -1 ? " & 0x07" : "";

  _addComment("Mute Channel");

  appendRaw(`VM_MUSIC_MUTE      ^/(${channelMask})/`);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
