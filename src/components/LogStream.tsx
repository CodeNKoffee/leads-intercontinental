import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface LogStreamProps {
  logs: LogEntry[];
}

const typeColors: Record<LogEntry["type"], string> = {
  info: "text-muted-foreground",
  success: "text-log-green",
  warning: "text-primary",
  error: "text-destructive",
};

export function LogStream({ logs }: LogStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-log-green animate-sovereign-pulse" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Live Execution Stream
        </span>
      </div>
      <div className="h-[180px] overflow-y-auto p-3 font-mono text-xs leading-relaxed">
        {logs.length === 0 && (
          <span className="text-muted-foreground">System ready for deployment...</span>
        )}
        {logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${typeColors[log.type]} mb-0.5`}
          >
            <span className="text-muted-foreground/60">[{log.timestamp}]</span>{" "}
            {log.message}
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
