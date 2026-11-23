"""Build every portfolio page from one shared shell. Run: python3 scripts/build-site.py"""
from pathlib import Path
R = Path(__file__).resolve().parents[1]
rd = lambda p: (R / p).read_text(encoding='utf8')
BASE = 'https://mshlikhon.github.io/'
NAV = [('about', 'About'), ('projects', 'Projects'), ('skills', 'Skills'), ('games', 'Games'), ('contact', 'Contact')]
FOOT = NAV[:2] + [('github', 'GitHub')] + NAV[2:4] + [('education', 'Education'), ('leadership', 'Leadership'), ('resume', 'Résumé'), ('contact', 'Contact')]
LD = '{"@context":"https://schema.org","@type":"Person","name":"Md. Shyed Hasan Likhon","url":"%s","jobTitle":"Software Developer","alumniOf":"United International University","address":{"@type":"PostalAddress","addressLocality":"Dhaka","addressCountry":"BD"},"sameAs":["https://github.com/MSHLIKHON","https://www.linkedin.com/in/mshlikhon/","https://x.com/shyed_likhon"]}' % BASE
FONTS = 'https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=Manrope:wght@300..800&family=Hind+Siliguri:wght@500&display=swap'
EXT = ' target="_blank" rel="noopener"'


FUN = {
 'index': 'Serious portfolio, unserious corner \u2014 the arcade is open.',
 'about': 'Enough about me \u2014 your turn to play.',
 'projects': 'You have seen the work. Now beat a high score.',
 'skills': 'Reflexes are a skill too. Prove it in the arcade.',
 'games': 'You are in the fun zone. New high score loading\u2026',
 'github': 'Code checked. Now check your Tetris stack.',
 'education': 'Study break, officially approved.',
 'leadership': 'Leading by example: breaks included.',
 'resume': 'Hiring? First, a quick game \u2014 for research.',
 'contact': 'One quick game before you hit send?',
 'thanks': 'Message sent. Reward yourself with a game.',
 '404': 'This page rage-quit. The games did not.',
}
FUNBAR = '<div class="funbar"><div class="w fb-in"><span class="fb-tag">Fun break</span><p>%s</p><a href="games.html">Take a break \u2192</a><button class="fb-x" type="button" aria-label="Dismiss announcement">\u00d7</button></div></div>'
FUNSEG = ('<div class="w funseg"><div class="funseg-copy"><span class="fb-tag">Take a break</span>'
 '<h2>All work? Take a play break.</h2><p>Five tiny browser games, built with the same care as the serious stuff. No sign-up, no downloads \u2014 just play.</p></div>'
 '<div class="chips"><a href="games.html">ChargeBD Rush</a><a href="games.html">Tetris</a><a href="games.html">Snake</a><a href="games.html">Tic-Tac-Toe</a><a href="games.html">Memory</a><a class="chip-go" href="games.html">Open the arcade \u2192</a></div></div>')
WMARK = '<div class="wmark" aria-hidden="true">LIKHON_</div>'

