export function coerceNumber(v: unknown): number {
  if (v === null || v === undefined) return 0
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.max(0, Math.floor(v))
  }
  if (typeof v === "string") {
    const n = parseInt(v.replace(/\D/g, ""), 10)
    return Number.isNaN(n) ? 0 : Math.max(0, n)
  }
  return 0
}