/** biome-ignore-all assist/source/organizeImports: <> */
import {
  Briefcase,
  FileText,
  Instagram,
  LayoutDashboard,
  Mail,
  MessageCircle,
  PhoneCall,
  Settings,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

export const dashboardData = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },

  navGroups: [
    {
      items: [
        {
          title: 'Dashboard',
          url: '/overview',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: 'Campaigns',
      items: [
        {
          title: 'Contact Sources',
          url: '/files/list',
          icon: FileText,
          items: [
            { title: 'Recipients', url: '/files/list' },
            { title: 'Pending Approval', url: '/files/pending' },
          ],
        },
        {
          title: 'Campaigns',
          url: '/campaigns/list',
          icon: Briefcase,
          items: [
            // { title: 'Configuration', url: '/campaigns/configuration' },
            { title: 'All Campaigns', url: '/campaigns/list' },
          ],
        },
        {
          title: 'Leads',
          url: '#',
          icon: UserCheck,
          items: [
            { title: 'All Leads', url: '/leads/list' },
            { title: 'Manual Followup', url: '/leads/manual-followup' },
          ],
        },
      ],
    },
    {
      label: 'Business Leads',
      items: [
        {
          title: 'Business Leads',
          url: '#',
          icon: TrendingUp,
          items: [
            { title: 'Search & Add', url: '/business-leads/search' },
            { title: 'All Leads', url: '/business-leads/list' },
          ],
        },
      ],
    },
    {
      label: 'Channels',
      items: [
        {
          title: 'Email',
          url: '/email/accounts',
          icon: Mail,
          items: [
            { title: 'Accounts', url: '/email/accounts' },
            { title: 'Inbox', url: '/email/inbox' },
          ],
        },
        {
          title: 'Instagram',
          url: '/instagram/accounts',
          icon: Instagram,
        },
        {
          title: 'Phone Number',
          url: '/phone',
          icon: PhoneCall,
        },
        {
          title: 'WhatsApp',
          url: '/whatsapp/list',
          icon: MessageCircle,
        },
      ],
    },
    {
      label: 'System',
      items: [
        {
          title: 'Settings',
          url: '/settings/financial-institutions',
          icon: Settings,
          items: [
            { title: 'Financial Institutions', url: '/settings/financial-institutions' },
            { title: 'Campaign Templates', url: '/settings/campaign-templates' },
            { title: 'NBFC', url: '/settings/nbfc' },
          ],
        },
      ],
    },
  ],

  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    },
  ],
};
