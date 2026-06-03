import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  TooltipProps,
} from 'recharts';

interface ReportRow {
  academicYear: string;
  semesterName: string;
  subjectCode: string;
  subjectName: string;
  questionCount: number;
  submissionCount: number;
  gradedCount: number;
  gradingCount: number;
  ungradedCount: number;
  averageScore: number;
}

interface Props {
  rows: ReportRow[];
}

const COLORS = {
  primary: '#315efb',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
  purple: '#7c3aed',
  teal: '#0d9488',
};

const PIE_COLORS = [COLORS.success, COLORS.warning, COLORS.danger];

// Aggregate rows by subject
function bySubject(rows: ReportRow[]) {
  const map = new Map<string, { label: string; exams: number; submissions: number; avgScore: number; scoreSum: number; scoredCount: number }>();
  for (const row of rows) {
    const key = row.subjectCode;
    const existing = map.get(key);
    const hasScore = row.averageScore > 0;
    if (!existing) {
      map.set(key, {
        label: row.subjectCode,
        exams: 1,
        submissions: row.submissionCount,
        avgScore: row.averageScore,
        scoreSum: hasScore ? row.averageScore : 0,
        scoredCount: hasScore ? 1 : 0,
      });
    } else {
      existing.exams += 1;
      existing.submissions += row.submissionCount;
      if (hasScore) {
        existing.scoreSum += row.averageScore;
        existing.scoredCount += 1;
        existing.avgScore = Number((existing.scoreSum / existing.scoredCount).toFixed(2));
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.exams - a.exams)
    .slice(0, 10);
}

// Aggregate rows by academic year
function byYear(rows: ReportRow[]) {
  const map = new Map<string, { label: string; exams: number; submissions: number }>();
  for (const row of rows) {
    const key = row.academicYear || 'N/A';
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { label: key, exams: 1, submissions: row.submissionCount });
    } else {
      existing.exams += 1;
      existing.submissions += row.submissionCount;
    }
  }
  return Array.from(map.values());
}

// Grading status totals
function gradingPie(rows: ReportRow[]) {
  const graded = rows.reduce((s, r) => s + r.gradedCount, 0);
  const grading = rows.reduce((s, r) => s + r.gradingCount, 0);
  const ungraded = rows.reduce((s, r) => s + r.ungradedCount, 0);
  return [
    { name: 'Đã chấm', value: graded },
    { name: 'Đang chấm', value: grading },
    { name: 'Chưa chấm', value: ungraded },
  ].filter((d) => d.value > 0);
}

// Avg score by semester (line chart)
function scoreByTime(rows: ReportRow[]) {
  const map = new Map<string, { label: string; sum: number; count: number }>();
  for (const row of rows) {
    if (row.averageScore <= 0) continue;
    const key = row.semesterName || row.academicYear || 'N/A';
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { label: key, sum: row.averageScore, count: 1 });
    } else {
      existing.sum += row.averageScore;
      existing.count += 1;
    }
  }
  return Array.from(map.values()).map((d) => ({
    label: d.label,
    avgScore: Number((d.sum / d.count).toFixed(2)),
  }));
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: '#172033' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const total = (item.payload as any)._total as number;
  const pct = total > 0 ? ((Number(item.value) / total) * 100).toFixed(1) : '0';
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ fontWeight: 600, color: item.payload.fill }}>{item.name}</p>
      <p style={{ margin: '2px 0', color: '#172033' }}>{item.value} bài ({pct}%)</p>
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function YearReportCharts({ rows }: Props) {
  if (!rows.length) return null;

  const subjectData = bySubject(rows);
  const yearData = byYear(rows);
  const pieData = gradingPie(rows);
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);
  const pieDataWithTotal = pieData.map((d) => ({ ...d, _total: pieTotal }));
  const timeData = scoreByTime(rows);

  const showSemesterChart = yearData.length > 1;
  const showScoreChart = subjectData.some((d) => d.avgScore > 0);
  const showTimeChart = timeData.length > 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Row 1: bar charts */}
      <div style={{ display: 'grid', gridTemplateColumns: showSemesterChart ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* Chart 1: exams + submissions by subject */}
        <section className="card">
          <h2 className="section-title">Đề thi & bài thi theo môn</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={subjectData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#667085' }} />
              <YAxis tick={{ fontSize: 12, fill: '#667085' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="exams" name="Đề thi" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="submissions" name="Bài thi" fill={COLORS.info} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Chart 2: exams + submissions by academic year (only when >1 year) */}
        {showSemesterChart && (
          <section className="card">
            <h2 className="section-title">Đề thi & bài thi theo năm học</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yearData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#667085' }} />
                <YAxis tick={{ fontSize: 12, fill: '#667085' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="exams" name="Đề thi" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                <Bar dataKey="submissions" name="Bài thi" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}
      </div>

      {/* Row 2: pie + avg score */}
      <div style={{ display: 'grid', gridTemplateColumns: showScoreChart ? '340px 1fr' : '1fr', gap: 16 }}>
        {/* Chart 3: grading pie */}
        {pieTotal > 0 && (
          <section className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="section-title" style={{ alignSelf: 'flex-start' }}>Tỉ lệ chấm điểm</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieDataWithTotal}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {pieDataWithTotal.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Chart 4: avg score per subject OR avg score over time */}
        {showScoreChart && (
          <section className="card">
            <h2 className="section-title">
              {showTimeChart ? 'Điểm trung bình theo học kỳ' : 'Điểm trung bình theo môn'}
            </h2>
            {showTimeChart ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timeData} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#667085' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#667085' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="avgScore" name="Điểm TB" stroke={COLORS.warning} strokeWidth={2} dot={{ r: 4, fill: COLORS.warning }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={subjectData.filter((d) => d.avgScore > 0)} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#667085' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#667085' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgScore" name="Điểm TB" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
