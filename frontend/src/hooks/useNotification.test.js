import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotification } from "./useNotification";

describe("useNotification", () => {
  it("starts with null notification", () => {
    const { result } = renderHook(() => useNotification());
    expect(result.current.notification).toBeNull();
  });

  it("shows a notification", () => {
    const { result } = renderHook(() => useNotification(9999));
    act(() => { result.current.showNotification("success", "Test message"); });
    expect(result.current.notification).toEqual({ type: "success", text: "Test message" });
  });

  it("dismisses a notification", () => {
    const { result } = renderHook(() => useNotification(9999));
    act(() => { result.current.showNotification("success", "Test"); });
    expect(result.current.notification).not.toBeNull();
    act(() => { result.current.dismissNotification(); });
    expect(result.current.notification).toBeNull();
  });
});
