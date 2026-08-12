export type Track = "science-bio" | "science-cs" | "commerce" | "arts";
export type Path12 = "engineering" | "medical" | "other";

export interface Question {
  id: string;
  text: string;
  options: { label: string; track: string }[];
}

export const GRADE_10_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "Which subject do you score highest in right now?",
    options: [
      { label: "Biology / Life sciences", track: "science-bio" },
      { label: "Mathematics", track: "science-cs" },
      { label: "Social science & business studies", track: "commerce" },
      { label: "Languages, history or art", track: "arts" },
    ],
  },
  {
    id: "q2",
    text: "A free Saturday. What sounds most fun?",
    options: [
      { label: "Dissect how the human body works", track: "science-bio" },
      { label: "Build a small app or game", track: "science-cs" },
      { label: "Run a small resale or shop idea", track: "commerce" },
      { label: "Write, design or debate", track: "arts" },
    ],
  },
  {
    id: "q3",
    text: "How comfortable are you with heavy mathematics?",
    options: [
      { label: "Comfortable, but I prefer memory-based subjects", track: "science-bio" },
      { label: "Very comfortable, I enjoy problem solving", track: "science-cs" },
      { label: "Fine with accounts and statistics", track: "commerce" },
      { label: "I avoid math when I can", track: "arts" },
    ],
  },
  {
    id: "q4",
    text: "Pick the school activity you'd volunteer for.",
    options: [
      { label: "Science lab / hospital visit", track: "science-bio" },
      { label: "Coding club or robotics", track: "science-cs" },
      { label: "Managing the school fest budget", track: "commerce" },
      { label: "Editing the school magazine", track: "arts" },
    ],
  },
  {
    id: "q5",
    text: "Which praise feels most like you?",
    options: [
      { label: "You are patient and caring with people", track: "science-bio" },
      { label: "You figure out how things work fast", track: "science-cs" },
      { label: "You are sharp with money and planning", track: "commerce" },
      { label: "You express ideas beautifully", track: "arts" },
    ],
  },
  {
    id: "q6",
    text: "How do you feel about long study hours with memorisation?",
    options: [
      { label: "I can do it if the topic interests me", track: "science-bio" },
      { label: "I prefer practice problems over memorising", track: "science-cs" },
      { label: "I like structured, rule-based learning", track: "commerce" },
      { label: "I prefer open-ended creative work", track: "arts" },
    ],
  },
  {
    id: "q7",
    text: "Ten years from now, where do you see yourself?",
    options: [
      { label: "In a hospital or research lab", track: "science-bio" },
      { label: "In a tech company or startup", track: "science-cs" },
      { label: "Running a business or in finance", track: "commerce" },
      { label: "In media, law, design or civil service", track: "arts" },
    ],
  },
  {
    id: "q8",
    text: "Your class average across last three exams was roughly:",
    options: [
      { label: "Above 85% overall", track: "science-cs" },
      { label: "70–85% overall", track: "science-bio" },
      { label: "55–70% overall", track: "commerce" },
      { label: "Below 55% overall", track: "arts" },
    ],
  },
];

export const GRADE_12_QUESTIONS: Question[] = [
  {
    id: "s1",
    text: "Which stream did you study in 11th and 12th?",
    options: [
      { label: "PCM (Maths group)", track: "engineering" },
      { label: "PCB (Biology group)", track: "medical" },
      { label: "PCMB (both)", track: "engineering" },
      { label: "Commerce / Arts", track: "other" },
    ],
  },
  {
    id: "s2",
    text: "Your strongest performance in board exams was in:",
    options: [
      { label: "Maths & Physics", track: "engineering" },
      { label: "Biology & Chemistry", track: "medical" },
      { label: "Accountancy / Economics", track: "other" },
      { label: "Computer Science", track: "engineering" },
    ],
  },
  {
    id: "s3",
    text: "How do you prefer to solve problems?",
    options: [
      { label: "Design and build a system that fixes it", track: "engineering" },
      { label: "Diagnose the cause and treat it carefully", track: "medical" },
      { label: "Analyse numbers and decide strategy", track: "other" },
      { label: "Automate it with software", track: "engineering" },
    ],
  },
  {
    id: "s4",
    text: "How long a study commitment are you ready for?",
    options: [
      { label: "About 4 years to a degree and a job", track: "engineering" },
      { label: "7+ years including specialisation", track: "medical" },
      { label: "3 years, then work or a master's", track: "other" },
      { label: "Whatever it takes for the right field", track: "medical" },
    ],
  },
  {
    id: "s5",
    text: "Which entrance exams did you prepare for or attempt?",
    options: [
      { label: "JEE / State engineering exams", track: "engineering" },
      { label: "NEET", track: "medical" },
      { label: "CUET / CA foundation / CLAT", track: "other" },
      { label: "None yet", track: "other" },
    ],
  },
  {
    id: "s6",
    text: "Which work environment appeals to you most?",
    options: [
      { label: "Labs, workshops and offices with screens", track: "engineering" },
      { label: "Hospitals and clinics with patients", track: "medical" },
      { label: "Corporate offices, courts or classrooms", track: "other" },
      { label: "Field sites and factories", track: "engineering" },
    ],
  },
  {
    id: "s7",
    text: "How comfortable are you with the cost of the course?",
    options: [
      { label: "Moderate fees, want quick placement", track: "engineering" },
      { label: "Ready for a long, expensive course", track: "medical" },
      { label: "I need a low-cost path", track: "other" },
      { label: "Scholarship or merit seat is my plan", track: "engineering" },
    ],
  },
  {
    id: "s8",
    text: "Your overall 12th percentage is roughly:",
    options: [
      { label: "Above 85%", track: "engineering" },
      { label: "75–85%", track: "medical" },
      { label: "60–75%", track: "other" },
      { label: "Below 60%", track: "other" },
    ],
  },
];

export const STREAM_LABELS: Record<string, string> = {
  "science-bio": "Science with Biology",
  "science-cs": "Science with Computer Science",
  commerce: "Commerce",
  arts: "Arts & Humanities",
  engineering: "Engineering",
  medical: "Medical & Allied Health",
  other: "Other professional fields",
};

export const PATH_DEPARTMENTS: Record<string, string[]> = {
  engineering: [
    "Information Technology",
    "Computer Science & Engineering",
    "Electronics & Communication",
    "Electrical & Electronics",
    "Mechanical Engineering",
    "Civil Engineering",
    "AI & Data Science",
  ],
  medical: [
    "MBBS",
    "BDS (Dental)",
    "BPT (Physiotherapy)",
    "B.Pharm",
    "B.Sc Nursing",
    "Allied Health Sciences",
    "Biotechnology",
  ],
  other: [
    "B.Com / CA Foundation",
    "BBA / Management",
    "B.Sc Computer Applications",
    "Law (BA LLB)",
    "Design (B.Des)",
    "Hotel Management",
    "Civil Services track (BA)",
  ],
  "science-bio": ["Biology group (PCB)", "Bio-Maths group (PCMB)"],
  "science-cs": ["Computer Science group (PCM + CS)", "Maths group (PCM)"],
  commerce: ["Commerce with Accountancy", "Commerce with Computer Applications"],
  arts: ["Humanities with Economics", "Humanities with Fine Arts"],
};
