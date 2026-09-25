-- FVCN seed data, generated from js/data.js by tools/seed-generator.html.
-- Safe to re-run: rows are inserted or updated by id.
begin;

insert into public.majors (id, name, short_name, icon, summary, roles, skills, timeline, sort_order) values
  ('finance', 'Finance', null, 'chart', 'Help companies and investors make money decisions: raising capital, valuing businesses, managing portfolios, and analyzing markets.', array['Investment Banking', 'Sales & Trading', 'Asset Management', 'Corporate Finance (FP&A)', 'Equity Research', 'Private Equity']::text[], array['Excel and financial modeling', 'Accounting and the three financial statements', 'Valuation (DCF, comparable companies)', 'Following markets and business news', 'Technical and behavioral interview prep']::text[], '[{"when":"Freshman–Sophomore","what":"Join finance clubs, apply to early-insight and diversity programs, and start networking."},{"when":"Sophomore spring","what":"Junior-summer banking and markets internships can open this early. Have your resume ready."},{"when":"Junior summer","what":"The internship that most often leads to a full-time offer."}]'::jsonb, 0),
  ('marketing', 'Marketing', null, 'megaphone', 'Understand customers and grow brands through strategy, content, campaigns, and data.', array['Brand Marketing', 'Digital & Social Media', 'Marketing Analytics', 'Content Strategy', 'Agency Account & Strategy', 'Consumer Insights']::text[], array['Storytelling and clear writing', 'Content tools like Canva and Adobe', 'Google Analytics and Ads basics', 'Consumer research', 'A portfolio of real work']::text[], '[{"when":"Freshman–Sophomore","what":"Build a portfolio by running social media or events for a club or small business."},{"when":"Junior year","what":"Agency and brand internships post from fall through spring, often on a rolling basis."},{"when":"Senior year","what":"Many full-time roles are posted closer to the start date, so keep networking."}]'::jsonb, 1),
  ('info-systems', 'Information Systems', null, 'database', 'Work between business and technology: analyze data, improve systems, and help teams build the right products.', array['Business / Systems Analyst', 'Technology Consulting', 'Data Analyst', 'Product Analyst', 'IT Risk & Cybersecurity', 'ERP / Salesforce Analyst']::text[], array['SQL and Excel', 'Dashboards in Tableau or Power BI', 'Process mapping and requirements', 'Python basics', 'Explaining tech to non-technical people']::text[], '[{"when":"Sophomore year","what":"Explore through tech-consulting discovery programs and data projects."},{"when":"Junior fall","what":"Big 4 technology consulting and bank technology analyst roles recruit."},{"when":"Rolling","what":"Data and product roles at mid-size companies post year-round."}]'::jsonb, 2),
  ('ais', 'Accounting Information Systems', 'Accounting (AIS)', 'calculator', 'Combine accounting with technology: audit financial statements, manage risk, and work with the systems that run a business.', array['Audit', 'Risk Advisory / IT Audit', 'Tax', 'Forensic Accounting', 'ERP / Systems Consulting', 'Financial Reporting']::text[], array['Financial and managerial accounting', 'Excel and data analytics', 'Internal controls and risk', 'ERP systems (SAP, Oracle)', 'Planning for the CPA exam']::text[], '[{"when":"Sophomore year","what":"Apply to Big 4 leadership and discovery programs."},{"when":"Junior fall–winter","what":"Audit, tax, and advisory internships recruit, often through campus events."},{"when":"Senior year","what":"Plan your CPA credits and exam timeline with your advisor."}]'::jsonb, 3),
  ('cs', 'Computer Science', null, 'code', 'Build software and systems, from apps and websites to data pipelines, AI, and security.', array['Software Engineering', 'Data Science & ML', 'Cybersecurity', 'Web & Mobile Development', 'Quant Development', 'Solutions Engineering']::text[], array['Data structures and algorithms', 'One language in depth (Python, Java, or JavaScript)', 'Git and GitHub', 'Two or three real projects', 'Mock technical interviews']::text[], '[{"when":"Freshman–Sophomore","what":"Look for programs built for first- and second-year students. Start building projects."},{"when":"August–October","what":"Large tech companies open summer internship applications early. Apply in the first weeks."},{"when":"Year-round","what":"Keep shipping projects, join hackathons, and practice interviews weekly."}]'::jsonb, 4)
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  icon = excluded.icon,
  summary = excluded.summary,
  roles = excluded.roles,
  skills = excluded.skills,
  timeline = excluded.timeline,
  sort_order = excluded.sort_order;

