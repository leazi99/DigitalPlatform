import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { download } from "../../lib/api";
import { ColumnInput } from "../fields";
import { emptyRecord } from "../record";
import { useMeta, useResource } from "../useAdmin";
import {
  Alert,
  Badge,
  Btn,
  Card,
  ConfirmBtn,
  Drawer,
  Empty,
  Input,
  Loading,
  Page,
  Select,
  TD,
  TH,
  Table,
} from "../ui";
import {
  formatAgo,
  formatDateTime,
} from "../format";

/**
 * The people who got in touch: seat requests from the academy form, and
 * enquiries from the agency form.
 *
 * Both are the same screen because the work is the same — read what came in,
 * ring them, move the status along, write down what was said. They can also be
 * added by hand, for the person who walked in off the street.
 */

const VIEWS = {
  students: {
    title: "Students",
    lead: "Everyone who asked for a seat, and everyone enrolled. A form submission arrives as an enquiry — nobody is marked enrolled until someone here says so.",
    columns: ["name", "contact", "batch", "status", "when"],
    statuses: {
      enquiry: "signal",
      contacted: "warn",
      enrolled: "good",
      studying: "good",
      completed: "neutral",
      dropped: "bad",
    },
    addLabel: "Add student",
    exportName: "students",
  },
  enquiries: {
    title: "Agency enquiries",
    lead: "Businesses that sent the contact form on the agency page.",
    columns: ["name", "contact", "service", "status", "when"],
    statuses: { new: "signal", contacted: "warn", quoted: "warn", won: "good", lost: "bad" },
    addLabel: "Add enquiry",
    exportName: "enquiries",
  },
};

