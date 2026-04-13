import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

function buildRadarPoints(dimensions, radius) {
  const count = dimensions.length;
  return dimensions
    .map((item, index) => {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2) / count;
      const r = radius * (item.value / 10);
      const x = 80 + Math.cos(angle) * r;
      const y = 80 + Math.sin(angle) * r;
      return `${x},${y}`;
    })
    .join(" ");
}

function buildHexagon(radius) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2) / 6;
    const x = 80 + Math.cos(angle) * radius;
    const y = 80 + Math.sin(angle) * radius;
    return `${x},${y}`;
  }).join(" ");
}

function getNodeLabelLayout(index, total, radius) {
  const angle = (-Math.PI / 2) + (index * Math.PI * 2) / total;
  const x = 80 + Math.cos(angle) * radius;
  const y = 80 + Math.sin(angle) * radius;

  let textAnchor = "middle";
  if (Math.cos(angle) > 0.28) textAnchor = "start";
  if (Math.cos(angle) < -0.28) textAnchor = "end";

  let dy = 0;
  if (Math.sin(angle) < -0.5) dy = -6;
  if (Math.sin(angle) > 0.5) dy = 12;

  return { x, y, angle, textAnchor, dy };
}

export const ShareImageCard = forwardRef(function ShareImageCard(
  {
    title,
    titleEn,
    personaName,
    summary,
    campLabel,
    campName,
    dimensionTitle,
    dimensions,
    qrUrl,
    footerCta,
    footerDisclaimer,
    websiteLabel,
  },
  ref,
) {
  const radarPolygon = buildRadarPoints(dimensions, 46);
  const outerHexagon = buildHexagon(52);
  const middleHexagon = buildHexagon(36);
  const innerHexagon = buildHexagon(20);

  return (
    <div
      ref={ref}
      className="relative w-[420px] overflow-hidden rounded-[40px] border border-[#e7dccf] bg-[#fbf7f0] p-5 text-[#2f2721] shadow-[0_28px_80px_rgba(111,86,57,0.14)]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 8% 0%, rgba(196,154,118,0.22), transparent 30%), radial-gradient(circle at 92% 10%, rgba(146,160,132,0.16), transparent 26%), radial-gradient(circle at 50% 100%, rgba(202,171,137,0.14), transparent 34%), linear-gradient(180deg, #fffaf3 0%, #f7eee2 52%, #f3e8da 100%)",
        fontFamily:
          '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
      }}
    >
      <div className="pointer-events-none absolute -left-10 top-8 h-32 w-32 rounded-full bg-[#e9c7a7]/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 top-20 h-28 w-28 rounded-full bg-[#c7d1ba]/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 right-6 h-20 w-20 rounded-full bg-[#efd8bf]/30 blur-2xl" />

      <div className="relative overflow-hidden rounded-[30px] border border-[#eadfce] bg-[#fffdf9]/95 p-5">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(120deg,transparent_0%,rgba(208,177,143,0.09)_28%,transparent_55%)]" />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full border border-[#e7dbcc] bg-[#faf3e9] px-3 py-1 text-[11px] tracking-[0.18em] text-[#8f7766]">
              {title}
            </div>
            {titleEn ? (
              <div className="mt-2 text-[12px] tracking-[0.14em] text-[#8f7766]">{titleEn}</div>
            ) : null}
          </div>
          <div className="rounded-full bg-[#f2e7d7] px-3 py-1 text-[11px] tracking-[0.14em] text-[#8d7462]">
            {campName}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] bg-gradient-to-br from-[#f6e7d5] via-[#fff8ef] to-[#f1e3d2] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div
            className="mt-3 text-[40px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#2f2721]"
            style={{
              fontFamily: '"Songti SC", "Noto Serif SC", "Source Han Serif SC", serif',
            }}
          >
            {personaName}
          </div>
          <div className="mt-4 rounded-[22px] border border-[#eadbc9] bg-[#fffdf8]/88 px-4 py-4 text-[15px] leading-7 text-[#43352d] shadow-[0_10px_24px_rgba(111,86,57,0.05)]">
            {summary}
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-[#eadfce] bg-[#fffaf4] p-4">
          <div className="text-[12px] tracking-[0.14em] text-[#917a68]">{campLabel}</div>
          <div className="mt-2 text-[18px] font-semibold text-[#2f2721]">{campName}</div>
        </div>
      </div>

      <div className="relative mt-4 rounded-[30px] border border-[#eadfce] bg-[#fffdf9]/94 p-4">
        <div className="text-[12px] tracking-[0.16em] text-[#907968]">{dimensionTitle}</div>
        <div className="mt-3 flex justify-center">
          <div className="rounded-[24px] bg-[#f8f1e7] p-3">
            <svg width="190" height="190" viewBox="0 0 190 190" role="img" aria-label={dimensionTitle}>
              <g transform="translate(15 15)">
              <polygon points={outerHexagon} fill="none" stroke="#dccab7" strokeWidth="1.2" />
              <polygon points={middleHexagon} fill="none" stroke="#e6d7c8" strokeWidth="1.1" />
              <polygon points={innerHexagon} fill="none" stroke="#efe4d8" strokeWidth="1" />
              {dimensions.map((item, index) => {
                const angle = (-Math.PI / 2) + (index * Math.PI * 2) / dimensions.length;
                const x = 80 + Math.cos(angle) * 52;
                const y = 80 + Math.sin(angle) * 52;
                return (
                  <line
                    key={item.key}
                    x1="80"
                    y1="80"
                    x2={x}
                    y2={y}
                    stroke="#e8dacb"
                    strokeWidth="1"
                  />
                );
              })}
              <polygon
                points={radarPolygon}
                fill="rgba(185,125,89,0.26)"
                stroke="#b97d59"
                strokeWidth="2"
              />
              {dimensions.map((item, index) => {
                const angle = (-Math.PI / 2) + (index * Math.PI * 2) / dimensions.length;
                const r = 46 * (item.value / 10);
                const x = 80 + Math.cos(angle) * r;
                const y = 80 + Math.sin(angle) * r;
                return <circle key={`${item.key}-dot`} cx={x} cy={y} r="3" fill="#b97d59" />;
              })}
              {dimensions.map((item, index) => {
                const layout = getNodeLabelLayout(index, dimensions.length, 68);
                return (
                  <g key={`${item.key}-label`}>
                    <text
                      x={layout.x}
                      y={layout.y + layout.dy}
                      textAnchor={layout.textAnchor}
                      fontSize="10"
                      fill="#7a6657"
                      letterSpacing="0.02em"
                    >
                      {item.label}
                    </text>
                    <text
                      x={layout.x}
                      y={layout.y + layout.dy + 13}
                      textAnchor={layout.textAnchor}
                      fontSize="12"
                      fontWeight="600"
                      fill="#2f2721"
                    >
                      {item.score}
                    </text>
                  </g>
                );
              })}
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[32px] border border-[#dccbb6] bg-gradient-to-br from-[#2f2721] via-[#4b3a31] to-[#6f5546] p-5 text-[#f9f1e5] shadow-[0_18px_42px_rgba(70,52,38,0.18)]">
        <div className="flex items-center gap-4">
          <div className="rounded-[24px] border border-[#eadfce] bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.14)]">
            <QRCodeSVG
              value={qrUrl}
              size={110}
              bgColor="#ffffff"
              fgColor="#2f2721"
              includeMargin
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mt-3 text-[18px] font-semibold leading-7 text-[#fff7ee]">{footerCta}</div>
            <div className="mt-3 rounded-[16px] bg-white/10 px-3 py-2 text-[12px] leading-6 text-[#f0dfce] break-all">
              {websiteLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 px-2 text-center text-[11px] leading-6 text-[#8a7768]">
        <div className="font-medium text-[#6f5d51]">{footerCta}</div>
        <div>{footerDisclaimer}</div>
      </div>
    </div>
  );
});
