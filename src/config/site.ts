/**
 * Global site configuration.
 * Change `name`, `brand`, and `stats` here to update every reference across the app.
 */
export const siteConfig = {
  /** Full display name used in headings, titles, sign-in panel, etc. */
  name: 'Campaign CRM',

  /** Short label shown alongside the brand on the login page */
  subtitle: 'Campaign Management',

  /** Two-line hero brand mark on the login page */
  brand: {
    line1: 'CAMPAIGN',
    line2: 'CRM',
  },

  tagline: 'Manage campaigns, leads & communications.\nStay ahead — always.',

  /** Stat cards displayed on the login page left panel */
  stats: [
    { label: 'Active Campaigns', value: '124' },
    { label: 'Total Leads', value: '8,942' },
    { label: 'Files Processed', value: '3,281' },
    { label: 'Delivery Rate', value: '94.2 %' },
  ],

  copyright: `© ${new Date().getFullYear()}`,
};
