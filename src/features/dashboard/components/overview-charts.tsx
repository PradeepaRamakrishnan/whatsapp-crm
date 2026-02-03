'use client';

import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  //   Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLeadsChartData } from '../services';

export function OverviewCharts() {
  const { data: leadChartDataResponse = [], isLoading } = useQuery({
    queryKey: ['leads-chart'],
    queryFn: () => getLeadsChartData(),
  });

  // Transform YYYY-MM-DD to just Day number
  const leadChartData = React.useMemo(() => {
    return leadChartDataResponse.map((item) => ({
      ...item,
      // Parse DD from YYYY-MM-DD
      date: item.date.includes('-') ? parseInt(item.date.split('-')[2], 10).toString() : item.date,
    }));
  }, [leadChartDataResponse]);

  // Current Month Label
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  const year = new Date().getFullYear();

  const campaignData = [
    { month: 'Jan', email: 245, whatsapp: 189, sms: 134, ai: 98 },
    { month: 'Feb', email: 289, whatsapp: 234, sms: 178, ai: 145 },
    { month: 'Mar', email: 321, whatsapp: 267, sms: 201, ai: 178 },
    { month: 'Apr', email: 298, whatsapp: 289, sms: 234, ai: 212 },
    { month: 'May', email: 356, whatsapp: 312, sms: 267, ai: 245 },
    { month: 'Jun', email: 398, whatsapp: 345, sms: 289, ai: 278 },
  ];

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
              <Line type="monotone" dataKey="email" stroke="#3b82f6" strokeWidth={2} name="Email" />
              <Line
                type="monotone"
                dataKey="whatsapp"
                stroke="#10b981"
                strokeWidth={2}
                name="WhatsApp"
              />
              <Line type="monotone" dataKey="sms" stroke="#f59e0b" strokeWidth={2} name="SMS" />
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
                  <BarChart
                    data={leadChartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      className="text-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      className="text-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                      barSize={leadChartData.length <= 5 ? 40 : undefined}
                      name="Leads"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
