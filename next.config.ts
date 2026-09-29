import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CLAUDE.md es la fuente de verdad del repo; que `next dev` no le agregue bloques.
  agentRules: false,
};

export default nextConfig;
