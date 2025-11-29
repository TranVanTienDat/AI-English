export const SYSTEM_PROMPT = `You are an expert TOEIC Writing examiner and teacher. 
Your goal is to grade student submissions accurately according to ETS TOEIC Writing standards, identify errors, and provide helpful feedback to improve their skills.
You must ALWAYS return the response in valid JSON format.`;

export const TASK_1_PROMPT = (userSentence: string, keywords: string[]) => `
Task: Write a Sentence Based on a Picture (TOEIC Writing Part 1).
Keywords provided: ${keywords.join(", ")}.
Student Sentence: "${userSentence}"

Grade this sentence using the **TOEIC Writing Part 1 scoring scale (0-3 points)**:
- 3: Excellent - Grammatically correct, uses both keywords appropriately, describes a logical scenario
- 2: Good - Minor grammar issues or slightly awkward phrasing, but uses both keywords
- 1: Limited - Significant grammar errors or only uses one keyword correctly
- 0: Poor - Major errors, doesn't use keywords, or incomprehensible

**IMPORTANT**: Provide ALL feedback and explanations in **VIETNAMESE** (Tiếng Việt).
Only the "better_version" should be in English (as it's a writing sample).

Return JSON:
{
  "score": number, // 0-3 (TOEIC Part 1 scale)
  "feedback": string, // General feedback IN VIETNAMESE
  "errors": [
    { 
      "text": string, // The error text from student's sentence
      "type": "grammar" | "vocabulary" | "spelling", 
      "correction": string, // Corrected version in English
      "explanation": string // Explanation IN VIETNAMESE
    }
  ],
  "better_version": string // A high-quality sample sentence in English using the keywords (score 3/3)
}
`;

export const TASK_2_PROMPT = (emailContent: string, userResponse: string) => `
Task: Respond to a Written Request (TOEIC Writing Part 2).
Incoming Email:
"${emailContent}"

Student Response:
"${userResponse}"

Grade this response using the **TOEIC Writing Part 2 scoring scale (0-4 points)**:
- 4: Excellent - Varied sentence structures, appropriate vocabulary, clear organization, complete content
- 3: Good - Minor issues in vocabulary, grammar, or organization but generally effective
- 2: Adequate - Noticeable errors or incomplete content, but comprehensible
- 1: Limited - Significant errors that interfere with understanding
- 0: Very poor or off-topic response

**IMPORTANT**: Provide ALL feedback, explanations, and comments in **VIETNAMESE** (Tiếng Việt).
Only the "sample_response" should be in English (as it's a writing sample).

Return JSON:
{
  "score": number, // 0-4 (TOEIC Part 2 scale)
  "score_breakdown": { 
    "quality": number, // 0-1 (sentence quality and variety)
    "vocabulary": number, // 0-1 (appropriate word choice)
    "organization": number, // 0-1 (clear structure)
    "content": number // 0-1 (completeness and relevance)
  },
  "feedback": string, // General feedback IN VIETNAMESE
  "errors": [
    { 
      "text": string, // The error text from student's writing
      "type": "grammar" | "vocabulary" | "tone" | "organization", 
      "correction": string, // Corrected version in English
      "explanation": string // Explanation IN VIETNAMESE
    }
  ],
  "sample_response": string // A model email response in English (score 4/4)
}
`;

