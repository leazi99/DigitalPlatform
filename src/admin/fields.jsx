import { Btn, FormField, Input, Select, Textarea, Toggle } from "./ui";

/**
 * Turns a field description into a control.
 *
 * The server is the only place that knows what columns a resource has and what
 * each one may contain — `GET /api/admin/meta` sends those descriptions, and
 * this file renders them. Adding a column to `server/resources.js` makes it
 * appear in the panel with the right control and no change here.
 */

// ── Resource columns ────────────────────────────────────────────────────────

export function ColumnInput({ name, col, value, onChange, error, options = [] }) {
  const id = `field-${name}`;
  const label = col.label ?? name;
  const common = { id, invalid: Boolean(error) };

  switch (col.type) {
    case "bool":
      return (
        <FormField error={error}>
          <div className="rounded-xl border border-rule bg-mist px-3.5 py-3">
            <Toggle id={id} label={label} checked={value} onChange={onChange} />
            <p className="mt-1.5 pl-7 text-[0.8125rem] text-ink-soft">
              {value ? "Showing on the website." : "Hidden from the website."}
            </p>
          </div>
        </FormField>
      );

    case "long":
      return (
        <FormField label={label} error={error} htmlFor={id}>
          <Textarea
            {...common}
            rows={4}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
          />
        </FormField>
      );

    case "json":
      return (
        <FormField label={label} hint="One per line" error={error} htmlFor={id}>
          <Textarea
            {...common}
            rows={5}
            value={toLines(value)}
            onChange={(event) => onChange(fromLines(event.target.value))}
          />
        </FormField>
      );

    case "enum":
      return (
        <FormField label={label} error={error} htmlFor={id}>
          <Select {...common} value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
            {col.values.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </FormField>
      );

    case "ref":
      return (
        <FormField label={label} hint="Optional" error={error} htmlFor={id}>
          <Select
            {...common}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
          >
            <option value="">Not linked</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      );

    case "int":
      return (
        <FormField label={label} error={error} htmlFor={id}>
          <Input
            {...common}
            type="number"
            value={value ?? 0}
            onChange={(event) => onChange(event.target.value === "" ? 0 : Number(event.target.value))}
          />
        </FormField>
      );

    default:
      return (
        <FormField label={label} error={error} htmlFor={id}>
          <Input
            {...common}
            type="text"
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            disabled={col.readOnly}
          />
        </FormField>
      );
  }
}

// ── Settings blocks ─────────────────────────────────────────────────────────

/**
 * One field of a content block.
 *
 * Blocks are stored as JSON, so a field can be a string, a list of strings, a
 * fixed object (a button's label and link), or a list of objects (the nav).
 * Each gets an editor rather than being handed to the admin as raw JSON.
 */
export function SettingInput({ field, value, onChange }) {
  const id = `setting-${field.name}`;

  switch (field.type) {
    case "long":
      return (
        <FormField label={field.label} htmlFor={id}>
          <Textarea id={id} rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        </FormField>
      );

    case "lines":
      return (
        <FormField label={field.label} hint="One per line" htmlFor={id}>
          <Textarea
            id={id}
            rows={4}
            value={toLines(value)}
            onChange={(event) => onChange(fromLines(event.target.value))}
          />
        </FormField>
      );

    case "object":
      return (
        <fieldset className="rounded-xl border border-rule bg-mist/70 p-4">
          <legend className="px-1 text-[0.8125rem] font-semibold text-ink">{field.label}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {field.fields.map((inner) => (
              <SettingInput
                key={inner.name}
                field={inner}
                value={value?.[inner.name]}
                onChange={(next) => onChange({ ...(value ?? {}), [inner.name]: next })}
              />
            ))}
          </div>
        </fieldset>
      );

    case "objects":
      return <RowsEditor field={field} value={value} onChange={onChange} />;

    default:
      return (
        <FormField label={field.label} htmlFor={id}>
          <Input id={id} type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        </FormField>
      );
  }
}

/** A list of small objects — the nav, the hero's micro-stats, the socials. */
function RowsEditor({ field, value, onChange }) {
  const rows = Array.isArray(value) ? value : [];

  const update = (index, key, next) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: next } : row)));

  const blank = Object.fromEntries(field.fields.map((f) => [f.name, ""]));

  return (
    <fieldset className="rounded-xl border border-rule bg-mist/70 p-4">
      <legend className="px-1 text-[0.8125rem] font-semibold text-ink">{field.label}</legend>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              {field.fields.map((inner) => (
                <FormField key={inner.name} label={inner.label} htmlFor={`row-${index}-${inner.name}`}>
                  <Input
                    id={`row-${index}-${inner.name}`}
                    type="text"
                    value={row?.[inner.name] ?? ""}
                    onChange={(event) => update(index, inner.name, event.target.value)}
                  />
                </FormField>
              ))}
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <Btn
                variant="ghost"
                type="button"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => onChange(swap(rows, index, index - 1))}
              >
                ↑
              </Btn>
              <Btn
                variant="ghost"
                type="button"
                aria-label="Move down"
                disabled={index === rows.length - 1}
                onClick={() => onChange(swap(rows, index, index + 1))}
              >
                ↓
              </Btn>
              <Btn
                variant="ghost"
                type="button"
                aria-label="Remove"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
              >
                ✕
              </Btn>
            </div>
          </div>
        ))}
      </div>

      <Btn variant="subtle" type="button" className="mt-3" onClick={() => onChange([...rows, blank])}>
        Add row
      </Btn>
    </fieldset>
  );
}

function swap(list, a, b) {
  const copy = [...list];
  [copy[a], copy[b]] = [copy[b], copy[a]];
  return copy;
}

function toLines(value) {
  if (Array.isArray(value)) return value.join("\n");
  return value ?? "";
}

/**
 * Kept exactly as typed, blank lines and all.
 *
 * Dropping empties here would mean pressing Enter never appeared to do
 * anything — the new line would vanish before the next character arrived. They
 * are dropped on save instead: the server prunes list columns, and the settings
 * screen prunes content blocks.
 */
function fromLines(text) {
  return String(text).split("\n");
}
