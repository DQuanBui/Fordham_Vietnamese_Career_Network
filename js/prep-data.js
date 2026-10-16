/*
  Prep kit content: interview questions, recruiting calendar, message templates, glossary.
  Timelines shift every year, so the calendar describes typical timing, not deadlines.
*/
const FVCN_PREP = {
  tracks: [
    { id: "behavioral", label: "Behavioral", icon: "message" },
    { id: "finance", label: "Finance", icon: "chart" },
    { id: "ais", label: "Accounting & Audit", icon: "calculator" },
    { id: "info-systems", label: "Consulting & IS", icon: "database" },
    { id: "marketing", label: "Marketing", icon: "megaphone" },
    { id: "cs", label: "Software", icon: "code" }
  ],

  /* ------------------------------------------------------------------------
     Interview question bank
     `tip` is how to approach the question; `points` are what a strong answer covers.
     ------------------------------------------------------------------------ */
  questions: [
    // Behavioral: asked in every industry
    {
      id: "b-tell-me", track: "behavioral", type: "Fit",
      q: "Walk me through your resume. / Tell me about yourself.",
      tip: "This sets the tone for the whole interview. Keep it to 60–90 seconds and tell a story, not a list.",
      points: [
        "Past: where you're from and what brought you to Fordham, in one or two sentences",
        "Present: your major plus one or two experiences that show real interest in this field",
        "Future: why this role is the natural next step",
        "Practice it out loud until it sounds natural, not memorized"
      ]
    },
    {
      id: "b-why-firm", track: "behavioral", type: "Fit",
      q: "Why our firm?",
      tip: "Generic answers (\"great culture, smart people\") are the most common mistake. Use what you learned from real people.",
      points: [
        "Name someone you spoke with and one specific thing they told you",
        "Mention a recent deal, product, client, or initiative and why it interests you",
        "Connect it back to what you want to learn",
        "Coffee chats with FVCN mentors are the easiest way to get this material"
      ]
    },
    {
      id: "b-why-role", track: "behavioral", type: "Fit",
      q: "Why this role, and why this industry?",
      tip: "Show that you've tested your interest, not just read about it.",
      points: [
        "The moment or experience that sparked the interest",
        "What you've done since to explore it: a class, club, project, or internship",
        "What you understand about the day-to-day work, and why it suits you"
      ]
    },
    {
      id: "b-team-conflict", track: "behavioral", type: "Behavioral",
      q: "Tell me about a time you disagreed with a teammate.",
      tip: "Use STAR (Situation, Task, Action, Result) and spend most of your time on Action: what you did.",
      points: [
        "Pick a real but low-drama example (a group project works well)",
        "Show that you listened and understood the other view",
        "Explain how you reached a decision together",
        "End with the result and what you'd do the same way next time"
      ]
    },
    {
      id: "b-failure", track: "behavioral", type: "Behavioral",
      q: "Tell me about a time you failed.",
      tip: "Interviewers want self-awareness. A real failure you learned from beats a disguised strength.",
      points: [
        "Own it without blaming others",
        "Explain what you changed afterwards",
        "Give evidence the change worked: a later result"
      ]
    },
    {
      id: "b-lead", track: "behavioral", type: "Behavioral",
      q: "Describe a time you led without a formal title.",
      tip: "Leadership is taking initiative, not holding a position. Club, class, and part-time job examples all count.",
      points: [
        "What problem you noticed that nobody owned",
        "How you got others on board",
        "A measurable result: attendance, time saved, grade, money raised"
      ]
    },
    {
      id: "b-learn-fast", track: "behavioral", type: "Behavioral",
      q: "Tell me about a time you had to learn something quickly.",
      tip: "Internships are mostly learning on the job, so this is really \"Will you ramp up fast?\"",
      points: [
        "The deadline or pressure you faced",
        "How you learned: who you asked, what you read, how you practiced",
        "The result, and how you'd learn even faster next time"
      ]
    },
    {
      id: "b-weakness", track: "behavioral", type: "Fit",
      q: "What's your greatest weakness?",
      tip: "Choose a real weakness that won't disqualify you, and show the steps you're taking.",
      points: [
        "Avoid fake weaknesses like \"I'm a perfectionist\"",
        "Describe a concrete example of the weakness",
        "Explain what you're doing about it and the progress you've made"
      ]
    },
    {
      id: "b-ambiguity", track: "behavioral", type: "Behavioral",
      q: "Tell me about a time you made a decision with incomplete information.",
      tip: "Show your judgment: how you weighed the risks and what you did to reduce them.",
      points: [
        "What you knew, what you didn't, and why you couldn't wait",
        "How you decided, and the checkpoints you set",
        "The outcome and what you learned"
      ]
    },
    {
      id: "b-questions", track: "behavioral", type: "Fit",
      q: "Do you have any questions for us?",
      tip: "Always say yes. Prepare three questions and ask the two that fit best.",
      points: [
        "Ask about their experience: \"What surprised you most in your first year?\"",
        "Ask about the team: \"What does a great intern do in the first month?\"",
        "Don't ask about anything easily answered on the website"
      ]
    },

    // Finance
    {
      id: "f-three-statements", track: "finance", type: "Technical",
      q: "Walk me through the three financial statements.",
      tip: "Explain what each statement shows, then how they connect. This question comes up in nearly every finance interview.",
      points: [
        "Income statement: revenue minus expenses over a period, ending in net income",
        "Cash flow statement: starts with net income, adds back non-cash items like depreciation, adjusts for working capital, then shows investing and financing cash flows",
        "Balance sheet: assets = liabilities + shareholders' equity at a point in time",
        "Links: net income flows into retained earnings, and ending cash on the cash flow statement becomes cash on the balance sheet"
      ]
    },
    {
      id: "f-depreciation", track: "finance", type: "Technical",
      q: "If depreciation increases by $10, how do the three statements change? (Assume a 25% tax rate.)",
      tip: "Go statement by statement and check that the balance sheet balances at the end.",
      points: [
        "Income statement: pre-tax income falls by $10, so net income falls by $7.50",
        "Cash flow statement: net income −$7.50, add back +$10 depreciation, so cash rises by $2.50",
        "Balance sheet: cash +$2.50 and PP&E −$10, so assets fall by $7.50; retained earnings fall by $7.50, so it balances"
      ]
    },
    {
      id: "f-valuation", track: "finance", type: "Technical",
      q: "What are the main ways to value a company?",
      tip: "Name the methods, then say when each is most useful.",
      points: [
        "Comparable companies: multiples like EV/EBITDA and P/E of similar public companies",
        "Precedent transactions: multiples paid in past acquisitions (usually higher because of control premiums)",
        "Discounted cash flow: the present value of future cash flows",
        "An LBO analysis can show what a financial buyer could afford to pay"
      ]
    },
    {
      id: "f-dcf", track: "finance", type: "Technical",
      q: "Walk me through a DCF.",
      tip: "Give the steps in order in about a minute. Detail comes in follow-up questions.",
      points: [
        "Project unlevered free cash flow for 5–10 years",
        "Calculate a terminal value with a perpetuity growth rate or an exit multiple",
        "Discount both to today using WACC",
        "The sum is enterprise value; subtract net debt for equity value, then divide by diluted shares"
      ]
    },
    {
      id: "f-ev-equity", track: "finance", type: "Technical",
      q: "What's the difference between enterprise value and equity value?",
      tip: "Use one sentence for each, then give the bridge between them.",
      points: [
        "Equity value is the value of the company to shareholders only",
        "Enterprise value is the value of the core business to all capital providers",
        "Enterprise value = equity value + debt + preferred stock + noncontrolling interest − cash"
      ]
    },
    {
      id: "f-wacc", track: "finance", type: "Technical",
      q: "What is WACC and how do you calculate it?",
      tip: "Define it first, then build it up.",
      points: [
        "The weighted average cost of capital: the blended return all investors expect",
        "Cost of equity from CAPM: risk-free rate + beta × equity risk premium",
        "After-tax cost of debt: interest rate × (1 − tax rate)",
        "Weight each by its share of the capital structure, using market values"
      ]
    },
    {
      id: "f-pitch", track: "finance", type: "Markets",
      q: "Pitch me a stock.",
      tip: "Choose a company you know well and can defend for five minutes of follow-up questions.",
      points: [
        "What the company does, in one sentence",
        "Your thesis in two or three points: why the market is mispricing it",
        "Valuation: where it trades compared to peers, and your target",
        "Catalysts that would prove you right, and the key risks"
      ]
    },
    {
      id: "f-markets", track: "finance", type: "Markets",
      q: "What's happening in the markets right now?",
      tip: "Read the Wall Street Journal, Bloomberg, or the Financial Times for 15 minutes a day during recruiting.",
      points: [
        "Where interest rates are and what the Fed did most recently",
        "One recent deal (M&A or IPO) and why it happened",
        "One company or sector story you have a view on"
      ]
    },

    // Accounting and audit
    {
      id: "a-audit-review", track: "ais", type: "Technical",
      q: "What's the difference between an audit and a review?",
      tip: "Focus on the level of assurance each one gives.",
      points: [
        "An audit gives reasonable assurance that financial statements are free of material misstatement, and ends in an opinion",
        "A review gives limited assurance, mostly through inquiry and analytical procedures",
        "Audits involve testing controls and gathering evidence such as confirmations and inventory counts"
      ]
    },
    {
      id: "a-materiality", track: "ais", type: "Technical",
      q: "What is materiality?",
      tip: "Give the definition, then a simple example.",
      points: [
        "A misstatement is material if it could change the decisions of someone relying on the financial statements",
        "Auditors often start from a benchmark, such as a percentage of pre-tax income or revenue",
        "Judgment matters: a small amount can still be material if it involves fraud"
      ]
    },
    {
      id: "a-controls", track: "ais", type: "Technical",
      q: "What is an internal control? Give an example.",
      tip: "Show that you understand why controls exist: to prevent and detect errors and fraud.",
      points: [
        "Segregation of duties: the person who approves a payment doesn't also record it",
        "Review and approval of journal entries above a set amount",
        "Monthly bank reconciliations reviewed by a manager"
      ]
    },
    {
      id: "a-itgc", track: "ais", type: "Technical",
      q: "What are IT general controls (ITGCs)?",
      tip: "Common in IT audit and risk advisory interviews, and a strong topic for AIS majors.",
      points: [
        "Controls over the systems that produce financial data",
        "Access management: who can log in and what they can change",
        "Change management: how system changes are tested and approved",
        "IT operations: backups, job scheduling, and incident handling"
      ]
    },
    {
      id: "a-accrual", track: "ais", type: "Technical",
      q: "Explain accrual accounting versus cash accounting.",
      tip: "A simple example makes this answer stand out.",
      points: [
        "Cash accounting records revenue and expenses when cash moves",
        "Accrual accounting records them when they are earned or incurred",
        "Example: a December sale paid in January is December revenue under accrual accounting",
        "U.S. GAAP requires accrual accounting"
      ]
    },
    {
      id: "a-revenue", track: "ais", type: "Technical",
      q: "How is revenue recognized under ASC 606?",
      tip: "Name the five steps in order.",
      points: [
        "Identify the contract with the customer",
        "Identify the performance obligations",
        "Determine the transaction price",
        "Allocate the price to the performance obligations",
        "Recognize revenue as each obligation is satisfied"
      ]
    },
    {
      id: "a-error", track: "ais", type: "Behavioral",
      q: "What would you do if you found a mistake in a senior's work?",
      tip: "They're testing professional skepticism and how you communicate up.",
      points: [
        "Double-check your own work first",
        "Raise it privately and promptly, with the evidence",
        "Frame it as making sure the work is right, not as blame"
      ]
    },
    {
      id: "a-why-audit", track: "ais", type: "Fit",
      q: "Why audit, rather than tax or advisory?",
      tip: "Show that you know what the work actually involves.",
      points: [
        "You see how many different businesses work from the inside",
        "It builds a foundation for many later paths (controller, CFO, advisory)",
        "Mention the CPA path and how you plan to meet the 150-hour requirement"
      ]
    },

    // Consulting and information systems
    {
      id: "c-sales-drop", track: "info-systems", type: "Case",
      q: "A retailer's online sales fell 15% last quarter. How would you figure out why?",
      tip: "Clarify, structure, then go deep. Think out loud: interviewers grade your process.",
      points: [
        "Clarifying questions: all products or some? All regions? Did competitors see the same drop?",
        "Break it down: sales = traffic × conversion rate × average order value",
        "Check each driver for changes in marketing spend, site changes, pricing, or stock-outs",
        "Close with a hypothesis and the data you'd ask for to test it"
      ]
    },
    {
      id: "c-market-size", track: "info-systems", type: "Case",
      q: "Estimate how many cups of coffee are sold in Manhattan each day.",
      tip: "The number matters less than a clear, reasonable structure. Round to keep the math simple.",
      points: [
        "Start with people in Manhattan on a weekday: about 1.6M residents plus about 1.5M commuters",
        "Share who buy coffee out (for example 40%) × cups per buyer (about 1.5)",
        "About 3M × 40% × 1.5 ≈ 1.8M cups a day",
        "Sanity check the answer and say what you'd refine"
      ]
    },
    {
      id: "c-erp", track: "info-systems", type: "Case",
      q: "A client is moving to a new ERP system. What risks would you flag?",
      tip: "A favorite in tech consulting and risk advisory interviews.",
      points: [
        "Data migration: incomplete or inaccurate data moving from the old system",
        "Access and controls: new roles need the right segregation of duties",
        "Integration with other systems, and cutover timing (avoid quarter-end)",
        "Change management and training: the system fails if people don't use it"
      ]
    },
    {
      id: "c-explain-tech", track: "info-systems", type: "Communication",
      q: "Explain cloud computing (or an API) to a client who isn't technical.",
      tip: "Use an analogy, then connect it to something the client cares about.",
      points: [
        "Cloud: renting computing power instead of buying and maintaining your own servers, like streaming instead of owning DVDs",
        "API: a menu that lets one system order data from another without knowing how the kitchen works",
        "Business value: speed, cost, and scaling up or down as needed"
      ]
    },
    {
      id: "c-sql", track: "info-systems", type: "Technical",
      q: "What's the difference between an INNER JOIN and a LEFT JOIN?",
      tip: "Give the definition, then an example with two tables.",
      points: [
        "INNER JOIN returns only the rows that match in both tables",
        "LEFT JOIN returns every row from the left table, with NULLs where there's no match",
        "Example: all customers with their orders (LEFT) versus only customers who ordered (INNER)"
      ]
    },
    {
      id: "c-trend", track: "info-systems", type: "Fit",
      q: "Which technology trend will matter most to our clients in the next few years?",
      tip: "Pick one trend and go deep instead of listing five.",
      points: [
        "Name it, for example generative AI, cybersecurity, or cloud cost management",
        "Give one concrete example of how it changes a client's business",
        "Mention a risk or challenge, which shows balanced judgment"
      ]
    },
    {
      id: "c-data", track: "info-systems", type: "Behavioral",
      q: "Tell me about a time you used data to change someone's mind.",
      tip: "Consulting is persuasion with evidence. Show both halves.",
      points: [
        "What they believed and why",
        "The data you gathered and how you analyzed it",
        "How you presented it (a simple chart beats a spreadsheet) and the outcome"
      ]
    },

    // Marketing
    {
      id: "m-grow-brand", track: "marketing", type: "Case",
      q: "Pick a brand you love. How would you grow it?",
      tip: "Structure beats creativity alone: who, what insight, which channel, and how you'd measure it.",
      points: [
        "The target customer, defined specifically",
        "A consumer insight: something true about them that the brand isn't using yet",
        "The idea and the channel where that customer actually spends time",
        "The metric that would show it worked"
      ]
    },
    {
      id: "m-campaign", track: "marketing", type: "Fit",
      q: "Tell me about a campaign you admire, and why it worked.",
      tip: "Go beyond \"it was creative\". Explain the strategy behind it.",
      points: [
        "The business problem the campaign was solving",
        "The insight behind it",
        "Results, if public, or the signals that it worked"
      ]
    },
    {
      id: "m-metrics", track: "marketing", type: "Technical",
      q: "Which metrics would you use to judge whether a campaign worked?",
      tip: "Always start with the campaign's objective, because the right metric depends on it.",
      points: [
        "Awareness: reach, impressions, brand lift",
        "Engagement: click-through rate, saves, shares, time spent",
        "Conversion: conversion rate, cost per acquisition, return on ad spend",
        "Retention: repeat purchase rate, customer lifetime value"
      ]
    },
    {
      id: "m-gen-z", track: "marketing", type: "Case",
      q: "How would you market a product to Gen Z?",
      tip: "You are the audience, so use your own insight, then back it up.",
      points: [
        "Choose platforms by behavior: TikTok and Instagram for discovery, group chats for word of mouth",
        "Creators over polished ads; authenticity and humor",
        "Community and participation: let customers co-create",
        "A clear test-and-learn plan with a small budget"
      ]
    },
    {
      id: "m-small-budget", track: "marketing", type: "Case",
      q: "How would you launch a new product with a very small budget?",
      tip: "Show prioritization: what you'd do first and what you'd skip.",
      points: [
        "Focus on one tight customer segment",
        "Earned and owned channels first: PR, creators, email, community",
        "Run small paid tests, then scale what works",
        "Define success metrics before launch"
      ]
    },
    {
      id: "m-struggling", track: "marketing", type: "Case",
      q: "Name a brand that's struggling. What would you do?",
      tip: "Diagnose before prescribing.",
      points: [
        "What changed: customers, competitors, the product, or the culture",
        "Who the brand should win back, or win for the first time",
        "One or two focused moves, and how you'd measure them"
      ]
    },

    // Software engineering
    {
      id: "s-two-sum", track: "cs", type: "Coding",
      q: "Given an array of integers and a target, return the indices of two numbers that add up to the target.",
      tip: "Talk through a brute-force solution first, then improve it. Interviewers care about your process.",
      points: [
        "Brute force: check every pair, O(n²) time",
        "Better: one pass with a hash map from value to index; check whether target − current is already in the map",
        "O(n) time and O(n) space",
        "Test edge cases: duplicates, negative numbers, no solution"
      ]
    },
    {
      id: "s-hash-map", track: "cs", type: "Technical",
      q: "What's the time complexity of a hash map lookup? When can it be worse?",
      tip: "Know the average and the worst case, and why they differ.",
      points: [
        "Average O(1): the hash function sends a key straight to its bucket",
        "Worst case O(n), when many keys collide in the same bucket",
        "Good hash functions and resizing keep collisions rare"
      ]
    },
    {
      id: "s-binary-search", track: "cs", type: "Coding",
      q: "Explain binary search. When can you use it?",
      tip: "Off-by-one errors are the classic trap here, so walk through a small example.",
      points: [
        "Works on sorted data, or any problem where the answer space is monotonic",
        "Compare with the middle element and discard half each step",
        "O(log n) time",
        "Be careful with the loop condition and how you move the low and high pointers"
      ]
    },
    {
      id: "s-url", track: "cs", type: "Systems",
      q: "What happens when you type a URL into your browser and press Enter?",
      tip: "Go layer by layer. You can go as deep as the interviewer wants.",
      points: [
        "DNS resolves the domain to an IP address",
        "TCP connection and a TLS handshake for HTTPS",
        "The browser sends an HTTP request; the server sends back a response",
        "The browser parses the HTML, loads CSS and JavaScript, and renders the page"
      ]
    },
    {
      id: "s-process-thread", track: "cs", type: "Technical",
      q: "What's the difference between a process and a thread?",
      tip: "Give the definition, then why it matters.",
      points: [
        "A process has its own memory space; threads share memory within a process",
        "Threads are cheaper to create and switch between",
        "Shared memory means threads need synchronization (locks) to avoid race conditions"
      ]
    },
    {
      id: "s-project", track: "cs", type: "Behavioral",
      q: "Tell me about a project you're proud of. What would you do differently?",
      tip: "Pick a project you built, ideally with real users, and be ready to go deep on any decision.",
      points: [
        "The problem and who it was for",
        "Your technical choices and why you made them",
        "The hardest bug or trade-off",
        "What you'd change with what you know now"
      ]
    },
    {
      id: "s-bug", track: "cs", type: "Behavioral",
      q: "Describe a bug that took you a long time to find.",
      tip: "This shows how you debug, which is most of the job.",
      points: [
        "The symptom and why it was confusing",
        "How you narrowed it down: logs, a debugger, a minimal reproduction",
        "The root cause and what you changed so it couldn't happen again"
      ]
    }
  ]
};