def shell(key, title, desc, main, js=(), css=(), noindex=False):
    home = key == 'index'
    url = BASE + ('' if home else key + '.html')
    links = ''.join('<a href="%s.html"%s>%s</a>' % (k, ' aria-current="page"' if k == key else '', n) for k, n in NAV)
    foot = ''.join('<a href="%s.html">%s</a>' % (k, n) for k, n in FOOT)
    head = ('<!doctype html>\n<html lang="en" data-theme="dark">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<title>%s</title>\n<meta name="description" content="%s">\n<link rel="canonical" href="%s">\n%s'
        '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta property="og:type" content="website">\n<meta property="og:url" content="%s">\n'
        '<meta property="og:image" content="%sassets/og-card.jpg">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="theme-color" content="#06100d">\n'
        '<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">\n%s'
        '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="%s">\n'
        '<link rel="stylesheet" href="assets/site.css">\n%s'
        '<script>try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}</script>\n%s</head>\n') % (
        title, desc, url, '<meta name="robots" content="noindex">\n' if noindex else '', title, desc, url, BASE,
        '<link rel="preload" href="assets/portrait.webp" as="image" type="image/webp">\n' if home else '', FONTS,
        ''.join('<link rel="stylesheet" href="assets/%s">\n' % c for c in css),
        '<script type="application/ld+json">%s</script>\n' % LD if home else '')
    field = '' if home else '<canvas id="field" aria-hidden="true"></canvas>'
    body = ('<body>\n%s<div id="bar"></div>' + field + '<div id="pv" aria-hidden="true"><img alt=""></div>\n'
        '<header><nav class="w" aria-label="Primary"><a class="brand" href="index.html">LIKHON<i>_</i></a><div class="ls">%s</div>'
        '<button id="theme" type="button" aria-label="Switch light or dark theme">◐</button><button id="mt" class="mt" type="button" aria-label="Menu" aria-expanded="false">Menu</button></nav></header>\n'
        + (FUNBAR % FUN.get(key, 'Take a break.')) + '\n'
        '%s\n<footer>' + FUNSEG + '<div class="w fr"><span>© 2026 Md. Shyed Hasan Likhon</span><div>%s</div></div>' + WMARK + '</footer>\n'
        '<script defer src="assets/site.js"></script>\n%s</body>\n</html>\n') % (
        '<div class="intro" aria-hidden="true"><span lang="bn">স্বাগতম</span></div>\n' if home else '', links, main, foot,
        ''.join('<script defer src="assets/%s"></script>\n' % j for j in js))
    (R / (key + '.html')).write_text(head + body, encoding='utf8')

def ph(h, lead):
    return '<section class="ph"><div class="w"><h1>%s<i>.</i></h1><p class="lead">%s</p></div></section>' % (h, lead)
def sec(inner, extra=''):
    return '<section class="sec"%s><div class="w">%s</div></section>' % (extra, inner)
def tags(t): return '<div class="tg">%s</div>' % ''.join('<span>%s</span>' % x for x in t)
def lns(l): return '<div class="ln">%s</div>' % ''.join('<a href="%s"%s>%s</a>' % (u, EXT if u.startswith('http') else '', n) for n, u in l)
def card(h, p, extra='', k=''): return '<article class="cd">%s<h3>%s</h3><p>%s</p>%s</article>' % (('<span class="k">%s</span>' % k) if k else '', h, p, extra)
def tl(items): return '<ol class="tl">%s</ol>' % ''.join('<li><time>%s</time><h3>%s</h3><p>%s</p></li>' % i for i in items)

# ---------------- home
shell('index', 'Md. Shyed Hasan Likhon | Software Developer Portfolio',
      'Portfolio of Md. Shyed Hasan Likhon, a CSE undergraduate at UIU building web apps, databases and service workflows in Dhaka, Bangladesh.',
      rd('templates/home-main.html'), js=['orbit.js', 'hero-particles.js'])

# ---------------- about
cur = [('Software Engineering and Information Systems', 'Majoring in Software Engineering, with interests in system analysis, networking, databases and reliable IT services.'),
       ('Data and databases', 'Modelling data, defining relationships and building structured solutions.'),
       ('Development sector', 'Combining technical learning, programme coordination and community service.')]
about = ph('About me', 'I combine technical learning with teamwork, communication, leadership and social responsibility.') + sec(
    '<div class="g2"><div><h2>Career objective</h2><p>Motivated and responsible Computer Science and Engineering student who has completed 105 of the 138 credits required for UIU’s BSCSE degree. My studies have built a foundation in programming, database management, software analysis, computer networking, mathematics and engineering.</p>'
    '<p>I have experience in teamwork, leadership, event management, volunteering and public communication.</p></div>'
    '<video class="vd" controls playsinline preload="metadata" poster="assets/about-video-poster.webp" aria-label="About Likhon video"><source src="assets/about-video-mobile.mp4" media="(max-width:760px)" type="video/mp4"><source src="assets/about-video.mp4" type="video/mp4"></video></div>') + sec(
    '<h2>Current focus</h2><div class="g3">%s</div>' % ''.join(card(h, p) for h, p in cur)) + sec(
    '<div class="feat"><div><h2>Software for a more connected Bangladesh.</h2><p class="lead" style="margin:0">My final-year concept, ChargeBD, plans EV charging with live station availability and time-slot booking.</p></div><div class="btns"><a class="btn p" href="projects.html#chargebd">Try the station finder</a><a class="btn" href="games.html">Play ChargeBD Rush</a></div></div>')
