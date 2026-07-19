import { mutex } from "./baseApi";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("mutex", () => {
  it(
    "wakes every waiter parked before unlock, not just the most recent one",
    async () => {
      mutex.lock();

      const resolved = [false, false, false];

      const p1 = mutex.wait().then(() => {
        resolved[0] = true;
      });
      const p2 = mutex.wait().then(() => {
        resolved[1] = true;
      });
      const p3 = mutex.wait().then(() => {
        resolved[2] = true;
      });

      // None should have resolved yet — still locked, no unlock called.
      expect(resolved).toEqual([false, false, false]);

      mutex.unlock();

      await Promise.all([p1, p2, p3]);

      expect(resolved).toEqual([true, true, true]);
    },
    5000,
  );

  it("unlocking with no waiters does not throw and clears isLocked", () => {
    mutex.lock();
    expect(() => mutex.unlock()).not.toThrow();
    expect(mutex.isLocked).toBe(false);
  });

  it("resets waiters after unlock so a fresh wait() parks again until the next unlock", async () => {
    mutex.lock();
    mutex.unlock();

    const raced = await Promise.race([
      mutex.wait().then(() => "resolved"),
      delay(50).then(() => "timeout"),
    ]);

    expect(raced).toBe("timeout");

    // Clean up the still-parked waiter so it doesn't leak into other tests.
    mutex.unlock();
  });
});
