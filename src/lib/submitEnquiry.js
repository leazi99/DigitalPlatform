/**
 * The two public forms: the academy's enrolment request and the agency's
 * enquiry.
 *
 * Both are stored in our own database, which is what makes them appear in the
 * admin panel. The Formspree endpoints are now optional: set them and a copy
 * of the submission is also emailed, leave them blank and the database row is
 * the only record. Emailing is treated as the copy, not the original — an
 * email that fails to send must not lose an enrolment.
 *
 * Each submission carries the visitor's session id where there is one, so the
 * admin can see which visit turned into an enquiry. It is the same random id
 * the visitor log uses, and it identifies a browser session, not a person.
 */

import { post } from "./api";
import { formEndpoints } from "../config";
import { currentSessionId } from "./track";

/** POST /api/enrol — a seat request for the course. */
export async function submitEnrolment(values) {
  const result = await post(
    "/enrol",
    { ...values, sessionId: currentSessionId() },
    { auth: false },
  );
  emailCopy(formEndpoints.institute, {
    ...values,
    sector: "institute",
    _subject: "Course enrolment request",
  });
  return result;
}

/** POST /api/enquiries — an enquiry from the agency's contact form. */
export async function submitAgencyEnquiry(values) {
  const result = await post(
    "/enquiries",
    { ...values, sector: "agency", sessionId: currentSessionId() },
    { auth: false },
  );
  emailCopy(formEndpoints.agency, { ...values, sector: "agency", _subject: "Agency enquiry" });
  return result;
}

/**
 * Fire and forget. Deliberately not awaited and deliberately silent: the
 * submission is already saved, so a failure here is ours to notice in the
 * logs, not the visitor's to be told about after a successful send.
 */
function emailCopy(endpoint, values) {
  if (!endpoint) return;

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(values),
    keepalive: true,
  }).catch((error) => {
    console.warn("The email copy of that submission did not send:", error.message);
  });
}
