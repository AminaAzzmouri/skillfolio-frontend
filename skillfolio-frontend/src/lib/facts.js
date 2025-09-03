import { api } from "./api";

export async function fetchRandomFact() {
  const { data } = await api.get("/api/facts/random/");
  // Expect: { id, text, source, source_url }
  return {
    id: data?.id ?? null,
    text: data?.text ?? "",
    source: data?.source ?? "",
    url: data?.source_url ?? null,
  };
}