shell('about', 'About | Md. Shyed Hasan Likhon', 'About Md. Shyed Hasan Likhon: CSE undergraduate at United International University, Dhaka, focused on software engineering, databases and service workflows.', '<main id="top">' + about + '</main>')

# ---------------- projects
P = [
 ('live', 'work-prostuti.webp', 'Prostuti: Admission OMR', 'A Bangla OMR practice app for admission candidates, with timed 100-question sessions and saved attempt history.', ['Cloudflare Workers', 'Timed practice'], [('Open app', 'https://admission-omr.myselfmshl.workers.dev/')]),
 ('live', 'work-admission-tracker.webp', 'Focus on Target', 'A university admission tracker with application dates, eligibility checks and exam clash alerts.', ['Education', 'Vercel'], [('Open app', 'https://focusontarget-hsc.vercel.app/')]),
 ('live', 'work-compass.webp', 'UIU Compass', 'Plan courses, estimate CGPA, compare retakes and track graduation requirements.', ['Academic planning', 'Vercel'], [('Open planner', 'https://uiucompass.vercel.app/'), ('Source', 'https://github.com/MSHLIKHON/uiu-compass')]),
 ('live', 'work-reunion.webp', 'NGDC Reunion 2026', 'The event website for the 2026 New Government Degree College reunion.', ['Event website', 'Netlify'], [('Open website', 'https://ngdc-reunion-2026.netlify.app/')]),
 ('proto', 'work-bloodbridge-donors.webp', 'BloodBridge BD', 'Donor search by blood group and area, with a directory of demo profiles. Still in progress.', ['PHP', 'MySQL', 'Access control', 'Reporting'], [('GitHub', 'https://github.com/MSHLIKHON/BloodBridge-BD'), ('Demo video', 'assets/bloodbridge.webm')]),
 ('proto', 'copilot.webp', 'Career Copilot Lab', 'A team learning prototype with progress tracking and originality checks. I integrated the guard that detects copied reference solutions before tests run.', ['Python', 'Streamlit', 'SQLite'], [('GitHub', 'https://github.com/MSHLIKHON/career_copilot_lab'), ('Demo video', 'assets/copilot.webm')]),
 ('academic', '', 'Mayor’s Rise', 'A Java city-builder prototype built around reusable game objects. I helped plan the program architecture and data handling.', ['Java', 'OOP', 'Team project'], [('GitHub', 'https://github.com/ashad-abir/Mayor-s-Rise/')]),
 ('academic', '', 'Game of Life', 'A Java implementation of Conway’s cellular automaton, where each cell’s neighbours decide whether it survives.', ['Java', 'Simulation'], [('GitHub', 'https://github.com/MSHLIKHON/Game-of-life')]),
]
kinds = {'live': 'Live web app', 'proto': 'Prototype', 'academic': 'Academic'}
pc = ''.join('<article class="cd" data-k="%s">%s<span class="k">%s</span><h3>%s</h3><p>%s</p>%s%s</article>' % (
    k, ('<img src="assets/%s" alt="" loading="lazy">' % im) if im else '', kinds[k], t, d, tags(tg), lns(l)) for k, im, t, d, tg, l in P)
fl = '<div class="fl" role="group" aria-label="Filter projects">%s</div>' % ''.join(
    '<button type="button" data-filter="%s" aria-pressed="%s">%s</button>' % (k, 'true' if k == 'all' else 'false', n) for k, n in [('all', 'All'), ('live', 'Live'), ('proto', 'Prototypes'), ('academic', 'Academic')])
sim = ('<div class="feat" id="chargebd"><div><h2>ChargeBD</h2><p class="lead" style="margin:0 0 14px">Smart EV charging network and management system for Bangladesh. A final-year concept in progress: station availability, time-slot booking and an operator workflow.</p>'
       + tags(['Mobile app', 'Web dashboard', 'Maps', 'Database', 'EV research']) + '</div><div><h3 style="margin:0 0 14px;font:700 1.2rem var(--d)">Try the station finder</h3>'
       '<div class="sim"><label>Station<select class="sel" id="cs"><option>Dhaka North</option><option>Dhaka South</option></select></label><label>Time<select class="sel" id="ct"><option>09:00</option><option>14:00</option><option>17:30</option></select></label>'
       '<button class="btn p" id="ch" type="button">Hold sample slot</button></div><p id="co" role="status" style="color:var(--ac);margin:14px 0 4px"></p><p class="k">Fictional station data. No real booking is made.</p></div></div>')
