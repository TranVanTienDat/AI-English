export const SAMPLE_TASKS = {
  task1: [
    {
      id: 1,
      type: "task1",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", // Meeting
      keywords: ["meeting", "discuss"],
      description:
        "A group of people sitting around a table having a discussion.",
      level: "intermediate",
    },
    {
      id: 2,
      type: "task1",
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", // Laptop work
      keywords: ["laptop", "working"],
      description: "A person typing on a laptop in an office.",
      level: "basic",
    },
  ],
  task2: [
    {
      id: 1,
      type: "task2",
      subject: "Question about the upcoming conference",
      sender: "John Smith",
      content: `Dear Team,

I am writing to ask about the schedule for the upcoming marketing conference next month. 
Could you please let me know when the final agenda will be available? 
Also, I would like to know if there is any fee for attending the workshops.

Thank you,
John Smith`,
      level: "intermediate",
    },
  ],
  task3: [
    {
      id: 1,
      type: "task3",
      topic:
        "Some people prefer to work for a large company, while others prefer to work for a small company. Which do you prefer? Use specific reasons and examples to support your choice.",
      level: "basic",
    },
    {
      id: 2,
      type: "task3",
      topic:
        "Do you agree or disagree with the following statement? Technology has made children less creative than they were in the past. Use specific reasons and examples to support your opinion.",
      level: "advanced",
    },
  ],
};
