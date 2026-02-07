'use client';

import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCampaignPerformanceStats } from '../../campaigns/services';
import { getLeadsChartData } from '../services';

export function OverviewCharts() {
  // All hooks at top level - no conditional calls
  const { data: leadChartDataResponse } = useQuery({
    queryKey: ['leads-chart'],
    queryFn: () => getLeadsChartData(),
  });

  const { data: campaignDataResponse = [] } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: () => getCampaignPerformanceStats(),
  });

  // Calculate chart data at top level (FIXED: moved outside JSX)
  const chartData = React.useMemo(() => {
    const totals = campaignDataResponse.reduce(
      (acc, curr) => ({
        email: acc.email + (Number(curr.email) || 0),
        sms: acc.sms + (Number(curr.sms) || 0),
        whatsapp: acc.whatsapp + (Number(curr.whatsapp) || 0),
      }),
      { email: 0, sms: 0, whatsapp: 0 },
    );

    return [
      {
        name: 'Email',
        value: totals.email,
        fill: 'url(#gradient-email)',
      },
      {
        name: 'SMS',
        value: totals.sms,
        fill: 'url(#gradient-sms)',
      },
      {
        name: 'WhatsApp',
        value: totals.whatsapp,
        fill: 'url(#gradient-whatsapp)',
      },
    ].filter((item) => item.value > 0);
  }, [campaignDataResponse]);

  const leadChartData = React.useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const fullMonthData: Array<{ date: string; count: number }> = Array.from(
      { length: daysInMonth },
      (_, i) => ({
        date: (i + 1).toString(),
        count: 0,
      }),
    );

    if (!leadChartDataResponse || leadChartDataResponse.length === 0) {
      return fullMonthData;
    }

    const dataMap = new Map(
      leadChartDataResponse.map((item) => {
        const day = item.date.includes('-')
          ? parseInt(item.date.split('-')[2], 10).toString()
          : item.date;
        return [day, item.count as number];
      }),
    );

    return fullMonthData.map((item) => ({
      ...item,
      count: (dataMap.get(item.date) as number) ?? 0,
    }));
  }, [leadChartDataResponse]);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  const year = new Date().getFullYear();

  return (
    <div className="grid gap-4 md:grid-cols-2 min-w-0">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Monthly campaign activity by channel</CardDescription>
        </CardHeader>
        <CardContent>
          {campaignDataResponse && campaignDataResponse.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="gradient-email" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="gradient-sms" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                  <linearGradient id="gradient-whatsapp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={110}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index as number}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm font-medium text-muted-foreground ml-2">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center rounded">
              <div className="text-center">
                <p className="text-muted-foreground font-medium">No data available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  There are no campaigns for this month
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads Details</CardTitle>
          <CardDescription>
            Daily lead generation for {monthName} {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leadChartDataResponse && leadChartDataResponse.length > 0 ? (
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted">
              <div
                style={{
                  minWidth: leadChartData.length > 10 ? '800px' : '100%',
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={leadChartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={true}
                      stroke="currentColor"
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-xl">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Date: {label} {monthName}
                              </p>
                              <p className="text-lg font-bold text-[#413ea0]">
                                {Number(payload[0].value).toLocaleString()} Leads
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#413ea0" barSize={20} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center rounded">
              <div className="text-center">
                <p className="text-muted-foreground font-medium">No data available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  There are no leads for {monthName} {year}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
