// Google OAuth + Gmail/Classroom scanning helpers (server-side only).
// Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local.

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export type GoogleService = "gmail" | "classroom";

const SCOPES: Record<GoogleService, string[]> = {
  gmail: ["https://www.googleapis.com/auth/gmail.readonly"],
  classroom: [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  ],
};

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function redirectUri(): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
}

export function buildAuthUrl(service: GoogleService): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPES[service].join(" "),
    access_type: "offline",
    prompt: "consent",
    state: service,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
}> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }
  return res.json();
}

export interface ImportedTask {
  title: string;
  due_date: string | null;
}

// Scan Gmail for assignment/deadline-looking emails from the last 30 days.
export async function scanGmail(accessToken: string): Promise<ImportedTask[]> {
  const q = encodeURIComponent(
    "(assignment OR deadline OR test OR due) newer_than:30d",
  );
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=15`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!listRes.ok) return [];
  const list = await listRes.json();
  const ids: string[] = (list.messages ?? []).map((m: { id: string }) => m.id);

  const tasks: ImportedTask[] = [];
  for (const id of ids) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!msgRes.ok) continue;
    const msg = await msgRes.json();
    const subject = (msg.payload?.headers ?? []).find(
      (h: { name: string; value: string }) => h.name === "Subject",
    )?.value;
    if (subject) tasks.push({ title: subject.slice(0, 200), due_date: null });
  }
  return tasks;
}

// Pull active coursework from Google Classroom with due dates.
export async function scanClassroom(accessToken: string): Promise<ImportedTask[]> {
  const coursesRes = await fetch(
    "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=10",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!coursesRes.ok) return [];
  const coursesData = await coursesRes.json();
  const courses: { id: string; name: string }[] = coursesData.courses ?? [];

  const tasks: ImportedTask[] = [];
  for (const course of courses.slice(0, 6)) {
    const workRes = await fetch(
      `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?pageSize=20`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!workRes.ok) continue;
    const workData = await workRes.json();
    for (const cw of workData.courseWork ?? []) {
      let due: string | null = null;
      if (cw.dueDate?.year) {
        const d = new Date(
          Date.UTC(
            cw.dueDate.year,
            (cw.dueDate.month ?? 1) - 1,
            cw.dueDate.day ?? 1,
            cw.dueTime?.hours ?? 23,
            cw.dueTime?.minutes ?? 59,
          ),
        );
        due = d.toISOString();
      }
      tasks.push({
        title: `${course.name}: ${cw.title}`.slice(0, 200),
        due_date: due,
      });
    }
  }
  return tasks;
}
