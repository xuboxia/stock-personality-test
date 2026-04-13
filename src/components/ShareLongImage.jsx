import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

function buildPolygonPoints(items, radius, center = 96) {
  return items
    .map((item, index) => {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2) / items.length;
      const r = radius * (item.value / 10);
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      return `${x},${y}`;
    })
    .join(" ");
}

function buildRing(radius, count = 6, center = 96) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2) / count;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    return `${x},${y}`;
  }).join(" ");
}

function getLabelPosition(index, total, radius, center = 96) {
  const angle = (-Math.PI / 2) + (index * Math.PI * 2) / total;
  const x = center + Math.cos(angle) * radius;
  const y = center + Math.sin(angle) * radius;

  let textAnchor = "middle";
  if (Math.cos(angle) > 0.28) textAnchor = "start";
  if (Math.cos(angle) < -0.28) textAnchor = "end";

  let dy = 0;
  if (Math.sin(angle) < -0.5) dy = -8;
  if (Math.sin(angle) > 0.5) dy = 14;

  return { x, y, textAnchor, dy };
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-[26px] border border-[#eadfce] bg-[#fffdf9]/94 p-5 shadow-[0_10px_26px_rgba(111,86,57,0.06)]">
      <div className="text-[12px] tracking-[0.16em] text-[#907968]">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ExplainCard({ title, content }) {
  return (
    <div className="rounded-[22px] border border-[#eadfce] bg-[#fbf5ed] p-4">
      <div className="text-[13px] font-medium tracking-[0.06em] text-[#836d5e]">{title}</div>
      <div className="mt-2 text-[15px] leading-7 text-[#43352d]">{content}</div>
    </div>
  );
}

export const ShareLongImage = forwardRef(function ShareLongImage(
  {
    title,
    titleEn,
    persona,
    camp,
    campLabel,
    summaryLabel,
    insight,
    dimensions,
    radarTitle,
    explainTitle,
    explainCards,
    closeTypesTitle,
    closeTypesBody,
    closePersonas,
    peopleTitle,
    peopleBody,
    peopleCards,
    shareTitle,
    shareText,
    qrUrl,
    footerCta,
    footerDisclaimer,
    websiteLabel,
  },
  ref,
) {
  const polygon = buildPolygonPoints(dimensions, 56);
  const outer = buildRing(64);
  const middle = buildRing(44);
  const inner = buildRing(24);

  return (
    <div
      ref={ref}
      className="w-[430px] overflow-hidden rounded-[40px] border border-[#e7dccf] bg-[#fbf7f0] p-5 text-[#2f2721] shadow-[0_28px_80px_rgba(111,86,57,0.14)]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 8% 0%, rgba(196,154,118,0.22), transparent 30%), radial-gradient(circle at 92% 10%, rgba(146,160,132,0.16), transparent 26%), radial-gradient(circle at 50% 100%, rgba(202,171,137,0.14), transparent 34%), linear-gradient(180deg, #fffaf3 0%, #f7eee2 52%, #f3e8da 100%)",
        fontFamily:
          '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
      }}
    >
      <div className="pointer-events-none absolute" />

      <div className="rounded-[30px] border border-[#eadfce] bg-[#fffdf9]/95 p-5">
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
            {camp.label}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] bg-gradient-to-br from-[#f6e7d5] via-[#fff8ef] to-[#f1e3d2] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div
            className="text-[40px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#2f2721]"
            style={{
              fontFamily: '"Songti SC", "Noto Serif SC", "Source Han Serif SC", serif',
            }}
          >
            {persona.name}
          </div>
          <div className="mt-3 text-[15px] leading-7 text-[#6f5d51]">{persona.subtitle}</div>
          <div className="mt-4 rounded-[22px] border border-[#eadbc9] bg-[#fffdf8]/88 px-4 py-4 text-[15px] leading-7 text-[#43352d] shadow-[0_10px_24px_rgba(111,86,57,0.05)]">
            {persona.oneLiner}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[18px] border border-[#eadbc9] bg-[#fffdf9] p-4">
              <div className="text-[12px] tracking-[0.14em] text-[#8f7766]">{campLabel}</div>
              <div className="mt-2 text-[18px] font-semibold text-[#2f2721]">{camp.label}</div>
            </div>
            <div className="rounded-[18px] border border-[#eadbc9] bg-[#fffdf9] p-4">
              <div className="text-[12px] tracking-[0.14em] text-[#8f7766]">{summaryLabel}</div>
              <div className="mt-2 text-[14px] leading-6 text-[#43352d]">{insight.contrast}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <SectionCard title={radarTitle}>
          <div className="text-[14px] leading-6 text-[#6f5d51]">{insight.headline}</div>
          <div className="mt-4 flex justify-center rounded-[24px] bg-[#f8f1e7] p-4">
            <svg width="230" height="230" viewBox="0 0 230 230" role="img" aria-label="radar chart">
              <g transform="translate(19 19)">
                <polygon points={outer} fill="none" stroke="#dccab7" strokeWidth="1.2" />
                <polygon points={middle} fill="none" stroke="#e6d7c8" strokeWidth="1.1" />
                <polygon points={inner} fill="none" stroke="#efe4d8" strokeWidth="1" />
                {dimensions.map((item, index) => {
                  const angle = (-Math.PI / 2) + (index * Math.PI * 2) / dimensions.length;
                  const x = 96 + Math.cos(angle) * 64;
                  const y = 96 + Math.sin(angle) * 64;
                  return (
                    <line
                      key={item.key}
                      x1="96"
                      y1="96"
                      x2={x}
                      y2={y}
                      stroke="#e8dacb"
                      strokeWidth="1"
                    />
                  );
                })}
                <polygon
                  points={polygon}
                  fill="rgba(185,125,89,0.26)"
                  stroke="#b97d59"
                  strokeWidth="2.4"
                />
                {dimensions.map((item, index) => {
                  const angle = (-Math.PI / 2) + (index * Math.PI * 2) / dimensions.length;
                  const r = 56 * (item.value / 10);
                  const x = 96 + Math.cos(angle) * r;
                  const y = 96 + Math.sin(angle) * r;
                  return <circle key={`${item.key}-dot`} cx={x} cy={y} r="3.2" fill="#b97d59" />;
                })}
                {dimensions.map((item, index) => {
                  const layout = getLabelPosition(index, dimensions.length, 82);
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
          <div className="mt-4 rounded-[20px] bg-[#fbf5ed] px-4 py-4 text-[15px] leading-7 text-[#43352d]">
            {insight.insight}
          </div>
        </SectionCard>

        <SectionCard title={explainTitle}>
          <div className="space-y-3">
            {explainCards.map((item) => (
              <ExplainCard key={item.title} title={item.title} content={item.content} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title={closeTypesTitle}>
          <div className="text-[14px] leading-6 text-[#6f5d51]">{closeTypesBody}</div>
          <div className="mt-4 space-y-3">
            {closePersonas.map((persona) => (
              <div
                key={persona.name}
                className="rounded-[22px] border border-[#eadfce] bg-[#fbf5ed] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[17px] font-semibold text-[#2f2721]">{persona.name}</div>
                  <div className="rounded-full bg-[#f2e5d7] px-3 py-1 text-[11px] tracking-[0.14em] text-[#8c7463]">
                    {persona.camp}
                  </div>
                </div>
                <div className="mt-2 text-[14px] leading-6 text-[#79685b]">{persona.subtitle}</div>
                <div className="mt-3 text-[15px] leading-7 text-[#43352d]">{persona.reason}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={peopleTitle}>
          <div className="text-[14px] leading-6 text-[#6f5d51]">{peopleBody}</div>
          <div className="mt-4 space-y-3">
            {peopleCards.map((person) => (
              <div
                key={person.name}
                className="rounded-[22px] border border-[#eadfce] bg-[#fbf5ed] p-4"
              >
                <div className="text-[17px] font-semibold text-[#2f2721]">{person.name}</div>
                <div className="mt-1 text-[14px] leading-6 text-[#79685b]">{person.shortLabel}</div>
                <div className="mt-3 text-[15px] leading-7 text-[#43352d]">{person.likePoint}</div>
                <div className="mt-3 text-[14px] leading-7 text-[#5b4b41]">{person.story}</div>
                <div className="mt-3 text-[13px] leading-6 text-[#7c685a]">
                  {person.keywords.join(" / ")}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={shareTitle}>
          <div className="rounded-[22px] bg-[#fbf5ed] px-4 py-4 text-[15px] leading-7 text-[#43352d]">
            {shareText}
          </div>
        </SectionCard>

        <div className="overflow-hidden rounded-[32px] border border-[#dccbb6] bg-gradient-to-br from-[#2f2721] via-[#4b3a31] to-[#6f5546] p-5 text-[#f9f1e5] shadow-[0_18px_42px_rgba(70,52,38,0.18)]">
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
              <div className="text-[18px] font-semibold leading-7 text-[#fff7ee]">{footerCta}</div>
              <div className="mt-3 rounded-[16px] bg-white/10 px-3 py-2 text-[12px] leading-6 text-[#f0dfce] break-all">
                {websiteLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 text-center text-[11px] leading-6 text-[#8a7768]">
          <div className="font-medium text-[#6f5d51]">{footerCta}</div>
          <div>{footerDisclaimer}</div>
        </div>
      </div>
    </div>
  );
});
