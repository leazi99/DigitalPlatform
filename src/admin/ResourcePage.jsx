import { useMemo, useState } from "react";
import { ColumnInput } from "./fields";
import { emptyRecord } from "./record";
import { resourceViews } from "./resourceViews";
import { useMeta, useResource } from "./useAdmin";
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
} from "./ui";

/**
 * Add, edit, reorder and delete — for any resource the API describes.
 *
 * One screen serves all eleven content resources. The columns come from
 * `resourceViews`, the form from the server's field descriptions, so a new
 * resource needs a table on the server and a row in that file, not another
 * copy of this.
 */
export default function ResourcePage({ resourceKey }) {
  const { meta } = useMeta();
  const view = resourceViews[resourceKey] ?? { title: resourceKey, columns: [] };

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({});
  const [editing, setEditing] = useState(null); // a row, {} for a new one, or null

  const spec = meta?.resources?.[resourceKey];
  const query = useMemo(() => ({ q, ...filters }), [q, filters]);
  const resource = useResource(resourceKey, { query, auto: Boolean(spec) });

  if (!spec) return <Page title={view.title}><Loading label="Reading the field descriptions…" /></Page>;

  const columns = view.columns.filter((name) => spec.columns[name]);

  return (
    <Page
      title={view.title}
      lead={view.lead}
      actions={
        <Btn variant="signal" onClick={() => setEditing({})}>
          Add {spec.label.toLowerCase()}
        </Btn>
      }
    >
      <div className="space-y-4">
        {resource.error && (
          <Alert tone="error" onDismiss={() => resource.setError("")}>
            {resource.error}
          </Alert>
        )}

        {(spec.search.length > 0 || spec.filters.length > 0) && (
          <div className="flex flex-wrap items-center gap-3">
            {spec.search.length > 0 && (
              <Input
                type="search"
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder={`Search ${view.title.toLowerCase()}…`}
                className="max-w-xs"
                aria-label={`Search ${view.title}`}
              />
            )}

            {spec.filters.map((name) => (
              <FilterSelect
                key={name}
                name={name}
                spec={spec}
                meta={meta}
                label={view.filterLabels?.[name] ?? name}
                value={filters[name] ?? ""}
                onChange={(value) => setFilters((current) => ({ ...current, [name]: value }))}
              />
            ))}

            <p className="ml-auto font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-soft">
              {resource.total} {resource.total === 1 ? spec.label : spec.plural}
            </p>
          </div>
        )}

        <Card>
          {resource.loading && resource.items.length === 0 ? (
            <Loading />
          ) : resource.items.length === 0 ? (
            <Empty
              title={q || Object.values(filters).some(Boolean) ? "Nothing matches that." : `No ${spec.plural.toLowerCase()} yet.`}
              body={
                q || Object.values(filters).some(Boolean)
                  ? "Clear the search and the filters to see everything."
                  : `Add the first one and it appears on the website straight away.`
              }
              action={
                <Btn variant="signal" onClick={() => setEditing({})}>
                  Add {spec.label.toLowerCase()}
                </Btn>
              }
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  {spec.ordered && <TH className="w-20">Order</TH>}
                  {columns.map((name) => (
                    <TH key={name}>{spec.columns[name].label ?? name}</TH>
                  ))}
                  <TH className="w-44 text-right">Actions</TH>
                </tr>
              </thead>
              <tbody>
                {resource.items.map((row, index) => (
                  <tr key={row.id} className="transition-colors hover:bg-white/60">
                    {spec.ordered && (
                      <TD>
                        <div className="flex items-center gap-1">
                          <Btn
                            variant="ghost"
                            aria-label="Move up"
                            disabled={index === 0 || resource.loading}
                            onClick={() => resource.move(row.id, -1)}
                          >
                            ↑
                          </Btn>
                          <Btn
                            variant="ghost"
                            aria-label="Move down"
                            disabled={index === resource.items.length - 1 || resource.loading}
                            onClick={() => resource.move(row.id, 1)}
                          >
                            ↓
                          </Btn>
                        </div>
                      </TD>
                    )}

                    {columns.map((name) => (
                      <TD key={name}>
                        <Cell name={name} col={spec.columns[name]} value={row[name]} meta={meta} />
                      </TD>
                    ))}

                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Btn variant="subtle" onClick={() => setEditing(row)}>
                          Edit
                        </Btn>
                        <ConfirmBtn onConfirm={() => resource.remove(row.id)} />
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      <ResourceForm
        spec={spec}
        meta={meta}
        row={editing}
        onClose={() => setEditing(null)}
        onSave={(values) =>
          editing?.id ? resource.update(editing.id, values) : resource.create(values)
        }
      />
    </Page>
  );
}

function FilterSelect({ name, spec, meta, label, value, onChange }) {
  const col = spec.columns[name];
  const options =
    col.type === "ref"
      ? (meta.options[col.ref] ?? [])
      : (col.values ?? []).map((v) => ({ value: v, label: v }));

  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="max-w-[14rem]"
      aria-label={`Filter by ${label}`}
    >
      <option value="">All {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}

/** One table cell, rendered according to what kind of column it is. */
function Cell({ col, value, meta }) {
  if (col.type === "bool") {
    return <Badge tone={value ? "good" : "neutral"}>{value ? "Live" : "Hidden"}</Badge>;
  }

  if (col.type === "enum") {
    const tones = { open: "good", filling: "warn", closed: "neutral" };
    return <Badge tone={tones[value] ?? "signal"}>{value}</Badge>;
  }

  if (col.type === "ref") {
    const option = (meta.options[col.ref] ?? []).find((o) => o.value === value);
    return (
      <span className={option ? "text-ink" : "text-ink-soft"}>
        {option ? option.label : "Not linked"}
      </span>
    );
  }

  if (col.type === "json") {
    const list = Array.isArray(value) ? value : [];
    if (list.length === 0) return <span className="text-ink-soft">None</span>;
    return (
      <span className="text-ink-soft">
        {list.length} {list.length === 1 ? "item" : "items"}
        <span className="block truncate text-[0.8125rem]">{list.join(" · ")}</span>
      </span>
    );
  }

  const text = String(value ?? "");
  return (
    <span className="line-clamp-2 block max-w-[28rem] text-ink">
      {text || <span className="text-ink-soft">—</span>}
    </span>
  );
}

/** The add/edit drawer. Every writable column, in the order the server lists them. */
function ResourceForm({ spec, meta, row, onClose, onSave }) {
  const open = row !== null;
  const isNew = open && !row.id;

  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const [openedFor, setOpenedFor] = useState(null);

  // Reset the form when the drawer opens on a different row. Deriving it during
  // render rather than in an effect means the fields are never briefly showing
  // the previous row's values.
  const signature = open ? (row.id ?? "new") : null;
  if (signature !== openedFor) {
    setOpenedFor(signature);
    setValues(isNew ? emptyRecord(spec.columns) : { ...row });
    setErrors({});
    setFailure("");
  }

  if (!open) return null;

  const set = (name) => (value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  async function submit(event) {
    event.preventDefault();
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

  return (
    <Drawer
      open={open}
      title={isNew ? `Add ${spec.label.toLowerCase()}` : `Edit ${spec.label.toLowerCase()}`}
      lead={isNew ? undefined : `Saved changes appear on the website immediately.`}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" type="button" onClick={onClose} disabled={busy}>
            Cancel
          </Btn>
          <Btn variant="signal" type="submit" form="resource-form" disabled={busy}>
            {busy ? "Saving…" : isNew ? "Add it" : "Save changes"}
          </Btn>
        </>
      }
    >
      <form id="resource-form" noValidate onSubmit={submit} className="grid gap-4">
        {failure && <Alert tone="error">{failure}</Alert>}

        {Object.entries(spec.columns)
          // A read-only field on a new record is an empty disabled box saying
          // nothing. It is worth showing on an existing row, where it has a value.
          .filter(([, col]) => !col.readOnly || !isNew)
          .map(([name, col]) => (
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
