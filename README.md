# Sports Video Architect 🎥🏆

An AI-powered sports broadcast editor and video metadata architect. This application analyzes sports footage (via YouTube links) to identify high-leverage "Key Moments" and generates a clickable, frame-accurate Highlight Log.

## Features
- **AI Analysis**: Uses Gemini 3.1 Pro to scan for visual and audio triggers (crowd peaks, score changes, specific sports movements).
- **Sport-Specific Logic**: Specialized recognition for Football, Squash, Basketball, Hockey, and Baseball.
- **Frame-Accurate Deep Links**: Generates YouTube links with a 3-second buffer for perfect context.
- **Technical Dashboard**: A professional, data-dense UI designed for broadcast editors.
- **Markdown Export**: Easily copy your highlight logs for use in reports or social media.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS 4, Motion
- **AI**: Google Gemini API (Gemini 3.1 Pro Preview)
- **Icons**: Lucide React

## Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up your environment variables in a `.env` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Run the development server: `npm run dev`

## License
Apache-2.0