insert into public.companies (id, name, logo_url, icon_url, logo_fit, sort_order) values
  ('jpmorgan', 'JPMorgan', 'assets/logos/jpmorgan.png', 'assets/companies/jpmorgan.png', 'contain', 0),
  ('google', 'Google', 'assets/logos/google.png', 'assets/companies/google.png', 'contain', 1),
  ('barclays', 'Barclays', 'assets/logos/barclays.webp', 'assets/companies/barclays.png', 'contain', 2),
  ('socgen', 'Société Générale', 'assets/logos/societegeneral.png', 'assets/companies/socgen.png', 'contain', 3),
  ('deloitte', 'Deloitte', 'assets/logos/deloitte.webp', 'assets/companies/deloitte.png', 'contain', 4),
  ('ey', 'EY', 'assets/logos/ey.webp', 'assets/companies/ey.png', 'contain', 5),
  ('cocacola', 'The Coca-Cola Company', 'assets/logos/cocacola.png', 'assets/companies/cocacola.png', 'contain', 6),
  ('brookfield', 'Brookfield', 'assets/logos/brookfield.jpg', 'assets/companies/brookfield.png', 'cover', 7),
  ('ogilvy', 'Ogilvy', 'assets/logos/ogilvy.jpg', 'assets/companies/ogilvy.png', 'cover', 8),
  ('nvidia', 'NVIDIA', 'assets/logos/nvidia.jpg', null, 'contain', 9),
  ('shakeshack', 'Shake Shack', 'assets/logos/shakeshack.png', 'assets/companies/shakeshack.png', 'contain', 10),
  ('iheartmedia', 'iHeartMedia', 'assets/logos/iheartmedia.webp', 'assets/companies/iheartmedia.png', 'contain', 11),
  ('wwt', 'World Wide Technology', 'assets/logos/wwt.jpg', 'assets/companies/wwt.png', 'contain', 12),
  ('unicredit', 'UniCredit', 'assets/logos/unicredit.jpg', null, 'contain', 13),
  ('fox', 'FOX Corporation', 'assets/logos/fox.png', null, 'contain', 14),
  ('profound', 'Profound', null, 'assets/companies/profound.png', 'contain', 15)
on conflict (id) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  icon_url = excluded.icon_url,
  logo_fit = excluded.logo_fit,
  sort_order = excluded.sort_order;

