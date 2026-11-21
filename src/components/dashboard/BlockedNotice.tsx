"use client";

import { useRouter } from "next/navigation";
import { ShieldBan } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { clearAccessToken } from "@/lib/api";
import { SALON_INFO } from "@/lib/constants";

export default function BlockedNotice() {
  const router = useRouter();
  return (
    <div className="grid min-h-screen place-items-center bg-cream p-4">
      <div className="card max-w-md p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
          <ShieldBan className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold">Account blocked</h1>
        <p className="mt-2 text-sm text-stone-600">
          Your account has been blocked by the salon, so dashboard features are unavailable. If you think this is a
          mistake, please contact us at <a className="font-medium text-brand-700" href={`mailto:${SALON_INFO.email}`}>{SALON_INFO.email}</a>.
        </p>
        <button
          className="btn-primary mt-6"
          onClick={() =>
            signOut({
              fetchOptions: {
                onSuccess: () => {
                  clearAccessToken();
                  router.push("/");
                  router.refresh();
                },
              },
            })
          }
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
