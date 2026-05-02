export function createRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = "AMR-"

  for (let i = 0; i < 3; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }

  result += "-"

  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }

  return result
}

export function getDisplayName(user: {
  email?: string
  user_metadata?: Record<string, unknown>
}) {
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null

  if (fullName?.trim()) return fullName.trim()

  const name =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : null

  if (name?.trim()) return name.trim()

  if (user.email) return user.email.split("@")[0]

  return "Guest"
}

export function getInviteLink(roomCode: string) {
  if (typeof window === "undefined") return ""
  return `${window.location.origin}/booth/dual/room/${roomCode}`
}

export function getTimeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()

  if (diff <= 0) return "00:00"

  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}