import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../useAdminAuth";
import { Alert, Btn, FormField, Input } from "../ui";

export default function Login() {
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setFailure("");
    setBusy(true);
    try {
      await signIn(email, password);
      // No redirect here: signing in re-renders the panel, and the route the
      // admin asked for renders itself.
    } catch (error) {
      setFailure(error.message);
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-16">
      <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

      <div className="relative w-full max-w-sm">
        <Link to="/" className="font-display text-lg font-extrabold tracking-tight text-ink">
          Digital World <span className="text-signal">Admin</span>
        </Link>

        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink">
          Sign in
        </h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
          For staff. Everything behind this screen changes what visitors see.
        </p>

        <form noValidate onSubmit={submit} className="mt-8 grid gap-4">
          {failure && <Alert tone="error">{failure}</Alert>}

          <FormField label="Email" htmlFor="admin-email">
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </FormField>

          <FormField label="Password" htmlFor="admin-password">
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </FormField>

          <Btn variant="signal" type="submit" disabled={busy} className="mt-1 py-3">
            {busy ? "Signing in…" : "Sign in"}
          </Btn>
        </form>

        <p className="mt-8 text-[0.8125rem] leading-relaxed text-ink-soft">
          Forgotten the password? There is no reset email — ask another admin to
          add you again, or set <code className="font-mono text-[0.75rem]">ADMIN_PASSWORD</code> in
          the server's <code className="font-mono text-[0.75rem]">.env</code> and start it against
          an empty database.
        </p>
      </div>
    </div>
  );
}
