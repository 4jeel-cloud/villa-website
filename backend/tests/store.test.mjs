import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const store = require("../src/data/store");

describe("store", () => {
  beforeEach(() => {
    store.reset();
  });

  describe("getRooms / getRoom", () => {
    it("returns default rooms", async () => {
      const rooms = await store.getRooms();
      expect(rooms).toHaveLength(2);
      expect(rooms[0].id).toBe("r1");
      expect(rooms[1].id).toBe("r2");
    });

    it("getRoom returns null for unknown id", async () => {
      const room = await store.getRoom("nonexistent");
      expect(room).toBeNull();
    });

    it("getRoom returns matching room", async () => {
      const room = await store.getRoom("r1");
      expect(room).not.toBeNull();
      expect(room.id).toBe("r1");
      expect(room.name).toBe("4 Rooms");
    });
  });

  describe("roomExists", () => {
    it("returns true for existing rooms", async () => {
      expect(await store.roomExists("r1")).toBe(true);
      expect(await store.roomExists("r2")).toBe(true);
    });

    it("returns false for nonexistent rooms", async () => {
      expect(await store.roomExists("r99")).toBe(false);
    });
  });

  describe("createBooking", () => {
    it("creates a booking and returns it", async () => {
      const booking = await store.createBooking({
        roomId: "r1",
        checkIn: "2026-08-01",
        checkOut: "2026-08-03",
        guestName: "Test Guest",
        guestEmail: "test@example.com",
        guestPhone: "+91 9876543210",
      });

      expect(booking.id).toBeTruthy();
      expect(booking.roomName).toBe("4 Rooms");
      expect(booking.status).toBe("confirmed");
      expect(booking.guestName).toBe("Test Guest");
    });

    it("rejects overlapping booking", async () => {
      await store.createBooking({
        roomId: "r1",
        checkIn: "2026-09-01",
        checkOut: "2026-09-03",
        guestName: "First",
        guestEmail: "first@test.com",
        guestPhone: "+91 1111111111",
      });

      await expect(
        store.createBooking({
          roomId: "r1",
          checkIn: "2026-09-02",
          checkOut: "2026-09-04",
          guestName: "Second",
          guestEmail: "second@test.com",
          guestPhone: "+91 2222222222",
        })
      ).rejects.toThrow("Room is already booked or blocked");
    });

    it("allows non-overlapping booking in different room", async () => {
      await store.createBooking({
        roomId: "r1",
        checkIn: "2026-10-01",
        checkOut: "2026-10-03",
        guestName: "First",
        guestEmail: "first@test.com",
        guestPhone: "+91 1111111111",
      });

      const booking = await store.createBooking({
        roomId: "r2",
        checkIn: "2026-10-01",
        checkOut: "2026-10-03",
        guestName: "Second",
        guestEmail: "second@test.com",
        guestPhone: "+91 2222222222",
      });

      expect(booking.guestName).toBe("Second");
    });
  });

  describe("cancelBooking", () => {
    it("cancels an existing booking", async () => {
      const booking = await store.createBooking({
        roomId: "r1",
        checkIn: "2026-11-01",
        checkOut: "2026-11-03",
        guestName: "Cancel Test",
        guestEmail: "cancel@test.com",
        guestPhone: "+91 3333333333",
      });

      const cancelled = await store.cancelBooking(booking.id, {
        reason: "Testing cancellation",
        cancelledBy: "admin",
        refundStatus: "pending",
      });

      expect(cancelled).not.toBeNull();
      expect(cancelled.status).toBe("cancelled");
      expect(cancelled.cancellationReason).toBe("Testing cancellation");
    });

    it("returns null for nonexistent booking", async () => {
      const result = await store.cancelBooking("nonexistent", { reason: "test" });
      expect(result).toBeNull();
    });
  });

  describe("updateRoomPrice", () => {
    it("updates the room price", async () => {
      const updated = await store.updateRoomPrice("r1", 15000);
      expect(updated).not.toBeNull();
      expect(updated.basePrice).toBe(15000);
    });

    it("returns null for unknown room", async () => {
      const result = await store.updateRoomPrice("r99", 10000);
      expect(result).toBeNull();
    });
  });
});
