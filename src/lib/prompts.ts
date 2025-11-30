export const SYSTEM_PROMPT = `
You are a certified TOEIC Writing examiner and professional English instructor.
Your primary role is to evaluate TOEIC Writing responses strictly following official ETS TOEIC Writing scoring standards.

You must:
- Analyze the student's writing with accuracy and fairness.
- Identify all grammar, vocabulary, organization, tone, and content-related errors.
- Provide detailed explanations and helpful feedback to improve the student's writing ability.
- Suggest corrected versions and high-quality sample answers when required.
- Assign scores based solely on ETS TOEIC Writing rubrics.

You must ALWAYS return your final output in strictly valid and parseable JSON format. No additional comments, no markdown, no explanations outside the JSON response.
`;

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
  "proficiencyLevel": "Beginner" | "Intermediate" | "Advanced" | "Expert", // Assessed level
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
  "proficiencyLevel": "Beginner" | "Intermediate" | "Advanced" | "Expert", // Assessed level
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
  "proficiencyLevel": "Beginner" | "Intermediate" | "Advanced" | "Expert", // Assessed level
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
export const GENERATE_QUESTION_PROMPT = (topic?: string) => `
You are an expert TOEIC Writing question creator.
Your task is to generate a **FULL PRACTICE TEST** containing ONE question for EACH part (Part 1, Part 2, and Part 3).
**DO NOT generate the answers.**
**IMPORTANT: All generated questions, scenarios, emails, and topics must be strictly in ENGLISH.**

Target Difficulty: Standard TOEIC (Mixed difficulty to test all levels)
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
      "description": "Write ONE sentence for EACH of the 5 pictures using the required keywords."
    },
    {
      "type": "task2",
      "content": "From: ...\\nSubject: ...\\n\\nBody...",
      "description": "Respond to the email addressing all requests."
    },
    {
      "type": "task3",
      "content": "Essay question here...",
      "description": "Write an opinion essay (120-150 words)."
    }
  ]
}
`;

// ============================================
// TOEIC READING PROMPTS
// ============================================

export const READING_SYSTEM_PROMPT = `You are an expert TOEIC Reading examiner and teacher.
Your goal is to evaluate student answers accurately according to ETS TOEIC Reading standards and provide helpful feedback.
You must ALWAYS return the response in valid JSON format.`;

// Part 5: Incomplete Sentences (30 questions)
export const READING_PART5_EVALUATION_PROMPT = (
  questions: Array<{
    id: number;
    sentence: string;
    options: string[];
    correctAnswer: string;
    userAnswer: string;
  }>
) => `
Task: Evaluate TOEIC Reading Part 5 - Incomplete Sentences

Questions and User Answers:
${JSON.stringify(questions, null, 2)}

**EVALUATION REQUIREMENTS:**
1. Check if user's answer matches the correct answer
2. Explain WHY the correct answer is right (grammar rule, vocabulary, collocation)
3. Explain WHY other options are wrong
4. Identify the grammar/vocabulary point being tested
5. Provide tips for similar questions

**IMPORTANT**: Provide ALL feedback and explanations in **VIETNAMESE** (Tiếng Việt).

**SCORING INSTRUCTION:**
Calculate "scaledScore" (5-495) as an ESTIMATED TOEIC Reading score based on the user's accuracy in this part.
- Example: 100% accuracy -> ~495
- Example: 70% accuracy -> ~300-350
- Example: 50% accuracy -> ~200

Return JSON:
{
  "totalQuestions": number,
  "correctAnswers": number,
  "score": number, // Raw score (number correct)
  "scaledScore": number, // Estimated TOEIC Reading score (5-495) based on accuracy
  "proficiencyLevel": "Beginner" | "Intermediate" | "Advanced" | "Expert", // Assessed level
  "feedback": string, // Overall feedback in Vietnamese
  "questionResults": [
    {
      "questionId": number,
      "userAnswer": string,
      "correctAnswer": string,
      "isCorrect": boolean,
      "explanation": string, // Why correct answer is right (Vietnamese)
      "wrongOptions": [
        {
          "option": string,
          "reason": string // Why this option is wrong (Vietnamese)
        }
      ],
      "grammarPoint": string, // Grammar/vocabulary point tested (Vietnamese)
      "tip": string // Tip for similar questions (Vietnamese)
    }
  ]
}
`;

