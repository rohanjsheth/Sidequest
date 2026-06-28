// deterministic per-person avatar color — same seed → same hue everywhere
function hashString(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function avatarColor(seed: string) {
  const hue = hashString(seed) % 360;
  return {
    bg: `hsl(${hue}, 70%, 92%)`,
    fg: `hsl(${hue}, 55%, 35%)`,
  };
}