insert into public.mentors (id, name, major_id, status, role, company_label, linkedin_url, bio, helps_with, interests, photo_url, featured, sort_order) values
  ('tam-nguyen', 'Tam Nguyen', 'finance', 'former', 'Asset Management Summer Intern', null, 'https://www.linkedin.com/in/tamnguyen005/', 'Spent a summer in asset management at JPMorgan. Ask about asset management vs. banking, how recruiting works, and building a finance resume.', array['Asset management', 'Resume review', 'Networking']::text[], array['Soccer']::text[], null, false, 0),
  ('tri-pham', 'Tri Pham', 'finance', 'incoming', 'Global Markets Analyst', null, 'https://www.linkedin.com/in/triphamtranminh/', 'Joining Société Générale''s global markets team. Ask about markets recruiting, superday prep, and how to follow macro news.', array['Global markets', 'Superday prep', 'Market news']::text[], '{}'::text[], null, true, 1),
  ('jonathan-tran', 'Jonathan Tran', 'finance', 'incoming', 'Sales, Trading & Structuring Analyst', null, 'https://www.linkedin.com/in/quang-nguyen-tran-19b18a247/', 'Joining Barclays in sales, trading, and structuring. Ask about S&T interviews, how desks differ, and preparing a market pitch.', array['Sales & trading', 'Structuring', 'Market pitches']::text[], '{}'::text[], null, false, 2),
  ('thao-nguyen', 'Thao Nguyen', 'marketing', 'former', 'Social Strategy Intern', null, 'https://www.linkedin.com/in/thaonguyen47/', 'Interned on the social strategy team at Ogilvy. Ask about agency life, building a marketing portfolio, and telling your story on LinkedIn.', array['Social strategy', 'Portfolio', 'LinkedIn']::text[], array['Coffee']::text[], null, false, 3),
  ('quang-nguyen', 'Quang Nguyen', 'marketing', 'current', 'GFi & Ins Service Sales Intern', null, 'https://www.linkedin.com/in/quang-p-nguyen/', 'Sales intern at World Wide Technology. Ask about tech sales, client-facing roles, and B2B marketing.', array['Tech sales', 'Client communication', 'B2B marketing']::text[], '{}'::text[], null, false, 4),
  ('phuong-bui', 'Phuong Bui', 'marketing', 'former', 'Retail Sales Intern', null, 'https://www.linkedin.com/in/phuongbuiphb/', 'Interned in retail sales at The Coca-Cola Company. Ask about consumer goods (CPG) careers, sales internships, and behavioral interviews.', array['CPG careers', 'Sales', 'Behavioral interviews']::text[], '{}'::text[], null, false, 5),
  ('quan-bui', 'Quan Bui', 'info-systems', 'current', 'Business Analyst Intern', null, 'https://www.linkedin.com/in/dangquanbui/', 'Business analyst intern at Brookfield. Ask about business analyst roles, SQL and data skills, and product thinking.', array['Business analysis', 'SQL', 'Product thinking']::text[], array['Gym']::text[], null, false, 6),
  ('amy-pham', 'Amy Pham', 'info-systems', 'current', 'Research Intern', null, 'https://www.linkedin.com/in/amypham05/', 'Research intern at iHeartMedia. Ask about audience and market research, working with data in media, and landing a media internship.', array['Market research', 'Data analysis', 'Media industry']::text[], '{}'::text[], null, false, 7),
  ('anh-bui', 'Anh Bui', 'info-systems', 'current', 'Data Engineer Intern', 'Startup', 'https://www.linkedin.com/in/anh-nt-bui/', 'Data engineering intern at a startup. Ask about data pipelines, Python and SQL, and what it''s like to work at a small company.', array['Data engineering', 'Python & SQL', 'Startups']::text[], '{}'::text[], null, false, 8),
  ('thomas-vu-hong', 'Thomas Vu Hong', 'ais', 'incoming', 'Audit Intern', null, 'https://www.linkedin.com/in/duc-anh-thomas-v-132120257/', 'Incoming audit intern at Deloitte and EY. Ask about Big 4 recruiting, audit vs. advisory, and professional communication.', array['Big 4 recruiting', 'Audit', 'Professional emails']::text[], array['Food']::text[], null, true, 9),
  ('dani-pham', 'Khue (Dani) Pham', 'ais', 'current', 'Tax Intern', null, 'https://www.linkedin.com/in/danikhuepham/', 'Tax intern at Shake Shack. Ask about corporate (in-house) tax, accounting careers outside the Big 4, and balancing recruiting with classes.', array['Corporate tax', 'In-house accounting', 'Time management']::text[], '{}'::text[], null, false, 10),
  ('nick-trinh', 'Nick Trinh', 'cs', 'current', 'Software Engineer Intern', null, 'https://www.linkedin.com/in/nicktrinh/', 'Software engineering intern at Google. Ask about picking projects worth building, technical interviews, and big tech applications.', array['Technical interviews', 'Projects & GitHub', 'Big tech applications']::text[], array['Basketball']::text[], null, true, 11),
  ('minh-vu', 'Minh Vu', 'cs', 'current', 'Software Engineer', null, 'https://www.linkedin.com/in/minhvu01/', 'Software engineer at Profound. Ask about full-time SWE recruiting, working at a startup, and growing as an engineer.', array['SWE recruiting', 'Startups', 'System design']::text[], '{}'::text[], null, false, 12)
