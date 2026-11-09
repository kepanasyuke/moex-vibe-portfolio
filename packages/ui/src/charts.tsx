export interface SparklineProps {
  points: number[];
  height?: number;
  tone?: "up" | "down" | "neutral";
  fill?: boolean;
  label?: string;
}

interface Geometry {
  min: number;
  span: number;
  step: number;
  height: number;
}

const geometry = (points: number[], width: number, height: number): Geometry => ({
  min: Math.min(...points),
  span: (Math.max(...points) - Math.min(...points)) || 1,
  step: points.length > 1 ? width / (points.length - 1) : width,
  height,
});

const pointAt = (point: number, index: number, geometry: Geometry): string => {
  const y = geometry.height - ((point - geometry.min) / geometry.span) * (geometry.height - 6) - 3;

  return `${index === 0 ? "M" : "L"}${(index * geometry.step).toFixed(1)},${y.toFixed(1)}`;
};

const path = (points: number[], width: number, height: number): string => {
  const frame = geometry(points, width, height);

  return points.map((point, index) => pointAt(point, index, frame)).join(" ");
};

const plot = (points: number[], height: number, tone: SparklineProps["tone"]) => ({
  line: path(points, 320, height),
  color: tone === "up" ? "#0a7f4f" : tone === "down" ? "#c40000" : "#1e1f24",
  width: 320,
});

export const Sparkline = ({ points, height = 64, tone = "neutral", fill = true, label }: SparklineProps) => {
  const view = plot(points, height, tone);

  return (
    <svg
      viewBox={`0 0 ${view.width} ${height}`}
      className="sparkline"
      preserveAspectRatio="none"
      role="img"
      aria-label={label ?? "График"}
      style={{ width: "100%", height }}
    >
      {fill && <path d={`${view.line} L${view.width},${height} L0,${height} Z`} fill={view.color} opacity="0.08" />}
      <path d={view.line} fill="none" stroke={view.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

export const VolumeBar = ({ value, max }: { value: number; max: number }) => (
  <span
    className="volume-bar"
    style={{ width: `${Math.max(2, (value / (max || 1)) * 100)}%` }}
    aria-hidden="true"
  />
);
