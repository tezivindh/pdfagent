import { ShieldAlert } from 'lucide-react';

export function ConfidenceExplainer() {
  return (
    <div className="glass-card p-4 mt-4 border-l-2 border-l-warning bg-warning/5">
      <div className="flex items-start">
        <ShieldAlert className="w-5 h-5 text-warning mr-3 mt-0.5 shrink-0" />
        <div className="text-sm text-text-muted">
          <strong className="text-textMain block mb-1">Constrained Agent</strong>
          This AI can <span className="text-warning">ONLY</span> answer questions using the uploaded document. Questions about outside knowledge (or unrelated topics) will be explicitly refused to prevent hallucination.
        </div>
      </div>
    </div>
  );
}
