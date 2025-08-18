"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { Candidate } from "@/lib/types"

interface ResultsChartProps {
  candidates: Candidate[]
  totalVotes: number
  chartType?: "bar" | "pie"
}

export function ResultsChart({ candidates, totalVotes, chartType = "bar" }: ResultsChartProps) {
  const chartData = candidates.map((candidate, index) => ({
    name: candidate.name,
    votes: candidate.voteCount,
    percentage: totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : "0",
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }))

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  if (chartType === "pie") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vote Distribution</CardTitle>
          <CardDescription>Percentage breakdown of votes by candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              votes: {
                label: "Votes",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="votes"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vote Count by Candidate</CardTitle>
        <CardDescription>Total votes received by each candidate</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            votes: {
              label: "Votes",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="votes" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
