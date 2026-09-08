// Form endpoints, read from the environment at build time.
//
// Set these in a `.env` file at the project root (see `.env.example`):
//
//   VITE_FORMSPREE_AGENCY=https://formspree.io/f/xxxxxxxx
//   VITE_FORMSPREE_INSTITUTE=https://formspree.io/f/yyyyyyyy
//
// Until they are set, the forms still render and validate, but submitting
// shows a configuration error rather than pretending to send. That is
// deliberate: a form that silently drops enquiries is worse than one that
// says it is broken.

export const formEndpoints = {
  agency: import.meta.env.VITE_FORMSPREE_AGENCY ?? "",
  institute: import.meta.env.VITE_FORMSPREE_INSTITUTE ?? "",
};
