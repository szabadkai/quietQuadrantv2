const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 6, rng = Math.random) {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(rng() * CHARSET.length);
    code += CHARSET[index];
  }
  return code;
}

export function normalizeRoomCode(code) {
  return (code ?? "")
    .toString()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}
