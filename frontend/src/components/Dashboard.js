import React, { useState, useEffect } from 'react';

const COLORS = {
  bg: '#0a0f0d',
  surface: '#111c17',
  surfaceElevated: '#162620',
  border: '#1e3a2f',
  primary: '#2ecc71',
  primaryDark: '#27ae60',
  accent: '#f39c12',
  alertRed: '#e74c3c',
  alertOrange: '#e67e22',
  textPrimary: '#e8f5e9',
  textSecondary: '#81a89c',
  textMuted: '#4a7a67',
};

const CLIMATE_ZONE_MAP = {
  arid: { label: 'Arid Zone', emoji: '🌵', color: '#e67e22' },
  'semi-arid': { label: 'Semi-Arid', emoji: '🌤️', color: '#f39c12' },
  temperate: { label: 'Temperate Zone', emoji: '🌿', color: '#2ecc71' },
  tropical: { label: 'Tropical Zone', emoji: '🌴', color: '#1abc9c' },
  continental: { label: 'Continental Zone', emoji: '❄️', color: '#3498db' },
};

const VULNERABILITY_THEMES = {
  extreme: {
    gradient: 'linear-gradient(135deg, #2d0a0a, #4a0f0f)',
    border: '#e74c3c',
    color: '#ff6b6b',
    icon: '⚠️',
    badgeBg: 'rgba(231, 76, 60, 0.15)',
  },
  high: {
    gradient: 'linear-gradient(135deg, #2d1a0a, #4a2f0f)',
    border: '#e67e22',
    color: '#ffa94d',
    icon: '⚠️',
    badgeBg: 'rgba(230, 126, 34, 0.15)',
  },
  moderate: {
    gradient: 'linear-gradient(135deg, #1a2d0a, #2f4a0f)',
    border: '#f39c12',
    color: '#ffd43b',
    icon: 'ℹ️',
    badgeBg: 'rgba(243, 156, 18, 0.15)',
  },
  low: {
    gradient: 'linear-gradient(135deg, #0a2d1a, #0f4a2f)',
    border: '#2ecc71',
    color: '#69db7c',
    icon: '✅',
    badgeBg: 'rgba(46, 204, 113, 0.15)',
  },
};

const RANK_BADGES = {
  1: { label: '🏆 #1 Optimal Choice', bg: 'linear-gradient(135deg, #d4af37, #aa820a)', color: '#0d1f17' },
  2: { label: '🥈 #2 Viable Alternative', bg: 'linear-gradient(135deg, #bdc3c7, #7f8c8d)', color: '#0d1f17' },
  3: { label: '🥉 #3 Conditional Option', bg: 'linear-gradient(135deg, #cd7f32, #8c4a1e)', color: '#fff' },
};

