/*
  FVCN content data.
  This file plays the role of the database for the front-end version.
  Each top-level array maps to a future database table
  (majors, mentors, resources, events, companies, guides).
  The UI never reads this directly — it goes through js/api.js.
*/
const FVCN_DATA = {
  majors: [
    {
      id: "finance",
      name: "Finance",
      icon: "chart",
      summary:
        "Help companies and investors make money decisions: raising capital, valuing businesses, managing portfolios, and analyzing markets.",
      roles: [
        "Investment Banking",
        "Sales & Trading",
        "Asset Management",
        "Corporate Finance (FP&A)",
        "Equity Research",
        "Private Equity"
      ],
      skills: [
        "Excel and financial modeling",
        "Accounting and the three financial statements",
        "Valuation (DCF, comparable companies)",
        "Following markets and business news",
        "Technical and behavioral interview prep"
      ],
      timeline: [
        { when: "Freshman–Sophomore", what: "Join finance clubs, apply to early-insight and diversity programs, and start networking." },
        { when: "Sophomore spring", what: "Junior-summer banking and markets internships can open this early. Have your resume ready." },
        { when: "Junior summer", what: "The internship that most often leads to a full-time offer." }
      ]
    },
    {
      id: "marketing",
      name: "Marketing",
      icon: "megaphone",
      summary:
        "Understand customers and grow brands through strategy, content, campaigns, and data.",
      roles: [
        "Brand Marketing",
        "Digital & Social Media",
        "Marketing Analytics",
        "Content Strategy",
        "Agency Account & Strategy",
        "Consumer Insights"
      ],
      skills: [
        "Storytelling and clear writing",
        "Content tools like Canva and Adobe",
        "Google Analytics and Ads basics",
        "Consumer research",
        "A portfolio of real work"
      ],
      timeline: [
        { when: "Freshman–Sophomore", what: "Build a portfolio by running social media or events for a club or small business." },
        { when: "Junior year", what: "Agency and brand internships post from fall through spring, often on a rolling basis." },
        { when: "Senior year", what: "Many full-time roles are posted closer to the start date, so keep networking." }
      ]
    },
    {
      id: "info-systems",
      name: "Information Systems",
      icon: "database",
      summary:
        "Work between business and technology: analyze data, improve systems, and help teams build the right products.",
      roles: [
        "Business / Systems Analyst",
        "Technology Consulting",
        "Data Analyst",
        "Product Analyst",
        "IT Risk & Cybersecurity",
        "ERP / Salesforce Analyst"
      ],
      skills: [
        "SQL and Excel",
        "Dashboards in Tableau or Power BI",
        "Process mapping and requirements",
        "Python basics",
        "Explaining tech to non-technical people"
      ],
      timeline: [
        { when: "Sophomore year", what: "Explore through tech-consulting discovery programs and data projects." },
        { when: "Junior fall", what: "Big 4 technology consulting and bank technology analyst roles recruit." },
        { when: "Rolling", what: "Data and product roles at mid-size companies post year-round." }
      ]
    },
    {
      id: "ais",
      name: "Accounting Information Systems",
      shortName: "Accounting (AIS)",
      icon: "calculator",
      summary:
        "Combine accounting with technology: audit financial statements, manage risk, and work with the systems that run a business.",
      roles: [
        "Audit",
        "Risk Advisory / IT Audit",
        "Tax",
        "Forensic Accounting",
        "ERP / Systems Consulting",
        "Financial Reporting"
      ],
      skills: [
        "Financial and managerial accounting",
        "Excel and data analytics",
        "Internal controls and risk",
        "ERP systems (SAP, Oracle)",
        "Planning for the CPA exam"
      ],
      timeline: [
        { when: "Sophomore year", what: "Apply to Big 4 leadership and discovery programs." },
        { when: "Junior fall–winter", what: "Audit, tax, and advisory internships recruit, often through campus events." },
        { when: "Senior year", what: "Plan your CPA credits and exam timeline with your advisor." }
      ]
    },
    {
      id: "cs",
      name: "Computer Science",
      icon: "code",
      summary:
        "Build software and systems, from apps and websites to data pipelines, AI, and security.",
      roles: [
        "Software Engineering",
        "Data Science & ML",
        "Cybersecurity",
        "Web & Mobile Development",
        "Quant Development",
        "Solutions Engineering"
      ],
      skills: [
        "Data structures and algorithms",
        "One language in depth (Python, Java, or JavaScript)",
        "Git and GitHub",
        "Two or three real projects",
        "Mock technical interviews"
      ],
      timeline: [
        { when: "Freshman–Sophomore", what: "Look for programs built for first- and second-year students. Start building projects." },
        { when: "August–October", what: "Large tech companies open summer internship applications early. Apply in the first weeks." },
        { when: "Year-round", what: "Keep shipping projects, join hackathons, and practice interviews weekly." }
      ]
    }
  ],

  // status: "incoming" (accepted offer), "former" (past role), or "current".
  // companyIds point at the companies table below (first one is the main company);
  // companyLabel is shown when the company has no record (e.g. "Startup").
  // featured mentors appear in the hero card. Add photo: "assets/mentors/<id>.jpg" to replace the initials.
  mentors: [
    {
      id: "tam-nguyen",
      name: "Tam Nguyen",
      majorId: "finance",
      status: "former",
      role: "Asset Management Summer Intern",
      companyIds: ["jpmorgan"],
      linkedin: "https://www.linkedin.com/in/tamnguyen005/",
      bio: "Spent a summer in asset management at JPMorgan. Ask about asset management vs. banking, how recruiting works, and building a finance resume.",
      helpsWith: ["Asset management", "Resume review", "Networking"],
      interests: ["Soccer"]
    },
    {
      id: "tri-pham",
      name: "Tri Pham",
      majorId: "finance",
      status: "incoming",
      role: "Global Markets Analyst",
      companyIds: ["socgen"],
      linkedin: "https://www.linkedin.com/in/triphamtranminh/",
      bio: "Joining Société Générale's global markets team. Ask about markets recruiting, superday prep, and how to follow macro news.",
      helpsWith: ["Global markets", "Superday prep", "Market news"],
      featured: true
    },
    {
      id: "jonathan-tran",
      name: "Jonathan Tran",
      majorId: "finance",
      status: "incoming",
      role: "Sales, Trading & Structuring Analyst",
      companyIds: ["barclays"],
      linkedin: "https://www.linkedin.com/in/quang-nguyen-tran-19b18a247/",
      bio: "Joining Barclays in sales, trading, and structuring. Ask about S&T interviews, how desks differ, and preparing a market pitch.",
      helpsWith: ["Sales & trading", "Structuring", "Market pitches"]
    },
    {
      id: "thao-nguyen",
      name: "Thao Nguyen",
      majorId: "marketing",
      status: "former",
      role: "Social Strategy Intern",
      companyIds: ["ogilvy"],
      linkedin: "https://www.linkedin.com/in/thaonguyen47/",
      bio: "Interned on the social strategy team at Ogilvy. Ask about agency life, building a marketing portfolio, and telling your story on LinkedIn.",
      helpsWith: ["Social strategy", "Portfolio", "LinkedIn"],
      interests: ["Coffee"]
    },
    {
      id: "quang-nguyen",
      name: "Quang Nguyen",
      majorId: "marketing",
      status: "current",
      role: "GFi & Ins Service Sales Intern",
      companyIds: ["wwt"],
      linkedin: "https://www.linkedin.com/in/quang-p-nguyen/",
      bio: "Sales intern at World Wide Technology. Ask about tech sales, client-facing roles, and B2B marketing.",
      helpsWith: ["Tech sales", "Client communication", "B2B marketing"]
    },
    {
      id: "phuong-bui",
      name: "Phuong Bui",
      majorId: "marketing",
      status: "former",
      role: "Retail Sales Intern",
      companyIds: ["cocacola"],
      linkedin: "https://www.linkedin.com/in/phuongbuiphb/",
      bio: "Interned in retail sales at The Coca-Cola Company. Ask about consumer goods (CPG) careers, sales internships, and behavioral interviews.",
      helpsWith: ["CPG careers", "Sales", "Behavioral interviews"]
    },
    {
      id: "quan-bui",
      name: "Quan Bui",
      majorId: "info-systems",
      status: "current",
      role: "Business Analyst Intern",
      companyIds: ["brookfield"],
      linkedin: "https://www.linkedin.com/in/dangquanbui/",
      bio: "Business analyst intern at Brookfield. Ask about business analyst roles, SQL and data skills, and product thinking.",
      helpsWith: ["Business analysis", "SQL", "Product thinking"],
      interests: ["Gym"]
    },
    {
      id: "amy-pham",
      name: "Amy Pham",
      majorId: "info-systems",
      status: "current",
      role: "Research Intern",
      companyIds: ["iheartmedia"],
      linkedin: "https://www.linkedin.com/in/amypham05/",
      bio: "Research intern at iHeartMedia. Ask about audience and market research, working with data in media, and landing a media internship.",
      helpsWith: ["Market research", "Data analysis", "Media industry"]
    },
    {
      id: "anh-bui",
      name: "Anh Bui",
      majorId: "info-systems",
      status: "current",
      role: "Data Engineer Intern",
      companyLabel: "Startup",
      linkedin: "https://www.linkedin.com/in/anh-nt-bui/",
      bio: "Data engineering intern at a startup. Ask about data pipelines, Python and SQL, and what it's like to work at a small company.",
      helpsWith: ["Data engineering", "Python & SQL", "Startups"]
    },
    {
      id: "thomas-vu-hong",
      name: "Thomas Vu Hong",
      majorId: "ais",
      status: "incoming",
      role: "Audit Intern",
      companyIds: ["deloitte", "ey"],
      linkedin: "https://www.linkedin.com/in/duc-anh-thomas-v-132120257/",
      bio: "Incoming audit intern at Deloitte and EY. Ask about Big 4 recruiting, audit vs. advisory, and professional communication.",
      helpsWith: ["Big 4 recruiting", "Audit", "Professional emails"],
      interests: ["Food"],
      featured: true
    },
    {
      id: "dani-pham",
      name: "Khue (Dani) Pham",
      majorId: "ais",
      status: "current",
      role: "Tax Intern",
      companyIds: ["shakeshack"],
      linkedin: "https://www.linkedin.com/in/danikhuepham/",
      bio: "Tax intern at Shake Shack. Ask about corporate (in-house) tax, accounting careers outside the Big 4, and balancing recruiting with classes.",
      helpsWith: ["Corporate tax", "In-house accounting", "Time management"]
    },
    {
      id: "nick-trinh",
      name: "Nick Trinh",
      majorId: "cs",
      status: "current",
      role: "Software Engineer Intern",
      companyIds: ["google"],
      linkedin: "https://www.linkedin.com/in/nicktrinh/",
      bio: "Software engineering intern at Google. Ask about picking projects worth building, technical interviews, and big tech applications.",
      helpsWith: ["Technical interviews", "Projects & GitHub", "Big tech applications"],
      interests: ["Basketball"],
      featured: true
    },
    {
      id: "minh-vu",
      name: "Minh Vu",
      majorId: "cs",
      status: "current",
      role: "Software Engineer",
      companyIds: ["profound"],
      linkedin: "https://www.linkedin.com/in/minhvu01/",
      bio: "Software engineer at Profound. Ask about full-time SWE recruiting, working at a startup, and growing as an engineer.",
      helpsWith: ["SWE recruiting", "Startups", "System design"]
    }
  ],

  // majorId "general" = useful for every major.
  // A resource has either a url (external), a guideId (FVCN guide), or neither (coming soon).
  resources: [
    { id: "r-coffee-playbook", title: "Coffee Chat Playbook", majorId: "general", type: "Guide", level: "Beginner", source: "FVCN", guideId: "coffee-chat",
      description: "How to prepare for a coffee chat, what to ask, and how to follow up. Includes a thank-you note template." },
    { id: "r-resume-checklist", title: "Resume Review Checklist", majorId: "general", type: "Guide", level: "Beginner", source: "FVCN", guideId: "resume",
      description: "A step-by-step checklist to make your resume clean, specific, and ready for recruiters." },
    { id: "r-handshake", title: "Handshake", majorId: "general", type: "Job search", level: "Beginner", source: "Handshake", url: "https://joinhandshake.com",
      description: "Internship and full-time job postings for college students, plus employer events." },
    { id: "r-glassdoor", title: "Glassdoor interview questions", majorId: "general", type: "Job search", level: "Intermediate", source: "Glassdoor", url: "https://www.glassdoor.com",
      description: "Real interview questions and experiences shared by candidates, by company and role." },

    { id: "r-finance-pack", title: "Finance Recruiting Starter Pack", majorId: "finance", type: "Guide", level: "Beginner", source: "FVCN",
      description: "Networking, recruiting timelines, and the technical questions to learn first. Written by FVCN mentors." },
    { id: "r-investopedia", title: "Investopedia", majorId: "finance", type: "Reference", level: "Beginner", source: "Investopedia", url: "https://www.investopedia.com",
      description: "Plain-English definitions for finance terms you'll hear in class and interviews." },
    { id: "r-cfi", title: "Corporate Finance Institute", majorId: "finance", type: "Course", level: "Intermediate", source: "CFI", url: "https://corporatefinanceinstitute.com",
      description: "Courses and articles on Excel, accounting, and valuation fundamentals." },

    { id: "r-marketing-portfolio", title: "Marketing Portfolio Guide", majorId: "marketing", type: "Guide", level: "Beginner", source: "FVCN",
      description: "How to present campaigns, social media work, and analytics projects so recruiters notice." },
    { id: "r-hubspot", title: "HubSpot Academy", majorId: "marketing", type: "Course", level: "Beginner", source: "HubSpot", url: "https://academy.hubspot.com",
      description: "Free certifications in content, social media, and inbound marketing." },
    { id: "r-skillshop", title: "Google Skillshop", majorId: "marketing", type: "Course", level: "Intermediate", source: "Google", url: "https://skillshop.withgoogle.com",
      description: "Free Google Ads and Google Analytics training and certifications." },

    { id: "r-sqlbolt", title: "SQLBolt", majorId: "info-systems", type: "Practice", level: "Beginner", source: "SQLBolt", url: "https://sqlbolt.com",
      description: "Short interactive SQL lessons you can finish in an afternoon." },
    { id: "r-mslearn", title: "Microsoft Learn", majorId: "info-systems", type: "Course", level: "Beginner", source: "Microsoft", url: "https://learn.microsoft.com/training/",
      description: "Free learning paths for Power BI, Excel, and cloud fundamentals." },
    { id: "r-tech-consulting", title: "Tech Consulting Case Notes", majorId: "info-systems", type: "Guide", level: "Intermediate", source: "FVCN",
      description: "How technology consulting interviews work, with example cases and frameworks." },

    { id: "r-accounting-coach", title: "AccountingCoach", majorId: "ais", type: "Reference", level: "Beginner", source: "AccountingCoach", url: "https://www.accountingcoach.com",
      description: "Clear explanations of accounting fundamentals with practice quizzes." },
    { id: "r-aicpa", title: "AICPA & CIMA", majorId: "ais", type: "Reference", level: "Intermediate", source: "AICPA & CIMA", url: "https://www.aicpa-cima.com",
      description: "CPA exam information, career resources, and student membership." },
    { id: "r-risk-notes", title: "Accounting & Risk Interview Notes", majorId: "ais", type: "Guide", level: "Intermediate", source: "FVCN",
      description: "Common interview questions for audit, risk advisory, and accounting roles." },

    { id: "r-neetcode", title: "NeetCode", majorId: "cs", type: "Practice", level: "Intermediate", source: "NeetCode", url: "https://neetcode.io",
      description: "A structured list of coding interview problems with video explanations." },
    { id: "r-roadmap-sh", title: "roadmap.sh", majorId: "cs", type: "Reference", level: "Beginner", source: "roadmap.sh", url: "https://roadmap.sh",
      description: "Step-by-step learning roadmaps for frontend, backend, data, and more." },
    { id: "r-portfolio", title: "Build Your First Portfolio", majorId: "cs", type: "Guide", level: "Beginner", source: "FVCN",
      description: "Pick, build, and present projects that make your resume stand out." }
  ],

  // Times are America/New_York.
  events: [
    { id: "e-resume-night", title: "Resume Review Night", category: "Career", date: "2026-10-08", start: "18:00", end: "19:30",
      location: "Lincoln Center campus · room shared after RSVP",
      description: "Bring a printed or digital resume and get one-on-one feedback from upperclassmen and alumni." },
    { id: "e-soccer", title: "Soccer Friday", category: "Community", date: "2026-10-16", start: "18:00", end: "21:00",
      location: "Rose Hill campus · field shared after RSVP",
      description: "A casual game for all skill levels to kick off the weekend. Open to Vietnamese students and friends." },
    { id: "e-alumni-panel", title: "Vietnamese Alumni Career Panel", category: "Alumni", date: "2026-10-29", start: "18:30", end: "20:00",
      location: "Lincoln Center campus · room shared after RSVP",
      description: "Alumni in finance, tech, consulting, and accounting share how they got started. Q&A to follow." },
    { id: "e-mock-interviews", title: "Mock Interview Workshop", category: "Career", date: "2026-11-12", start: "18:00", end: "19:30",
      location: "Virtual · link shared after RSVP",
      description: "Practice behavioral and technical questions in small groups, with feedback from mentors." },
    { id: "e-pho-night", title: "Phở Night", category: "Community", date: "2026-11-20", start: "19:00", end: "21:00",
      location: "Restaurant shared after RSVP",
      description: "End the semester with a bowl of phở and good company. Everyone is welcome." }
  ],

  // logo: wide logo for the "where our members work" strip (omit to leave a company out of it).
  // icon: small square mark shown next to a mentor's company.
  // fit: "cover" is for logos whose image has its own solid background color.
  companies: [
    { id: "jpmorgan", name: "JPMorgan", logo: "assets/logos/jpmorgan.png", icon: "assets/companies/jpmorgan.png" },
    { id: "google", name: "Google", logo: "assets/logos/google.png", icon: "assets/companies/google.png" },
    { id: "barclays", name: "Barclays", logo: "assets/logos/barclays.webp", icon: "assets/companies/barclays.png" },
    { id: "socgen", name: "Société Générale", logo: "assets/logos/societegeneral.png", icon: "assets/companies/socgen.png" },
    { id: "deloitte", name: "Deloitte", logo: "assets/logos/deloitte.webp", icon: "assets/companies/deloitte.png" },
    { id: "ey", name: "EY", logo: "assets/logos/ey.webp", icon: "assets/companies/ey.png" },
    { id: "cocacola", name: "The Coca-Cola Company", logo: "assets/logos/cocacola.png", icon: "assets/companies/cocacola.png" },
    { id: "brookfield", name: "Brookfield", logo: "assets/logos/brookfield.jpg", icon: "assets/companies/brookfield.png", fit: "cover" },
    { id: "ogilvy", name: "Ogilvy", logo: "assets/logos/ogilvy.jpg", icon: "assets/companies/ogilvy.png", fit: "cover" },
    { id: "nvidia", name: "NVIDIA", logo: "assets/logos/nvidia.jpg" },
    { id: "shakeshack", name: "Shake Shack", logo: "assets/logos/shakeshack.png", icon: "assets/companies/shakeshack.png" },
    { id: "iheartmedia", name: "iHeartMedia", logo: "assets/logos/iheartmedia.webp", icon: "assets/companies/iheartmedia.png" },
    { id: "wwt", name: "World Wide Technology", logo: "assets/logos/wwt.jpg", icon: "assets/companies/wwt.png" },
    { id: "unicredit", name: "UniCredit", logo: "assets/logos/unicredit.jpg" },
    { id: "fox", name: "FOX Corporation", logo: "assets/logos/fox.png" },
    { id: "profound", name: "Profound", icon: "assets/companies/profound.png" }
  ],

  // Campus and community photos (all from Wikimedia Commons; credits are shown in the footer).
  photos: {
    "keating-hall": {
      src: "assets/photos/keating-hall.jpg",
      caption: "Keating Hall and Edwards Parade, Rose Hill",
      author: "Raymond Bucko, SJ",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      source: "https://commons.wikimedia.org/wiki/File:Keating_Hall,_2014.png"
    },
    "queens-court": {
      src: "assets/photos/queens-court.jpg",
      caption: "Queen's Court and the University Church, Rose Hill",
      author: "Indefatigable2",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:Queen%27s_Court_and_University_Church_at_Fordham.jpg"
    },
    "lincoln-center": {
      src: "assets/photos/lincoln-center.jpg",
      caption: "Lincoln Center campus, Manhattan",
      author: "Tdorante10",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:Fordham_LC_01.jpg"
    },
    "rose-hill-autumn": {
      src: "assets/photos/rose-hill-autumn.jpg",
      caption: "Autumn at Rose Hill",
      author: "Kristine Paulus",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      source: "https://commons.wikimedia.org/wiki/File:Fordham_University_Campus_(5190445947).jpg"
    },
    "edwards-parade": {
      src: "assets/photos/edwards-parade.jpg",
      caption: "Edwards Parade, Rose Hill",
      author: "Doug Olson",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      source: "https://commons.wikimedia.org/wiki/File:Fordham_Manor,_Bronx,_NY,_USA_-_panoramio_(5).jpg"
    },
    pho: {
      src: "assets/photos/pho.jpg",
      caption: "Phở bò",
      author: "Codename5281",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      source: "https://commons.wikimedia.org/wiki/File:Ph%E1%BB%9F_b%C3%B2,_C%E1%BA%A7u_Gi%E1%BA%A5y,_H%C3%A0_N%E1%BB%99i.jpg"
    }
  },

  roadmap: [
    {
      id: "freshman",
      label: "Freshman",
      focus: "Explore and build good habits",
      intro: "You don't need a plan yet. Try things, meet people, and set up the basics.",
      items: [
        { id: "fr-clubs", text: "Join two or three clubs, including one tied to a career you're curious about" },
        { id: "fr-linkedin", text: "Create a LinkedIn profile with a photo and a clear headline" },
        { id: "fr-chat", text: "Book your first coffee chat with an upperclassman" },
        { id: "fr-resume", text: "Write a one-page resume, even if it's short" },
        { id: "fr-skill", text: "Learn one practical skill: Excel, SQL, or Python basics" },
        { id: "fr-career-office", text: "Meet with Fordham's career services office at least once" }
      ]
    },
    {
      id: "sophomore",
      label: "Sophomore",
      focus: "Narrow your direction",
      intro: "Start choosing. Talk to people in the paths you're considering and apply to early programs.",
      items: [
        { id: "so-major", text: "Choose or confirm your major and concentration" },
        { id: "so-programs", text: "Apply to sophomore and early-insight programs in your field" },
        { id: "so-leadership", text: "Take on a leadership role or project in a club" },
        { id: "so-chats", text: "Have three to five coffee chats with people in your target path" },
        { id: "so-project", text: "Complete one project you can talk about in interviews" }
      ]
    },
    {
      id: "junior",
      label: "Junior",
      focus: "Land the internship that matters",
      intro: "This is the main recruiting year. Be organized, practice often, and use your network.",
      items: [
        { id: "ju-resume", text: "Tailor your resume for your target roles and get it reviewed" },
        { id: "ju-tracker", text: "Track applications and deadlines in one spreadsheet" },
        { id: "ju-practice", text: "Practice technical and behavioral interviews every week" },
        { id: "ju-alumni", text: "Reach out to alumni at your target companies" },
        { id: "ju-internship", text: "Secure a summer internship and work toward a return offer" }
      ]
    },
    {
      id: "senior",
      label: "Senior",
      focus: "Decide, then give back",
      intro: "Lock in your first full-time role and help the students coming after you.",
      items: [
        { id: "se-fulltime", text: "Accept a return offer or recruit for full-time roles" },
        { id: "se-compare", text: "Compare offers on role, growth, team, and pay, not just the company name" },
        { id: "se-thanks", text: "Thank and stay in touch with the mentors who helped you" },
        { id: "se-mentor", text: "Become an FVCN mentor for younger students" }
      ]
    }
  ],

  guides: {
    "coffee-chat": {
      title: "Coffee Chat Playbook",
      intro: "A coffee chat is a relaxed 20–30 minute conversation to learn from someone's experience. It isn't an interview, and nobody expects you to have it all figured out.",
      sections: [
        {
          heading: "Before the chat",
          items: [
            "Read your mentor's profile and LinkedIn so you don't ask what's already there.",
            "Write down two or three things you really want to learn.",
            "If you want resume feedback, send your resume a day ahead."
          ]
        },
        {
          heading: "Good questions to ask",
          items: [
            "What made you choose your major and career path?",
            "What did your recruiting timeline look like, month by month?",
            "What do you wish you had done differently as a freshman?",
            "Which classes, clubs, or projects helped you most?",
            "Is there anyone else you think I should talk to?"
          ]
        },
        {
          heading: "After the chat",
          items: [
            "Send a thank-you message within 24 hours.",
            "Mention one specific thing you learned.",
            "Follow up a few weeks later when you act on their advice."
          ]
        }
      ],
      template:
        "Hi [Name],\n\nThank you for taking the time to chat with me today. I really appreciated your advice about [specific takeaway], and I'm going to [next step you'll take].\n\nI'll keep you posted on how it goes. Thanks again!\n\nBest,\n[Your name]"
    },
    resume: {
      title: "Resume Review Checklist",
      intro: "Recruiters often skim a resume in under a minute. Use this checklist before you apply or ask a mentor for a review.",
      sections: [
        {
          heading: "Format",
          items: [
            "One page, with the same font, spacing, and date style throughout.",
            "Save as a PDF named FirstName-LastName-Resume.pdf.",
            "Education at the top while you're a student: school, degree, expected graduation date."
          ]
        },
        {
          heading: "Content",
          items: [
            "Start every bullet with a strong verb (built, led, analyzed, launched).",
            "Show results with numbers where you can (grew followers by 40%, saved 5 hours a week).",
            "Put your most relevant experience first.",
            "List skills that match your path: Excel, SQL, Python, Canva, Tableau, and so on."
          ]
        },
        {
          heading: "Final check",
          items: [
            "Read it out loud to catch typos and awkward phrasing.",
            "Make sure your email and LinkedIn link work.",
            "Ask a mentor for a resume review before big deadlines."
          ]
        }
      ]
    }
  },

  faqs: [
    {
      q: "Who can book a coffee chat?",
      a: "Any Fordham student, especially freshmen and sophomores figuring out their path. You don't need to be Vietnamese or have a major picked."
    },
    {
      q: "Is it free?",
      a: "Yes. Mentors volunteer their time because someone once did the same for them."
    },
    {
      q: "I'm not sure what I want to do. Should I still book?",
      a: "Yes. \"I'm still exploring\" is one of the most common reasons students book. Choose \"No preference\" as your mentor and we'll match you with someone."
    },
    {
      q: "What happens after I send a request?",
      a: "Your mentor reviews it and confirms one of your preferred times by email. If they're busy, we'll help you find another mentor in the same path."
    },
    {
      q: "How should I prepare?",
      a: "Read the Coffee Chat Playbook, bring two or three specific questions, and share your resume ahead of time if you want feedback."
    },
    {
      q: "Can I become a mentor?",
      a: "If you're a junior, senior, or alum with internship or work experience, we'd love your help. Use \"Become a mentor\" at the bottom of the page."
    }
  ]
};
