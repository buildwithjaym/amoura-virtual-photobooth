"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ShieldCheck,
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
          window.location.href = "/login?next=/admin"
          return
        }

        const { data, error: rpcError } = await supabase.rpc(
          "get_admin_dashboard_stats"
        )

        if (rpcError) {
          console.error("Admin stats error:", rpcError)
          setError(
            "You are not allowed to view this dashboard, or the admin stats function is not installed yet."
          )
          return
        }

        setStats({
          ...emptyStats,
          ...(data as AdminStats),
          dailyStats: normalizeDailyStats((data as AdminStats).dailyStats ?? []),
          recentRooms: (data as AdminStats).recentRooms ?? [],
        })
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

  const maxDailyValue = Math.max(
    1,
    ...stats.dailyStats.map((item) =>
      Math.max(item.users ?? 0, item.dualRooms ?? 0, item.completedRooms ?? 0)
    )
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
            Checking your site analytics.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="amoura-pwa-page min-h-[100dvh] px-4 py-4 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-col gap-4 rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-amoura-muted transition hover:text-amoura-cream"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amoura-red-soft/25 bg-amoura-red/10 text-amoura-red-soft">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
                  AmoreFrame Admin
                </p>
                <h1 className="amoura-serif text-3xl text-amoura-cream sm:text-4xl">
                  Site Monitoring
                </h1>
              </div>
            </div>
          </div>

          <button
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className="amoura-btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh
          </button>
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
          />

          <MetricCard
            icon={CalendarDays}
            label="Users Last 7 Days"
            value={stats.usersLast7Days}
            subtext={`${stats.usersLast30Days} users in 30 days`}
          />

          <MetricCard
            icon={Video}
            label="Dual Mode Rooms"
            value={stats.totalDualRooms}
            subtext={`+${stats.dualRoomsToday} today`}
          />

          <MetricCard
            icon={CheckCircle2}
            label="Completed Dual Sessions"
            value={stats.completedDualRooms}
            subtext={`${stats.activeDualRooms} active now`}
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
                  Growth
                </p>
                <h2 className="amoura-serif text-2xl text-amoura-cream">
                  Last 7 Days
                </h2>
              </div>

              <Activity className="h-5 w-5 text-amoura-red-soft" />
            </div>

            <div className="space-y-4">
              {stats.dailyStats.map((item) => (
                <DailyStatRow
                  key={item.date}
                  item={item}
                  maxValue={maxDailyValue}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
                Dual Mode
              </p>
              <h2 className="amoura-serif text-2xl text-amoura-cream">
                Session Summary
              </h2>
            </div>

            <div className="grid gap-3">
              <SmallMetric
                label="Rooms Last 7 Days"
                value={stats.dualRoomsLast7Days}
              />
              <SmallMetric label="Total Room Members" value={stats.totalDualMembers} />
              <SmallMetric label="Active Rooms" value={stats.activeDualRooms} />
              <SmallMetric
                label="Completion Rate"
                value={`${calculateCompletionRate(
                  stats.completedDualRooms,
                  stats.totalDualRooms
                )}%`}
              />
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amoura-red-soft">
                Recent Activity
              </p>
              <h2 className="amoura-serif text-2xl text-amoura-cream">
                Recent Dual Rooms
              </h2>
            </div>

            <Camera className="h-5 w-5 text-amoura-red-soft" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
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
                    <td
                      colSpan={6}
                      className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-8 text-center text-amoura-muted"
                    >
                      No Dual Mode rooms yet.
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
}: {
  icon: React.ElementType
  label: string
  value: number
  subtext: string
}) {
  return (
    <article className="rounded-[1.5rem] border border-amoura-red-soft/20 bg-black/45 p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amoura-red-soft/25 bg-amoura-red/10 text-amoura-red-soft">
          <Icon className="h-6 w-6" />
        </div>

        <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-amoura-muted">
          Live
        </span>
      </div>

      <p className="text-sm font-medium text-amoura-muted">{label}</p>
      <h2 className="amoura-serif mt-2 text-5xl text-amoura-cream">
        {value.toLocaleString()}
      </h2>
      <p className="mt-3 text-sm text-amoura-red-soft">{subtext}</p>
    </article>
  )
}

function SmallMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">
      <span className="text-sm text-amoura-muted">{label}</span>
      <span className="font-semibold text-amoura-cream">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  )
}

function DailyStatRow({
  item,
  maxValue,
}: {
  item: DailyStat
  maxValue: number
}) {
  const userPercent = Math.max(4, ((item.users ?? 0) / maxValue) * 100)
  const dualPercent = Math.max(4, ((item.dualRooms ?? 0) / maxValue) * 100)
  const completedPercent = Math.max(
    4,
    ((item.completedRooms ?? 0) / maxValue) * 100
  )

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-semibold text-amoura-cream">{formatShortDate(item.date)}</p>
        <p className="text-xs text-amoura-muted">
          {item.users} users · {item.dualRooms} rooms · {item.completedRooms} completed
        </p>
      </div>

      <div className="space-y-2">
        <Bar label="Users" value={item.users} percent={userPercent} />
        <Bar label="Dual Rooms" value={item.dualRooms} percent={dualPercent} />
        <Bar
          label="Completed"
          value={item.completedRooms}
          percent={completedPercent}
        />
      </div>
    </div>
  )
}

function Bar({
  label,
  value,
  percent,
}: {
  label: string
  value: number
  percent: number
}) {
  return (
    <div className="grid grid-cols-[88px_1fr_34px] items-center gap-3 text-xs">
      <span className="text-amoura-muted">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-amoura-red-soft"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-right text-amoura-cream">{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const goodStatuses = ["completed", "ready", "partner_joined"]
  const activeStatuses = ["waiting", "countdown", "capturing", "between_shots"]

  const className = goodStatuses.includes(status)
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
    : activeStatuses.includes(status)
      ? "border-amoura-red-soft/25 bg-amoura-red/10 text-amoura-pink"
      : "border-white/10 bg-white/[0.035] text-amoura-muted"

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${className}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  )
}

function normalizeDailyStats(items: DailyStat[]) {
  return items.map((item) => ({
    ...item,
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
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}