simjs = ("<script>(()=>{const a={'Dhaka North':{'09:00':0,'14:00':2,'17:30':1},'Dhaka South':{'09:00':3,'14:00':0,'17:30':2}},s=document.getElementById('cs'),t=document.getElementById('ct'),o=document.getElementById('co');"
         "const f=()=>{const n=a[s.value][t.value];o.textContent=n?n+' bays free at '+s.value+' at '+t.value+'.':s.value+' is fully booked at '+t.value+'. Try another time.'};"
         "s.onchange=t.onchange=f;f();document.getElementById('ch').onclick=()=>{const n=a[s.value][t.value];if(!n){f();return}a[s.value][t.value]--;o.textContent='Slot held at '+s.value+' for '+t.value+'. Sample only, nothing was booked.'}})();</script>")
shell('projects', 'Projects | Md. Shyed Hasan Likhon', 'Selected projects by Md. Shyed Hasan Likhon: Prostuti, Focus on Target, UIU Compass, BloodBridge BD, Career Copilot Lab and the ChargeBD concept.',
      '<main id="top">' + ph('Selected work', 'Live web apps, software prototypes and academic projects.') + sec(fl + '<div class="g2">%s</div>' % pc) + sec(sim) + simjs + '</main>')

# ---------------- skills
S = [('C', 'C', 'Comfortable', 'Programming fundamentals, problem solving and academic exercises.'), ('PY', 'Python', 'Learning', 'Career Copilot workflow, scripting and application logic.'),
     ('PHP', 'PHP', 'Learning', 'Server-rendered interfaces and BloodBridge workflow screens.'), ('JV', 'Java', 'Learning', 'Object-oriented design through Mayor’s Rise and coursework.'),
     ('UI', 'HTML and CSS', 'Comfortable', 'Responsive layouts, accessible structure and visual systems.'), ('JS', 'JavaScript', 'Learning', 'Portfolio interactions, Canvas games and UI behaviour.'),
     ('SQL', 'MySQL and SQL', 'Learning', 'Relational queries, schemas and service-workflow data.'), ('ER', 'Data modelling', 'Foundation', 'ER diagrams, relationships, normalization and schema design.'),
     ('GIT', 'Git and GitHub', 'Comfortable', 'Version control, repositories, commits and project publishing.'), ('UX', 'Figma and UI tools', 'Learning', 'Wireframes, visual planning and prototyping.'),
     ('NET', 'Networking', 'Foundation', 'Packet Tracer, IP addressing, routers and switches.'), ('APP', 'Streamlit', 'Learning', 'Rapid Python interfaces for the Career Copilot prototype.')]
sk = '<div class="g3">%s</div>' % ''.join(card(n, d, k=lv) for a, n, lv, d in S)
orb = ('<div class="tk"><div class="orb"><canvas id="orbit" role="img" aria-label="Rotating sphere of my skills"></canvas><span class="hint">Drag to rotate</span></div><div><div id="chips" role="group" aria-label="Filter skills by group"></div>'
       '<p style="color:var(--mu)">Tap a group to light up its tools. Levels below are honest states, not percentages.</p></div></div>')
shell('skills', 'Skills | Md. Shyed Hasan Likhon', 'Tools used by Md. Shyed Hasan Likhon: C, C++, Java, Python, PHP, JavaScript, SQL and Git, with honest proficiency levels.',
      '<main id="top">' + ph('Technical toolkit', 'Tools I use while learning and building, grouped by where they fit in my workflow.') + sec(orb) + sec('<h2>Depth by skill</h2>' + sk) + '</main>', js=['orbit.js'])

# ---------------- education
ring = ('<div class="edu"><div class="ring"><svg viewBox="0 0 112 112" aria-hidden="true"><circle class="bg" cx="56" cy="56" r="50"/><circle class="fg" cx="56" cy="56" r="50"/></svg><div><strong>76%</strong><small>105 of 138 credits<br>33 credits remaining</small></div></div>'
        '<h3>BSc in Computer Science and Engineering</h3><p>United International University, Dhaka. Expected Summer 2027.</p></div>')
