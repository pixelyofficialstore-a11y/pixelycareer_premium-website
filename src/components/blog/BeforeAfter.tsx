export default function BeforeAfter({ before, after, large }: { before: string; after: string; large?: boolean }) {
  return (
    <div className={`ba ${large ? "ba-large" : ""}`}>
      <div className="ba-before">
        <span className="ba-label">Before</span>
        <p>{before}</p>
      </div>
      <div className="ba-after">
        <span className="ba-label">After</span>
        <p>{after}</p>
      </div>
    </div>
  );
}
