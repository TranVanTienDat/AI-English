export const SYSTEM_PROMPT = `You are an expert TOEIC Writing examiner and teacher. 
Your goal is to grade student submissions accurately according to ETS TOEIC Writing standards, identify errors, and provide helpful feedback to improve their skills.
You must ALWAYS return the response in valid JSON format.`;

export const TASK_1_PROMPT = (
  userResponse: string,
  keywords: string[], // This might be unused now, as scenarios have their own keywords
  scenarioDescription?: string // This contains the JSON string of 5 scenarios
) => `
Task: Write 5 Sentences Based on 5 Pictures (TOEIC Writing Part 1 - Questions 1-5).

Scenarios & Keywords (JSON):
${scenarioDescription}

Student Response (containing 5 sentences):
"${userResponse}"

**CRITICAL REQUIREMENTS FOR PART 1:**
1. Student must write ONE sentence for EACH of the 5 scenarios.
2. Each sentence must use BOTH keywords specified for that scenario.
3. Sentences must be grammatically correct and relevant to the scenario.

**SCORING CRITERIA (Per Question, 0-10 points, Total 50 points):**
- 9-10: Perfect grammar, uses both keywords, relevant.
- 7-8: Uses keywords, minor grammar errors, relevant.
- 4-6: Uses only 1 keyword OR major grammar errors OR unclear.
- 0-3: No keywords OR incomprehensible OR off-topic.

**IMPORTANT**: Provide ALL feedback and explanations in **VIETNAMESE** (Tiếng Việt).

Return JSON:
{
  "overall_score": number, // Total score 0-50
  "feedback": string, // General feedback
  "questions": [
    {
      "id": number, // 1-5
      "score": number, // 0-10
      "keywords_used": { "keyword1": boolean, "keyword2": boolean },
      "errors": [{ "text": string, "correction": string, "explanation": string }],
      "better_version": string, // Sample answer
      "feedback": string // Specific feedback for this sentence
    }
  ]
}
`;

export const TASK_2_PROMPT = (emailContent: string, userResponse: string) => `
Task: Respond to a Written Request (TOEIC Writing Part 2 - Questions 6-7).

Incoming Email:
"${emailContent}"

Student Response:
"${userResponse}"

**CRITICAL REQUIREMENTS FOR PART 2:**
1. Must have proper email format:
   - Greeting (Dear Mr./Ms., Hi [Name]...)
   - Opening sentence
   - Body addressing ALL requests
   - Closing sentence
   - Signature
2. Must answer ALL requests/questions in the incoming email
3. Must use appropriate formal/professional tone
4. Must be well-organized and clear

**SCORING CRITERIA (0-50 points):**
- **45-50 points (Excellent)**:
  - Answers ALL requests completely
  - Proper email format (greeting, body, closing, signature)
  - Varied sentence structures
  - Appropriate vocabulary and professional tone
  - Clear organization
  
- **35-44 points (Good)**:
  - Answers most/all requests
  - Has email format (may miss minor elements)
  - Minor grammar or vocabulary issues
  - Generally professional tone
  
- **25-34 points (Adequate)**:
  - Answers some requests (missing 1-2)
  - Basic email format
  - Noticeable grammar errors
  - Somewhat informal tone
  
- **10-24 points (Limited)**:
  - Missing many requests
  - Poor email format (no greeting/closing)
  - Significant grammar errors
  - Inappropriate tone
  
- **0-9 points (Poor)**:
  - Doesn't answer requests
  - No email format
  - Major errors throughout
  - Off-topic

**IMPORTANT**: Provide ALL feedback, explanations, and comments in **VIETNAMESE** (Tiếng Việt).
Only the "sample_response" should be in English (as it's a writing sample).

Return JSON:
{
  "score": number, // 0-50 (TOEIC Part 2 scale)
  "score_breakdown": { 
    "content": number, // 0-15 (answers all requests)
    "organization": number, // 0-10 (email format & structure)
    "grammar_vocabulary": number, // 0-15 (language quality)
    "tone": number // 0-10 (professional/appropriate)
  },
  "feedback": string, // General feedback IN VIETNAMESE
  "requests_answered": {
    "total_requests": number, // Total number of requests in incoming email
    "answered": number, // How many the student answered
    "missing": string[] // List of missing requests IN VIETNAMESE
  },
  "format_check": {
    "has_greeting": boolean,
    "has_closing": boolean,
    "has_signature": boolean
  },
  "errors": [
    { 
      "text": string, // The error text from student's writing
      "type": "grammar" | "vocabulary" | "tone" | "organization" | "format", 
      "correction": string, // Corrected version in English
      "explanation": string // Explanation IN VIETNAMESE
    }
  ],
  "sample_response": string // A model email response in English (score 50/50)
}
`;

