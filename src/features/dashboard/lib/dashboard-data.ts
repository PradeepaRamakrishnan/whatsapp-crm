import { Bot, Briefcase, FileText, LayoutDashboard, Settings, UserCheck } from 'lucide-react';

export const dashboardData = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },

  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
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
      name: 'Agents',
      url: '/agents/configuration',
      icon: Bot,
      items: [
        {
          title: 'Configuration',
          url: '/agents/configuration',
        },
        {
          title: 'Logs',
          url: '/agents/logs',
        },
      ],
    },
    {
      name: 'Campaigns',
      url: '/campaigns/list',
      icon: Briefcase,
      items: [
        {
          title: 'All Campaigns',
          url: '/campaigns/list',
        },
        {
          title: 'Archived',
          url: '/campaigns/archived',
        },
      ],
    },
    {
      name: 'Leads',
      url: '#',
      icon: UserCheck,
      items: [
        {
          title: 'All Leads',
          url: '/leads/all',
        },
        {
          title: 'Interested',
          url: '/leads/interested',
        },
        {
          title: 'Qualified',
          url: '/leads/qualified',
        },
        {
          title: 'Ready for Disbursal',
          url: '/leads/ready-for-disbursal',
        },
      ],
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
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    },
  ],
};