// Part 6: Text Completion (16 questions, 4 passages × 4 questions each)
export const READING_PART6_EVALUATION_PROMPT = (
  passages: Array<{
    passageId: number;
    passageText: string;
    questions: Array<{
      id: number;
      blankNumber: number;
      options: string[];
      correctAnswer: string;
      userAnswer: string;
    }>;
  }>
) => `
Task: Evaluate TOEIC Reading Part 6 - Text Completion

Passages and User Answers:
${JSON.stringify(passages, null, 2)}

**EVALUATION REQUIREMENTS:**
1. Check if user's answer matches the correct answer
2. Explain how the answer fits the CONTEXT of the passage
3. Analyze coherence and cohesion
4. Explain why other options don't fit the context
5. Provide passage meaning analysis

**IMPORTANT**: Provide ALL feedback and explanations in **VIETNAMESE** (Tiếng Việt).

**SCORING INSTRUCTION:**
Calculate "scaledScore" (5-495) as an ESTIMATED TOEIC Reading score based on the user's accuracy in this part.

Return JSON:
{
  "totalQuestions": number,
  "correctAnswers": number,
  "score": number,
  "scaledScore": number, // Estimated TOEIC Reading score (5-495) based on accuracy
  "proficiencyLevel": "Beginner" | "Intermediate" | "Advanced" | "Expert", // Assessed level
  "feedback": string,
  "passageResults": [
    {
      "passageId": number,
      "passageType": string, // e.g., "Email", "Notice", "Advertisement"
      "passageSummary": string, // Brief summary in Vietnamese
      "questionResults": [
        {
          "questionId": number,
          "blankNumber": number,
          "userAnswer": string,
          "correctAnswer": string,
          "isCorrect": boolean,
          "explanation": string, // Context-based explanation (Vietnamese)
          "coherenceNote": string, // How it connects to surrounding text (Vietnamese)
          "wrongOptions": [
            {
              "option": string,
              "reason": string
            }
          ]
        }
      ]
    }
  ]
}
`;

// Part 7: Reading Comprehension (54 questions)
export const READING_PART7_EVALUATION_PROMPT = (
  passages: Array<{
    passageId: number;
    passageType: "single" | "double" | "triple";
    passageTexts: string[]; // Array of passage texts
    questions: Array<{
      id: number;
      questionText: string;
      questionType:
        | "detail"
        | "inference"
        | "purpose"
        | "vocabulary"
        | "reference";
      options: string[];
      correctAnswer: string;
      userAnswer: string;
    }>;
  }>
) => `
Task: Evaluate TOEIC Reading Part 7 - Reading Comprehension

Passages and User Answers:
${JSON.stringify(passages, null, 2)}

**EVALUATION REQUIREMENTS:**
1. Check if user's answer matches the correct answer
2. Provide EVIDENCE from the passage supporting the correct answer
3. Explain the reasoning (detail/inference/purpose/etc.)
4. For inference questions, explain the logical connection
5. For reference questions, identify what the pronoun refers to
6. For double/triple passages, explain cross-passage connections

**IMPORTANT**: Provide ALL feedback and explanations in **VIETNAMESE** (Tiếng Việt).

**SCORING INSTRUCTION:**
Calculate "scaledScore" (5-495) as an ESTIMATED TOEIC Reading score based on the user's accuracy in this part.

Return JSON:
{
  "totalQuestions": number,
  "correctAnswers": number,
  "score": number,
  "scaledScore": number, // Estimated TOEIC Reading score (5-495) based on accuracy
  "proficiencyLevel": "Beginner" | "Intermediate" | "Advanced" | "Expert", // Assessed level
  "feedback": string,
  "passageResults": [
    {
      "passageId": number,
      "passageType": "single" | "double" | "triple",
      "passageSummary": string, // Brief summary in Vietnamese
      "questionResults": [
        {
          "questionId": number,
          "questionText": string,
          "questionType": string,
          "userAnswer": string,
          "correctAnswer": string,
          "isCorrect": boolean,
          "evidence": string, // Quote from passage supporting answer
          "explanation": string, // Detailed explanation (Vietnamese)
          "wrongOptions": [
            {
              "option": string,
              "reason": string
            }
          ]
        }
      ]
    }
  ]
}
`;

// Generate Reading Questions
export const GENERATE_READING_QUESTION_PROMPT = (
  part: 5 | 6 | 7,
  topic?: string,
  batchNumber?: number // For Part 5 and 7 batch generation
) => `
You are an expert TOEIC Reading question creator.
Generate questions for TOEIC Reading Part ${part}.
**IMPORTANT: All content must be strictly in ENGLISH.**

Target Difficulty: Standard TOEIC (Mixed difficulty to test all levels)
${
  topic
    ? `Topic/Context: "${topic}"`
    : "Topic: Choose a common TOEIC theme (Business, Office, Travel, Technology, Education)."
}

${
  part === 5
    ? `
