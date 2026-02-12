import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ActivityIcon, AlertCircleIcon, CheckCircleIcon, CpuIcon, HardDriveIcon, ServerIcon, WifiOffIcon } from 'lucide-react';
import { FastApiHealth } from '../types';

interface FastApiHealthCardProps {
    health: FastApiHealth;
}

export function FastApiHealthCard({ health }: FastApiHealthCardProps) {
    return (
        <Card className={cn(
            "border bg-card shadow-sm transition-all duration-200",
            health?.status === 'healthy' && "border-l-4 border-l-emerald-500",
            health?.status === 'degraded' && "border-l-4 border-l-amber-500",
            health?.status === 'unhealthy' && "border-l-4 border-l-red-500",
            health?.status === 'offline' && "border-l-4 border-l-zinc-400",
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <div className="rounded-lg bg-teal-500/10 p-1.5">
                            <ServerIcon className="h-4 w-4 text-teal-500" />
                        </div>
                        FastAPI Service Status
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className={cn(
                            "border px-2.5 py-0.5 text-xs font-medium",
                            health?.status === 'healthy' && "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
                            health?.status === 'degraded' && "border-amber-500/30 bg-amber-500/10 text-amber-500",
                            health?.status === 'unhealthy' && "border-red-500/30 bg-red-500/10 text-red-500",
                            health?.status === 'offline' && "border-zinc-500/30 bg-zinc-500/10 text-zinc-500",
                        )}
                    >
                        {health?.status === 'healthy' && <CheckCircleIcon className="mr-1 h-3 w-3" />}
                        {health?.status === 'degraded' && <AlertCircleIcon className="mr-1 h-3 w-3" />}
                        {health?.status === 'unhealthy' && <AlertCircleIcon className="mr-1 h-3 w-3" />}
                        {health?.status === 'offline' && <WifiOffIcon className="mr-1 h-3 w-3" />}
                        {health?.status ? health.status.charAt(0).toUpperCase() + health.status.slice(1) : 'Unknown'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {health?.status === 'offline' ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <WifiOffIcon className="h-4 w-4" />
                        <span>{health?.error || 'Unable to connect to FastAPI service'}</span>
                    </div>
                ) : health?.system ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                        {/* CPU Usage */}
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "rounded-lg p-2",
                                health?.checks?.cpu_ok ? "bg-emerald-500/10" : "bg-red-500/10"
                            )}>
                                <CpuIcon className={cn(
                                    "h-4 w-4",
                                    health?.checks?.cpu_ok ? "text-emerald-500" : "text-red-500"
                                )} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">CPU Usage</p>
                                <p className="text-lg font-semibold tabular-nums text-foreground">
                                    {health.system.cpu_percent}%
                                </p>
                            </div>
                        </div>

                        {/* Memory Usage */}
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "rounded-lg p-2",
                                health?.checks?.memory_ok ? "bg-emerald-500/10" : "bg-red-500/10"
                            )}>
                                <ActivityIcon className={cn(
                                    "h-4 w-4",
                                    health?.checks?.memory_ok ? "text-emerald-500" : "text-red-500"
                                )} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Memory</p>
                                <p className="text-lg font-semibold tabular-nums text-foreground">
                                    {health.system.memory_percent}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {health.system.memory_used_gb} / {health.system.memory_total_gb} GB
                                </p>
                            </div>
                        </div>

                        {/* Disk Usage */}
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "rounded-lg p-2",
                                health?.checks?.disk_ok ? "bg-emerald-500/10" : "bg-red-500/10"
                            )}>
                                <HardDriveIcon className={cn(
                                    "h-4 w-4",
                                    health?.checks?.disk_ok ? "text-emerald-500" : "text-red-500"
                                )} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Disk</p>
                                <p className="text-lg font-semibold tabular-nums text-foreground">
                                    {health.system.disk_percent}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {health.system.disk_used_gb} / {health.system.disk_total_gb} GB
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircleIcon className="h-4 w-4" />
                        <span>{health?.error || 'Service status unavailable'}</span>
                    </div>
                )}

                {health?.service && health?.version && (
                    <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                        <span>{health.service}</span>
                        <span>v{health.version}</span>
                        <span>Last checked: {new Date(health.timestamp).toLocaleTimeString()}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
