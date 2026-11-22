<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0a84ff,50:5e5ce6,100:bf5af2&height=220&section=header&text=Macro%20Lens&fontSize=64&fontColor=ffffff&fontAlignY=38&desc=Food%20Calorie%20%26%20Macro%20Estimator&descSize=20&descAlignY=60&animation=fadeIn" alt="Macro Lens banner" />

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&duration=3200&pause=1100&color=0A84FF&center=true&vCenter=true&width=760&lines=Snap+a+meal+or+a+nutrition+label;Vision+and+OCR+do+the+reading;Net+carbs+and+energy+density+calculated+exactly;Calories%2C+macros%2C+and+a+full+carbohydrate+breakdown" alt="Typing animation describing the project" />
</a>

<br />

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-v2-E92063?style=for-the-badge&logo=pydantic&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
  - [What it does](#what-it-does)
  - [How data flows through it](#how-data-flows-through-it)
  - [Key design choices](#key-design-choices)
  - [Tech stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup and Run](#setup-and-run)
- [Configuration Reference](#configuration-reference)
- [Accuracy and Limitations](#accuracy-and-limitations)
- [Contributor](#contributor)

---

## Project Overview

### What it does

Macro Lens turns a photo of a meal, or of a nutrition label, into a full nutritional breakdown. For each image it reports:

- Total calories (kcal) and energy density (kcal per gram)
- Protein, total fats, and total carbohydrates
- Dietary fiber, split into soluble and insoluble
- Total sugars and added sugars
- Sugar alcohols (polyols) and starch
- Net carbs, calculated as Total Carbs minus Fiber minus Sugar Alcohols
- The identified food names and a confidence score

The web app has three pages:

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Home and Food Scanner | Live camera scan or drag-and-drop upload, followed by the results dashboard |
| `/about` | The Problem and Mission | Scroll-animated explanation of why manual calorie tracking fails and how Vision plus OCR addresses it |
| `/contributors` | Contributors | Profile cards for the people behind the project |

The interface follows an Apple-inspired design language with glassmorphism: frosted translucent cards, hairline borders, spring-physics button presses, animated nutrition rings, and a persistent light and dark theme toggle in the floating navigation bar.

### How data flows through it

An image can enter the app in two ways. The live camera path opens a stream with `navigator.mediaDevices.getUserMedia` (front or rear camera), then draws the current frame to a canvas and exports it as a JPEG. The upload path accepts JPG, PNG, and WEBP files through a drag-and-drop dropzone. Both paths produce a `File`, so everything after that point is identical.

```
Browser (React + Vite)
  Camera (getUserMedia) --+
                          +--> File/Blob (JPEG/PNG/WEBP) --> lib/api.js
  Drag and drop upload ---+                                      |
                                                                 | multipart/form-data, field "image"
                                                                 v
Backend (FastAPI)                                         POST /api/analyze
  routers/analyze.py     validate file type and size
        |
        +-- no API key --> services/mock.py     (deterministic demo results)
        |
        +-- API key set -> services/vision.py   (Gemini vision + OCR, forced JSON schema)
                                  |
                                  v
                       schemas.RawEstimate      (validated model output)
                                  |
                                  v
                       services/nutrition.py    (net carbs, energy density, clamping, rounding)
                                  |
                                  v
                       schemas.NutritionResult  --> JSON response to the browser
```

In development, Vite proxies `/api/*` to `http://127.0.0.1:8000`, so the browser only ever talks to one origin and no CORS setup is needed. The frontend also calls `GET /api/health` on load and shows a status pill that reads Live AI, Demo mode, or Backend offline.

Errors come back as `{ "detail": "..." }` with a meaningful status code, and the UI displays that message:

| Status | Meaning |
| --- | --- |
| 413 | Image larger than `MAX_UPLOAD_MB` |
| 415 | Not a JPG, PNG, or WEBP file |
| 422 | No food or nutrition label detected |
| 502 | The vision service failed or returned unusable data |

### Key design choices

**The model extracts, the code calculates.** The vision model only reports what it can see: the foods, estimated portion weights, and printed label values. Anything that can be computed is computed in `backend/app/services/nutrition.py`, so the formulas are always exact:

```
Net Carbs      = Total Carbs - Dietary Fiber - Sugar Alcohols      (never below 0)
Energy Density = Calories / Serving Weight (g)                     (kcal per gram)
Fiber Total    = max(reported total, soluble + insoluble)
```

**Four layers keep the AI output trustworthy.** The pipeline in `backend/app/services/vision.py` works like this:

1. A strict prompt tells the model to classify the image as a label or a meal, OCR the printed values for one serving when it is a label, estimate per-food portion weights in grams when it is a meal, and never calculate net carbs or energy density itself.
2. The request sets `responseMimeType` to `application/json` and supplies a `responseSchema`, so Gemini must emit the exact keys and numeric types instead of free text.
3. The returned text is parsed and validated against the `RawEstimate` Pydantic model. Malformed output raises a `VisionError`, which the API turns into a clean 502.
4. `nutrition.py` clamps every value to zero or above, clamps confidence to the 0 to 1 range, rounds to one decimal, and applies the formulas above.

**Mock mode works out of the box.** If `GEMINI_API_KEY` is empty, `backend/app/services/mock.py` returns one of four realistic sample results (three meals and one label with sugar alcohols). The sample is chosen from a hash of the image bytes, so the same photo always gives the same result. Responses carry `"mode": "mock"` and the UI says so. No data leaves the machine in this mode.

**The AI provider is isolated.** Only `vision.py` knows about Gemini. Any other provider can be swapped in as long as it keeps the signature `analyze_image(bytes, mime) -> RawEstimate`.

**The camera is handled carefully.** `useCamera.js` stops all tracks on unmount so the camera indicator turns off when you leave the tab, ignores stale asynchronous starts, and maps browser errors (permission denied, no device, device busy) to readable messages.

### Tech stack

| Layer | Technology | Role |
| --- | --- | --- |
| UI | React 18, Vite, React Router | Fast dev server and multi-page routing |
| Styling | Tailwind CSS 3 with CSS variables | Theme tokens that switch between light and dark |
| Motion | Framer Motion | Spring physics, page transitions, animated rings |
| Icons | Lucide React | Consistent line icons |
| API | FastAPI, Pydantic v2 | Typed request and response models, automatic docs at `/docs` |
| HTTP client | httpx (async) | Non-blocking calls to the vision API |
| AI | Google Gemini (vision and structured output) | One multimodal model for both meal recognition and label OCR |

---

## Project Structure

```
food-macro-estimator/
├── main.py                     one-command launcher for backend and frontend
├── explanation.md              architecture and data flow write-up
├── .gitignore
│
├── backend/
│   ├── requirements.txt        Python dependencies
│   ├── .env.example            copy to .env and fill in
│   └── app/
│       ├── main.py             FastAPI app, CORS, router registration
│       ├── config.py           settings loaded from .env (pydantic-settings)
│       ├── schemas.py          RawEstimate (from model) and NutritionResult (to UI)
│       ├── routers/
│       │   └── analyze.py      GET /api/health, POST /api/analyze
│       └── services/
│           ├── vision.py       Gemini client, prompt, JSON schema, parsing
│           ├── mock.py         deterministic demo results (no API key needed)
│           └── nutrition.py    net carbs, energy density, clamping, rounding
│
└── frontend/
    ├── package.json
    ├── vite.config.js          dev server and /api proxy to port 8000
    ├── tailwind.config.js      design tokens, keyframes
    ├── postcss.config.js
    ├── index.html              pre-paint theme script (prevents dark-mode flash)
    ├── .env.example
    └── src/
        ├── main.jsx            React root, Router, ThemeProvider
        ├── App.jsx             layout, animated routes
        ├── index.css           theme variables and glassmorphism classes
        ├── context/
        │   └── ThemeContext.jsx        light and dark state, persisted
        ├── hooks/
        │   └── useCamera.js            getUserMedia wrapper
        ├── lib/
        │   ├── api.js                  fetch calls to the backend
        │   └── cn.js                   className helper
        ├── pages/
        │   ├── Home.jsx                hero, scanner, results
        │   ├── About.jsx               problem and mission storytelling
        │   └── Contributors.jsx        contributor cards
        └── components/
            ├── layout/     Navbar.jsx, Footer.jsx
            ├── scanner/    ScannerPanel.jsx, CameraScanner.jsx, ImageDropzone.jsx
            ├── results/    ResultsDashboard.jsx, MacroRing.jsx, BreakdownCard.jsx
            └── ui/         GlassCard.jsx, Button.jsx, Background.jsx,
                            PageTransition.jsx, AnimatedNumber.jsx, Reveal.jsx
```

---

## Setup and Run

### Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer (includes npm)
- Optional: a Gemini API key from Google AI Studio for real analysis. Without one, the app runs in demo mode.

### Option 1: One command

Create and activate a virtual environment inside `backend`, then start both servers from the project root.

Windows (PowerShell):

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
cd ..
python main.py
```

macOS or Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
cd ..
python main.py
```

The launcher creates `backend/.env` and `frontend/.env` from their `.env.example` files if they are missing, installs backend dependencies and runs `npm install` on first use, starts uvicorn on port 8000 and Vite on port 5173, and opens `http://localhost:5173` once the frontend is ready. Press Ctrl+C to stop both servers. Optional flags are `--no-browser`, `--no-reload`, and `--skip-install`.

### Option 2: Run each server manually

Backend, in one terminal:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Frontend, in a second terminal:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

On macOS or Linux, use `cp` instead of `copy` and `source .venv/bin/activate` instead of the Windows activation script.

Then open:

- App: `http://localhost:5173`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### Using it

1. Open the Upload photo tab, drop a food photo, and press Analyze nutrition. Alternatively, use the Live camera tab, allow permission, and tap the shutter.
2. Scroll to the results dashboard. The status pill at the top of the page tells you whether you are seeing demo data or live AI output.

The camera works on `localhost` or over HTTPS. Browsers block camera access on a plain `http://` LAN address.

---

## Configuration Reference

### Backend (`backend/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | empty | Leave empty to run in mock mode |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Any Gemini vision-capable model id |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | CORS allow-list |
| `MAX_UPLOAD_MB` | `8` | Server-side image size limit |
| `REQUEST_TIMEOUT_S` | `60` | Vision API timeout in seconds |

If you change `MAX_UPLOAD_MB`, also update the `MAX_MB` constant in `frontend/src/components/scanner/ImageDropzone.jsx` so the browser-side check matches.

### Frontend (`frontend/.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Leave empty in development. Set it to your API URL when deploying. |

---

## Accuracy and Limitations

- Portion weights from meal photos are estimates. Plate size, depth, and hidden ingredients such as oil and sauces limit accuracy. The confidence bar and the model's note reflect this.
- Label scans are usually far more accurate than meal photos because the values are printed.
- Added sugars and the soluble and insoluble fiber split are only exact when printed on a label. For meals they are estimates.
- Results are informational and are not medical or dietary advice.

---

## Contributor

| | |
| --- | --- |
| Name | [Your Name] |
| Role | [Your Role, for example Full-Stack Developer] |
| Profile | [Your Profile Link] |

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:bf5af2,50:5e5ce6,100:0a84ff&height=120&section=footer" alt="Footer wave" />

</div>