import { ImageResponse } from "next/og";

export const alt = "StudyRaven — AI study partner for IGCSE and IB, Grades 8–12";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Basic share card until the Phase 1a brand mark exists. Built at deploy
// time — no runtime cost.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FCFCFA",
          color: "#0B0B0C",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 600 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#0B0B0C",
              color: "#FCFCFA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
            }}
          >
            S
          </div>
          StudyRaven
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
            Your AI study partner for IGCSE and IB.
          </div>
          <div style={{ fontSize: 32, color: "#3D3D40" }}>
            AI-marked mock tests, study plans and a college guide. Grades 8–12.
          </div>
        </div>
        <div style={{ fontSize: 26, color: "#6B6B70" }}>studyravenai.com</div>
      </div>
    ),
    size,
  );
}
