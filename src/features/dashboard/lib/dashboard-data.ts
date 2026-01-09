import { Briefcase, FileText, LayoutDashboard, Settings, UserCheck } from 'lucide-react';

export const dashboardData = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },

  navMain: [
    {
      title: 'Overview',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: true,
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
          title: 'Review Files',
          url: '/files/review',
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