export const TASK_3_PROMPT = (topic: string, userEssay: string) => `
Task: Write an Opinion Essay (TOEIC Writing Part 3 - Question 8).

Topic: "${topic}"

Student Essay:
"${userEssay}"

**CRITICAL REQUIREMENTS FOR PART 3:**
1. Word count: 120-150 words (essays <120 words are heavily penalized)
2. Must have clear 4-paragraph structure:
   - Introduction (state opinion)
   - Body Paragraph 1 (reason 1 + example)
   - Body Paragraph 2 (reason 2 + example)
   - Conclusion (restate opinion)
3. Must provide specific reasons and examples
4. Must use transition words/phrases for coherence
5. Must stay on topic

**SCORING CRITERIA (0-100 points):**
- **90-100 points (Excellent)**:
  - 120-150 words
  - Clear 4-paragraph structure
  - Strong reasons with specific examples
  - Varied grammar structures
  - Rich, precise vocabulary
  - Excellent coherence with transition words
  
- **75-89 points (Good)**:
  - Meets word count
  - Has structure (may be slightly unclear)
  - Good reasons with examples
  - Minor grammar issues
  - Good vocabulary
  - Generally coherent
  
- **50-74 points (Adequate)**:
  - Meets/close to word count
  - Basic structure
  - Some reasons but weak examples
  - Noticeable grammar errors
  - Adequate vocabulary
  - Some coherence issues
  
- **25-49 points (Limited)**:
  - Below word count OR
  - Poor structure
  - Weak reasons, no examples
  - Significant grammar errors
  - Limited vocabulary
  - Poor coherence
  
- **0-24 points (Very Limited)**:
  - Well below word count
  - No clear structure
  - Minimal support
  - Major errors throughout
  
**IMPORTANT**: Provide ALL feedback, explanations, and comments in **VIETNAMESE** (Tiếng Việt).
Only the "sample_essay" should be in English (as it's a writing sample).

Return JSON:
{
  "score": number, // 0-100 (TOEIC Part 3 scale)
  "word_count": number, // Actual word count of student essay
  "score_breakdown": { 
    "development": number, // 0-30 (reasons and examples)
    "organization": number, // 0-20 (structure and coherence)
    "grammar": number, // 0-25
    "vocabulary": number // 0-25
  },
  "structure_analysis": {
    "has_introduction": boolean,
    "has_body_paragraphs": boolean,
    "has_conclusion": boolean,
    "has_examples": boolean
  },
  "feedback": string, // General feedback IN VIETNAMESE
  "errors": [
    { 
      "text": string, // The error text from student's writing
      "type": "grammar" | "vocabulary" | "coherence" | "structure" | "word_count", 
      "correction": string, // Corrected version in English
      "explanation": string // Explanation IN VIETNAMESE
    }
  ],
  "sample_essay": string // A model essay in English (score 100/100, 120-150 words)
}
`;

// Prompt for generating a full test (Part 1, 2, and 3)
export const GENERATE_QUESTION_PROMPT = (
  level: "0-90" | "100-140" | "150-170" | "180-200",
  topic?: string
) => `
You are an expert TOEIC Writing question creator.
Your task is to generate a **FULL PRACTICE TEST** containing ONE question for EACH part (Part 1, Part 2, and Part 3).
**DO NOT generate the answers.**

Target TOEIC Writing Score Range: ${level}
${
  topic
    ? `Topic/Context: "${topic}"`
    : "Topic: Choose a common TOEIC theme (e.g., Business, Office, Travel, Technology, Education)."
}

---

### Part 1: Picture Sentence
Generate **5 Different Scenarios**, each with **Two Keywords**.
- For each (1-5):
  - Scenario: Describe a scene clearly.
  - Keywords: Two mandatory words.
- Format the "content" field for Part 1 as a **JSON String** of an array: \`[{ "id": 1, "scenario": "...", "keywords": ["...", "..."] }, ...]\`

### Part 2: Email Response
Generate an **Incoming Email** with 2-4 requests.
- Include From, Subject, and Body.
- Requests must be clear (e.g., ask for info, schedule meeting).

### Part 3: Opinion Essay
Generate an **Essay Topic/Question**.
- Ask for opinion, reasons, and examples.
- E.g., "Do you agree that...?" or "Some people prefer..."

---

Return the result in this EXACT JSON format:
{
  "questions": [
    {
      "type": "task1",
      "content": "[{\\"id\\": 1, \\"scenario\\": \\"...\\", \\"keywords\\": [\\"a\\", \\"b\\"]}, ...]",
      "keywords": [],
      "level": "${level}",
      "description": "Write ONE sentence for EACH of the 5 pictures using the required keywords."
    },
    {
      "type": "task2",
      "content": "From: ...\\nSubject: ...\\n\\nBody...",
      "level": "${level}",
      "description": "Respond to the email addressing all requests."
    },
    {
      "type": "task3",
      "content": "Essay question here...",
      "level": "${level}",
      "description": "Write an opinion essay (120-150 words)."
    }
  ]
}
`;
