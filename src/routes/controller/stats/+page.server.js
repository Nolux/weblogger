export async function load({ fetch, locals }) {
  const res = await fetch("/api/stats");
  const data = await res.json();
  console.log(data);
  return { stats: data };
}