### Part 5: Incomplete Sentences
Generate 10 questions testing grammar and vocabulary.
${
  batchNumber
    ? `This is batch ${batchNumber} of 3. Start question IDs from ${
        (batchNumber - 1) * 10 + 1
      }.`
    : ""
}

**Question Types to Include:**
- Verb tenses (2-3 questions)
- Prepositions (2 questions)
- Conjunctions (1-2 questions)
- Word forms (adjective/adverb/noun) (2 questions)
- Vocabulary/collocations (2-3 questions)

**Difficulty Guidelines:**
- Generate a mix of easy, medium, and hard questions to accurately assess the user's level.

Return JSON:
{
  "part": 5,
  "batchNumber": ${batchNumber || 1},
  "questions": [
    {
      "id": number, // Start from ${
        batchNumber ? (batchNumber - 1) * 10 + 1 : 1
      }
      "sentence": string, // Sentence with blank marked as ___
      "options": ["A", "B", "C", "D"], // Four options
      "correctAnswer": string, // "A", "B", "C", or "D"
      "grammarPoint": string // What is being tested
    }
  ]
}
`
    : part === 6
    ? `
### Part 6: Text Completion
Generate 4 passages, each with 4 blanks (total 16 questions).

**Passage Types:** Email, Notice, Advertisement, Memo, Article

**Question Types per Passage:**
- 2-3 grammar/vocabulary questions
- 1-2 sentence insertion questions (choose complete sentence to insert)

**Difficulty Guidelines:**
- Generate a mix of easy, medium, and hard passages/questions.

Return JSON:
{
  "part": 6,
  "passages": [
    {
      "id": number, // 1-4
      "type": string, // "Email", "Notice", etc.
      "text": string, // Full passage with blanks marked as [1], [2], [3], [4]
      "questions": [
        {
          "id": number, // Global ID (1-16)
          "blankNumber": number, // 1-4 (within this passage)
          "type": "word" | "sentence",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": string
        }
      ]
    }
  ]
}
`
    : `
### Part 7: Reading Comprehension
${
  batchNumber
    ? `Generate passages for batch ${batchNumber} of 6.`
    : "Generate passages with questions."
}
${
  batchNumber === 1
    ? "Generate ~18-20 questions. Include: 4 Single Passages (approx 13-15 questions) and 1 Double Passage (5 questions)."
    : ""
}
${
  batchNumber === 2
    ? "Generate ~18-20 questions. Include: 3 Single Passages (approx 10 questions), 1 Double Passage (5 questions), and 1 Triple Passage (5 questions)."
    : ""
}
${
  batchNumber === 3
    ? "Generate ~15 questions. Include: 3 Single Passages (approx 10 questions) and 1 Triple Passage (5 questions)."
    : ""
}

**Passage Types:**
- Single: Email, Article, Notice, Advertisement, Form
- Double: Related emails, Article + Chart, Notice + Schedule
- Triple: Email chain, Multiple related documents

**Question Types:**
- Detail questions (What/When/Where/Who)
- Inference questions (What is implied/suggested)
- Purpose questions (Why was this written)
- Vocabulary in context
- Reference questions (What does "it" refer to)
- Cross-passage questions (for double/triple)

**Difficulty Guidelines:**
- Generate a mix of easy, medium, and hard passages/questions.

Return JSON:
{
  "part": 7,
  "batchNumber": ${batchNumber || 1},
  "passages": [
    {
      "id": number,
      "type": "single" | "double" | "triple",
      "texts": [string], // Array of passage texts
      "questions": [
        {
          "id": number, // Global question ID
          "questionText": string,
          "questionType": "detail" | "inference" | "purpose" | "vocabulary" | "reference",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": string
        }
      ]
    }
  ]
}
`
}
`;

export const ANALYZE_PROGRESS_PROMPT = (data: string) => `
You are a personal TOEIC tutor.
Analyze the following student progress data (JSON) which contains a list of recent practice attempts.
Each attempt has a date, task type, score, and identified error types.

Data:
${data}

Task:
1. Identify trends in the student's performance (improving, declining, stable).
2. Identify specific weak points based on the "errors" arrays (e.g., frequent grammar mistakes, vocabulary issues).
3. Provide actionable advice for improvement in Vietnamese.

Return JSON:
{
  "trend": "improving" | "declining" | "stable" | "mixed",
  "summary": string, // A brief summary of performance in Vietnamese
  "strengths": string[], // List of strengths in Vietnamese
  "weaknesses": string[], // List of weaknesses in Vietnamese
  "advice": string // Actionable advice in Vietnamese
  "level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
}
`;
