export const VIDEO_PROMPTS = [
  "How I met your mom and what I felt in that moment",
  "The story of our first date (where, what we did, how it went)",
  "My first kiss: when and where it happened",
  "The moment I knew I wanted to marry your mom",
  "What I was like in college—my favorite class and why",
  "My funniest college prank or party story",
  "A challenge I faced in college and how I overcame it",
  "My first day at my very first job",
  "The grossest thing that ever happened at work",
  "A time I failed at work and what it taught me",
  "My proudest accomplishment on the job",
  "The hardest lesson I learned at work",
  "My first car: what it was, how I got it, and why I loved (or hated) it",
  "A road trip I'll never forget",
  "The first time I flew on an airplane",
  "My favorite family vacation memory",
  "The trip that went terribly wrong (and what saved it)",
  "The home I grew up in and what I loved about it",
  "My relationship with my parents and what I learned from them",
  "A story about my grandparents and something valuable they taught me",
  "My earliest memory as a child",
  "The first pet I ever had and what happened to it",
  "My favorite birthday party as a kid",
  "The worst birthday mishap I ever had",
  "My first day of school and how I felt",
  "My favorite teacher and what made them special",
  "A school project I was proud of",
  "The day I graduated high school and what it meant to me",
  "My first heartbreak and how I got over it",
  "The best advice a friend ever gave me",
  "A lesson I learned the hard way about honesty",
  "What honesty means to me and why it matters",
  "My thoughts on loyalty and friendship",
  "A time I stood up for someone else",
  "A time someone stood up for me",
  "What I've learned about forgiveness",
  "The importance of gratitude and how I practice it",
  "My morning routine and why I stick to it",
  "How I manage stress or tough days",
  "My proudest moment as your dad so far",
  "What having you in my life has taught me",
  "The biggest risk I ever took—and its outcome",
  "A moment I was really scared—and what I did anyway",
  "The best life lesson I've learned so far",
  "A habit I'd like you to develop and why",
  "Something I wish I'd known when I was your age",
  "My favorite book (or movie) and why it influenced me",
  "A song that always lifts my spirits",
  "My favorite way to spend a weekend day",
  "How I met my best friend and why they matter",
  "The most embarrassing thing I've ever done",
  "A time I laughed so hard I cried",
  "My biggest regret and what I learned from it",
  "How I handle failure and bounce back",
  "The value of hard work: a personal example",
  "What money means to me—and the difference between wants and needs",
  "My philosophy on saving versus spending",
  "Why I believe education (formal or self-taught) is important",
  "My views on religion or spirituality—and how it shaped me",
  "What I believe about kindness and compassion",
  "Why it's important to help others—and a time I did",
  "A charity or cause I care about and why",
  "How I choose my priorities when life gets busy",
  "My strategies for setting and achieving goals",
  "The most fun I've ever had—and why it was special",
  "My favorite family tradition and how it started",
  "A tradition I hope we'll always have",
  "My favorite holiday and how I celebrate it",
  "A funny holiday mishap we've shared",
  "What I love most about our family",
  "How I balance work and home life",
  "A skill I taught myself—and how I did it",
  "Something new I want to learn next",
  "What courage means to me—and a courageous moment I had",
  "A time I felt overwhelmed—and how I coped",
  "Why I value honesty in relationships",
  "My thoughts on forgiveness and letting go",
  "How I define success—and whether I feel successful",
  "The best piece of advice I've ever received",
  "The advice I'd give you when you're a teenager",
  "The advice I'd give you when you become an adult",
  "What love means to me—and how I show it",
  "How I want you to remember me",
  "The legacy I hope to leave behind",
  "A question you might ask—and my honest answer (e.g., 'Do you regret having kids?')",
  "A story about how you changed my life for the better",
  "My hopes and dreams for your future",
  "What I consider the meaning of life to be",
  "How I practice self-care and why it's important",
  "A funny habit I have that you might inherit",
  "A recipe or meal tradition I hope you'll carry on",
  "What 'home' means to me—and where I feel most at peace",
  "My definition of a 'good day'",
  "The moment I realized my parents were human too",
  "How I deal with disappointment—and why it's okay",
  "The qualities I most admire in you",
  "A promise I make to you for your future",
  "My wish for you when you graduate or leave home",
  "A letter to your future self—what would I say to you in 20 years?",
  "Why I love you and what you mean to me"
];