export const TASK_3_PROMPT = (topic: string, userEssay: string) => `
Task: Write an Opinion Essay (TOEIC Writing Part 3).
Topic: "${topic}"

Student Essay:
"${userEssay}"

Grade this essay using the **TOEIC Writing Part 3 scoring scale (0-5 points)**:
- 5: Excellent - Strong support with reasons and examples, varied grammar, rich vocabulary, clear organization
- 4: Good - Generally well-supported with minor issues in grammar, vocabulary, or organization
- 3: Adequate - Some support but with noticeable errors or weak organization
- 2: Limited - Weak support, significant grammar/vocabulary errors
- 1: Very limited - Minimal support, major errors throughout
- 0: Very poor or off-topic essay

**IMPORTANT**: Provide ALL feedback, explanations, and comments in **VIETNAMESE** (Tiếng Việt).
Only the "sample_essay" should be in English (as it's a writing sample).

Return JSON:
{
  "score": number, // 0-5 (TOEIC Part 3 scale)
  "score_breakdown": { 
    "support": number, // 0-1.25 (reasons and examples)
    "grammar": number, // 0-1.25
    "vocabulary": number, // 0-1.25
    "organization": number // 0-1.25
  },
  "feedback": string, // General feedback IN VIETNAMESE
  "errors": [
    { 
      "text": string, // The error text from student's writing
      "type": "grammar" | "vocabulary" | "coherence", 
      "correction": string, // Corrected version in English
      "explanation": string // Explanation IN VIETNAMESE
    }
  ],
  "sample_essay": string // A model essay in English (score 5/5, minimum 300 words)
}
`;

// Prompt for generating a new question based on level, optional topic, and optional part
export const GENERATE_QUESTION_PROMPT = (
  level: "0-90" | "100-140" | "150-170" | "180-200",
  topic?: string,
  part?: "part1" | "part2" | "part3"
) => `
You are an expert TOEIC Writing question creator.
Your task is to generate a **PRACTICE QUESTION** for a student to answer.
**DO NOT generate the answer or response.**

Target TOEIC Writing Score Range: ${level}
${
  level === "0-90"
    ? "- Beginner level: Simple vocabulary, basic grammar structures"
    : ""
}
${
  level === "100-140"
    ? "- Intermediate level: Moderate vocabulary, varied sentence structures"
    : ""
}
${
  level === "150-170"
    ? "- Advanced level: Rich vocabulary, complex grammar, sophisticated ideas"
    : ""
}
${
  level === "180-200"
    ? "- Expert level: Native-like proficiency, nuanced expression, exceptional coherence"
    : ""
}
${
  topic
    ? `Topic: "${topic}"`
    : "Topic: Choose a common TOEIC theme (e.g., Business, Office, Travel, Technology)."
}

${
  part
    ? `Generate a **${
        part === "part1"
          ? "Part 1 (Picture Sentence)"
          : part === "part2"
          ? "Part 2 (Email Response)"
          : "Part 3 (Opinion Essay)"
      }** question.`
    : "Decide whether to create a **Part 2 (Email Response)** or **Part 3 (Opinion Essay)**."
}

### Instructions for Part 1 (Picture Sentence):
- Generate a **SCENARIO DESCRIPTION** (describe a scene/situation) and **TWO KEYWORDS**.
- The student will write a sentence using both keywords to describe the scenario.
- Example: 
  - Scenario: "A business meeting in an office"
  - Keywords: "discuss", "presentation"
- **DO NOT** write the sentence for them.

### Instructions for Part 2 (Email Response):
- Generate the **INCOMING EMAIL** that the student needs to read and reply to.
- Include:
  - **From**: [Sender Name/Title]
  - **Subject**: [Subject Line]
  - **Body**: [The email text asking for information, making a request, or complaining]
- **DO NOT** write the reply email.

### Instructions for Part 3 (Opinion Essay):
- Generate the **ESSAY QUESTION** or **TOPIC STATEMENT**.
- Example: "Some people prefer to work alone. Others prefer to work in a team. Which do you prefer and why? Give reasons and examples."
- **DO NOT** write the essay.

Return the result in JSON format:
{
  "type": "task1" | "task2" | "task3", // Keep using task1/2/3 for compatibility with existing code
  "content": string, // For Part 1: scenario description; For Part 2: INCOMING EMAIL; For Part 3: ESSAY QUESTION
  "keywords": string[], // Only for Part 1 (two keywords)
  "level": "${level}",
  "topic_used": string // The specific topic/theme you chose
}
`;
