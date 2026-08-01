import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 1. Initialize dotenv
dotenv.config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  PORT
} = process.env;

// Placeholders check helper
const isMissingOrPlaceholder = (val: string | undefined, placeholder: string): boolean => {
  if (!val) return true;
  const trimmed = val.trim();
  return trimmed === '' || trimmed === placeholder || trimmed.includes('your-supabase');
};

// 2. Validate CLI environment keys for Google OAuth
const invalidClientId = isMissingOrPlaceholder(GOOGLE_CLIENT_ID, 'YOUR_GOOGLE_CLIENT_ID');
const invalidClientSecret = isMissingOrPlaceholder(GOOGLE_CLIENT_SECRET, 'YOUR_GOOGLE_CLIENT_SECRET');

if (invalidClientId || invalidClientSecret) {
  console.error('\n================================================================================');
  console.error(' [WARNING] MISSING OR PLACEHOLDER GOOGLE OAUTH2 CREDENTIALS IN .env');
  console.error('================================================================================\n');
  console.error('The server cannot start because GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing');
  console.error('or set to a placeholder value.\n');
  console.error('Checklist to obtain your keys from the Google Cloud Console:');
  console.error('  1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.error('  2. Create a new project (or select an existing one).');
  console.error('  3. Navigate to "APIs & Services" > "Library" and enable "Google Calendar API".');
  console.error('  4. Navigate to "APIs & Services" > "OAuth consent screen" and configure it.');
  console.error('  5. Navigate to "APIs & Services" > "Credentials" > "Create Credentials" > "OAuth client ID".');
  console.error('  6. Choose "Web application" as Application type.');
  console.error('  7. Add Authorized Redirect URI: http://localhost:3000/oauth2callback');
  console.error('  8. Copy the Client ID and Client Secret into your calendar-utility/.env file:');
  console.error('       GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com');
  console.error('       GOOGLE_CLIENT_SECRET=your-actual-client-secret');
  console.error('       GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback\n');
  console.error('================================================================================\n');
  process.exit(1);
}

const redirectUri = GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

// 3. Set up Google OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  redirectUri
);

// 4. Initialize Supabase Client (if credentials are provided, else fallback to mock log)
let supabase: SupabaseClient | null = null;
const hasSupabaseUrl = !isMissingOrPlaceholder(SUPABASE_URL, 'https://your-supabase-project-id.supabase.co');
const hasSupabaseKey = !isMissingOrPlaceholder(SUPABASE_ANON_KEY, 'your-supabase-anon-key');