edu = ph('Academic journey', 'Progressing through UIU’s 138-credit BSCSE programme with a focus on problem solving, teamwork, communication and responsible engineering.') + sec(
    '<div class="jg">%s%s</div>' % (ring, tl([('2020', 'Higher Secondary Certificate, Science', 'New Govt. Degree College, Rajshahi. GPA 5.00 out of 5.00.'), ('2018', 'Secondary School Certificate, Science', 'Naogaon Krishnadhan Govt High School, Naogaon. GPA 5.00 out of 5.00.')])))
shell('education', 'Education | Md. Shyed Hasan Likhon', 'Education of Md. Shyed Hasan Likhon: BSc in Computer Science and Engineering at United International University, expected Summer 2027.', '<main id="top">' + edu + '</main>')

# ---------------- leadership
lead = ph('Beyond the classroom', 'Leadership, volunteering, event support and community service are important parts of my development.') + sec(
    '<div class="jg">' + tl([('2024 to 2026', 'Deputy Logistics', 'UIU Social Services Club. Event logistics, volunteer coordination, material management and social-service programmes.'),
        ('2023 to now', 'General Member', 'UIU App Forum. Technology activities, workshops, seminars and collaborative learning.'),
        ('2020 to now', 'Founder and Volunteer', 'Personal social welfare initiative. Relief during COVID-19 and floods, and support for underprivileged children.'),
        ('Aug 2017 to Feb 2018', 'General Secretary', 'National Children’s Task Force, school branch. Advocated for children’s rights and ran welfare initiatives.'),
        ('School', 'Student Representative', 'Naogaon Krishnadhan Govt High School Cabinet. Represented students and joined school programmes.')]) +
    '<div style="display:grid;gap:18px;align-content:start">' + card('Courses and workshops', 'Grameenphone Academy coursework includes AI-powered communication, UX design decisions with AI, networking and personal branding.', lns([('Certifications on LinkedIn', 'https://www.linkedin.com/in/mshlikhon/')])) +
    '<div class="g2">' + card('Bangla', 'Native', k='Language') + card('English', 'Professional working proficiency', k='Language') + '</div>' + card('Social responsibility', 'Community-focused leadership guides how I work.', k='Core value') + '</div></div>')
shell('leadership', 'Leadership | Md. Shyed Hasan Likhon', 'Leadership, volunteering and community work of Md. Shyed Hasan Likhon, including UIU Social Services Club and UIU App Forum.', '<main id="top">' + lead + '</main>')

# ---------------- github
G = [('Admission Portal', 'University application dates, exam clash alerts and eligibility tools.', 'addmission-protal-2026'), ('UIU Compass', 'Course planning and degree progress for UIU students.', 'uiu-compass'),
     ('Career Copilot Lab', 'A practice workspace with progress tracking and originality checks.', 'career_copilot_lab'), ('This portfolio', 'The static site, its interactions and its browser games.', 'mshlikhon.github.io'),
     ('Game of Life', 'A Java implementation of Conway’s cellular automaton.', 'Game-of-life'), ('Medical portfolio', 'A professional portfolio website for a physician.', 'dr-pritom-medical-portfolio')]
gh = ph('From my repositories', '@MSHLIKHON on GitHub: source code and project history.') + sec(
    '<div class="feat"><div><h2>Md. Shyed Hasan Likhon</h2><p class="lead" id="gs" style="margin:0 0 18px">Source code and project history.</p><a class="btn p" href="https://github.com/MSHLIKHON"%s>View GitHub profile</a></div>'
    '<div><h3 style="margin:0 0 12px;font:700 1.1rem var(--d)">Recently updated</h3><div id="ga" style="display:grid;gap:12px"></div></div></div>' % EXT) + sec(
    '<h2>Selected repositories</h2><div class="g3">%s</div>' % ''.join('<a class="cd" href="https://github.com/MSHLIKHON/%s"%s><h3>%s</h3><p>%s</p><span class="k">View source</span></a>' % (r, EXT, t, d) for t, d, r in G))