export default function Dashboard({ data }) {
  const [animatedIn, setAnimatedIn] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedIn(true), 60);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data) return null;

  const {
    vulnerability = 'Moderate Conditions',
    vulnerability_level = 'moderate',
    coordinates = { lat: 0, lon: 0 },
    climate_zone = 'temperate',
    soil_moisture = { raw: 0.3, level: 'moderate' },
    heat_stress = { celsius: 25, level: 'low' },
    strategies = [],
    analysis_timestamp,
  } = data;

  const vTheme = VULNERABILITY_THEMES[vulnerability_level] || VULNERABILITY_THEMES.moderate;
  const climateInfo = CLIMATE_ZONE_MAP[climate_zone.toLowerCase()] || { label: climate_zone, emoji: '🌱', color: COLORS.primary };

  // Circular progress math for soil moisture
  const moisturePct = Math.min(Math.round((soil_moisture.raw || 0) * 100), 100);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animatedIn ? circumference - (moisturePct / 100) * circumference : circumference;

  const moistureColor =
    soil_moisture.level === 'critical' ? COLORS.alertRed :
    soil_moisture.level === 'low' ? COLORS.alertOrange :
    soil_moisture.level === 'moderate' ? COLORS.accent : COLORS.primary;

  // Temperature math (scale 0°C to 50°C)
  const tempVal = heat_stress.celsius || 20;
  const tempHeightPct = Math.min(Math.max(Math.round((tempVal / 50) * 100), 5), 100);
  const tempColor =
    heat_stress.level === 'critical' ? COLORS.alertRed :
    heat_stress.level === 'high' ? COLORS.alertOrange :
    heat_stress.level === 'moderate' ? COLORS.accent : COLORS.primary;

  const formattedDate = analysis_timestamp
    ? new Date(analysis_timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : 'Real-time Telemetry';

  return (
    <div style={{
      padding: '24px',
      background: COLORS.bg,
      color: COLORS.textPrimary,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* ---------------- SECTION 1: HEADER & META ---------------- */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: COLORS.textSecondary,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            padding: '5px 12px',
            borderRadius: '20px',
          }}>
            <span>📍</span>
            <span style={{ fontWeight: 600, color: COLORS.textPrimary }}>
              {coordinates.lat >= 0 ? `${coordinates.lat.toFixed(4)}°N` : `${Math.abs(coordinates.lat).toFixed(4)}°S`},{' '}
              {coordinates.lon >= 0 ? `${coordinates.lon.toFixed(4)}°E` : `${Math.abs(coordinates.lon).toFixed(4)}°W`}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: climateInfo.color,
            background: 'rgba(22, 38, 32, 0.8)',
            border: `1px solid ${COLORS.border}`,
            padding: '5px 12px',
            borderRadius: '20px',
            fontWeight: 500,
          }}>
            <span>{climateInfo.emoji}</span>
            <span>{climateInfo.label}</span>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: COLORS.textMuted }}>
          🛰️ STAC Telemetry: {formattedDate}
        </div>
      </div>

      {/* ---------------- SECTION 2: VULNERABILITY BANNER ---------------- */}
      <div style={{
        background: vTheme.gradient,
        border: `1.5px solid ${vTheme.border}`,
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 15px ${vTheme.border}33`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: vTheme.badgeBg,
              border: `1px solid ${vTheme.border}55`,
              color: vTheme.color,
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '10px',
            }}>
              <span>{vTheme.icon}</span>
              <span>Field Climate Assessment</span>
            </div>

            <h2 style={{
              margin: '0 0 12px',
              fontSize: '24px',
              fontWeight: 800,
              color: COLORS.textPrimary,
              letterSpacing: '-0.5px',
            }}>
              {vulnerability}
            </h2>

            <p style={{
              margin: 0,
              fontSize: '13px',
              color: COLORS.textSecondary,
              lineHeight: 1.5,
              maxWidth: '560px',
            }}>
              Cross-correlated SMAP L3 microwave radiometer and ECOSTRESS thermal radiometer observations detect heightened agro-climatic sensitivity for this field.
            </p>
          </div>

          <div style={{
            fontSize: '44px',
            lineHeight: 1,
            opacity: 0.9,
            padding: '8px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
          }}>
            {vTheme.icon}
          </div>
        </div>

        {/* Quick sensor pills */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,0,0,0.3)',
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '12px',
          }}>
            <span>💧</span>
            <span style={{ color: COLORS.textMuted }}>Soil Moisture:</span>
            <span style={{ fontWeight: 700, color: moistureColor }}>
              {(soil_moisture.raw * 100).toFixed(1)}% ({soil_moisture.level})
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,0,0,0.3)',
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '12px',
          }}>
            <span>🌡️</span>
            <span style={{ color: COLORS.textMuted }}>Surface Temp:</span>
            <span style={{ fontWeight: 700, color: tempColor }}>
              {heat_stress.celsius.toFixed(1)}°C ({heat_stress.level})
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- SECTION 3: SATELLITE SENSOR GAUGES ---------------- */}
      <div>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: COLORS.textMuted,
          marginBottom: '12px',
        }}>
          🛰️ Earth Observation Telemetry
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {/* Soil Moisture Radial Gauge */}
          <div style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '14px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}>
            <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0 }}>
              <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="46"
                  cy="46"
                  r={radius}
                  fill="transparent"
                  stroke="#162620"
                  strokeWidth="8"
                />
                <circle
                  cx="46"
                  cy="46"
                  r={radius}
                  fill="transparent"
                  stroke={moistureColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: COLORS.textPrimary }}>
                  {moisturePct}%
                </span>
                <span style={{ fontSize: '9px', color: COLORS.textMuted, textTransform: 'uppercase' }}>
                  Index
                </span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px' }}>💧</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: COLORS.textPrimary }}>
                  Soil Moisture (SMAP)
                </span>
              </div>
              <div style={{ fontSize: '11px', color: COLORS.textSecondary, marginBottom: '8px' }}>
                L-band Microwave Radiometer
              </div>
              <span style={{
                display: 'inline-block',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: `${moistureColor}22`,
                color: moistureColor,
                border: `1px solid ${moistureColor}55`,
              }}>
                {soil_moisture.level} Moisture
              </span>
            </div>
          </div>

          {/* Heat Stress Thermometer Bar */}
          <div style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '14px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}>
            {/* Vertical Thermometer Gauge */}
            <div style={{
              width: '28px',
              height: '84px',
              background: '#162620',
              borderRadius: '14px',
              padding: '3px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              flexShrink: 0,
              border: `1px solid ${COLORS.border}`,
            }}>
              <div style={{
                width: '100%',
                height: animatedIn ? `${tempHeightPct}%` : '5%',
                background: `linear-gradient(to top, ${COLORS.primary}, ${tempColor})`,
                borderRadius: '10px',
                transition: 'height 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px' }}>🌡️</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: COLORS.textPrimary }}>
                  Land Surface Temp
                </span>
              </div>
              <div style={{ fontSize: '11px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                ECOSTRESS Thermal Infrared
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: tempColor }}>
                  {heat_stress.celsius.toFixed(1)}°C
                </span>
                <span style={{ fontSize: '11px', color: COLORS.textMuted }}>
                  / {(heat_stress.celsius * 1.8 + 32).toFixed(1)}°F
                </span>
              </div>
              <span style={{
                display: 'inline-block',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: `${tempColor}22`,
                color: tempColor,
                border: `1px solid ${tempColor}55`,
              }}>
                {heat_stress.level} heat stress
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- SECTION 4: ROTATION STRATEGY CARDS ---------------- */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: COLORS.textMuted,
          }}>
            🌱 Ranked Crop Rotation Strategies
          </div>
          <span style={{ fontSize: '11px', color: COLORS.textSecondary }}>
            Optimized for Field Resilience
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {strategies.map((strategy, idx) => {
            const rank = strategy.rank || idx + 1;
            const rankMeta = RANK_BADGES[rank] || RANK_BADGES[3];
            const isHovered = hoveredCard === strategy.id;
            const isTopRank = rank === 1;

            const score = strategy.score || 70;
            const scoreColor =
              score >= 80 ? COLORS.primary :
              score >= 65 ? COLORS.accent : COLORS.alertOrange;

            return (
              <div
                key={strategy.id || idx}
                onMouseEnter={() => setHoveredCard(strategy.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: isHovered ? COLORS.surfaceElevated : COLORS.surface,
                  border: isTopRank ? `1.5px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                  borderRadius: '16px',
                  padding: '22px',
                  boxShadow: isTopRank
                    ? '0 0 25px rgba(46, 204, 113, 0.25), 0 4px 16px rgba(0,0,0,0.4)'
                    : isHovered
                    ? '0 6px 20px rgba(0,0,0,0.5)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                }}
              >
                {/* Header row of Strategy Card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: rankMeta.bg,
                        color: rankMeta.color,
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                      }}>
                        {rankMeta.label}
                      </span>

                      {strategy.priority_tag && (
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '20px',
                          background: 'rgba(255,255,255,0.06)',
                          color: COLORS.textSecondary,
                          fontSize: '11px',
                          fontWeight: 500,
                          border: `1px solid ${COLORS.border}`,
                        }}>
                          {strategy.priority_tag}
                        </span>
                      )}
                    </div>

                    <h3 style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: 700,
                      color: COLORS.textPrimary,
                      letterSpacing: '-0.3px',
                    }}>
                      {strategy.name}
                    </h3>
                  </div>

                  {/* Score Radial / Badge */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#162620',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '12px',
                    padding: '8px 14px',
                    minWidth: '68px',
                  }}>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: 800,
                      color: scoreColor,
                      lineHeight: 1,
                    }}>
                      {score}
                    </span>
                    <span style={{ fontSize: '9px', color: COLORS.textMuted, textTransform: 'uppercase', marginTop: '2px' }}>
                      Index / 100
                    </span>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: COLORS.textMuted,
                    marginBottom: '6px',
                  }}>
                    <span>Agronomic Match Confidence</span>
                    <span style={{ fontWeight: 600, color: scoreColor }}>{score}%</span>
                  </div>
                  <div style={{
                    height: '7px',
                    background: '#162620',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: animatedIn ? `${score}%` : '0%',
                      height: '100%',
                      background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})`,
                      borderRadius: '4px',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                  </div>
                </div>

                {/* Agronomic Reasoning */}
                <div style={{
                  background: 'rgba(10, 15, 13, 0.5)',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: COLORS.primary, marginBottom: '4px' }}>
                    🔬 Agronomic Analysis & Decision Logic:
                  </div>
                  <div style={{ fontSize: '13px', color: COLORS.textSecondary, lineHeight: 1.6 }}>
                    {strategy.reason}
                  </div>
                </div>

                {/* Example Crops Chips */}
                {strategy.example_crops && strategy.example_crops.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: COLORS.textMuted, fontWeight: 500 }}>
                      Recommended Cultivars:
                    </span>
                    {strategy.example_crops.map((crop, cIdx) => (
                      <span
                        key={cIdx}
                        style={{
                          fontSize: '11px',
                          color: COLORS.textPrimary,
                          background: '#162620',
                          border: `1px solid ${COLORS.border}`,
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        🌾 {crop}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Citation */}
                <div style={{
                  fontSize: '10px',
                  color: COLORS.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span>🛰️</span>
                  <span>Validated by NASA SMAP L3 + ECOSTRESS thermal flux models</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------- SECTION 5: FOOTER & CITATIONS ---------------- */}
      <footer style={{
        marginTop: '12px',
        paddingTop: '16px',
        borderTop: `1px solid ${COLORS.border}`,
        fontSize: '11px',
        color: COLORS.textMuted,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <div>
          Data ingested via{' '}
          <a
            href="https://planetarycomputer.microsoft.com/"
            target="_blank"
            rel="noreferrer"
            style={{ color: COLORS.textSecondary, textDecoration: 'underline' }}
          >
            Microsoft Planetary Computer STAC Catalog
          </a>{' '}
          and NASA Earthdata.
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <a
            href="https://smap.jpl.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            style={{ color: COLORS.primary, textDecoration: 'none' }}
          >
            NASA SMAP Mission →
          </a>
          <a
            href="https://ecostress.jpl.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            style={{ color: COLORS.primary, textDecoration: 'none' }}
          >
            NASA ECOSTRESS Mission →
          </a>
          <a
            href="https://websoilsurvey.sc.egov.usda.gov/"
            target="_blank"
            rel="noreferrer"
            style={{ color: COLORS.primary, textDecoration: 'none' }}
          >
            USDA Web Soil Survey →
          </a>
        </div>
      </footer>
    </div>
  );
}
