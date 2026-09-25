/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      {
        // TEMPORARY. Sends the bare domain to the squeeze page while the full
        // funnel still has bracketed placeholders on it.
        //
        // REMOVE THIS BEFORE LAUNCHING THE FULL FUNNEL. See CLAUDE.md.
        //
        // Scoped by host so only the live domain redirects. The vercel.app URL
        // keeps serving the full funnel, which is how we review it.
        source: '/',
        has: [{ type: 'host', value: '(www\\.)?thecookoutevent\\.com' }],
        destination: '/preregister',
        // permanent: false gives a 307, not a 308. A 308 is cached hard by
        // browsers and would keep redirecting people long after this rule is
        // deleted, with no way to clear it from our side.
        permanent: false,
      },
    ]
  },
}
export default nextConfig
