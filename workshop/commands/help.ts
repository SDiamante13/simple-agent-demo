export const help = (): void => {
  console.log(
    [
      "Slash commands (intercepted by the CLI, not seen by the agent):",
      "  :where      Show the lesson banner",
      "  :next       Advance to the next lesson tag",
      "  :prev       Go back to the previous lesson tag",
      "  :goto N     Jump to lesson N",
      "  :diff       Show what this lesson added vs. the previous one",
      "  :help       This message",
      "",
      "Anything not starting with ':' is sent to the agent.",
    ].join("\n")
  );
};
