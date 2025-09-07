// If you'd like a pre-styled input wrapper you can reuse:
export function TextInput(props) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded p-3 bg-background/60",
        "ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50",
        props.className || "",
      ].join(" ")}
    />
  );
}
export function NumberInput(props) {
  return <TextInput type="number" {...props} />;
}
export function DateInput(props) {
  return <TextInput type="date" {...props} />;
}


export function Select(props) {
  return (
    <select
      {...props}
      className={[
        "rounded p-3 bg-background/60",
        "ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40",
        props.className || "",
      ].join(" ")}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded p-3 bg-background/60",
        "ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40",
        "min-h-[6rem] resize-y", // nicer default
        props.className || "",
      ].join(" ")}
    />
  );
}
