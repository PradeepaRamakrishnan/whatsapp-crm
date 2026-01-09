'use client';

import { Send, Target, TrendingDown, TrendingUp, UserCheck, Users } from 'lucide-react';
import {
  // Bar,
  // BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for campaigns over time
const campaignData = [
  { month: 'Jan', email: 245, whatsapp: 189, sms: 134, ai: 98 },
  { month: 'Feb', email: 289, whatsapp: 234, sms: 178, ai: 145 },
  { month: 'Mar', email: 321, whatsapp: 267, sms: 201, ai: 178 },
  { month: 'Apr', email: 298, whatsapp: 289, sms: 234, ai: 212 },
  { month: 'May', email: 356, whatsapp: 312, sms: 267, ai: 245 },
  { month: 'Jun', email: 398, whatsapp: 345, sms: 289, ai: 278 },
];

// Mock data for campaign distribution
const campaignTypeData = [
  { name: 'Email', value: 1907, color: '#3b82f6' },
  { name: 'WhatsApp', value: 1636, color: '#10b981' },
  { name: 'SMS', value: 1303, color: '#f59e0b' },
  { name: 'AI Calling', value: 1156, color: '#8b5cf6' },
];

// Mock data for conversion funnel
// const conversionData = [
//   { stage: 'Total Borrowers', count: 15420 },
//   { stage: 'Eligible Pool', count: 12336 },
//   { stage: 'Campaigns Sent', count: 6002 },
//   { stage: 'Leads Generated', count: 2401 },
//   { stage: 'Qualified', count: 1201 },
//   { stage: 'Ready for Disbursal', count: 720 },
// ];

const OverviewPage = () => {
  const stats = [
    {
      title: 'Total Campaigns',
      value: '6,002',
      change: '+12.5%',
      trend: 'up',
      icon: Send,
      description: 'Active campaigns this month',
    },
    {
      title: 'Total Leads',
      value: '2,401',
      change: '+18.2%',
      trend: 'up',
      icon: UserCheck,
      description: 'Leads generated from campaigns',
    },
    {
      title: 'Conversion Rate',
      value: '40.0%',
      change: '+5.4%',
      trend: 'up',
      icon: Target,
      description: 'Campaign to lead conversion',
    },
    {
      title: 'Eligible Borrowers',
      value: '12,336',
      change: '-2.1%',
      trend: 'down',
      icon: Users,
      description: 'Ready for campaigns',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Overview</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Your campaign performance and analytics at a glance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold sm:text-2xl">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-rose-500" />
                )}
                <span className={stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}>
                  {stat.change}
                </span>
                <span className="ml-1 hidden sm:inline">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 min-w-0">
        {/* Campaign Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Monthly campaign activity by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={campaignData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="email"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Email"
                />
                <Line
                  type="monotone"
                  dataKey="whatsapp"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="WhatsApp"
                />
                <Line type="monotone" dataKey="sms" stroke="#f59e0b" strokeWidth={2} name="SMS" />
                <Line
                  type="monotone"
                  dataKey="ai"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="AI Calling"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Distribution</CardTitle>
            <CardDescription>Total campaigns by channel type</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(Number(percent) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {campaignTypeData.map((entry, index) => (
                    <Cell key={`cell-${index + entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Borrower journey through campaign stages</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={conversionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                dataKey="stage"
                type="category"
                width={120}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip />
              <Bar dataKey="count" className="fill-primary" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card> */}

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaign Activity</CardTitle>
          <CardDescription>Latest campaigns and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium whitespace-nowrap">Campaign</th>
                  <th className="pb-3 text-left font-medium whitespace-nowrap">Type</th>
                  <th className="pb-3 text-left font-medium whitespace-nowrap">Status</th>
                  <th className="pb-3 text-right font-medium whitespace-nowrap">Sent</th>
                  <th className="pb-3 text-right font-medium whitespace-nowrap">Leads</th>
                  <th className="pb-3 text-right font-medium whitespace-nowrap">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 whitespace-nowrap">June Personal Loan Campaign</td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      Email
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Active
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">2,450</td>
                  <td className="py-3 text-right whitespace-nowrap">982</td>
                  <td className="py-3 text-right whitespace-nowrap">40.1%</td>
                </tr>
                <tr>
                  <td className="py-3 whitespace-nowrap">WhatsApp Follow-up Wave 2</td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 whitespace-nowrap">
                      WhatsApp
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 whitespace-nowrap">
                      Active
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">1,892</td>
                  <td className="py-3 text-right whitespace-nowrap">756</td>
                  <td className="py-3 text-right whitespace-nowrap">40.0%</td>
                </tr>
                <tr>
                  <td className="py-3 whitespace-nowrap">SMS Reminder - Payment Due</td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300 whitespace-nowrap">
                      SMS
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-950 dark:text-slate-300 whitespace-nowrap">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">3,120</td>
                  <td className="py-3 text-right whitespace-nowrap">1,248</td>
                  <td className="py-3 text-right whitespace-nowrap">40.0%</td>
                </tr>
                <tr>
                  <td className="py-3 whitespace-nowrap">AI Calling - High Priority</td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300 whitespace-nowrap">
                      AI Calling
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 whitespace-nowrap">
                      Active
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">567</td>
                  <td className="py-3 text-right whitespace-nowrap">227</td>
                  <td className="py-3 text-right whitespace-nowrap">40.0%</td>
                </tr>
                <tr>
                  <td className="py-3 whitespace-nowrap">May Business Loan Outreach</td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300 whitespace-nowrap">
                      Email
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-950 dark:text-slate-300 whitespace-nowrap">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">1,834</td>
                  <td className="py-3 text-right whitespace-nowrap">734</td>
                  <td className="py-3 text-right whitespace-nowrap">40.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewPage;
