export type DualRoomStatus =
  | "waiting"
  | "partner_joined"
  | "ready"
  | "countdown"
  | "capturing"
  | "completed"
  | "expired"
  | "cancelled"

export type DualRoom = {
  id: string
  room_code: string
  host_user_id: string
  status: DualRoomStatus
  total_shots: number
  current_shot: number
  countdown_starts_at: string | null
  created_at: string
  expires_at: string
}

export type DualRoomMemberRole = "host" | "partner"

export type DualRoomMember = {
  id: string
  room_id: string
  user_id: string | null
  role: DualRoomMemberRole
  display_name: string | null
  is_ready: boolean
  is_connected: boolean
  joined_at: string
}