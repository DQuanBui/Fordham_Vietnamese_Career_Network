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
     Recruiting calendar
     Months are calendar months (1 = January). Each phase sits inside one academic
     year, which runs August to July, so a phase never wraps past July.
     kind: explore | prep | apply | interview | intern
     ------------------------------------------------------------------------ */
  calendar: [
    {
      id: "banking", label: "Investment banking & markets", majorId: "finance",
      phases: [
        { year: "freshman", from: 9, to: 11, kind: "explore", title: "Join finance clubs", detail: "Get into a student investment or finance club and learn the basics of accounting and markets." },
        { year: "freshman", from: 10, to: 2, kind: "apply", title: "First-year and diversity programs", detail: "Many banks run early-insight and diversity programs for first-years. They are small, but a strong head start." },
        { year: "freshman", from: 3, to: 5, kind: "prep", title: "Start networking", detail: "Two or three coffee chats a month with upperclassmen and alumni. Keep a simple tracker." },
        { year: "freshman", from: 6, to: 7, kind: "intern", title: "Summer experience", detail: "Any job, research, or internship works. Learn Excel and the three financial statements on the side." },

        { year: "sophomore", from: 8, to: 11, kind: "apply", title: "Sophomore insight programs", detail: "Apply to sophomore and diversity programs, and polish your resume with a mentor." },
        { year: "sophomore", from: 9, to: 12, kind: "prep", title: "Learn the technicals", detail: "The three statements, valuation methods, and a DCF. Use the Finance questions in the bank above." },
        { year: "sophomore", from: 1, to: 4, kind: "apply", title: "Junior-summer applications open", detail: "Many banks now recruit for the summer after junior year more than a year ahead. Have your story and resume ready by January." },
        { year: "sophomore", from: 2, to: 6, kind: "interview", title: "HireVues and superdays", detail: "Recorded first-round interviews, then a final round of back-to-back interviews." },
        { year: "sophomore", from: 6, to: 7, kind: "intern", title: "Sophomore summer internship", detail: "Boutique banks, private equity or venture capital, corporate finance, or wealth management." },

        { year: "junior", from: 8, to: 10, kind: "apply", title: "Remaining summer analyst roles", detail: "Middle-market banks, boutiques, and later-cycle programs. Don't stop if you don't have an offer yet." },
        { year: "junior", from: 9, to: 11, kind: "interview", title: "Later-cycle interviews", detail: "Interviews for the programs above." },
        { year: "junior", from: 6, to: 7, kind: "intern", title: "Summer analyst internship", detail: "The internship that most often leads to a full-time offer." },

        { year: "senior", from: 8, to: 9, kind: "apply", title: "Return offers and full-time recruiting", detail: "Accept a return offer, or recruit for full-time roles if you're looking for a different firm." },
        { year: "senior", from: 9, to: 12, kind: "interview", title: "Full-time interviews", detail: "For students still recruiting." },
        { year: "senior", from: 1, to: 5, kind: "explore", title: "Pay it forward", detail: "Help the next class: become an FVCN mentor." }
      ]
    },
    {
      id: "accounting", label: "Big 4 accounting & audit", majorId: "ais",
      phases: [
        { year: "freshman", from: 9, to: 12, kind: "explore", title: "Meet the firms", detail: "Go to accounting society events and firm information sessions. Recruiters remember faces." },
        { year: "freshman", from: 1, to: 4, kind: "apply", title: "First-year exploration programs", detail: "Some firms run short programs for first-years. Ask upperclassmen which ones they did." },
        { year: "freshman", from: 3, to: 5, kind: "prep", title: "Plan for 150 credits", detail: "Most states require 150 credit hours for a CPA license. Map out how you'll get there (often a master's)." },

        { year: "sophomore", from: 8, to: 11, kind: "apply", title: "Sophomore leadership programs", detail: "Each Big 4 firm, and many mid-size firms, runs a program for sophomores. Applications usually open in late summer and fall." },
        { year: "sophomore", from: 10, to: 1, kind: "interview", title: "Leadership program interviews", detail: "Mostly behavioral. These programs often lead to junior internship offers." },
        { year: "sophomore", from: 2, to: 5, kind: "prep", title: "Choose a service line", detail: "Audit, tax, or advisory. Coffee chats with people in each are the best way to decide." },

        { year: "junior", from: 8, to: 10, kind: "apply", title: "Internship applications", detail: "Audit, tax, and advisory internships for the following year. Leadership program alumni may be fast-tracked." },
        { year: "junior", from: 9, to: 11, kind: "interview", title: "Office visits and interviews", detail: "Offers often arrive by late fall." },
        { year: "junior", from: 1, to: 3, kind: "intern", title: "Winter (busy season) internships", detail: "Some firms offer audit internships during busy season instead of the summer." },
        { year: "junior", from: 6, to: 7, kind: "intern", title: "Summer internship", detail: "Strong performance usually leads to a full-time offer." },

        { year: "senior", from: 8, to: 9, kind: "apply", title: "Accept a full-time offer", detail: "Start dates are often a year or more away, especially if you're doing a master's first." },
        { year: "senior", from: 10, to: 5, kind: "prep", title: "Plan the CPA exam", detail: "Decide which sections to take first and finish your 150 credits." }
      ]
    },
    {
      id: "consulting", label: "Consulting & tech consulting", majorId: "info-systems",
      phases: [
        { year: "freshman", from: 9, to: 12, kind: "explore", title: "Join a consulting club", detail: "Try a case competition. It's the fastest way to find out if you enjoy this kind of problem solving." },
        { year: "freshman", from: 1, to: 5, kind: "prep", title: "Build your leadership story", detail: "Firms look for leadership and impact. Take on a real role in one or two organizations." },

        { year: "sophomore", from: 8, to: 12, kind: "apply", title: "Sophomore and diversity programs", detail: "Many consulting firms run early programs for sophomores, often with an interview for a junior internship." },
        { year: "sophomore", from: 1, to: 5, kind: "prep", title: "Start case practice", detail: "Two or three cases a week with a partner. Use the Consulting questions above to warm up." },
        { year: "sophomore", from: 6, to: 7, kind: "intern", title: "Summer internship", detail: "Any role with analytical work and measurable results." },

        { year: "junior", from: 8, to: 9, kind: "apply", title: "Internship applications", detail: "Strategy firms and Big 4 consulting and advisory practices. Networking and referrals matter a lot." },
        { year: "junior", from: 9, to: 11, kind: "interview", title: "Case interviews and final rounds", detail: "Usually two rounds, each with a case and behavioral questions." },
        { year: "junior", from: 6, to: 7, kind: "intern", title: "Summer consulting internship", detail: "Most full-time consulting hires come from the summer intern class." },

        { year: "senior", from: 8, to: 9, kind: "apply", title: "Full-time applications", detail: "For students without a return offer, or switching firms." },
        { year: "senior", from: 9, to: 11, kind: "interview", title: "Full-time interviews", detail: "Same format as the internship process." }
      ]
    },
    {
      id: "software", label: "Software engineering", majorId: "cs",
      phases: [
        { year: "freshman", from: 9, to: 12, kind: "explore", title: "Build your first project", detail: "Something small that you finish. Join a coding club or a hackathon." },
        { year: "freshman", from: 9, to: 11, kind: "apply", title: "First- and second-year programs", detail: "Large tech companies run programs for first- and second-year students. Applications open early in the fall." },
        { year: "freshman", from: 1, to: 4, kind: "apply", title: "Startups and research", detail: "Smaller companies and professors' research labs hire closer to the summer." },
        { year: "freshman", from: 6, to: 7, kind: "intern", title: "Summer project or internship", detail: "Shipping something real beats a long list of tutorials." },

        { year: "sophomore", from: 8, to: 10, kind: "apply", title: "Internship applications open", detail: "Large tech and finance-tech companies open applications in late summer. Apply early, because many review on a rolling basis." },
        { year: "sophomore", from: 9, to: 12, kind: "interview", title: "Online assessments and interviews", detail: "Timed coding tests, then technical interviews." },
        { year: "sophomore", from: 1, to: 4, kind: "apply", title: "Rolling applications", detail: "Mid-size companies and startups keep hiring through the spring." },
        { year: "sophomore", from: 6, to: 7, kind: "intern", title: "Summer internship", detail: "" },

        { year: "junior", from: 8, to: 10, kind: "apply", title: "Main internship season", detail: "Big tech and quantitative trading firms. Use referrals from past internships and FVCN mentors." },
        { year: "junior", from: 9, to: 12, kind: "interview", title: "Technical interviews", detail: "Data structures, algorithms, and a little system design." },
        { year: "junior", from: 6, to: 7, kind: "intern", title: "Summer internship", detail: "Return offers usually come at the end of the summer." },

        { year: "senior", from: 8, to: 11, kind: "apply", title: "New-grad applications", detail: "Return offers, or apply to new-grad roles early in the fall." },
        { year: "senior", from: 9, to: 12, kind: "interview", title: "New-grad interviews", detail: "" }
      ]
    },
    {
      id: "marketing", label: "Marketing & brand", majorId: "marketing",
      phases: [
        { year: "freshman", from: 9, to: 12, kind: "explore", title: "Start a portfolio", detail: "Social posts, designs, writing, or campaign ideas. Join a marketing club." },
        { year: "freshman", from: 1, to: 5, kind: "prep", title: "Run something real", detail: "Manage social media for a club or a local business, and track the numbers." },

        { year: "sophomore", from: 9, to: 11, kind: "apply", title: "Early programs at consumer brands", detail: "Some large consumer-goods companies run programs for sophomores in the fall." },
        { year: "sophomore", from: 2, to: 5, kind: "apply", title: "Agency, media, and startup internships", detail: "These usually hire a few months before the summer." },
        { year: "sophomore", from: 6, to: 7, kind: "intern", title: "Summer internship", detail: "" },

        { year: "junior", from: 8, to: 11, kind: "apply", title: "Brand management internships", detail: "Large consumer companies recruit for junior-summer brand roles in the fall." },
        { year: "junior", from: 9, to: 12, kind: "interview", title: "Interviews and case questions", detail: "Expect \"How would you grow this brand?\" questions. Practice with the Marketing set above." },
        { year: "junior", from: 2, to: 5, kind: "apply", title: "Agencies, media, and startups", detail: "Rolling hiring continues in the spring." },
        { year: "junior", from: 6, to: 7, kind: "intern", title: "Summer internship", detail: "" },

        { year: "senior", from: 8, to: 11, kind: "apply", title: "Full-time brand programs", detail: "Rotational and associate brand manager programs recruit in the fall." },
        { year: "senior", from: 2, to: 5, kind: "apply", title: "Agencies and startups", detail: "Full-time hiring here happens closer to graduation." }
      ]
    }
  ],

  /* ------------------------------------------------------------------------
     Message templates. {field} placeholders are filled from the form.
     ------------------------------------------------------------------------ */
  templateFields: {
    name: { label: "Your name", placeholder: "Linh Nguyen" },
    year: { label: "Your class year", placeholder: "sophomore" },
    major: { label: "Your major", placeholder: "Finance" },
    theirName: { label: "Their first name", placeholder: "Tam" },
    company: { label: "Their company", placeholder: "JPMorgan" },
    focus: { label: "Industry or team", placeholder: "asset management" },
    how: { label: "How you found them", placeholder: "through the Fordham alumni network on LinkedIn" },
    detail: { label: "Something specific about them", placeholder: "your move from audit into risk advisory" },
    takeaway: { label: "Something you talked about", placeholder: "how to prepare for superdays" },
    nextStep: { label: "What you'll do next", placeholder: "start practicing technical questions every week" },
    jobTitle: { label: "Role", placeholder: "Summer Analyst" }
  },

  templates: [
    {
      id: "linkedin",
      label: "LinkedIn connection note",
      icon: "linkedin",
      limit: 200,
      fields: ["theirName", "year", "major", "focus", "company"],
      body: "Hi {theirName}, I'm a {year} at Fordham studying {major}. I'd love to hear how you got into {focus} at {company}. Would you be open to a quick 15-minute chat? Thank you!",
      tips: [
        "Free LinkedIn accounts limit connection notes to about 200 characters, so keep it short.",
        "Don't attach a resume or ask for a job in the first message.",
        "Fordham alumni are the most likely to say yes. Mention Fordham early."
      ]
    },
    {
      id: "coffee-email",
      label: "Coffee chat request email",
      icon: "coffee",
      fields: ["name", "year", "major", "theirName", "company", "focus", "how", "detail"],
      subject: "Fordham {year} interested in {focus}",
      body: "Hi {theirName},\n\nMy name is {name}, and I'm a {year} at Fordham studying {major}. I found you {how} and was especially interested in {detail}.\n\nI'm exploring {focus} and would really appreciate 15–20 minutes to hear about your experience at {company}. I'm happy to work around your schedule, by phone or video.\n\nThank you for considering it.\n\nBest,\n{name}",
      tips: [
        "Send it Tuesday to Thursday morning, when people catch up on email.",
        "One specific detail about them shows you did your homework.",
        "Offer a short call. 15–20 minutes is an easy yes."
      ]
    },
    {
      id: "thank-you",
      label: "Thank-you after a chat",
      icon: "heart",
      fields: ["name", "theirName", "takeaway", "nextStep"],
      subject: "Thank you, {theirName}",
      body: "Hi {theirName},\n\nThank you for taking the time to talk with me today. I especially appreciated your advice about {takeaway}, and I'm going to {nextStep}.\n\nI'll keep you posted on how it goes. Thanks again for your help.\n\nBest,\n{name}",
      tips: [
        "Send it within 24 hours.",
        "Mention one specific piece of advice, so it doesn't read like a template.",
        "Follow up again in a month or two with an update. That's how a contact becomes a mentor."
      ]
    },
    {
      id: "follow-up",
      label: "Follow-up when there's no reply",
      icon: "clock",
      fields: ["name", "theirName", "focus", "company"],
      subject: "Following up: Fordham student interested in {focus}",
      body: "Hi {theirName},\n\nI wanted to follow up on my note from last week. I know things get busy, so no worries if now isn't a good time.\n\nIf you have 15 minutes in the coming weeks, I'd love to hear about your experience in {focus} at {company}.\n\nBest,\n{name}",
      tips: [
        "Wait about a week before following up.",
        "Reply in the same thread, so they can see your first message.",
        "Follow up once. If there's still no reply, move on. It's rarely personal."
      ]
    },
    {
      id: "referral",
      label: "Asking for a referral",
      icon: "users",
      fields: ["name", "theirName", "takeaway", "jobTitle", "company"],
      subject: "{jobTitle} application at {company}",
      body: "Hi {theirName},\n\nI hope you're doing well. Thank you again for our conversation about {takeaway}. It helped me decide to apply for the {jobTitle} role at {company}.\n\nIf you feel comfortable, would you be willing to refer me or pass my resume along to the team? I've attached my resume, and I'm happy to send anything else that would help.\n\nEither way, I really appreciate your help.\n\nBest,\n{name}",
      tips: [
        "Only ask someone you've already talked with.",
        "Make it easy: attach your resume and include the job link or ID.",
        "Give them an easy way to say no."
      ]
    },
    {
      id: "interview-thanks",
      label: "Thank-you after an interview",
      icon: "briefcase",
      fields: ["name", "theirName", "jobTitle", "takeaway", "company"],
      subject: "Thank you for the {jobTitle} interview",
      body: "Hi {theirName},\n\nThank you for speaking with me today about the {jobTitle} role. I enjoyed learning about {takeaway}, and our conversation made me even more excited about the opportunity to join {company}.\n\nPlease let me know if there's anything else I can provide. I look forward to hearing from you.\n\nBest,\n{name}",
      tips: [
        "Send a separate note to each interviewer, the same day.",
        "Reference something specific from that conversation.",
        "Keep it to four or five sentences."
      ]
    }
  ],

  /* ------------------------------------------------------------------------
     Glossary
     ------------------------------------------------------------------------ */
  glossary: [
    // Recruiting
    { term: "Coffee chat", category: "Recruiting", def: "An informal 15–30 minute conversation to learn about someone's job and path. Not an interview, but it still leaves an impression." },
    { term: "Informational interview", category: "Recruiting", def: "A slightly more formal name for a coffee chat: you ask the questions, and the goal is learning, not a job offer." },
    { term: "Superday", category: "Recruiting", def: "The final round in banking and some other firms: several back-to-back interviews in one day, often with offers soon after." },
    { term: "HireVue", category: "Recruiting", def: "A platform for recorded video interviews. You see a question, get a short time to think, then record your answer." },
    { term: "Online assessment (OA)", category: "Recruiting", def: "A timed test early in the process: coding problems in tech, and numerical, logic, or game-based tests at some other firms." },
    { term: "Return offer", category: "Recruiting", def: "A full-time job offer given to an intern at the end of the internship. The main way many firms hire full-time." },
    { term: "Exploding offer", category: "Recruiting", def: "An offer with a short deadline to accept. It's fine to politely ask for more time." },
    { term: "Diversity program", category: "Recruiting", def: "An early program for students from underrepresented backgrounds, often with workshops and a faster path to an internship interview." },
    { term: "Early insight program", category: "Recruiting", def: "A short program (a day to a few weeks) that introduces first- and second-year students to a firm. Also called a sophomore or discovery program." },
    { term: "Off-cycle internship", category: "Recruiting", def: "An internship outside the summer: fall, winter, or spring." },
    { term: "Rolling basis", category: "Recruiting", def: "Applications are reviewed as they arrive, and spots can fill before the deadline. Apply early." },
    { term: "Referral", category: "Recruiting", def: "An employee formally recommending you to their recruiting team. Usually comes after you've built a relationship." },
    { term: "ATS", category: "Recruiting", def: "Applicant tracking system: the software firms use to collect and screen applications. Simple, clean resume formatting reads best." },
    { term: "STAR method", category: "Recruiting", def: "A structure for behavioral answers: Situation, Task, Action, Result. Spend most of the time on your Action." },

    // Finance
    { term: "Bulge bracket", category: "Finance", def: "The largest global investment banks, such as Goldman Sachs, JPMorgan, Morgan Stanley, Bank of America, and Citi." },
    { term: "Elite boutique", category: "Finance", def: "Smaller banks focused on advisory work like M&A, known for high-profile deals. Examples include Evercore, Lazard, and Centerview." },
    { term: "Middle market", category: "Finance", def: "Banks that advise smaller companies and deals, often with a smaller analyst class and broader responsibilities." },
    { term: "Sell side / buy side", category: "Finance", def: "Sell side firms (banks) advise on and sell securities. Buy side firms (asset managers, hedge funds, private equity) invest money." },
    { term: "IBD", category: "Finance", def: "Investment Banking Division: the team that advises companies on M&A and raising capital." },
    { term: "S&T", category: "Finance", def: "Sales & Trading: the team that buys and sells securities for clients and helps them manage risk." },
    { term: "M&A", category: "Finance", def: "Mergers and acquisitions: one company buying or combining with another." },
    { term: "EBITDA", category: "Finance", def: "Earnings before interest, taxes, depreciation, and amortization. A rough measure of operating cash profit used in valuation multiples." },
    { term: "DCF", category: "Finance", def: "Discounted cash flow: valuing a company by projecting its future cash flows and discounting them to today." },

    // Accounting
    { term: "Big 4", category: "Accounting", def: "The four largest accounting firms: Deloitte, PwC, EY, and KPMG." },
    { term: "Audit (assurance)", category: "Accounting", def: "Checking that a company's financial statements are fairly presented. The largest service line at most accounting firms." },
    { term: "Advisory", category: "Accounting", def: "Consulting work at accounting firms: risk, technology, deals, and operations." },
    { term: "Busy season", category: "Accounting", def: "Roughly January to April, when most audits and tax returns are due and hours are longest." },
    { term: "CPA", category: "Accounting", def: "Certified Public Accountant: the professional license for accountants. It requires passing the CPA exam and meeting education and experience rules." },
    { term: "150-hour rule", category: "Accounting", def: "Most states require 150 college credit hours for a CPA license, about 30 more than a typical bachelor's degree." },
    { term: "GAAP", category: "Accounting", def: "Generally Accepted Accounting Principles: the U.S. rules for financial reporting." },

    // Consulting
    { term: "MBB", category: "Consulting", def: "McKinsey, BCG, and Bain: the three largest strategy consulting firms." },
    { term: "Case interview", category: "Consulting", def: "An interview where you work through a business problem out loud. Interviewers grade your structure and reasoning." },
    { term: "Market sizing", category: "Consulting", def: "Estimating a number (like a market's size) from reasonable assumptions. Common in case interviews." },
    { term: "Risk advisory", category: "Consulting", def: "Helping companies manage risks like cybersecurity, regulation, and internal controls. A strong path for AIS and IS majors." },

    // Tech
    { term: "LeetCode", category: "Tech", def: "A practice site for coding interview problems. A few problems a week adds up." },
    { term: "System design", category: "Tech", def: "Interviews about designing large systems (like a URL shortener). More common for experienced hires than interns." },
    { term: "New grad", category: "Tech", def: "Full-time roles for students graduating that year, usually recruited in the fall of senior year." },
    { term: "PM", category: "Tech", def: "Product manager: decides what a product should do and why, working between engineering, design, and the business." },

    // Work authorization (general information only)
    { term: "F-1 status", category: "Work authorization", def: "The student visa status for full-time academic study in the U.S. Work is limited, so check before taking any job." },
    { term: "CPT", category: "Work authorization", def: "Curricular Practical Training: work authorization for F-1 students for internships that are part of the curriculum, approved by the school before you start." },
    { term: "OPT", category: "Work authorization", def: "Optional Practical Training: up to 12 months of work authorization in your field per degree level, approved by USCIS, used during or after your studies." },
    { term: "STEM OPT", category: "Work authorization", def: "A 24-month extension of OPT for graduates with eligible STEM degrees working for employers enrolled in E-Verify." },
    { term: "H-1B", category: "Work authorization", def: "An employer-sponsored visa for specialty jobs. There is an annual cap, so most new applicants go through a lottery." },
    { term: "Sponsorship", category: "Work authorization", def: "When an employer files paperwork, such as an H-1B petition, so you can work for them long term. Policies differ by firm." }
  ],

  international: [
    {
      title: "Know your options before you apply",
      body: "CPT covers internships during your studies; OPT can be used during or after them. Learn which one fits each internship early, because approval takes time."
    },
    {
      title: "Answer the sponsorship question honestly",
      body: "Applications often ask whether you will need sponsorship now or in the future. Answer truthfully. It is far better than a surprise after an offer."
    },
    {
      title: "Find firms that sponsor",
      body: "Policies differ by firm and even by team. Check careers pages, and ask FVCN mentors who were international students which firms sponsored them."
    },
    {
      title: "Check whether your major is STEM-designated",
      body: "STEM-designated degrees can qualify for the 24-month STEM OPT extension, which gives you more time in the H-1B lottery."
    }
  ],

  calendarKinds: {
    explore: "Explore",
    prep: "Prepare",
    apply: "Applications",
    interview: "Interviews",
    intern: "Internship"
  },

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
