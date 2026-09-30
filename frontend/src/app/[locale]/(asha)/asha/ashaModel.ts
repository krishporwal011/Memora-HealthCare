export interface AshaPatient {
  id: string;
  name: string;
  location: string;
  status: "checkin_suggested" | "watch" | "steady";
  statusLabel: string;
  triagePriority: number;
  lastActive: string;
  sessionsThisWeek: number;
  averageScore: number;
  unwellToday: boolean;
  isSynthetic: boolean;
  guardianName: string;
  guardianRel: string;
  preferredLanguage: string;
  robustZ: number;
  baselineMedian: number;
  currentScore: number;
  triggerMetric: string;
  domains: { name: string; score: number; status: string }[];
}

export const INITIAL_ASHA_PATIENTS: AshaPatient[] = [
  {
    id: "p-asha-01",
    name: "Bhaben Baruah",
    location: "Tezpur, Sonitpur",
    status: "checkin_suggested",
    statusLabel: "Check-in suggested",
    triagePriority: 1,
    lastActive: "Today, 10:30 AM",
    sessionsThisWeek: 7,
    averageScore: 0.42,
    unwellToday: false,
    isSynthetic: true,
    guardianName: "Jonali Baruah",
    guardianRel: "Daughter",
    preferredLanguage: "Assamese",
    robustZ: -2.85,
    baselineMedian: 0.82,
    currentScore: 0.42,
    triggerMetric: "Acute score dip (z = -2.85 <= -2.5)",
    domains: [
      { name: "Memory Match (Cultural)", score: 0.40, status: "lower_than_usual" },
      { name: "Family Photo Reminiscence", score: 0.45, status: "lower_than_usual" },
    ],
  },
  {
    id: "p-asha-02",
    name: "Hemoprabha Saikia",
    location: "Nagaon Sadar",
    status: "watch",
    statusLabel: "Watch",
    triagePriority: 2,
    lastActive: "Yesterday, 4:15 PM",
    sessionsThisWeek: 5,
    averageScore: 0.76,
    unwellToday: true,
    isSynthetic: true,
    guardianName: "Bipul Saikia",
    guardianRel: "Son",
    preferredLanguage: "Assamese",
    robustZ: -1.2,
    baselineMedian: 0.80,
    currentScore: 0.72,
    triggerMetric: "Illness flag active (alerts suppressed)",
    domains: [
      { name: "Memory Match (Cultural)", score: 0.75, status: "steady" },
      { name: "Family Photo Reminiscence", score: 0.78, status: "steady" },
    ],
  },
  {
    id: "p-asha-03",
    name: "Dharanidhar Das",
    location: "Guwahati, Kamrup Metro",
    status: "steady",
    statusLabel: "Steady",
    triagePriority: 3,
    lastActive: "Today, 8:45 AM",
    sessionsThisWeek: 6,
    averageScore: 0.84,
    unwellToday: false,
    isSynthetic: true,
    guardianName: "Pranab Das",
    guardianRel: "Son",
    preferredLanguage: "Assamese",
    robustZ: 0.15,
    baselineMedian: 0.83,
    currentScore: 0.85,
    triggerMetric: "Within normal 14-day baseline",
    domains: [
      { name: "Memory Match (Cultural)", score: 0.85, status: "steady" },
      { name: "Family Photo Reminiscence", score: 0.83, status: "steady" },
    ],
  },
];

export function buildSyntheticPdfBlob(patient: AshaPatient): Blob {
  const content = `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]
/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >>
/Contents 6 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length 580 >>
stream
BT
/F1 16 Tf
50 780 Td
(MEMORA CLINICAL SUMMARY REPORT) Tj
/F1 10 Tf
0 -20 Td
([DEMO / SYNTHETIC DATA -- FOR SIH26003 EVALUATION ONLY]) Tj
/F2 11 Tf
0 -30 Td
(Patient Name: ${patient.name} | Location: ${patient.location}) Tj
0 -18 Td
(Guardian: ${patient.guardianName} (${patient.guardianRel})) Tj
/F1 12 Tf
0 -25 Td
(ASHA Triage Status: ${patient.statusLabel.toUpperCase()}) Tj
/F1 11 Tf
0 -25 Td
(EXPLAINABLE STATISTICAL EVIDENCE:) Tj
/F2 10 Tf
0 -16 Td
(Primary Observation: ${patient.triggerMetric}) Tj
0 -16 Td
(Observed Score: ${Math.round(patient.currentScore * 100)}% | Baseline Median: ${Math.round(patient.baselineMedian * 100)}%) Tj
0 -16 Td
(Robust Z-Score: ${patient.robustZ} | Sessions this week: ${patient.sessionsThisWeek}) Tj
/F1 10 Tf
0 -30 Td
(CLINICAL ADVISORY & ETHICAL SAFEGUARDS:) Tj
/F2 9 Tf
0 -16 Td
(Memora is an offline cognitive stimulation platform and not a medical device.) Tj
0 -14 Td
(All alerts reflect statistical variations from a personal baseline.) Tj
0 -14 Td
(Consider a check-up with a doctor if lower performance continues.) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000257 00000 n 
0000000332 00000 n 
0000000402 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
1035
%%EOF`;

  return new Blob([content], { type: "application/pdf" });
}
