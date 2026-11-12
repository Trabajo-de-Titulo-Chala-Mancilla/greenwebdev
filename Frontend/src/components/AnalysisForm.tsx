import { useState, type FormEvent } from "react";
import type { AnalysisRequest } from "../api";

interface Props {
  onSubmit: (request: AnalysisRequest) => void;
  isLoading: boolean;
}

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-ink outline-none focus:border-accent disabled:opacity-60";

export default function AnalysisForm({ onSubmit, isLoading }: Props) {
  const [url, setUrl] = useState("https://www.wikipedia.org");
  const [visits, setVisits] = useState("10000");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ url, monthlyVisits: Number(visits) });
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
      <label className="block text-sm text-muted">
        Sitio web
        <input
          className={`${inputClass} mt-1`}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.ejemplo.cl"
          required
          disabled={isLoading}
        />
      </label>
      <label className="block text-sm text-muted">
        Visitas mensuales
        <input
          className={`${inputClass} mt-1`}
          type="number"
          min={1}
          step={1}
          value={visits}
          onChange={(event) => setVisits(event.target.value)}
          required
          disabled={isLoading}
        />
      </label>
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-accent px-6 py-2.5 font-bold text-black hover:brightness-110 disabled:opacity-60"
      >
        {isLoading ? "Analizando…" : "Analizar"}
      </button>
    </form>
  );
}