if (hasSupabaseUrl && hasSupabaseKey && SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[Supabase] Client initialized successfully for telemetry logging.');
  } catch (err: any) {
    console.warn('[Supabase] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('[Supabase] Unconfigured or placeholder keys detected. Telemetry will run in console mock mode.');
}

const app = express();
app.use(cors());
app.use(express.json());

const SERVER_PORT = PORT ? parseInt(PORT, 10) : 3000;

// OAuth Scopes needed for Calendar Event creation
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

/**
 * GET /auth
 * Route to generate the Google OAuth2 authorization URL and redirect the user.
 */
app.get('/auth', (req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  console.log('[Auth] Generated OAuth consent URL. Redirecting user...');
  res.redirect(authUrl);
});

/**
 * GET /oauth2callback
 * Route to handle the token exchange callback from Google OAuth2 consent screen.
 */
app.get('/oauth2callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).send('Missing authorization code parameter.');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('[Auth] Successfully authenticated with Google OAuth2!');
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #0f172a; color: #f8fafc; min-height: 100vh;">
        <h1 style="color: #818cf8;">Authentication Successful!</h1>
        <p>Google OAuth2 tokens have been set. The Aspiration Engine API Bridge is ready to schedule deep work events.</p>
        <p style="color: #94a3b8; font-size: 14px;">You may now close this browser tab.</p>
      </div>
    `);
  } catch (error: any) {
    console.error('[Auth Error] Error exchanging code for tokens:', error.message);
    res.status(500).send(`Failed to authenticate with Google: ${error.message}`);
  }
});

/**
 * POST /schedule-deep-work
 * Route that uses the authenticated client to autonomously create a 45-minute
 * calendar event on the primary calendar starting from new Date().
 */
app.post('/schedule-deep-work', async (req: Request, res: Response) => {
  try {
    if (!oauth2Client.credentials || (!oauth2Client.credentials.access_token && !oauth2Client.credentials.refresh_token)) {
      console.warn('[Schedule] Attempted to schedule deep work without active OAuth session.');
      res.status(401).json({
        error: 'Not authenticated with Google OAuth2.',
        authUrl: `http://localhost:${SERVER_PORT}/auth`,
        message: 'Please visit http://localhost:3000/auth first to authorize Google Calendar access.'
      });
      return;
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 45 * 60 * 1000); // 45 minutes duration

    const event = {
      summary: '🎯 Deep Work Session (Aspiration Engine)',
      description: 'Autonomously scheduled focus session initiated from Chrome Extension website interceptor.',
      start: {
        dateTime: startTime.toISOString(),
      },
      end: {
        dateTime: endTime.toISOString(),
      },
      colorId: '9', // Blueberry / Deep Purple color in Google Calendar
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 5 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    console.log(`[Schedule] Created 45-minute deep work event: "${response.data.summary}" at ${startTime.toLocaleTimeString()}`);

    res.status(200).json({
      success: true,
      message: 'Deep work session scheduled successfully.',
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
  } catch (error: any) {
    console.error('[Schedule Error] Failed to create Google Calendar event:', error.message);
    res.status(500).json({
      error: 'Failed to schedule deep work event on Google Calendar.',
      details: error.message,
    });
  }
});

/**
 * POST /log-session
 * Endpoint to receive Chrome Extension telemetry and insert row into Supabase user_telemetry table.
 */
app.post('/log-session', async (req: Request, res: Response) => {
  const { domain, time_saved_seconds, action } = req.body;

  const telemetryRecord = {
    domain: domain || 'reddit.com',
    time_saved_seconds: typeof time_saved_seconds === 'number' ? time_saved_seconds : parseInt(time_saved_seconds || '0', 10),
    action: action || 'intentional_focus',
    created_at: new Date().toISOString()
  };

  console.log('[Telemetry] Received session log request:', telemetryRecord);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_telemetry')
        .insert([telemetryRecord])
        .select();

      if (error) {
        console.error('[Supabase Error] Database insertion failed:', error.message);
        // Fallback to 200 OK so extension telemetry doesn't fail
        res.status(200).json({
          success: true,
          status: 'mock_logged',
          message: 'Supabase write error, logged in server console.',
          dbError: error.message,
          data: telemetryRecord
        });
        return;
      }

      console.log('[Supabase] Telemetry row inserted successfully:', data);
      res.status(200).json({
        success: true,
        status: 'db_inserted',
        message: 'Telemetry logged to Supabase successfully.',
        data: data
      });
      return;
    } catch (err: any) {
      console.error('[Supabase Exception] Failed to execute query:', err.message);
    }
  }

  // Mock logging fallback if Supabase is unconfigured or failed
  console.log('[Telemetry MOCK LOG] Saved to VPM & Implicit Profiling queue:', telemetryRecord);
  res.status(200).json({
    success: true,
    status: 'mock_logged',
    message: 'Telemetry logged in mock mode (Supabase unconfigured).',
    data: telemetryRecord
  });
});

app.listen(SERVER_PORT, () => {
  console.log(`\n🚀 Aspiration Engine Express API Bridge running on http://localhost:${SERVER_PORT}`);
  console.log(`   - Auth URL: http://localhost:${SERVER_PORT}/auth`);
  console.log(`   - Schedule endpoint: POST http://localhost:${SERVER_PORT}/schedule-deep-work`);
  console.log(`   - Telemetry endpoint: POST http://localhost:${SERVER_PORT}/log-session\n`);
});
