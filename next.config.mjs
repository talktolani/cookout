/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      {
        // Sends the bare domain to the ticket sales page (25 Sep; previously
        // /preregister, whose "pre-register free" copy is out of date now that
        // tickets are on sale). Press, listings and anyone typing the domain
        // land where they can buy. The full funnel at / still has bracketed
        // placeholders: revisit this before launching it. See CLAUDE.md.
        //
        // Scoped by host so only the live domain redirects. The vercel.app URL
        // keeps serving the full funnel, which is how we review it.
        source: '/',
        has: [{ type: 'host', value: '(www\\.)?thecookoutevent\\.com' }],
        destination: '/tickets',
        // permanent: false gives a 307, not a 308. A 308 is cached hard by
        // browsers and would keep redirecting people long after this rule is
        // deleted, with no way to clear it from our side.
        permanent: false,
      },
    ]
  },
}
export default nextConfig
