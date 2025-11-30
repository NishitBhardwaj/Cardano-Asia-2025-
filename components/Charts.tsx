'use client';

/**
 * Charts Components - Wrapper for Recharts
 * 
 * This component provides pre-configured chart components
 * that handle the recharts library properly with Next.js
 */

import {
    ResponsiveContainer,
    AreaChart as RechartsAreaChart,
    Area as RechartsArea,
    BarChart as RechartsBarChart,
    Bar as RechartsBar,
    PieChart as RechartsPieChart,
    Pie as RechartsPie,
    Cell as RechartsCell,
    XAxis as RechartsXAxis,
    YAxis as RechartsYAxis,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
} from 'recharts';

// ============================================================================
// BAR CHART COMPONENT
// ============================================================================

interface BarChartData {
    name: string;
    [key: string]: string | number;
}

interface SimpleBarChartProps {
    data: BarChartData[];
    bars: { dataKey: string; name: string; fill: string; opacity?: number }[];
    height?: number;
    showLegend?: boolean;
}

export function SimpleBarChart({ data, bars, height = 256, showLegend = false }: SimpleBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart data={data}>
                <RechartsXAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                <RechartsYAxis stroke="#6b7280" fontSize={11} />
                <RechartsTooltip
                    contentStyle={{
                        backgroundColor: 'hsl(224, 37%, 15%)',
                        border: '1px solid hsl(216, 34%, 17%)',
                        borderRadius: '8px',
                    }}
                />
                {showLegend && <RechartsLegend />}
                {bars.map((bar, index) => (
                    <RechartsBar
                        key={index}
                        dataKey={bar.dataKey}
                        name={bar.name}
                        fill={bar.fill}
                        opacity={bar.opacity}
                        radius={[4, 4, 0, 0] as [number, number, number, number]}
                    />
                ))}
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}

// ============================================================================
// AREA CHART COMPONENT
// ============================================================================

interface AreaChartData {
    [key: string]: string | number;
}

interface SimpleAreaChartProps {
    data: AreaChartData[];
    areas: { dataKey: string; stroke: string; fill: string }[];
    xAxisKey?: string;
    height?: number;
}

export function SimpleAreaChart({ data, areas, xAxisKey = 'name', height = 256 }: SimpleAreaChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsAreaChart data={data}>
                <RechartsXAxis dataKey={xAxisKey} stroke="#6b7280" fontSize={11} />
                <RechartsYAxis stroke="#6b7280" fontSize={11} />
                <RechartsTooltip
                    contentStyle={{
                        backgroundColor: 'hsl(224, 37%, 15%)',
                        border: '1px solid hsl(216, 34%, 17%)',
                        borderRadius: '8px',
                    }}
                />
                {areas.map((area, index) => (
                    <RechartsArea
                        key={index}
                        type="monotone"
                        dataKey={area.dataKey}
                        stroke={area.stroke}
                        fill={area.fill}
                        fillOpacity={0.3}
                    />
                ))}
            </RechartsAreaChart>
        </ResponsiveContainer>
    );
}

// ============================================================================
// PIE CHART COMPONENT
// ============================================================================

interface PieChartData {
    name: string;
    value: number;
    color: string;
}

interface SimplePieChartProps {
    data: PieChartData[];
    height?: number;
    showLegend?: boolean;
    innerRadius?: number;
    outerRadius?: number;
}

export function SimplePieChart({ 
    data, 
    height = 200, 
    showLegend = false,
    innerRadius = 0,
    outerRadius = 60,
}: SimplePieChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
                <RechartsPie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <RechartsCell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </RechartsPie>
                <RechartsTooltip
                    contentStyle={{
                        backgroundColor: 'hsl(224, 37%, 15%)',
                        border: '1px solid hsl(216, 34%, 17%)',
                        borderRadius: '8px',
                    }}
                />
                {showLegend && <RechartsLegend />}
            </RechartsPieChart>
        </ResponsiveContainer>
    );
}

// ============================================================================
// PROGRESS BAR COMPONENT (Simple CSS-based)
// ============================================================================

interface ProgressBarProps {
    value: number;
    max?: number;
    height?: number;
    color?: string;
    showLabel?: boolean;
}

export function ProgressBar({
    value,
    max = 100,
    height = 8,
    color = 'var(--primary)',
    showLabel = false,
}: ProgressBarProps) {
    const percentage = Math.min((value / max) * 100, 100);
    
    return (
        <div className="w-full">
            <div 
                className="bg-white/10 rounded-full overflow-hidden"
                style={{ height }}
            >
                <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
            {showLabel && (
                <p className="text-xs text-foreground/60 mt-1">
                    {percentage.toFixed(1)}%
                </p>
            )}
        </div>
    );
}

// Export all as default
const Charts = {
    SimpleBarChart,
    SimpleAreaChart,
    SimplePieChart,
    ProgressBar,
};

export default Charts;

