/**
 * The site's only network call: posts a form's values to its endpoint.
 *
 * Both the agency enquiry form and the academy enrolment form go through
 * here, so retries, error wording and the "not configured" case are handled
 * in one place rather than duplicated per form.
 *
 * Resolves on success. Throws an Error with a message written for the
 * visitor to read — never a raw status code.
 */
export async function submitEnquiry(values, endpoint) {
  if (!endpoint) {
    throw new Error(
      "This form is not connected yet. Please email or call us instead — we will reply just as quickly.",
    );
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(values),
    });
  } catch {
    // Offline, DNS failure, blocked request — the visitor cannot fix any of
    // these, so point them at a route that does not depend on us.
    throw new Error(
      "We could not reach the server. Check your connection, or email or call us directly.",
    );
  }

  if (!response.ok) {
    throw new Error(
      "Something went wrong sending that. Please try again, or email or call us directly.",
    );
  }

  return { ok: true };
}
