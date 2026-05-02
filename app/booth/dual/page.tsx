import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import CreateSessionClient from "./create-session-client"
import { getDisplayName } from "@/lib/dual/helpers"

export default async function DualModePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/create-account")
  }

  const displayName = getDisplayName({
    email: user.email,
    user_metadata: user.user_metadata ?? {},
  })

  return <CreateSessionClient displayName={displayName} />
}