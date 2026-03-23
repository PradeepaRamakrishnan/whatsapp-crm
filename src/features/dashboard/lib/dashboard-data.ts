/** biome-ignore-all assist/source/organizeImports: <> */
import {
  Briefcase,
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
      label: 'Leads Generation',
      items: [
        {
          title: 'Leads Generation',
          url: '#',
          icon: TrendingUp,
          items: [
            { title: 'Search & Add', url: '/business-leads/search' },
            { title: 'All Leads', url: '/business-leads/list' },
            { title: 'All Schedulers', url: '/leads/schedulers' },
          ],
        },
      ],
    },
    {
      label: 'Campaigns',
      items: [
        {
          title: 'Campaigns',
          url: '/campaigns/list',
          icon: Briefcase,
          items: [
            { title: 'All Campaigns', url: '/campaigns/list' },
            { title: 'Recipients', url: '/recipients/list' },
            { title: 'Configuration', url: '/campaigns/channel-config/email' },
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
            {
              title: 'Campaign Templates',
              url: '/settings/campaign-templates',
            },
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
