'use client';

import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCampaignPerformanceStats } from '../../campaigns/services';
import { getLeadsChartData } from '../services';

export function OverviewCharts() {
  const { data: leadChartDataResponse = [], isLoading } = useQuery({
    queryKey: ['leads-chart'],
    queryFn: () => getLeadsChartData(),
  });

  const leadChartData = React.useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const fullMonthData = Array.from({ length: daysInMonth }, (_, i) => ({
      date: (i + 1).toString(),
      count: 0,
    }));

    if (!leadChartDataResponse || leadChartDataResponse.length === 0) {
      return fullMonthData;
    }

    const dataMap = new Map(
      leadChartDataResponse.map((item) => {
        const day = item.date.includes('-')
          ? parseInt(item.date.split('-')[2], 10).toString()
          : item.date;
        return [day, item.count];
      }),
    );

    return fullMonthData.map((item) => ({
      ...item,
      count: dataMap.has(item.date) ? dataMap.get(item.date) : 0,
    }));
  }, [leadChartDataResponse]);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  const year = new Date().getFullYear();

  const { data: campaignDataResponse = [] } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: () => getCampaignPerformanceStats(),
  });

  const campaignData = React.useMemo(() => {
    // Show only 6 months - Jan to Jun
    const months6 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const dataMap = new Map(campaignDataResponse.map((item) => [item.month, item]));

    return months6.map((month) => {
      const existingData = dataMap.get(month);
      return {
        month,
        email: existingData?.email ? Number(existingData.email) : 0,
        sms: existingData?.sms ? Number(existingData.sms) : 0,
        whatsapp: existingData?.whatsapp ? Number(existingData.whatsapp) : 0,
      };
    });
  }, [campaignDataResponse]);

  return (
    <div className="grid gap-4 md:grid-cols-2 min-w-0">
      {/* Campaign Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Monthly campaign activity by channel</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={campaignData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={true}
                stroke="currentColor"
                opacity={0.1}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'currentColor', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
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
                  if (active && payload && payload.length > 0) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
                        <div className="space-y-1">
                          {payload.map((entry) => (
                            <div
                              key={entry.name}
                              className="flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm font-medium text-muted-foreground">
                                  {entry.name}
                                </span>
                              </div>
                              <span className="text-sm font-bold" style={{ color: entry.color }}>
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />

              {/* Email Line - Blue */}
              <Line
                type="monotone"
                dataKey="email"
                stroke="#3b82f6"
                strokeWidth={2.5}
                name="Email"
                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
                connectNulls={true}
              />

              {/* SMS Line - Orange */}
              <Line
                type="monotone"
                dataKey="sms"
                stroke="#f59e0b"
                strokeWidth={2.5}
                name="SMS"
                dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#f59e0b' }}
                connectNulls={true}
              />

              {/* WhatsApp Line - Green */}
              <Line
                type="monotone"
                dataKey="whatsapp"
                stroke="#10b981"
                strokeWidth={2.5}
                name="WhatsApp"
                dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#10b981' }}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Leads Details Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Details</CardTitle>
          <CardDescription>
            Daily lead generation for {monthName} {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
          ) : (
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted">
              <div style={{ minWidth: leadChartData.length > 10 ? '800px' : '100%' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={leadChartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b9d1d3" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#b9d1d3" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
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
                    />
                    <YAxis
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
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
                              <p className="text-lg font-bold text-[#82a0a2]">
                                {Number(payload[0].value).toLocaleString()} Leads
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="natural"
                      dataKey="count"
                      stroke="#82a0a2"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorLeads)"
                      animationDuration={1500}
                      dot={{ r: 4, fill: '#82a0a2', strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
