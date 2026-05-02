import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import ResultClient from "./result-client"

export default async function BoothResultPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/create-account")
  }

  return <ResultClient />
}