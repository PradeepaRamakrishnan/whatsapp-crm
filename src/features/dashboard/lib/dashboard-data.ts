import { LayoutDashboard, Settings, UserCheck, Workflow } from 'lucide-react';

export const dashboardData = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },

  navMain: [
    {
      title: 'Overview',
      url: '/overview',
      icon: LayoutDashboard,
      isActive: true,
    },
  ],
  workflows: [
    {
      name: 'Campaigns Orchestration',
      url: '/campaigns/files',
      icon: Workflow,
      items: [
        {
          title: 'File Management',
          url: '/campaigns/files',
        },
        {
          title: 'Campaigns Templates',
          url: '/campaigns/templates',
        },
        {
          title: 'All Campaigns',
          url: '/campaigns/list',
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
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    },
  ],
};
