export async function load({ params, fetch, locals }) {
  const logId = params.logId;

  const res = await fetch(`/api/log/single?logId=${logId}`);

  const data = await res.json();

  return { ...data };
}