export const PROMPT_CATEGORIES = {
  FAMILY: {
    name: "Family & Relationships",
    icon: "Heart",
    prompts: [
      "How I met your mom and what I felt in that moment",
      "The story of our first date (where, what we did, how it went)",
      "The moment I knew I wanted to marry your mom",
      "My relationship with my parents and what I learned from them",
      "A story about my grandparents and something valuable they taught me",
      "My favorite family vacation memory",
      "What I love most about our family",
      "My favorite family tradition and how it started",
      "A tradition I hope we'll always have",
      "How I balance work and home life",
      "A recipe or meal tradition I hope you'll carry on",
      "What 'home' means to me—and where I feel most at peace"
    ]
  },
  LIFE_LESSONS: {
    name: "Life Lessons & Wisdom",
    icon: "Lightbulb",
    prompts: [
      "The best life lesson I've learned so far",
      "Something I wish I'd known when I was your age",
      "The biggest risk I ever took—and its outcome",
      "A moment I was really scared—and what I did anyway",
      "How I handle failure and bounce back",
      "What courage means to me—and a courageous moment I had",
      "A time I felt overwhelmed—and how I coped",
      "The best piece of advice I've ever received",
      "The advice I'd give you when you're a teenager",
      "The advice I'd give you when you become an adult",
      "What I consider the meaning of life to be",
      "How I define success—and whether I feel successful"
    ]
  },
  CAREER: {
    name: "Career & Work",
    icon: "Briefcase",
    prompts: [
      "My first day at my very first job",
      "The grossest thing that ever happened at work",
      "A time I failed at work and what it taught me",
      "My proudest accomplishment on the job",
      "The hardest lesson I learned at work",
      "What money means to me—and the difference between wants and needs",
      "My philosophy on saving versus spending",
      "How I choose my priorities when life gets busy",
      "My strategies for setting and achieving goals",
      "The value of hard work: a personal example"
    ]
  },
  EDUCATION: {
    name: "Education & Growth",
    icon: "GraduationCap",
    prompts: [
      "What I was like in college—my favorite class and why",
      "My funniest college prank or party story",
      "A challenge I faced in college and how I overcame it",
      "My first day of school and how I felt",
      "My favorite teacher and what made them special",
      "A school project I was proud of",
      "The day I graduated high school and what it meant to me",
      "Why I believe education (formal or self-taught) is important",
      "A skill I taught myself—and how I did it",
      "Something new I want to learn next"
    ]
  },
  PERSONAL_GROWTH: {
    name: "Personal Growth & Values",
    icon: "Target",
    prompts: [
      "What honesty means to me and why it matters",
      "My thoughts on loyalty and friendship",
      "What I believe about kindness and compassion",
      "Why it's important to help others—and a time I did",
      "My views on religion or spirituality—and how it shaped me",
      "How I practice self-care and why it's important",
      "The importance of gratitude and how I practice it",
      "My morning routine and why I stick to it",
      "How I manage stress or tough days",
      "What love means to me—and how I show it"
    ]
  },
  MEMORIES: {
    name: "Childhood & Memories",
    icon: "Clock",
    prompts: [
      "My earliest memory as a child",
      "The first pet I ever had and what happened to it",
      "My favorite birthday party as a kid",
      "The worst birthday mishap I ever had",
      "The home I grew up in and what I loved about it",
      "The moment I realized my parents were human too",
      "My first car: what it was, how I got it, and why I loved (or hated) it",
      "A road trip I'll never forget",
      "The first time I flew on an airplane",
      "The trip that went terribly wrong (and what saved it)"
    ]
  },
  RELATIONSHIPS: {
    name: "Friends & Relationships",
    icon: "Users",
    prompts: [
      "My first heartbreak and how I got over it",
      "The best advice a friend ever gave me",
      "A lesson I learned the hard way about honesty",
      "My thoughts on loyalty and friendship",
      "A time I stood up for someone else",
      "A time someone stood up for me",
      "What I've learned about forgiveness",
      "How I met my best friend and why they matter",
      "Why I value honesty in relationships",
      "My thoughts on forgiveness and letting go"
    ]
  },
  ENTERTAINMENT: {
    name: "Entertainment & Culture",
    icon: "Film",
    prompts: [
      "My favorite book (or movie) and why it influenced me",
      "A song that always lifts my spirits",
      "My favorite way to spend a weekend day",
      "The most fun I've ever had—and why it was special",
      "My favorite holiday and how I celebrate it",
      "A funny holiday mishap we've shared",
      "A funny habit I have that you might inherit",
      "My definition of a 'good day'",
      "The most embarrassing thing I've ever done",
      "A time I laughed so hard I cried"
    ]
  },
  LEGACY: {
    name: "Legacy & Future",
    icon: "Star",
    prompts: [
      "My proudest moment as your dad so far",
      "What having you in my life has taught me",
      "How I want you to remember me",
      "The legacy I hope to leave behind",
      "A story about how you changed my life for the better",
      "My hopes and dreams for your future",
      "A promise I make to you for your future",
      "My wish for you when you graduate or leave home",
      "A letter to your future self—what would I say to you in 20 years?",
      "Why I love you and what you mean to me"
    ]
  },
  PHILOSOPHY: {
    name: "Philosophy & Beliefs",
    icon: "BookOpen",
    prompts: [
      "What I believe about kindness and compassion",
      "Why it's important to help others—and a time I did",
      "A charity or cause I care about and why",
      "My views on religion or spirituality—and how it shaped me",
      "What I consider the meaning of life to be",
      "How I practice self-care and why it's important",
      "What 'home' means to me—and where I feel most at peace",
      "How I deal with disappointment—and why it's okay",
      "The qualities I most admire in you",
      "A question you might ask—and my honest answer"
    ]
  }
};

// Function to get prompts by category
export const getPromptsByCategory = (categoryId) => {
  const category = PROMPT_CATEGORIES[categoryId]
  return category ? category.prompts : []
}

// Function to get random prompts from a specific category
export const getRandomPromptsFromCategory = (categoryId, count = 5) => {
  const category = PROMPT_CATEGORIES[categoryId]
  if (!category) {
    console.warn(`Category ${categoryId} not found, returning random prompts instead`)
    return getRandomPrompts(count)
  }
  const prompts = category.prompts
  const shuffled = [...prompts].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Function to get all categories
export const getAllCategories = () => {
  return Object.entries(PROMPT_CATEGORIES).map(([id, category]) => ({
    id,
    name: category.name,
    icon: category.icon
  }))
}

// Function to get random prompts
export const getRandomPrompts = (count = 5) => {
  const shuffled = [...VIDEO_PROMPTS].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Function to get a single random prompt
export const getRandomPrompt = () => {
  return VIDEO_PROMPTS[Math.floor(Math.random() * VIDEO_PROMPTS.length)]
} 