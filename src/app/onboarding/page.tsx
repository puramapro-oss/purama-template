import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata: Metadata = {
  title: "Bienvenue chez {{APP_NAME}}",
  description: "Quelques questions pour commencer ton parcours.",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, tutorial_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.tutorial_completed === true) {
    redirect("/app");
  }

  return <OnboardingFlow defaultName={profile?.full_name ?? ""} />;
}
