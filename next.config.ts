import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // `pg` opens real TCP sockets and resolves some of its own internals at
  // run time, so bundling it produces a driver that fails only once a query
  // is issued. Keep it external and let Node require it directly.
  serverExternalPackages: ['pg'],

  turbopack: {
    // Required: prevents Turbopack from inferring a parent directory as root
    // when .codeyam/ exists above the project (which breaks import resolution)
    root: '.',
  },
};

export default nextConfig;
