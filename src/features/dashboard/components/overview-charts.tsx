'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BarChart2, CheckCircle2, FileSpreadsheet, Send, Target } from 'lucide-react';
import Link from 'next/link';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCampaignPerformanceStats } from '../../campaigns/services';
import { MOCK_CAMPAIGN_PERFORMANCE, MOCK_LEADS_CHART } from '../lib/mock-data';
import { getLeadsChartData } from '../services';

const GETTING_STARTED_STEPS = [
  {
    step: 1,
    icon: FileSpreadsheet,
    color: 'text-amber-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    cardBg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800',
    title: 'Upload Borrower Files',
    desc: 'Import your borrower data as .CSV or .XLSX. Each file contains contact details and loan info used to target your outreach.',
    action: 'Go to Files',
    href: '/files',
  },
  {
    step: 2,
    icon: Send,
    color: 'text-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    cardBg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    title: 'Create a Campaign',
    desc: 'Choose a file, set up WhatsApp / SMS / Email templates, pick a schedule, and launch. Delivery is fully automated.',
    action: 'Create Campaign',
    href: '/campaigns/create',
  },
  {
    step: 3,
    icon: Target,
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    title: 'Track Results Here',
    desc: 'After campaigns run, this dashboard shows live stats — delivery rates, lead counts, channel breakdowns, and conversions.',
    action: null,
    href: null,
  },
];

export function OverviewCharts() {
  const { data: leadChartDataResponse } = useQuery({
    queryKey: ['leads-chart'],
    queryFn: () => getLeadsChartData(),
    select: (data) => (data.length === 0 ? MOCK_LEADS_CHART : data),
  });

  const { data: campaignDataResponse = [] } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: () => getCampaignPerformanceStats(),
    select: (data) => (data.length === 0 ? MOCK_CAMPAIGN_PERFORMANCE : data),
  });

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
      { name: 'Email', value: totals.email, fill: 'url(#gradient-email)' },
      { name: 'SMS', value: totals.sms, fill: 'url(#gradient-sms)' },
      { name: 'WhatsApp', value: totals.whatsapp, fill: 'url(#gradient-whatsapp)' },
    ].filter((item) => item.value > 0);
  }, [campaignDataResponse]);

  const leadChartData = React.useMemo(() => {
    if (!leadChartDataResponse || leadChartDataResponse.length === 0) return [];
    return leadChartDataResponse.map((item) => {
      let dayLabel = item.date;
      if (typeof item.date === 'string' && item.date.includes('-')) {
        const day = parseInt(item.date.split('-')[2], 10);
        dayLabel = day.toString();
      }
      return { date: dayLabel, count: Number(item.count) || 0, originalDate: item.date };
    });
  }, [leadChartDataResponse]);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  const year = new Date().getFullYear();

  const bothEmpty = chartData.length === 0 && leadChartData.length === 0;

  // ── Empty state: Getting Started guide ──────────────────────────────────────
  if (bothEmpty) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <BarChart2 className="h-4.5 w-4.5 text-primary" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <CardTitle className="text-base">Getting Started</CardTitle>
              <CardDescription>
                Follow these 3 steps — your analytics will appear here automatically
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {GETTING_STARTED_STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className={`relative flex flex-col rounded-xl border p-5 ${s.border} ${s.cardBg}`}
                >
                  {/* Connector arrow between cards */}
                  {idx < GETTING_STARTED_STEPS.length - 1 && (
                    <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 sm:flex">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm">
                        <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                      </div>
                    </div>
                  )}

                  {/* Step badge + icon */}
                  <div className="mb-4 flex items-center gap-2.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.iconBg} ${s.color}`}
                    >
                      Step {s.step}
                    </span>
                  </div>

                  {/* Title + description */}
                  <h3 className="mb-1.5 text-[13.5px] font-bold text-foreground">{s.title}</h3>
                  <p className="mb-4 flex-1 text-[12px] leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>

                  {/* Action */}
                  {s.href ? (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className={`h-8 w-fit gap-1.5 border-current/20 text-xs font-semibold ${s.color}`}
                    >
                      <Link href={s.href}>
                        {s.action}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  ) : (
                    <div
                      className={`flex items-center gap-1.5 text-[11.5px] font-medium ${s.color}`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Auto-populated after campaigns run
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Normal state: show charts ────────────────────────────────────────────────
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
            <div className="flex h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/10">
              <Send className="h-8 w-8 text-muted-foreground/30" />
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">No campaigns yet</p>
                <p className="mt-0.5 text-xs text-muted-foreground/60">
                  Channel breakdown appears after your first campaign
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                <Link href="/campaigns/create">
                  Create Campaign <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
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
          {leadChartData && leadChartData.length > 0 ? (
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted">
              <div
                style={{
                  minWidth:
                    leadChartData.length > 10
                      ? `${Math.max(leadChartData.length * 60, 800)}px`
                      : '100%',
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
                      interval={
                        leadChartData.length > 15 ? Math.floor(leadChartData.length / 10) : 0
                      }
                      label={{
                        value: 'Date (Day)',
                        position: 'insideBottomRight',
                        offset: -5,
                        style: { fontSize: 12, fill: 'currentColor' },
                      }}
                    />
                    <YAxis
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      label={{
                        value: 'Lead Count',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: 12, fill: 'currentColor' },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      }}
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
            <div className="flex h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/10">
              <Target className="h-8 w-8 text-muted-foreground/30" />
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No leads for {monthName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground/60">
                  Lead counts appear here once campaigns generate responses
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
