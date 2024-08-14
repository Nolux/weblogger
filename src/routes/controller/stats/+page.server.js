export async function load({ fetch, locals }) {
  const res = await fetch("/api/stats");
  const data = await res.json();

  return { stats: data };
}
