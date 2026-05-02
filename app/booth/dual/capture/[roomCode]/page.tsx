import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import DualCaptureClient from "@/components/dual/dual-capture-client"

type Props = {
  params: Promise<{
    roomCode: string
  }>
}

export default async function DualCapturePage({ params }: Props) {
  const { roomCode } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(
      `/create-account?next=/booth/dual/capture/${encodeURIComponent(roomCode)}`
    )
  }

  return <DualCaptureClient roomCode={roomCode} />
}