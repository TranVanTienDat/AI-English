import { GeneratedQuestion } from "@/lib/gemini";

interface QuestionPromptProps {
  question: GeneratedQuestion;
}

export function QuestionPrompt({ question }: QuestionPromptProps) {
  // Part 1: Picture Sentence
  if (question.type === "task1") {
    let scenarios: any[] = [];
    try {
      scenarios = JSON.parse(question.content);
    } catch (e) {
      // Fallback for legacy data
      scenarios = [
        {
          id: 1,
          scenario: question.content,
          keywords: question.keywords || [],
        },
      ];
    }

    return (
      <div className="space-y-6">
        {scenarios.map((item: any, index: number) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg border-2 border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">
                Picture {item.id || index + 1}
              </span>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Description & Keywords
              </h4>
            </div>

            <div className="space-y-4">
              {/* Description */}
              <div className="text-lg text-slate-800 font-medium leading-relaxed">
                {item.scenario}
              </div>

              {/* Keywords */}
              <div className="bg-emerald-50 p-3 rounded-md border border-emerald-100 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-emerald-800 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Keywords:
                </span>
                {item.keywords?.map((kw: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-white text-emerald-700 px-3 py-1 rounded border border-emerald-200 font-medium text-sm"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
          💡 <strong>Tip:</strong> Write ONE sentence for EACH picture using
          BOTH keywords. Number your answers 1-5.
        </div>
      </div>
    );
  }

  // Part 2: Email Response
  if (question.type === "task2") {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-slate-200">
        <div className="flex items-start gap-3 mb-4">
          <svg
            className="w-6 h-6 text-blue-600 shrink-0 mt-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Incoming Email
            </p>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
            {question.content}
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-3 italic">
          💡 Tip: Reply with proper email format (greeting, body, closing,
          signature) and address ALL requests.
        </p>
      </div>
    );
  }

  // Part 3: Opinion Essay
  if (question.type === "task3") {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-slate-200">
        <div className="flex items-start gap-3 mb-4">
          <svg
            className="w-6 h-6 text-purple-600 shrink-0 mt-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Essay Question
            </p>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-slate-800 font-medium leading-relaxed">
            {question.content}
          </p>
        </div>
        <p className="text-xs text-purple-700 mt-3 italic">
          💡 Tip: Write 120-150 words with clear structure (intro, 2 body
          paragraphs with examples, conclusion).
        </p>
      </div>
    );
  }

  return null;
}
