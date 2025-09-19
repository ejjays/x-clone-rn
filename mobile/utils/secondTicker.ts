import { AppState } from "react-native";

type Listener = (nowMs: number) => void;

let listeners: Set<Listener> = new Set();
let intervalId: any = null;
let timeoutId: any = null;
let started = false;

const tick = () => {
  const now = Date.now();
  listeners.forEach((cb) => {
    try {
      cb(now);
    } catch {}
  });
};

const startTimerAligned = () => {
  clearTimers();
  const now = Date.now();
  const delay = 1000 - (now % 1000);
  timeoutId = setTimeout(() => {
    tick();
    intervalId = setInterval(tick, 1000);
  }, delay);
};

const clearTimers = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const handleAppStateChange = (state: string) => {
  if (state === "active") {
    startTimerAligned();
  } else {
    clearTimers();
  }
};

const ensureStarted = () => {
  if (started) return;
  started = true;
  AppState.addEventListener("change", handleAppStateChange);
  startTimerAligned();
};

export const subscribeToSecondTicks = (cb: Listener) => {
  ensureStarted();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) {
      clearTimers();
      AppState.removeEventListener?.("change", handleAppStateChange as any);
      started = false;
    }
  };
};

