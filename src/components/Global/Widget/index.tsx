import { ClerkLoading, Show, useUser } from "@clerk/react";
import { Loader } from "../Loader";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "@/lib/utils";
import { useMediaSources } from "@/hooks/useMediaSources";
import MediaConfiguration from "../MediaConfiguration";

type UserProfile = {
  status: number;
  user: {
    subscription: { plan: "PRO" | "FREE" } | null;
    studio: {
      id: string;
      screen: string | null;
      mic: string | null;
      preset: "HD" | "SD";
      camera: string | null;
      userId: string;
      plan: "PRO" | "FREE";
    } | null;
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
    clerkId: string;
  } | null;
};

const Widget = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user } = useUser();
  const { state, fetchMediaResources } = useMediaSources();

  useEffect(() => {
    if (!user?.id) return;
    fetchUserProfile(user.id).then(setProfile);
    fetchMediaResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // stable primitive — avoids infinite loop from unstable function refs

  return (
    <div className="flex flex-col h-full w-full">
      <ClerkLoading>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Loader />
          <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase animate-pulse">
            Authenticating...
          </p>
        </div>
      </ClerkLoading>

      <Show when="signed-in">
        {profile ? (
          <div className="flex-1 animate-fadeIn"> {/* defined in tailwind.config */}
            <MediaConfiguration state={state} user={profile.user} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader color="#ffffff" />
            <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase animate-pulse">
              Loading Workspace...
            </p>
          </div>
        )}
      </Show>
    </div>
  );
};

export default Widget;