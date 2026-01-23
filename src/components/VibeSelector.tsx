import { vibes } from "@/lib/library";
import { appStore } from "@/lib/store";

export default function VibeSelector() {
  const selectedVibe = appStore((s) => s.selectedVibe);

  return (
    <select
      value={selectedVibe || "Calm"}
      onChange={(e) =>
        appStore.setState({ selectedVibe: e.target.value })
      }
      className="bg-black text-white border border-gray-700 p-2 rounded mb-4"
    >
      {vibes.map((v) => (
        <option key={v.name} value={v.name}>
          {v.name}
        </option>
      ))}
    </select>
  );
}
