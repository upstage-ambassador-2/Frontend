import type { Persona } from "@/lib/data";

type Props = {
  persona: Pick<Persona, "avatar" | "color">;
  size?: number;
};

export function PersonaAvatar({ persona, size = 28 }: Props) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: persona.color,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {persona.avatar}
    </div>
  );
}