on conflict (id) do update set
  name = excluded.name,
  major_id = excluded.major_id,
  status = excluded.status,
  role = excluded.role,
  company_label = excluded.company_label,
  linkedin_url = excluded.linkedin_url,
  bio = excluded.bio,
  helps_with = excluded.helps_with,
  interests = excluded.interests,
  photo_url = excluded.photo_url,
  featured = excluded.featured,
  sort_order = excluded.sort_order;

delete from public.mentor_companies where mentor_id in ('tam-nguyen', 'tri-pham', 'jonathan-tran', 'thao-nguyen', 'quang-nguyen', 'phuong-bui', 'quan-bui', 'amy-pham', 'anh-bui', 'thomas-vu-hong', 'dani-pham', 'nick-trinh', 'minh-vu');
insert into public.mentor_companies (mentor_id, company_id, sort_order) values
  ('tam-nguyen', 'jpmorgan', 0),
  ('tri-pham', 'socgen', 0),
  ('jonathan-tran', 'barclays', 0),
  ('thao-nguyen', 'ogilvy', 0),
  ('quang-nguyen', 'wwt', 0),
  ('phuong-bui', 'cocacola', 0),
  ('quan-bui', 'brookfield', 0),
  ('amy-pham', 'iheartmedia', 0),
  ('thomas-vu-hong', 'deloitte', 0),
  ('thomas-vu-hong', 'ey', 1),
  ('dani-pham', 'shakeshack', 0),
  ('nick-trinh', 'google', 0),
  ('minh-vu', 'profound', 0);

insert into public.resources (id, title, major_id, type, level, source, url, guide_id, description, sort_order) values
  ('r-coffee-playbook', 'Coffee Chat Playbook', null, 'Guide', 'Beginner', 'FVCN', null, 'coffee-chat', 'How to prepare for a coffee chat, what to ask, and how to follow up. Includes a thank-you note template.', 0),
  ('r-resume-checklist', 'Resume Review Checklist', null, 'Guide', 'Beginner', 'FVCN', null, 'resume', 'A step-by-step checklist to make your resume clean, specific, and ready for recruiters.', 1),
  ('r-handshake', 'Handshake', null, 'Job search', 'Beginner', 'Handshake', 'https://joinhandshake.com', null, 'Internship and full-time job postings for college students, plus employer events.', 2),
  ('r-glassdoor', 'Glassdoor interview questions', null, 'Job search', 'Intermediate', 'Glassdoor', 'https://www.glassdoor.com', null, 'Real interview questions and experiences shared by candidates, by company and role.', 3),
  ('r-finance-pack', 'Finance Recruiting Starter Pack', 'finance', 'Guide', 'Beginner', 'FVCN', null, null, 'Networking, recruiting timelines, and the technical questions to learn first. Written by FVCN mentors.', 4),
  ('r-investopedia', 'Investopedia', 'finance', 'Reference', 'Beginner', 'Investopedia', 'https://www.investopedia.com', null, 'Plain-English definitions for finance terms you''ll hear in class and interviews.', 5),
  ('r-cfi', 'Corporate Finance Institute', 'finance', 'Course', 'Intermediate', 'CFI', 'https://corporatefinanceinstitute.com', null, 'Courses and articles on Excel, accounting, and valuation fundamentals.', 6),
  ('r-marketing-portfolio', 'Marketing Portfolio Guide', 'marketing', 'Guide', 'Beginner', 'FVCN', null, null, 'How to present campaigns, social media work, and analytics projects so recruiters notice.', 7),
  ('r-hubspot', 'HubSpot Academy', 'marketing', 'Course', 'Beginner', 'HubSpot', 'https://academy.hubspot.com', null, 'Free certifications in content, social media, and inbound marketing.', 8),
  ('r-skillshop', 'Google Skillshop', 'marketing', 'Course', 'Intermediate', 'Google', 'https://skillshop.withgoogle.com', null, 'Free Google Ads and Google Analytics training and certifications.', 9),
  ('r-sqlbolt', 'SQLBolt', 'info-systems', 'Practice', 'Beginner', 'SQLBolt', 'https://sqlbolt.com', null, 'Short interactive SQL lessons you can finish in an afternoon.', 10),
  ('r-mslearn', 'Microsoft Learn', 'info-systems', 'Course', 'Beginner', 'Microsoft', 'https://learn.microsoft.com/training/', null, 'Free learning paths for Power BI, Excel, and cloud fundamentals.', 11),
  ('r-tech-consulting', 'Tech Consulting Case Notes', 'info-systems', 'Guide', 'Intermediate', 'FVCN', null, null, 'How technology consulting interviews work, with example cases and frameworks.', 12),
  ('r-accounting-coach', 'AccountingCoach', 'ais', 'Reference', 'Beginner', 'AccountingCoach', 'https://www.accountingcoach.com', null, 'Clear explanations of accounting fundamentals with practice quizzes.', 13),
  ('r-aicpa', 'AICPA & CIMA', 'ais', 'Reference', 'Intermediate', 'AICPA & CIMA', 'https://www.aicpa-cima.com', null, 'CPA exam information, career resources, and student membership.', 14),
  ('r-risk-notes', 'Accounting & Risk Interview Notes', 'ais', 'Guide', 'Intermediate', 'FVCN', null, null, 'Common interview questions for audit, risk advisory, and accounting roles.', 15),
  ('r-neetcode', 'NeetCode', 'cs', 'Practice', 'Intermediate', 'NeetCode', 'https://neetcode.io', null, 'A structured list of coding interview problems with video explanations.', 16),
  ('r-roadmap-sh', 'roadmap.sh', 'cs', 'Reference', 'Beginner', 'roadmap.sh', 'https://roadmap.sh', null, 'Step-by-step learning roadmaps for frontend, backend, data, and more.', 17),
  ('r-portfolio', 'Build Your First Portfolio', 'cs', 'Guide', 'Beginner', 'FVCN', null, null, 'Pick, build, and present projects that make your resume stand out.', 18)
