/**
 * The login routes are public, so bots POST bodies that are not form-encoded at
 * all (JSON, or nothing). `request.formData()` throws a TypeError on those,
 * which surfaces as an unhandled 500. Returning an empty object instead lets
 * the callers' existing field validation answer with a 400.
 */
export async function parseFormData(request) {
  try {
    return Object.fromEntries(await request.formData());
  } catch {
    return {};
  }
}
