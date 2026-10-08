import { useState } from "react";
import { put } from "../../lib/api";
import { SettingInput } from "../fields";
import { useFetch, useMeta } from "../useAdmin";
import { Alert, Btn, Card, Loading, Page } from "../ui";

/**
 * The copy that exists once per site: the company's details, the section
 * headings, the hero on each page, the nav.
 *
 * Lists that can grow — courses, services, testimonials — are their own screens.
 * This one is for the fixed furniture, one block at a time, each with its own
 * save button so nothing else is touched by accident.
 */
export default function SiteContent() {
  const { meta } = useMeta();
  const { data: blocks, loading, error } = useFetch("/admin/settings");

  if (error) {
    return (
      <Page title="Page copy">
        <Alert tone="error">{error}</Alert>
      </Page>
    );
  }

  if (!meta || loading || !blocks) {
    return (
      <Page title="Page copy">
        <Card>
          <Loading />
        </Card>
      </Page>
    );
  }

  const groups = {};
  for (const [key, spec] of Object.entries(meta.settings)) {
    const group = spec.group ?? "Other";
    groups[group] ??= [];
    groups[group].push([key, spec]);
  }

  return (
    <Page
      title="Page copy"
      lead="The wording around everything else — headings, the hero, the company's own details. Saved changes are live on the website immediately."
    >
      <div className="space-y-10">
        {Object.entries(groups).map(([group, entries]) => (
          <section key={group}>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">{group}</h2>
            <div className="mt-4 space-y-5">
              {entries.map(([key, spec]) => (
                <Block key={key} settingKey={key} spec={spec} stored={blocks[key]} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Page>
  );
}

/**
 * One content block.
 *
 * It owns both the draft and the last saved copy, so the Save button can be
 * disabled until something has actually changed, and Undo has something to go
 * back to. The draft starts as the whole stored value, which is what keeps the
 * fields this panel does not show — a sector's route, for instance — from being
 * dropped on save.
 */
function Block({ settingKey, spec, stored }) {
  const [baseline, setBaseline] = useState(stored);
  const [draft, setDraft] = useState(stored);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [saved, setSaved] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);

  async function save() {
    setBusy(true);
    setFailure("");
    try {
      const result = await put(`/admin/settings/${settingKey}`, { value: clean(draft) });
      setBaseline(result.value);
      setDraft(result.value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setFailure(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title={spec.label}
      lead={settingKey}
      actions={
        <>
          {saved && (
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-signal-deep">
              Saved
            </span>
          )}
          {dirty && (
            <Btn variant="ghost" onClick={() => setDraft(baseline)} disabled={busy}>
              Undo
            </Btn>
          )}
          <Btn variant="signal" onClick={save} disabled={busy || !dirty}>
            {busy ? "Saving…" : "Save"}
          </Btn>
        </>
      }
    >
      <div className="grid gap-4 px-5 py-5 sm:px-6">
        {failure && <Alert tone="error">{failure}</Alert>}

        {/* Three shapes of block: a bare list of rows, an object keyed by a
            fixed set of names, or a flat set of fields. */}
        {spec.list ? (
          <SettingInput
            field={{ name: settingKey, label: spec.label, type: "objects", fields: spec.fields }}
            value={draft}
            onChange={setDraft}
          />
        ) : spec.map ? (
          spec.map.map((name) => (
            <fieldset key={name} className="rounded-xl border border-rule bg-mist/60 p-4">
              <legend className="px-1 font-display text-[0.9375rem] font-extrabold tracking-tight text-ink">
                {name === "institute" ? "Academy" : "Agency"}
              </legend>
              <div className="grid gap-3">
                {spec.fields.map((field) => (
                  <SettingInput
                    key={field.name}
                    field={field}
                    value={draft?.[name]?.[field.name]}
                    onChange={(next) =>
                      setDraft({
                        ...draft,
                        [name]: { ...(draft?.[name] ?? {}), [field.name]: next },
                      })
                    }
                  />
                ))}
              </div>
            </fieldset>
          ))
        ) : (
          spec.fields.map((field) => (
            <SettingInput
              key={field.name}
              field={field}
              value={draft?.[field.name]}
              onChange={(next) => setDraft({ ...(draft ?? {}), [field.name]: next })}
            />
          ))
        )}
      </div>
    </Card>
  );
}

/**
 * Tidy a block before saving: drop the blank lines a line editor keeps while
 * typing, and drop rows the admin added and left entirely empty.
 */
function clean(value) {
  if (Array.isArray(value)) {
    return value
      .map(clean)
      .filter((row) =>
        row && typeof row === "object"
          ? Object.values(row).some((inner) => String(inner ?? "").trim() !== "")
          : String(row ?? "").trim() !== "",
      );
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, clean(inner)]));
  }
  return value;
}
