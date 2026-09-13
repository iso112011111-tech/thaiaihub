import type { NextConfig } from "next";

/**
 * Baseline security headers for every response. There is no script CSP yet:
 * Firebase Auth's Google popup and Next's inline runtime need a nonce-based
 * policy to do that properly, so CSP only locks down framing and plugins here.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Google sign-in opens a popup that has to report back to this window.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  // Testing from a phone on the LAN hits the dev server cross-origin; Next will
  // require this list in a future major version, so declare it now.
  allowedDevOrigins: ["192.168.1.11"],
  poweredByHeader: false,
  images: {
    // Only Google account photos come from another host. A wildcard here turns
    // /_next/image into an open proxy that fetches any URL on request.
    // Keep in step with lib/images/safe-src.ts and firestore.rules.
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
