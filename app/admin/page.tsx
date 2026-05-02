"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  Users,
  Video,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"

type DailyStat = {
  date: string
  users: number
  dualrooms?: number
  dualRooms: number
  completedrooms?: number
  completedRooms: number
}

type RecentRoom = {
  id: string
  room_code: string
  status: string
  current_shot: number
  total_shots: number
  created_at: string
  expires_at: string
  members: number
}

type AdminStats = {
  totalUsers: number
  usersToday: number
  usersLast7Days: number
  usersLast30Days: number
  totalDualRooms: number
  dualRoomsToday: number
  dualRoomsLast7Days: number
  completedDualRooms: number
  activeDualRooms: number
  totalDualMembers: number
  dailyStats: DailyStat[]
  recentRooms: RecentRoom[]
}

const emptyStats: AdminStats = {
  totalUsers: 0,
  usersToday: 0,
  usersLast7Days: 0,
  usersLast30Days: 0,
  totalDualRooms: 0,
  dualRoomsToday: 0,
  dualRoomsLast7Days: 0,
  completedDualRooms: 0,
  activeDualRooms: 0,
  totalDualMembers: 0,
  dailyStats: [],
  recentRooms: [],
}

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<AdminStats>(emptyStats)
  const [error, setError] = useState("")

  const loadStats = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        setError("")

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          window.location.href = "/create-account?next=/admin"
          return
        }

        const { data, error: rpcError } = await supabase.rpc(
          "get_admin_dashboard_stats"
        )

        if (rpcError) {
          console.error("Admin stats error:", rpcError)
          setError(
            "You are not allowed to view this dashboard, or the admin analytics SQL function is not installed correctly."
          )
          return
        }

        const parsed = data as AdminStats

        setStats({
          ...emptyStats,
          ...parsed,
          dailyStats: normalizeDailyStats(parsed.dailyStats ?? []),
          recentRooms: parsed.recentRooms ?? [],
        })
      } catch (err) {
        console.error("Admin load error:", err)
        setError("Something went wrong while loading the admin dashboard.")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [supabase]
  )

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const completionRate = calculateCompletionRate(
    stats.completedDualRooms,
    stats.totalDualRooms
  )

  const activeRate = calculateCompletionRate(
    stats.activeDualRooms,
    Math.max(stats.totalDualRooms, 1)
  )

  const maxUsers = Math.max(1, ...stats.dailyStats.map((item) => item.users ?? 0))
  const maxRooms = Math.max(
    1,
    ...stats.dailyStats.map((item) => item.dualRooms ?? 0)
  )

  if (loading) {
    return (
      <main className="amoura-pwa-page flex min-h-[100dvh] items-center justify-center px-6">
        <div className="rounded-[1.6rem] border border-amoura-red-soft/20 bg-black/45 p-8 text-center backdrop-blur-xl">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-amoura-red-soft" />
          <p className="mt-4 font-semibold text-amoura-cream">
            Loading admin dashboard...
          </p>
          <p className="mt-2 text-sm text-amoura-muted">
            Checking AmoreFrame activity.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="amoura-pwa-page min-h-[100dvh] px-4 py-4 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="relative isolate mb-5 overflow-hidden rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/50 p-5 backdrop-blur-xl sm:p-6">
          <div className="pointer-events-none absolute right-[-12%] top-[-80%] -z-10 h-72 w-72 rounded-full bg-amoura-red/25 blur-[80px]" />

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-amoura-muted transition hover:text-amoura-cream"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amoura-red-soft/25 bg-amoura-red/10 text-amoura-red-soft shadow-[0_0_35px_rgba(194,31,58,0.18)]">
                  <ShieldCheck className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amoura-red-soft">
                    AmoreFrame Admin
                  </p>
                  <h1 className="amoura-serif text-4xl leading-none text-amoura-cream sm:text-5xl">
                    Site Monitoring
                  </h1>
                  <p className="mt-2 text-sm text-amoura-muted">
                    Track users, Dual Mode rooms, completed sessions, and recent activity.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => loadStats(true)}
              disabled={refreshing}
              className="amoura-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh Data
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-5 rounded-[1.5rem] border border-rose-300/15 bg-rose-500/10 p-5 text-sm leading-6 text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
            subtext={`+${stats.usersToday} today`}
            footer={`${stats.usersLast7Days} new users in 7 days`}
          />

          <MetricCard
            icon={TrendingUp}
            label="30-Day Users"
            value={stats.usersLast30Days}
            subtext={`${stats.usersLast7Days} this week`}
            footer="New account growth"
          />

          <MetricCard
            icon={Video}
            label="Dual Mode Rooms"
            value={stats.totalDualRooms}
            subtext={`+${stats.dualRoomsToday} today`}
            footer={`${stats.dualRoomsLast7Days} rooms in 7 days`}
          />

          <MetricCard
            icon={CheckCircle2}
            label="Completed Sessions"
            value={stats.completedDualRooms}
            subtext={`${completionRate}% completion rate`}
            footer={`${stats.activeDualRooms} active rooms now`}
          />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <GraphCard
            title="User Growth"
            eyebrow="Last 7 Days"
            icon={Users}
            data={stats.dailyStats}
            maxValue={maxUsers}
            valueKey="users"
            valueLabel="users"
          />

          <GraphCard
            title="Dual Mode Usage"
            eyebrow="Last 7 Days"
            icon={Video}
            data={stats.dailyStats}
            maxValue={maxRooms}
            valueKey="dualRooms"
            valueLabel="rooms"
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
                  Sessions
                </p>
                <h2 className="amoura-serif text-3xl text-amoura-cream">
                  Dual Mode Health
                </h2>
              </div>

              <Activity className="h-6 w-6 text-amoura-red-soft" />
            </div>

            <div className="grid gap-4">
              <ProgressStat
                label="Completed Sessions"
                value={stats.completedDualRooms}
                percent={completionRate}
              />

              <ProgressStat
                label="Active Rooms"
                value={stats.activeDualRooms}
                percent={activeRate}
              />

              <ProgressStat
                label="Members Joined"
                value={stats.totalDualMembers}
                percent={Math.min(
                  100,
                  calculateCompletionRate(
                    stats.totalDualMembers,
                    Math.max(stats.totalDualRooms * 2, 1)
                  )
                )}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SmallMetric
                icon={CalendarDays}
                label="Rooms Today"
                value={stats.dualRoomsToday}
              />
              <SmallMetric
                icon={BarChart3}
                label="Rooms This Week"
                value={stats.dualRoomsLast7Days}
              />
              <SmallMetric
                icon={Users}
                label="Users Today"
                value={stats.usersToday}
              />
              <SmallMetric
                icon={Clock}
                label="Active Now"
                value={stats.activeDualRooms}
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
                  Overview
                </p>
                <h2 className="amoura-serif text-3xl text-amoura-cream">
                  Daily Summary
                </h2>
              </div>

              <BarChart3 className="h-6 w-6 text-amoura-red-soft" />
            </div>

            <div className="space-y-3">
              {stats.dailyStats.length > 0 ? (
                stats.dailyStats.map((item) => (
                  <DailySummaryRow key={item.date} item={item} />
                ))
              ) : (
                <EmptyState text="No daily analytics yet." />
              )}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
                Recent Activity
              </p>
              <h2 className="amoura-serif text-3xl text-amoura-cream">
                Recent Dual Rooms
              </h2>
            </div>

            <Camera className="hidden h-6 w-6 text-amoura-red-soft sm:block" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-amoura-muted">
                <tr>
                  <th className="px-4 py-2">Room Code</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Members</th>
                  <th className="px-4 py-2">Shot</th>
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2">Expires</th>
                </tr>
              </thead>

              <tbody>
                {stats.recentRooms.length > 0 ? (
                  stats.recentRooms.map((room) => (
                    <tr
                      key={room.id}
                      className="rounded-2xl bg-white/[0.035] text-amoura-cream"
                    >
                      <td className="rounded-l-2xl px-4 py-4 font-semibold">
                        {room.room_code}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={room.status} />
                      </td>

                      <td className="px-4 py-4 text-amoura-muted">
                        {room.members}
                      </td>

                      <td className="px-4 py-4 text-amoura-muted">
                        {room.current_shot}/{room.total_shots}
                      </td>

                      <td className="px-4 py-4 text-amoura-muted">
                        {formatDateTime(room.created_at)}
                      </td>

                      <td className="rounded-r-2xl px-4 py-4 text-amoura-muted">
                        {formatDateTime(room.expires_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState text="No Dual Mode rooms have been created yet." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  footer,
}: {
  icon: React.ElementType
  label: string
  value: number
  subtext: string
  footer: string
}) {
  return (
    <article className="relative isolate overflow-hidden rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl">
      <div className="pointer-events-none absolute right-[-30%] top-[-55%] -z-10 h-40 w-40 rounded-full bg-amoura-red/20 blur-[55px]" />

      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amoura-red-soft/25 bg-amoura-red/10 text-amoura-red-soft">
          <Icon className="h-6 w-6" />
        </div>

        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          Live
        </span>
      </div>

      <p className="text-sm font-medium text-amoura-muted">{label}</p>

      <h2 className="amoura-serif mt-2 text-5xl leading-none text-amoura-cream">
        {value.toLocaleString()}
      </h2>

      <p className="mt-3 text-sm font-semibold text-amoura-red-soft">
        {subtext}
      </p>

      <p className="mt-4 border-t border-white/10 pt-4 text-xs text-amoura-muted">
        {footer}
      </p>
    </article>
  )
}

function GraphCard({
  title,
  eyebrow,
  icon: Icon,
  data,
  maxValue,
  valueKey,
  valueLabel,
}: {
  title: string
  eyebrow: string
  icon: React.ElementType
  data: DailyStat[]
  maxValue: number
  valueKey: "users" | "dualRooms" | "completedRooms"
  valueLabel: string
}) {
  return (
    <div className="rounded-[1.75rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
            {eyebrow}
          </p>
          <h2 className="amoura-serif text-3xl text-amoura-cream">{title}</h2>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amoura-red-soft/20 bg-amoura-red/10 text-amoura-red-soft">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {data.length > 0 ? (
        <div className="flex h-64 items-end gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.025] p-4">
          {data.map((item) => {
            const value = item[valueKey] ?? 0
            const height = Math.max(8, (value / maxValue) * 100)

            return (
              <div
                key={`${item.date}-${valueKey}`}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex min-h-6 items-center text-xs font-semibold text-amoura-cream">
                  {value}
                </div>

                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-t-xl border border-amoura-red-soft/30 bg-gradient-to-t from-amoura-red-deep via-amoura-red to-amoura-red-soft shadow-[0_0_22px_rgba(194,31,58,0.25)] transition-all duration-300"
                    style={{ height: `${height}%` }}
                    title={`${value} ${valueLabel}`}
                  />
                </div>

                <p className="text-[10px] text-amoura-muted">
                  {formatChartDate(item.date)}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState text="No graph data available yet." />
      )}
    </div>
  )
}

function ProgressStat({
  label,
  value,
  percent,
}: {
  label: string
  value: number
  percent: number
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-amoura-cream">{label}</p>
        <p className="text-sm font-semibold text-amoura-red-soft">
          {value.toLocaleString()}
        </p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amoura-red-deep via-amoura-red to-amoura-red-soft"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-amoura-muted">{percent}% of total</p>
    </div>
  )
}

function SmallMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amoura-red/10 text-amoura-red-soft">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs text-amoura-muted">{label}</p>
        <p className="font-semibold text-amoura-cream">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  )
}

function DailySummaryRow({ item }: { item: DailyStat }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="font-semibold text-amoura-cream">
          {formatShortDate(item.date)}
        </p>
        <p className="mt-1 text-xs text-amoura-muted">
          {item.users} users · {item.dualRooms} dual rooms ·{" "}
          {item.completedRooms} completed
        </p>
      </div>

      <div className="flex gap-2">
        <MiniPill label="Users" value={item.users} />
        <MiniPill label="Rooms" value={item.dualRooms} />
        <MiniPill label="Done" value={item.completedRooms} />
      </div>
    </div>
  )
}

function MiniPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-amoura-red-soft/20 bg-amoura-red/10 px-3 py-1 text-xs text-amoura-pink">
      {label}: {value}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const completedStatuses = ["completed"]
  const goodStatuses = ["ready", "partner_joined"]
  const activeStatuses = ["waiting", "countdown", "capturing", "between_shots"]
  const badStatuses = ["expired", "cancelled"]

  const className = completedStatuses.includes(status)
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
    : goodStatuses.includes(status)
      ? "border-sky-400/20 bg-sky-500/10 text-sky-300"
      : activeStatuses.includes(status)
        ? "border-amoura-red-soft/25 bg-amoura-red/10 text-amoura-pink"
        : badStatuses.includes(status)
          ? "border-amber-400/20 bg-amber-500/10 text-amber-200"
          : "border-white/10 bg-white/[0.035] text-amoura-muted"

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${className}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-8 text-center text-sm text-amoura-muted">
      {text}
    </div>
  )
}

function normalizeDailyStats(items: DailyStat[]) {
  return items.map((item) => ({
    ...item,
    users: item.users ?? 0,
    dualRooms: item.dualRooms ?? item.dualrooms ?? 0,
    completedRooms: item.completedRooms ?? item.completedrooms ?? 0,
  }))
}

function calculateCompletionRate(completed: number, total: number) {
  if (!total) return 0
  return Math.round((completed / total) * 100)
}

function formatDateTime(value: string) {
  if (!value) return "—"

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatShortDate(value: string) {
  if (!value) return "—"

  return new Intl.DateTimeFormat("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

function formatChartDate(value: string) {
  if (!value) return "—"

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}