on conflict (id) do update set
  title = excluded.title,
  major_id = excluded.major_id,
  type = excluded.type,
  level = excluded.level,
  source = excluded.source,
  url = excluded.url,
  guide_id = excluded.guide_id,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.events (id, title, category, starts_at, ends_at, location, description) values
  ('e-resume-night', 'Resume Review Night', 'Career', timestamptz '2026-10-08 18:00:00 America/New_York', timestamptz '2026-10-08 19:30:00 America/New_York', 'Lincoln Center campus · room shared after RSVP', 'Bring a printed or digital resume and get one-on-one feedback from upperclassmen and alumni.'),
  ('e-soccer', 'Soccer Friday', 'Community', timestamptz '2026-10-16 18:00:00 America/New_York', timestamptz '2026-10-16 21:00:00 America/New_York', 'Rose Hill campus · field shared after RSVP', 'A casual game for all skill levels to kick off the weekend. Open to Vietnamese students and friends.'),
  ('e-alumni-panel', 'Vietnamese Alumni Career Panel', 'Alumni', timestamptz '2026-10-29 18:30:00 America/New_York', timestamptz '2026-10-29 20:00:00 America/New_York', 'Lincoln Center campus · room shared after RSVP', 'Alumni in finance, tech, consulting, and accounting share how they got started. Q&A to follow.'),
  ('e-mock-interviews', 'Mock Interview Workshop', 'Career', timestamptz '2026-11-12 18:00:00 America/New_York', timestamptz '2026-11-12 19:30:00 America/New_York', 'Virtual · link shared after RSVP', 'Practice behavioral and technical questions in small groups, with feedback from mentors.'),
  ('e-pho-night', 'Phở Night', 'Community', timestamptz '2026-11-20 19:00:00 America/New_York', timestamptz '2026-11-20 21:00:00 America/New_York', 'Restaurant shared after RSVP', 'End the semester with a bowl of phở and good company. Everyone is welcome.')
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  location = excluded.location,
  description = excluded.description;

commit;
