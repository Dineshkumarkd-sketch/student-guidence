import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Briefcase,
  BookOpen,
  Award,
  Target,
  Route as RouteIcon,
  RefreshCw,
} from "lucide-react";
import {
  GRADE_10_QUESTIONS,
  GRADE_12_QUESTIONS,
  PATH_DEPARTMENTS,
  STREAM_LABELS,
  type Question,
} from "@/lib/guidance-data";
import { getRecommendation, getRoadmap, type Recommendation, type Roadmap } from "@/lib/guidance.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Guidance — AI stream & career advisor" },
      {
        name: "description",
        content:
          "Take a quick assessment after class 10 or 12 and get an AI recommendation plus a course, internship and placement roadmap.",
      },
      { property: "og:title", content: "Student Guidance — AI stream & career advisor" },
      {
        property: "og:description",
        content:
          "AI-guided stream selection for class 10 and 12 students, with department-wise course and placement plans.",
      },
    ],
  }),
  component: Index,
});

type Level = "10" | "12";
type Stage = "start" | "quiz" | "result" | "department" | "roadmap";

function Index() {
  const [stage, setStage] = useState<Stage>("start");
  const [level, setLevel] = useState<Level>("10");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { label: string; track: string }>>({});
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [chosenPath, setChosenPath] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommend = useServerFn(getRecommendation);
  const buildRoadmap = useServerFn(getRoadmap);

  const questions: Question[] = level === "10" ? GRADE_10_QUESTIONS : GRADE_12_QUESTIONS;
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / questions.length) * 100);

  const topTrack = useMemo(() => {
    const tally: Record<string, number> = {};
    Object.values(answers).forEach((a) => {
      tally[a.track] = (tally[a.track] ?? 0) + 1;
    });
    return Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  }, [answers]);

  function reset() {
    setStage("start");
    setCurrent(0);
    setAnswers({});
    setRecommendation(null);
    setChosenPath("");
    setDepartment("");
    setRoadmap(null);
    setError(null);
  }

  function startQuiz(lvl: Level) {
    setLevel(lvl);
    setCurrent(0);
    setAnswers({});
    setRecommendation(null);
    setRoadmap(null);
    setChosenPath("");
    setDepartment("");
    setError(null);
    setStage("quiz");
  }

  function pick(q: Question, option: { label: string; track: string }) {
    const next = { ...answers, [q.id]: option };
    setAnswers(next);
    if (current < questions.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 180);
    } else {
      void submit(next);
    }
  }

  async function submit(all: Record<string, { label: string; track: string }>) {
    setLoading(true);
    setError(null);
    setStage("result");
    try {
      const tally: Record<string, number> = {};
      Object.values(all).forEach((a) => {
        tally[a.track] = (tally[a.track] ?? 0) + 1;
      });
      const leading = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
      const scorePercent = Math.round(((leading?.[1] ?? 0) / questions.length) * 100);
      const result = await recommend({
        data: {
          level,
          scorePercent,
          topTrack: STREAM_LABELS[leading?.[0] ?? ""] ?? leading?.[0] ?? "unknown",
          answers: questions.map((q) => ({
            question: q.text,
            answer: all[q.id]?.label ?? "skipped",
          })),
        },
      });
      setRecommendation(result);
      setChosenPath(result.primaryKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function generateRoadmap(dept: string) {
    setDepartment(dept);
    setLoading(true);
    setError(null);
    setStage("roadmap");
    try {
      const result = await buildRoadmap({
        data: {
          level,
          path: STREAM_LABELS[chosenPath] ?? chosenPath,
          department: dept,
        },
      });
      setRoadmap(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <button onClick={reset} className="flex items-center gap-2.5 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-xl btn-hero">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-base font-bold leading-none">
              Student Guidance
            </span>
            <span className="text-xs text-muted-foreground">AI stream & career advisor</span>
          </span>
        </button>
        {stage !== "start" && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Restart
          </button>
        )}
      </header>

      {stage === "start" && <StartScreen onStart={startQuiz} />}

      {stage === "quiz" && (
        <section className="mt-10">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Class {level} assessment · Question {current + 1} of {questions.length}
            </span>
            <span>{progress}% complete</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-300 btn-hero"
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>

          <div className="panel mt-6 p-6 sm:p-8">
            <h1 className="font-display text-xl font-bold sm:text-2xl">
              {questions[current]!.text}
            </h1>
            <div className="mt-6 grid gap-3">
              {questions[current]!.options.map((option) => {
                const selected = answers[questions[current]!.id]?.label === option.label;
                return (
                  <button
                    key={option.label}
                    onClick={() => pick(questions[current]!, option)}
                    className={`group flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all ${
                      selected
                        ? "border-primary bg-secondary"
                        : "border-border bg-surface hover:border-primary/60 hover:bg-secondary"
                    }`}
                  >
                    <span>{option.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
            {current > 0 && (
              <button
                onClick={() => setCurrent((c) => c - 1)}
                className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Previous question
              </button>
            )}
          </div>
        </section>
      )}

      {stage === "result" && (
        <section className="mt-10">
          {loading && <LoadingCard text="Analysing your answers with AI…" />}
          {error && <ErrorCard message={error} onRetry={() => submit(answers)} />}
          {recommendation && !loading && (
            <>
              <div className="panel p-6 sm:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> AI recommendation ·{" "}
                  {recommendation.confidence}% confidence
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold text-gradient sm:text-4xl">
                  {recommendation.primary}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {recommendation.summary}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <ListBlock
                    title="Your strengths"
                    icon={<CheckCircle2 className="h-4 w-4 text-accent" />}
                    items={recommendation.strengths}
                  />
                  <ListBlock
                    title="Watch out for"
                    icon={<Target className="h-4 w-4 text-primary" />}
                    items={recommendation.watchOuts}
                  />
                </div>
              </div>

              <div className="panel mt-5 p-6 sm:p-8">
                <h2 className="font-display text-lg font-bold">Also worth considering</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {recommendation.alternatives.map((alt) => (
                    <div key={alt.name} className="rounded-xl border border-border bg-surface p-4">
                      <p className="text-sm font-semibold">{alt.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{alt.why}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel mt-5 p-6 sm:p-8">
                <h2 className="font-display text-lg font-bold">Confirm your choice</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Go with the AI pick or choose a different path — the plan adapts either way.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.keys(
                    level === "10"
                      ? { "science-bio": 1, "science-cs": 1, commerce: 1, arts: 1 }
                      : { engineering: 1, medical: 1, other: 1 },
                  ).map((key) => (
                    <button
                      key={key}
                      onClick={() => setChosenPath(key)}
                      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                        chosenPath === key
                          ? "border-primary bg-secondary text-foreground"
                          : "border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {STREAM_LABELS[key]}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStage("department")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold btn-hero hover:btn-hero-hover"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {stage === "department" && (
        <section className="mt-10">
          <div className="panel p-6 sm:p-8">
            <h1 className="font-display text-2xl font-bold">
              Pick your {level === "10" ? "subject group" : "department"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Path selected: {STREAM_LABELS[chosenPath] ?? chosenPath}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(PATH_DEPARTMENTS[chosenPath] ?? []).map((dept) => (
                <button
                  key={dept}
                  onClick={() => void generateRoadmap(dept)}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-left text-sm transition-all hover:border-primary/60 hover:bg-secondary"
                >
                  <span>{dept}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setStage("result")}
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to recommendation
            </button>
          </div>
        </section>
      )}

      {stage === "roadmap" && (
        <section className="mt-10">
          {loading && <LoadingCard text={`Building your ${department} roadmap…`} />}
          {error && <ErrorCard message={error} onRetry={() => generateRoadmap(department)} />}
          {roadmap && !loading && (
            <>
              <div className="panel p-6 sm:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Personalised plan
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{department}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {roadmap.overview}
                </p>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <DetailBlock
                  title="Courses to focus on"
                  icon={<BookOpen className="h-4 w-4" />}
                  items={roadmap.courses}
                />
                <DetailBlock
                  title="Certifications"
                  icon={<Award className="h-4 w-4" />}
                  items={roadmap.certifications}
                />
                <DetailBlock
                  title="Internships"
                  icon={<Briefcase className="h-4 w-4" />}
                  items={roadmap.internships}
                />
                <DetailBlock
                  title="Placement training"
                  icon={<Target className="h-4 w-4" />}
                  items={roadmap.placementTraining}
                />
                <DetailBlock
                  title="Career options"
                  icon={<GraduationCap className="h-4 w-4" />}
                  items={roadmap.careers}
                />
                <DetailBlock
                  title="Year by year plan"
                  icon={<RouteIcon className="h-4 w-4" />}
                  items={roadmap.yearPlan}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setStage("department")}
                  className="rounded-xl border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  Try another department
                </button>
                <button
                  onClick={reset}
                  className="rounded-xl px-5 py-3 text-sm font-semibold btn-hero hover:btn-hero-hover"
                >
                  Start over
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        Guidance is AI-generated. Always cross-check with your school counsellor.
      </footer>
    </main>
  );
}

function StartScreen({ onStart }: { onStart: (level: Level) => void }) {
  return (
    <section className="mt-14">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" /> AI powered career guidance
      </span>
      <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
        Don't guess your <span className="text-gradient">next step</span> after school.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
        A short assessment reads your performance and interests, then AI recommends the right
        stream, department and a full roadmap of courses, internships and placement training.
      </p>

      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        <ChoiceCard
          badge="After class 10"
          title="Biology, Computer Science or Commerce?"
          copy="8 quick questions on your marks, strengths and interests to fix your +1 stream."
          onClick={() => onStart("10")}
        />
        <ChoiceCard
          badge="After class 12"
          title="Engineering, Medical or something else?"
          copy="Find the degree path that matches your board performance and long-term goals."
          onClick={() => onStart("12")}
        />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { t: "Assessment", d: "Answer 8 questions about marks, habits and interests." },
          { t: "AI recommendation", d: "Get one clear pick, plus alternatives and watch-outs." },
          { t: "Full roadmap", d: "Courses, certifications, internships and placement prep." },
        ].map((s, i) => (
          <div key={s.t} className="panel p-5">
            <span className="font-display text-sm text-primary">0{i + 1}</span>
            <p className="mt-1 font-display text-base font-bold">{s.t}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChoiceCard({
  badge,
  title,
  copy,
  onClick,
}: {
  badge: string;
  title: string;
  copy: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="panel group p-6 text-left transition-all hover:-translate-y-0.5 hover:border-primary/60"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-accent">{badge}</span>
      <p className="mt-3 font-display text-xl font-bold leading-snug">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Start assessment
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}

function ListBlock({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-xs leading-relaxed text-muted-foreground">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailBlock({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: { name: string; detail: string }[];
}) {
  return (
    <div className="panel p-6">
      <p className="flex items-center gap-2 font-display text-base font-bold text-primary">
        {icon} {title}
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.name}>
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoadingCard({ text }: { text: string }) {
  return (
    <div className="panel flex flex-col items-center gap-3 p-14 text-center">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="panel p-8 text-center">
      <p className="text-sm text-destructive">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold btn-hero hover:btn-hero-hover"
      >
        Try again
      </button>
    </div>
  );
}
