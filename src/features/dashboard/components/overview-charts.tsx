'use client';

import { useQuery } from '@tanstack/react-query';
import {
  //   Cell,
  //   Legend,
  Area,
  AreaChart,
  CartesianGrid,
  //   Pie,
  //   PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  //   Brush,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLeadsChartData } from '../services';

// Mock data for campaign distribution
// const campaignTypeData = [
//   { name: 'Email', value: 1907, color: '#3b82f6' },
//   { name: 'WhatsApp', value: 1636, color: '#10b981' },
//   { name: 'SMS', value: 1303, color: '#f59e0b' },
//   { name: 'AI Calling', value: 1156, color: '#8b5cf6' },
// ];

import * as React from 'react';

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

  return (
    <div className=" min-w-0">
      {/* Leads Details Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Details</CardTitle>
          <CardDescription>
            Daily lead generation progress for {monthName} {year}{' '}
            {leadChartData.length > 15 ? '(Scroll to view details)' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[350px] w-full animate-pulse rounded bg-muted" />
          ) : (
            <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-muted">
              <div style={{ minWidth: leadChartData.length > 15 ? '1500px' : '100%' }}>
                <ResponsiveContainer width="100%" height={375}>
                  <AreaChart
                    data={leadChartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                  >
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      className="text-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: `Days of ${monthName} ${year}`,
                        position: 'insideBottom',
                        offset: -25,
                        fill: 'currentColor',
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    />
                    <YAxis
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      className="text-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#f97316"
                      fillOpacity={1}
                      fill="url(#colorLeads)"
                      strokeWidth={2}
                      name="Leads"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Distribution Chart */}
      {/* <Card>
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
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {campaignTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card> */}
    </div>
  );
}
