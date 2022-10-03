import { onDestroy } from 'svelte';

export function setSafeTimeout(cb: Function, time: number): number {
  const timeout = setTimeout(cb, time);

  onDestroy(() => {
    clearTimeout(timeout);
  });

  return timeout;
}

export function setSafeInterval(
  cb: Function,
  time: number,
  runImmediately = false
): number {
  const interval = setInterval(cb, time);

  onDestroy(() => {
    clearInterval(interval);
  });

  if (runImmediately) {
    cb();
  }

  return interval;
}
