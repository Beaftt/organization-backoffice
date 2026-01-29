type ClientLogLevel = "info" | "warn" | "error";

type ClientLogPayload = {
  timestamp: string;
  level: ClientLogLevel;
  event: string;
  message: string;
  path?: string;
  data?: Record<string, unknown>;
};

const isEnabled =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED !== "false"
    : true;

const safeSerialize = (payload: ClientLogPayload) => {
  try {
    return JSON.stringify(payload);
  } catch {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: payload.level,
      event: "client_log_serialization_failed",
      message: "Failed to serialize client log payload",
    });
  }
};

export const logClientEvent = (
  level: ClientLogLevel,
  event: string,
  message: string,
  data?: Record<string, unknown>,
) => {
  if (!isEnabled) return;
  const path = typeof window !== "undefined" ? window.location.pathname : undefined;
  const payload: ClientLogPayload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    message,
    path,
    data,
  };

  const line = safeSerialize(payload);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
};
