/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // Swap for the custom domain once it's live — same call made for the canonical tags and JSON-LD.
  siteUrl: "https://ecovisrkca.netlify.app",
  generateRobotsTxt: true,
  // Next.js's file-based metadata icons (app/icon.png etc.) surface as routes in the build
  // output; they're assets, not pages, so keep them out of the sitemap.
  exclude: ["/icon.png"],
  sitemapSize: 5000,
  changefreq: "monthly",
  priority: 0.7,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
