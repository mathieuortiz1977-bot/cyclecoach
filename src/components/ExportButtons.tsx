"use client";
import type { SessionDef } from "@/lib/periodization";
import { exportToZWO, exportToMRC, exportToERG, exportToJSON, downloadFile } from "@/lib/export";

interface Props {
  session: SessionDef;
  ftp: number;
}

export function ExportButtons({ session, ftp }: Props) {
  const safeName = session.title.replace(/[^a-zA-Z0-9_-]/g, "_");

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => downloadFile(exportToZWO(session, ftp), `${safeName}.zwo`, "application/xml")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[var(--card-border)] hover:border-[#f97316] hover:text-[#f97316] transition-colors"
      >
        <span className="text-sm">🟠</span> Zwift (.zwo)
      </button>
      <button
        onClick={() => downloadFile(exportToERG(session, ftp), `${safeName}.erg`, "text/plain")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[var(--card-border)] hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors"
      >
        <span className="text-sm">📱</span> Wahoo (.erg)
      </button>
      <button
        onClick={() => downloadFile(exportToMRC(session), `${safeName}.mrc`, "text/plain")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[var(--card-border)] hover:border-[#22c55e] hover:text-[#22c55e] transition-colors"
      >
        <span className="text-sm">📊</span> Golden Cheetah (.mrc)
      </button>
      <button
        onClick={() => downloadFile(exportToJSON(session, ftp), `${safeName}.json`, "application/json")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[var(--card-border)] hover:border-[var(--muted)] hover:text-white transition-colors"
      >
        <span className="text-sm">💾</span> JSON
      </button>
    </div>
  );
}