export default function RecordsPage({ resourceKey }) {
  const view = VIEWS[resourceKey];
  const { meta } = useMeta();
  const spec = meta?.resources?.[resourceKey];

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(null); // a row, {} to add, or null
  const [selected, setSelected] = useState(() => new Set());
  const [busy, setBusy] = useState(false);

  const query = useMemo(() => ({ q, status, limit: 200 }), [q, status]);
  const resource = useResource(resourceKey, { query, auto: Boolean(spec) });

  if (!spec) {
    return (
      <Page title={view.title}>
        <Loading />
      </Page>
    );
  }

  const statusValues = spec.columns.status.values;

  const toggle = (id) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function deleteSelected() {
    setBusy(true);
    try {
      await resource.removeMany([...selected]);
      setSelected(new Set());
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page
      title={view.title}
      lead={view.lead}
      actions={
        <>
          <Btn
            variant="subtle"
            onClick={() => download(`/admin/export/${view.exportName}`, `${view.exportName}.csv`)}
          >
            Export CSV
          </Btn>
          <Btn variant="signal" onClick={() => setOpen({})}>
            {view.addLabel}
          </Btn>
        </>
      }
    >
      <div className="space-y-4">
        {resource.error && (
          <Alert tone="error" onDismiss={() => resource.setError("")}>
            {resource.error}
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search name, phone, email or notes…"
            className="max-w-sm"
            aria-label="Search"
          />
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="max-w-[12rem]"
            aria-label="Filter by status"
          >
            <option value="">Every status</option>
            {statusValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>

          {selected.size > 0 && (
            <ConfirmBtn
              onConfirm={deleteSelected}
              disabled={busy}
              label={`Delete ${selected.size} selected`}
              confirmLabel={`Really delete ${selected.size}?`}
            />
          )}

          <p className="ml-auto font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-soft">
            {resource.total} {resource.total === 1 ? spec.label : spec.plural}
          </p>
        </div>

        <Card>
          {resource.loading && resource.items.length === 0 ? (
            <Loading />
          ) : resource.items.length === 0 ? (
            <Empty
              title={q || status ? "Nothing matches that." : "Nothing has come in yet."}
              body={
                q || status
                  ? "Clear the search and the status filter to see everything."
                  : "Submissions from the website land here the moment they are sent."
              }
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <TH className="w-10">
                    <span className="sr-only">Select</span>
                  </TH>
                  <TH>Name</TH>
                  <TH>Contact</TH>
                  <TH>{resourceKey === "students" ? "Batch" : "Wants"}</TH>
                  <TH>Status</TH>
                  <TH>Came in</TH>
                  <TH className="w-24 text-right">Actions</TH>
                </tr>
              </thead>
              <tbody>
                {resource.items.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-white/60">
                    <TD>
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggle(row.id)}
                        aria-label={`Select ${row.name}`}
                        className="h-4 w-4 rounded border-rule accent-signal"
                      />
                    </TD>
                    <TD>
                      <button
                        type="button"
                        onClick={() => setOpen(row)}
                        className="text-left font-semibold text-ink underline decoration-signal/50 decoration-2 underline-offset-2 hover:decoration-signal"
                      >
                        {row.name}
                      </button>
                    </TD>
                    <TD>
                      <Contact row={row} />
                    </TD>
                    <TD className="text-ink-soft">
                      {resourceKey === "students"
                        ? row.batch_name || "Not chosen"
                        : row.service || "Not chosen"}
                    </TD>
                    <TD>
                      <Badge tone={view.statuses[row.status] ?? "neutral"}>{row.status}</Badge>
                    </TD>
                    <TD className="whitespace-nowrap text-ink-soft" title={formatDateTime(row.created_at)}>
                      {formatAgo(row.created_at)}
                    </TD>
                    <TD className="text-right">
                      <Btn variant="subtle" onClick={() => setOpen(row)}>
                        Open
                      </Btn>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      <RecordDrawer
        spec={spec}
        meta={meta}
        view={view}
        row={open}
        onClose={() => setOpen(null)}
        onSave={(values) => (open?.id ? resource.update(open.id, values) : resource.create(values))}
        onDelete={() => resource.remove(open.id).then(() => setOpen(null))}
      />
    </Page>
  );
}

function Contact({ row }) {
  return (
    <div className="space-y-0.5">
      {row.phone && (
        <a href={`tel:${row.phone.replace(/\s/g, "")}`} className="block text-ink hover:text-signal-deep">
          {row.phone}
        </a>
      )}
      {row.email && (
        <a href={`mailto:${row.email}`} className="block truncate text-ink-soft hover:text-signal-deep">
          {row.email}
        </a>
      )}
      {!row.phone && !row.email && <span className="text-ink-soft">No contact details</span>}
    </div>
  );
}

/**
 * The whole record, editable.
 *
 * The status buttons are at the top because that is the field that actually
 * changes after a phone call — everything else is usually read, not edited.
 */
function RecordDrawer({ spec, meta, view, row, onClose, onSave, onDelete }) {
  const isOpen = row !== null;
  const isNew = isOpen && !row.id;

  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const [openedFor, setOpenedFor] = useState(null);

  const signature = isOpen ? (row.id ?? "new") : null;
  if (signature !== openedFor) {
    setOpenedFor(signature);
    setValues(isNew ? emptyRecord(spec.columns) : { ...row });
    setErrors({});
    setFailure("");
  }

  if (!isOpen) return null;

  const set = (name) => (value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  async function submit(event) {
    event?.preventDefault();
    setBusy(true);
    setFailure("");
    try {
      await onSave(values);
      onClose();
    } catch (error) {
      setErrors(error.fields ?? {});
      setFailure(error.message);
    } finally {
      setBusy(false);
    }
  }

  // The fields worth showing, in the order they are useful to read. Status has
  // its own row of buttons above, and a read-only field on a new record is an
  // empty disabled box saying nothing.
  const fields = Object.entries(spec.columns).filter(
    ([name, col]) => name !== "status" && (!col.readOnly || !isNew),
  );

  return (
    <Drawer
      open={isOpen}
      title={isNew ? view.addLabel : values.name || "Record"}
      lead={isNew ? "For someone who got in touch another way." : `Came in ${formatDateTime(row.created_at)}`}
      onClose={onClose}
      footer={
        <>
          {!isNew && <ConfirmBtn onConfirm={onDelete} className="mr-auto" />}
          <Btn variant="ghost" type="button" onClick={onClose} disabled={busy}>
            Cancel
          </Btn>
          <Btn variant="signal" type="submit" form="record-form" disabled={busy}>
            {busy ? "Saving…" : isNew ? "Add it" : "Save changes"}
          </Btn>
        </>
      }
    >
      <form id="record-form" noValidate onSubmit={submit} className="grid gap-4">
        {failure && <Alert tone="error">{failure}</Alert>}

        <fieldset>
          <legend className="mb-2 text-[0.8125rem] font-semibold text-ink">Status</legend>
          <div className="flex flex-wrap gap-1.5">
            {spec.columns.status.values.map((value) => (
              <Btn
                key={value}
                type="button"
                variant={values.status === value ? "primary" : "subtle"}
                aria-pressed={values.status === value}
                onClick={() => set("status")(value)}
              >
                {value}
              </Btn>
            ))}
          </div>
        </fieldset>

        {!isNew && row.session_id && (
          <Alert tone="info">
            This came from a tracked visit.{" "}
            <Link
              to={`/admin/visitors?q=${encodeURIComponent(row.session_id)}`}
              className="font-semibold underline underline-offset-2"
            >
              See what they read first
            </Link>
            .
          </Alert>
        )}

        {fields.map(([name, col]) => (
          <ColumnInput
            key={name}
            name={name}
            col={col}
            value={values[name]}
            onChange={set(name)}
            error={errors[name]}
            options={col.type === "ref" ? (meta.options[col.ref] ?? []) : []}
          />
        ))}
      </form>
    </Drawer>
  );
}
