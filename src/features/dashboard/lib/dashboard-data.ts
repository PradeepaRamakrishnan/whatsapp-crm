/** biome-ignore-all assist/source/organizeImports: <> */
import {
  Briefcase,
  FileText,
  Instagram,
  MessageCircle,
  AudioLines,
  LayoutDashboard,
  Settings,
  UserCheck,
} from 'lucide-react';

export const dashboardData = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },

  navMain: [
    {
      title: 'Dashboard',
      url: '/overview',
      icon: LayoutDashboard,
    },
  ],
  workflows: [
    {
      name: 'Files',
      url: '/files/list',
      icon: FileText,
      items: [
        {
          title: 'File Management',
          url: '/files/list',
        },
        {
          title: 'Pending Review',
          url: '/files/pending',
        },
      ],
    },
    {
      name: 'Campaigns',
      url: '/campaigns/list',
      icon: Briefcase,
      items: [
        {
          title: 'Configuration',
          url: '/campaigns/configuration',
        },
        // {
        //   title: 'Logs',
        //   url: '/campaigns/logs',
        // },
        {
          title: 'All Campaigns',
          url: '/campaigns/list',
        },
        // {
        //   title: 'Archived',
        //   url: '/campaigns/archived',
        // },
      ],
    },
    {
      name: 'Leads',
      url: '#',
      icon: UserCheck,
      items: [
        {
          title: 'All Leads',
          url: '/leads/list',
        },
        {
          title: 'Manual Followup',
          url: '/leads/manual-followup',
        },
        // {
        //   title: 'Qualified',
        //   url: '/leads/qualified',
        // },
        // {
        //   title: 'Ready for Disbursal',
        //   url: '/leads/ready-for-disbursal',
        // },
      ],
    },
    {
      name: 'Instagram',
      url: '/instagram/accounts',
      icon: Instagram,
    },
    {
      name: 'PhoneNumber',
      url: '/phone',
      icon: AudioLines,
    },
    {
      name: 'Settings',
      url: '/settings/financial-institutions',
      icon: Settings,
      items: [
        {
          title: 'Financial Institutions',
          url: '/settings/financial-institutions',
        },
        {
          title: 'Campaign Templates',
          url: '/settings/campaign-templates',
        },
        {
          title: 'NBFC',
          url: '/settings/nbfc',
        },
      ],
    },

    {
      name: 'Whatsapp',
      url: '/whatsapp/list',
      icon: MessageCircle,
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
