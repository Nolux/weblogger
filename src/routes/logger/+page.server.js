export async function load({ fetch, locals }) {
  const res = await fetch("/api/log?page=0&perPage=10");
  const data = await res.json();
  console.log(data);
  return data;
}
