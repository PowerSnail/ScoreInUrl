export function expect<T>(v: T | null, message: string): T {
  if (v == null) {
    throw new Error(message);
  }
  return v;
}

export function expectElementById<T extends HTMLElement>(id: string): T {
  return <T>expect(document.getElementById(id), `${id} not found.`);
}

type Callable<A> = (...args: A[]) => void;

export function delayed<A>(time_ms: number, task: Callable<A>): Callable<A> {
  let taskId: number | null = null;
  return (...args: A[]) => {
    if (taskId != null) {
      clearTimeout(taskId);
    }
    taskId = window.setTimeout(() => task(...args), time_ms);
  };
}
