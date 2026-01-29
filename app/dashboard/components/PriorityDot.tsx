export default function PriorityDot({
  priority,
}: {
  priority?: Task["priority"];
}) {
  const color =
    priority === "high"
      ? "bg-red-500"
      : priority === "medium"
        ? "bg-yellow-400"
        : "bg-green-500";

  return (
    <span
      className={`w-3 h-3 rounded-full ${color} absolute right-1 top-1`}
      title={`Priority: ${priority ?? "low"}`}
    />
  );
}
