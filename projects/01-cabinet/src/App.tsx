import { useSession } from "./hooks.ts";
import { LoginScreen, Workspace } from "./views.tsx";

export const Root = () => {
  const session = useSession();

  return session.session ? (
    <Workspace session={session.session} onLogout={session.signOut} onUser={session.updateUser} />
  ) : (
    <LoginScreen session={session} />
  );
};