ghjs = ("<script>(()=>{const U='https://api.github.com/users/MSHLIKHON';fetch(U).then(r=>r.json()).then(u=>{if(u.public_repos!=null)document.getElementById('gs').textContent=u.public_repos+' public repositories and '+u.followers+' followers.'}).catch(()=>{});"
        "fetch(U+'/repos?sort=pushed&per_page=4').then(r=>r.json()).then(a=>{const l=document.getElementById('ga');if(!Array.isArray(a))return;a.forEach(r=>{const e=document.createElement('a');e.className='cd';e.href=r.html_url;e.target='_blank';e.rel='noopener';"
        "const h=document.createElement('h3'),p=document.createElement('p'),k=document.createElement('span');h.textContent=r.name;p.textContent=r.description||'No description yet.';k.className='k';k.textContent=(r.language||'Mixed')+', updated '+new Date(r.pushed_at).toLocaleDateString('en-GB',{month:'short',year:'numeric'});e.append(h,p,k);l.append(e)})}).catch(()=>{})})();</script>")
shell('github', 'GitHub | Md. Shyed Hasan Likhon', 'GitHub profile and repositories of Md. Shyed Hasan Likhon (MSHLIKHON): code, projects and recent activity.', '<main id="top">' + gh + ghjs + '</main>')

# ---------------- games (original arcade markup and scripts, new shell)
shell('games', 'Games | Md. Shyed Hasan Likhon', 'A small browser arcade built by Md. Shyed Hasan Likhon with Canvas and JavaScript: ChargeBD Rush, Snake, Tic-Tac-Toe, Tetris and Memory.',
      '<main id="top">' + ph('Take a play break', 'A little strategy, a little nostalgia, one more round.') + '<section class="sec" id="games"><div class="w">' + rd('templates/games-shell.html') + '</div></section></main>',
      css=['games.css'], js=['games.js', 'tetris.js'])

# ---------------- contact
form = ('<form class="fm" id="contact-form" action="https://formsubmit.co/myselfmshl@gmail.com" method="POST"><input type="hidden" name="_subject" value="New portfolio message"><input type="hidden" name="_template" value="table"><input type="hidden" name="_next" value="%sthanks.html">'
        '<label>Name<input name="name" required autocomplete="name"></label><label>Email<input name="email" type="email" required autocomplete="email"></label><label>Subject<input name="subject" required></label>'
        '<label>Message<textarea name="message" required></textarea></label><button class="btn p" type="submit">Send message</button><p class="k" style="margin:0">FormSubmit emails your name, email and message to me. A spam check may be required.</p></form>') % BASE
con = ph('Let’s build something useful', 'I’m seeking a junior software engineering role working on databases and service workflows. I bring a Software Engineering focus alongside teamwork, coordination and community service.') + sec(
    '<div class="g2"><div style="display:grid;gap:18px;align-content:start">' + card('Based in Dhaka, Bangladesh', 'Open to junior software engineer roles, internships and collaboration.', k='Location') +
    card('Reach me directly', 'Quickest on WhatsApp. LinkedIn works for work enquiries.', lns([('Message on WhatsApp', 'https://wa.me/8801797375496'), ('LinkedIn', 'https://www.linkedin.com/in/mshlikhon/'), ('GitHub', 'https://github.com/MSHLIKHON'), ('X', 'https://x.com/shyed_likhon')])) + '</div>' + form + '</div>')
shell('contact', 'Contact | Md. Shyed Hasan Likhon', 'Contact Md. Shyed Hasan Likhon about junior software engineer opportunities, internships and collaboration.', '<main id="top">' + con + '</main>')

# ---------------- thanks and 404
shell('thanks', 'Message sent | Md. Shyed Hasan Likhon', 'Your message was submitted.', '<main id="top">' + ph('Message sent', 'Thank you for getting in touch. If your message is urgent, reach me on WhatsApp.') + sec('<div class="btns"><a class="btn p" href="index.html">Back to portfolio</a><a class="btn" href="https://wa.me/8801797375496"%s>WhatsApp ↗</a></div>' % EXT) + '</main>', noindex=True)
shell('404', 'Page not found | Md. Shyed Hasan Likhon', 'This page does not exist.', '<main id="top">' + ph('Page not found', 'The page you opened does not exist or has moved.') + sec('<div class="btns"><a class="btn p" href="index.html">Go to home</a><a class="btn" href="projects.html">See my projects</a></div>') + '</main>', noindex=True)
print('built', len(list(R.glob('*.html'))), 'pages')
