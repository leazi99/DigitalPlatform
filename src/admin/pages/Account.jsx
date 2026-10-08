import { useState } from "react";
import { del, post } from "../../lib/api";
import { useAdminAuth } from "../useAdminAuth";
import { useFetch } from "../useAdmin";
import {
  Alert,
  Badge,
  Btn,
  Card,
  ConfirmBtn,
  FormField,
  Input,
  Loading,
  Page,
  TD,
  TH,
  Table,
} from "../ui";
import {
  formatDateTime,
} from "../format";

/** Your own password, who else can sign in, and how long the visitor log is kept. */
export default function Account() {
  const { admin } = useAdminAuth();

  return (
    <Page title="Account" lead={`Signed in as ${admin?.email}.`}>
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <ChangePassword />
        <Admins />
        <PurgeAnalytics />
      </div>
    </Page>
  );
}

function ChangePassword() {
  const { refreshToken } = useAdminAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [fields, setFields] = useState({});
  const [failure, setFailure] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setFailure("");
    setFields({});
    setDone(false);

    if (next !== again) {
      setFields({ again: "Those two do not match." });
      return;
    }

    setBusy(true);
    try {
      const result = await post("/auth/password", { current, next });
      // Changing the password invalidates every token signed before it,
      // including this tab's. The server hands back a fresh one.
      refreshToken(result.token);
      setCurrent("");
      setNext("");
      setAgain("");
      setDone(true);
    } catch (error) {
      setFields(error.fields ?? {});
      setFailure(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Your password">
      <form onSubmit={submit} noValidate className="grid gap-4 px-5 py-5 sm:px-6">
        {failure && <Alert tone="error">{failure}</Alert>}
        {done && (
          <Alert tone="success">
            Changed. Anyone signed in as you elsewhere has been signed out.
          </Alert>
        )}

        <FormField label="Current password" error={fields.current} htmlFor="pw-current">
          <Input
            id="pw-current"
            type="password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            autoComplete="current-password"
            required
          />
        </FormField>

        <FormField label="New password" hint="8 characters or more" error={fields.next} htmlFor="pw-next">
          <Input
            id="pw-next"
            type="password"
            value={next}
            onChange={(event) => setNext(event.target.value)}
            autoComplete="new-password"
            required
          />
        </FormField>

        <FormField label="New password again" error={fields.again} htmlFor="pw-again">
          <Input
            id="pw-again"
            type="password"
            value={again}
            onChange={(event) => setAgain(event.target.value)}
            autoComplete="new-password"
            required
          />
        </FormField>

        <Btn variant="signal" type="submit" disabled={busy} className="justify-self-start">
          {busy ? "Changing…" : "Change password"}
        </Btn>
      </form>
    </Card>
  );
}

function Admins() {
  const { admin } = useAdminAuth();
  const { data, loading, error, reload } = useFetch("/admin/admins");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [fields, setFields] = useState({});
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(event) {
    event.preventDefault();
    setFailure("");
    setFields({});
    setBusy(true);
    try {
      await post("/admin/admins", { email, name, password });
      setEmail("");
      setName("");
      setPassword("");
      reload();
    } catch (failed) {
      setFields(failed.fields ?? {});
      setFailure(failed.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    setFailure("");
    try {
      await del(`/admin/admins/${id}`);
      reload();
    } catch (failed) {
      setFailure(failed.message);
    }
  }

  return (
    <Card title="Who can sign in" lead="Everyone here can change anything on the website.">
      {error && (
        <div className="px-5 pt-4 sm:px-6">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {loading && !data ? (
        <Loading />
      ) : (
        <Table minWidth="min-w-[22rem]">
          <thead>
            <tr>
              <TH>Email</TH>
              <TH>Last signed in</TH>
              <TH className="w-24 text-right">Actions</TH>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((row) => (
              <tr key={row.id}>
                <TD>
                  <span className="font-semibold text-ink">{row.email}</span>
                  {row.name && <span className="block text-[0.8125rem] text-ink-soft">{row.name}</span>}
                  {row.id === admin?.id && (
                    <span className="mt-1 inline-block">
                      <Badge tone="signal">You</Badge>
                    </span>
                  )}
                </TD>
                <TD className="text-ink-soft">{row.lastLoginAt ? formatDateTime(row.lastLoginAt) : "Never"}</TD>
                <TD className="text-right">
                  {row.id !== admin?.id && (
                    <ConfirmBtn onConfirm={() => remove(row.id)} label="Remove" confirmLabel="Really remove?" />
                  )}
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <form onSubmit={add} noValidate className="grid gap-3 border-t border-rule px-5 py-5 sm:px-6">
        <p className="text-[0.8125rem] font-semibold text-ink">Add another admin</p>
        {failure && <Alert tone="error">{failure}</Alert>}

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Email" error={fields.email} htmlFor="new-admin-email">
            <Input
              id="new-admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="off"
              required
            />
          </FormField>
          <FormField label="Name" hint="Optional" htmlFor="new-admin-name">
            <Input
              id="new-admin-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="off"
            />
          </FormField>
        </div>

        <FormField
          label="Password to give them"
          hint="8 characters or more"
          error={fields.password}
          htmlFor="new-admin-password"
        >
          <Input
            id="new-admin-password"
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="off"
            required
          />
        </FormField>

        <p className="text-[0.8125rem] leading-relaxed text-ink-soft">
          Tell them to change it once they are in. It is shown in plain text here because you have to
          be able to pass it on — nothing emails it for you.
        </p>

        <Btn variant="outline" type="submit" disabled={busy} className="justify-self-start">
          {busy ? "Adding…" : "Add admin"}
        </Btn>
      </form>
    </Card>
  );
}

/** Keeping a visitor log forever is a liability rather than an asset. */
function PurgeAnalytics() {
  const [days, setDays] = useState(365);
  const [result, setResult] = useState(null);
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);

  async function purge() {
    setBusy(true);
    setFailure("");
    setResult(null);
    try {
      setResult(await post("/admin/analytics/purge", { days: Number(days) }));
    } catch (error) {
      setFailure(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Clear out old visitor data" lead="Deletes pages, actions and visits older than this. Enrolments and enquiries are never touched.">
      <div className="grid gap-4 px-5 py-5 sm:px-6">
        {failure && <Alert tone="error">{failure}</Alert>}
        {result && (
          <Alert tone="success">
            Removed {result.sessions} visits and {result.visitors} visitors older than {result.days}{" "}
            days.
          </Alert>
        )}

        <FormField label="Keep the last" hint="Days" htmlFor="purge-days">
          <Input
            id="purge-days"
            type="number"
            min="1"
            max="3650"
            value={days}
            onChange={(event) => setDays(event.target.value)}
            className="max-w-[10rem]"
          />
        </FormField>

        <ConfirmBtn
          onConfirm={purge}
          disabled={busy}
          label={busy ? "Clearing…" : "Clear older than that"}
          confirmLabel="Really delete it?"
          className="justify-self-start"
        />
      </div>
    </Card>
  );
}
