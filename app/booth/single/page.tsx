import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import SingleBoothClient from "./single-booth-client"

export default async function SingleBoothPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/create-account")
  }

  return <SingleBoothClient />
}