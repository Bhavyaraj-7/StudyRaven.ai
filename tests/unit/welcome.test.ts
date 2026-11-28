import { describe, expect, it } from "vitest";
import { firstName } from "../../components/welcome/shared";

describe("welcome film name", () => {
  it("uses the first name only", () => expect(firstName("Aarav Mehta")).toBe("Aarav"));
  it("trims stray spaces", () => expect(firstName("  Zoya   Khan ")).toBe("Zoya"));
  it("falls back to nothing when there is no name", () => expect(firstName("   ")).toBe(""));
  it("caps very long names so the title never overflows", () =>
    expect(firstName("Venkataramanarayanaswamy").length).toBe(18));
});
