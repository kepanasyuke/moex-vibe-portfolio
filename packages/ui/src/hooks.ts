import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export interface AsyncState<T> {
  status: "loading" | "ready" | "error";
  data?: T;
  error?: string;
}

export interface Toast {
  id: string;
  text: string;
  tone: "info" | "success";
}

const message = (error: unknown): string =>
  error instanceof Error ? error.message : "Не удалось загрузить данные";

const subscribe = <T,>(loader: () => Promise<T>, set: Dispatch<SetStateAction<AsyncState<T>>>) => {
  const flag = { alive: true };

  loader().then(
    (data) => flag.alive && set({ status: "ready", data }),
    (error: unknown) => flag.alive && set({ status: "error", error: message(error) }),
  );

  return () => {
    flag.alive = false;
  };
};

export const useTabs = <T extends string,>(initial: T) => {
  const [tab, setTab] = useState<T>(initial);

  return { tab, setTab };
};

export const useAsync = <T,>(loader: () => Promise<T>, deps: readonly unknown[]) => {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [tick, setTick] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => subscribe(loader, setState), [...deps, tick]);

  return { ...state, reload: () => setTick((value) => value + 1) };
};

export const useToasts = () => {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((text: string, tone: Toast["tone"] = "info") => {
    const toast: Toast = { id: crypto.randomUUID(), text, tone };

    setItems((prev) => [...prev, toast]);
    window.setTimeout(() => setItems((prev) => prev.filter((item) => item.id !== toast.id)), 4200);
  }, []);

  return { items, push };
};

const lockScroll = (locked: boolean): (() => void) => {
  document.body.style.overflow = locked ? "hidden" : "";

  return () => {
    document.body.style.overflow = "";
  };
};

const listenEscape = (onClose: () => void): (() => void) => {
  const handler = (event: KeyboardEvent) => event.key === "Escape" && onClose();

  document.addEventListener("keydown", handler);

  return () => document.removeEventListener("keydown", handler);
};

const combine = (...stops: Array<() => void>): (() => void) => () => stops.forEach((stop) => stop());

const bindDialog = (open: boolean, onClose: () => void): (() => void) =>
  combine(lockScroll(open), listenEscape(onClose));

export const useDialog = (open: boolean, onClose: () => void) => {
  useEffect(() => bindDialog(open, onClose), [open, onClose]);

  return {
    onBackdrop: (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
  };
};

export const useDebounced = <T,>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);

    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export const useClock = (intervalMs = 1000): string => {  const [now, setNow] = useState(() => new Date().toISOString());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date().toISOString()), intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
};
