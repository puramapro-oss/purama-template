import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

const PRIMARY = process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? "{{PRIMARY_COLOR}}";
const SECONDARY = process.env.NEXT_PUBLIC_SECONDARY_COLOR ?? "{{SECONDARY_COLOR}}";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const titleRaw = searchParams.get("title") ?? "{{APP_NAME}}";
  const subtitleRaw = searchParams.get("subtitle") ?? "{{APP_DESCRIPTION}}";

  const title = titleRaw.slice(0, 80);
  const subtitle = subtitleRaw.slice(0, 160);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #0A0A0F 50%, ${SECONDARY} 100%)`,
          color: "#F5F5FA",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            {"{{APP_NAME}}".charAt(0)}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 22, opacity: 0.85, letterSpacing: 4 }}>{"{{APP_NAME}}"}</span>
            <span style={{ fontSize: 14, opacity: 0.6 }}>{"{{SLUG}}"}.purama.dev</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <h1
            style={{
              fontSize: 76,
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 600,
              maxWidth: 1000,
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: 30, lineHeight: 1.35, opacity: 0.85, margin: 0, maxWidth: 950 }}>
            {subtitle}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            opacity: 0.7,
            fontSize: 18,
          }}
        >
          <span>SASU PURAMA · 8 Rue Chapelle · 25560 Frasne</span>
          <span>Made with care</span>
        </div>
      </div>
    ),
    SIZE,
  );
}
