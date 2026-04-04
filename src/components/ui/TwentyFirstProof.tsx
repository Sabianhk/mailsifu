'use client';

/**
 * TwentyFirstProof — minimal badge proving 21st.dev MCP availability.
 * Component shape suggested via mcp___21st-dev_magic__21st_magic_component_builder.
 * Retest 2026-04-03: 4 tools confirmed (builder, inspiration, refiner, logo_search).
 */

type Status = 'live' | 'pending' | 'expired';

const STATUS_CONFIG: Record<Status, { label: string; dot: string; pill: string }> = {
  live:    { label: 'OTP Live',    dot: 'bg-emerald-400 animate-pulse', pill: 'bg-emerald-950 text-emerald-300 ring-emerald-800' },
  pending: { label: 'OTP Pending', dot: 'bg-amber-400 animate-pulse',   pill: 'bg-amber-950  text-amber-300  ring-amber-800'  },
  expired: { label: 'OTP Expired', dot: 'bg-zinc-500',                  pill: 'bg-zinc-900   text-zinc-400   ring-zinc-700'   },
};

export function TwentyFirstProof({ status = 'live' }: { status?: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cfg.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
