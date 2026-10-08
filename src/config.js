// Optional email copies of a form submission, read from the environment at
// build time.
//
// Since the site gained a database, every submission is stored and appears in
// the admin panel — that is the record. These endpoints are an extra: set them
// and a copy of each submission is also emailed, so someone gets a nudge
// without opening the panel.
//
// Set them in `.env` at the project root (see `.env.example`):
//
//   VITE_FORMSPREE_AGENCY=https://formspree.io/f/xxxxxxxx
//   VITE_FORMSPREE_INSTITUTE=https://formspree.io/f/yyyyyyyy
//
// Leave them blank and nothing is emailed. Nothing is lost either way: the
// submission is saved before the email is attempted, and a failed email is
// logged rather than shown to the visitor.

export const formEndpoints = {
  agency: import.meta.env.VITE_FORMSPREE_AGENCY ?? "",
  institute: import.meta.env.VITE_FORMSPREE_INSTITUTE ?? "",
};
