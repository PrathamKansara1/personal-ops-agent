export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Personal Ops Agent</h1>
      <p>
        A free, serverless agent that reads my Google Calendar and activity log,
        summarizes my day with Gemini Flash, and sends me a morning briefing on
        WhatsApp.
      </p>
      <ul>
        <li>Built with Next.js + Vercel (cron)</li>
        <li>Google Calendar + Sheets APIs</li>
        <li>Gemini Flash (free tier)</li>
        <li>Twilio WhatsApp Sandbox</li>
      </ul>
    </main>
  );
}
