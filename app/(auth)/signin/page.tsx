import { auth } from "@/auth";
import { SigninButton } from "@/features/auth/components/signinButton";
import { permanentRedirect } from "next/navigation";

export default async function SignIn() {
  // Check if user session exists
  const session = await auth();

  // If session does NOT exist → show signin page
  if (!session?.user) {
    return (
      <div className="flex flex-col items-center gap-4 text-3xl p-4">
        <p>Sign in to start</p>
        <SigninButton />
      </div>
    );
  }

  // If session exists → redirect Profile page
  else permanentRedirect("/profile")
}
