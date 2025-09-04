import { api } from "./api";

export async function fetchRandomFact() {
    // add a tiny cache-buster to avoid any accidental caching proxies
  const { data } = await api.get("/api/facts/random/", {
    params: { t: Date.now() }
  });
  // normalize (your component expects: { text, url?, source? })
  return {
    text: data?.text || "",
    url: data?.source_url || "",
    source: data?.source || ""
  };
}
