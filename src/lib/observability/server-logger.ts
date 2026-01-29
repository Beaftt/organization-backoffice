type ServerLogLevel = "info" | "warn" | "error";

type ServerLogPayload = {
  timestamp: string;
  level: ServerLogLevel;
  event: string;
  message: string;
  path?: string;
  data?: Record<string, unknown>;
};

const isEnabled =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED !== "false"
    : true;

const safeSerialize = (payload: ServerLogPayload) => {
  try {
    return JSON.stringify(payload);
  } catch {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: payload.level,
      event: "server_log_serialization_failed",
      message: "Failed to serialize server log payload",
    });
  }
};

export const logServerEvent = (
  level: ServerLogLevel,
  event: string,
  message: string,
  data?: Record<string, unknown>,
) => {
  if (!isEnabled) return;
  const payload: ServerLogPayload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    message,
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
