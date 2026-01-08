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
      name: 'Campaigns',
      url: '/campaigns/list',
      icon: Workflow,
      items: [
        {
          title: 'Campaign List',
          url: '/campaigns/list',
        },
        {
          title: 'Active Campaigns',
          url: '/campaigns/active',
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
