# Md. Shyed Hasan Likhon — Portfolio

A dependency-free, responsive personal portfolio website built with HTML, CSS, and JavaScript. It includes:

- Dark and light themes
- Responsive mobile navigation
- Terminal-style hero section
- Skills, projects, education, leadership, and contact sections
- Project filtering
- Scroll animations with reduced-motion support
- Static contact form that opens the visitor's email app
- Printable resume page (`resume.html`)
- SEO and social sharing metadata

## Preview locally

Open `index.html` directly, or run a local server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Publish with GitHub Pages

1. Create a new GitHub repository, for example `portfolio`.
2. Upload every file and folder from this project.
3. Open **Repository Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder.
6. Save. GitHub will provide your public URL.

For a profile URL such as `https://MSHLIKHON.github.io`, create the repository with the exact name `MSHLIKHON.github.io`.

## Publish with Vercel

1. Push this project to GitHub.
2. Sign in to Vercel with GitHub.
3. Import the repository.
4. Set the framework preset to **Other** if Vercel does not detect it automatically.
5. Leave build command empty and deploy.

## Customize

- Replace the initials avatar with a photo by editing the `.avatar-orbit` block in `index.html`.
- Update projects inside the `#projects` section.
- Replace social links and contact information directly in `index.html` and `resume.html`.
- Change design colors in the CSS variables at the beginning of `assets/styles.css`.

## Add or replace the CV PDF

The **Download CV** button points to this file:

```text
mshlikhon-portfolio/
└── assets/
    └── Md-Shyed-Hasan-Likhon-CV.pdf
```

To update the CV later, replace that PDF with a new file using the exact same filename. No HTML editing is required.

## Resume PDF

Open `resume.html`, choose **Print / Save as PDF**, and select **Save as PDF** in your browser.
