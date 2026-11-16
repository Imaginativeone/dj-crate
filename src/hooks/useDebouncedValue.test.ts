import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

// Fake timers let the test "fast-forward" time instead of really waiting.
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("useDebouncedValue", () => {
  it("only updates after the value stops changing", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 250), {
      initialProps: { value: "b" },
    });

    rerender({ value: "be" });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: "bea" }); // typed again before 250ms: the timer restarts
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe("b");

    act(() => jest.advanceTimersByTime(50));
    expect(result.current).toBe("bea");
  });
});
