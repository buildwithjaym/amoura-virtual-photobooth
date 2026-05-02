import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import DualRoomClient from "@/components/dual/dual-room-client"

type Props = {
  params: Promise<{
    roomCode: string
  }>
}

export default async function DualRoomPage({ params }: Props) {
  const { roomCode } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(
      `/create-account?next=/booth/dual/room/${encodeURIComponent(roomCode)}`
    )
  }

  return <DualRoomClient roomCode={roomCode} />
}