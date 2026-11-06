/** Renders copy with [CONFIRM ...] items in a dashed box, so they are easy to spot, and **bold** text. */
export default function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\]|\*\*[^*]+\*\*)/).map((part, i) => {
        if (part.startsWith("[")) {
          return (
            <span key={i} className="confirm">
              {part}
            </span>
          );
        }
        if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        return part;
      })}
    </>
  );
}
