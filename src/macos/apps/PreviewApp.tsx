import { Download, ExternalLink } from "lucide-react";
import { PdfGlyph } from "../components/AppIcons";

const CV_URL = "/Saleh_Al-Mashni_Resume_2026.pdf";

export function PreviewApp() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <PdfGlyph className="h-5 w-4 shrink-0" />
          <span className="truncate text-[13px] text-white/80">
            Saleh_Al-Mashni_Resume_2026.pdf
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href={CV_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs text-white/85 hover:bg-white/20"
          >
            <ExternalLink size={12} />
            Open in Tab
          </a>
          <a
            href={CV_URL}
            download
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2a7de1] px-2.5 py-1 text-xs font-medium text-[#fff] hover:bg-[#3b8af0]"
          >
            <Download size={12} />
            Download
          </a>
        </div>
      </div>

      {/* Page sits on a Preview-style gray board with a paper shadow */}
      <div className="min-h-0 flex-1 bg-[#323237] p-4">
        <div className="mx-auto h-full max-w-3xl overflow-hidden rounded-md bg-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <iframe
            src={`${CV_URL}#view=FitH&toolbar=0&navpanes=0`}
            title="Saleh Al-Mashni CV"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
