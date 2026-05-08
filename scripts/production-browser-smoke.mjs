import { chromium } from 'playwright';

const FRONTEND_BASE_URL = process.env.SMOKE_BASE_URL || 'https://buicojourney.com';
const API_BASE_URL =
  process.env.SMOKE_API_BASE_URL || 'https://api.buicojourney.com/api/v1';
const HEADLESS = process.env.SMOKE_HEADLESS !== 'false';

const REGISTER_EMAIL_ERROR = 'Vui lòng nhập email hợp lệ.';
const REGISTER_PASSWORD_MIN_ERROR = 'Mật khẩu phải có ít nhất 8 ký tự.';
const LOGIN_PATH = '/auth/login';
const PROFILE_PATH = '/app/profile';
const REGISTER_PATH = '/auth/register';
const PUBLIC_PLANNER_CTA = 'Xem kế hoạch';
const PUBLIC_LOGIN_CTA = 'Đăng nhập';
const LOGOUT_LABEL = 'Đăng xuất';

async function main() {
  const timestamp = Date.now();
  const fixtureEmail = `browser.smoke.${timestamp}@example.com`;
  const fixturePassword = 'Journey123';
  const fixtureDisplayName = `Browser Smoke ${timestamp}`;
  const invalidFormEmail = `browser.invalid.${timestamp}@example.com`;
  const tripName = `Browser Smoke Trip ${timestamp}`;
  const journalNoteText = `Smoke note ${timestamp}`;

  let accessToken = null;
  let refreshToken = null;
  let tripId = null;
  let browser = null;

  try {
    logStep('Creating production fixture through API');
    const register = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        displayName: fixtureDisplayName,
        email: fixtureEmail,
        password: fixturePassword,
      },
      expectedStatuses: [201],
    });
    accessToken = register.data.tokens.accessToken;
    refreshToken = register.data.tokens.refreshToken;

    const trip = await apiRequest('/trips', {
      method: 'POST',
      token: accessToken,
      body: {
        name: tripName,
        destination: 'Hoi An',
        summaryNotes: 'Browser smoke fixture',
        coverImageUrl: null,
        startDate: '2026-08-10',
        endDate: '2026-08-12',
        budgetMode: 'auto',
        manualBudgetAmount: null,
        manualBudgetCurrency: null,
        visibility: 'private',
      },
      expectedStatuses: [201],
    });
    tripId = trip.data.id;

    const ownerJournal = await apiRequest(`/trips/${tripId}/journal`, {
      token: accessToken,
      expectedStatuses: [200],
    });
    await apiRequest(`/trips/${tripId}/journal`, {
      method: 'PUT',
      token: accessToken,
      body: {
        sceneVersion: ownerJournal.data.journal.sceneVersion,
        page: ownerJournal.data.journal.page,
        objects: [
          {
            id: `note-${timestamp}`,
            type: 'note',
            x: 120,
            y: 180,
            width: 360,
            height: 220,
            rotation: -4,
            zIndex: 1,
            locked: false,
            props: {
              color: '#fff4c7',
              text: journalNoteText,
            },
          },
        ],
      },
      expectedStatuses: [200],
    });
    await apiRequest(`/trips/${tripId}/journal`, {
      method: 'PATCH',
      token: accessToken,
      body: {
        visibility: 'public',
      },
      expectedStatuses: [200],
    });

    const publicJournalUrl = `${FRONTEND_BASE_URL}/public/trips/${encodeURIComponent(tripId)}/journal`;

    logStep('Launching headless Chromium');
    browser = await chromium.launch({
      headless: HEADLESS,
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(20000);

    logStep('Checking register validation copy on production');
    await page.goto(`${FRONTEND_BASE_URL}${REGISTER_PATH}`, {
      waitUntil: 'networkidle',
    });
    await page.locator('#register-display-name').fill('Nguyen Van A');
    await page.locator('#register-email').fill('not-an-email');
    await page.locator('#register-password').fill(fixturePassword);
    await page.locator('form button[type="submit"]').click();
    await expectVisibleText(page, REGISTER_EMAIL_ERROR);

    await page.locator('#register-email').fill(invalidFormEmail);
    await page.locator('#register-password').fill('abc123');
    await page.locator('form button[type="submit"]').click();
    await expectVisibleText(page, REGISTER_PASSWORD_MIN_ERROR);

    logStep('Checking login -> profile -> logout flow on production');
    await page.goto(`${FRONTEND_BASE_URL}${LOGIN_PATH}`, {
      waitUntil: 'networkidle',
    });
    await page.locator('#login-email').fill(fixtureEmail);
    await page.locator('#login-password').fill(fixturePassword);
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.endsWith(LOGIN_PATH), {
      timeout: 20000,
    });

    await page.goto(`${FRONTEND_BASE_URL}${PROFILE_PATH}`, {
      waitUntil: 'networkidle',
    });
    await page.getByRole('button', { name: LOGOUT_LABEL }).click();
    await page.waitForURL(`**${LOGIN_PATH}`, {
      timeout: 20000,
    });
    await page.goto(`${FRONTEND_BASE_URL}${PROFILE_PATH}`, {
      waitUntil: 'networkidle',
    });
    await page.waitForURL(`**${LOGIN_PATH}`, {
      timeout: 20000,
    });
    await expectVisible(page.locator('#login-email'), 'login email field after logout');

    logStep('Checking public journal render and hidden planner CTA');
    await page.goto(publicJournalUrl, {
      waitUntil: 'networkidle',
    });
    await expectVisibleText(page, tripName);
    await expectVisibleText(page, journalNoteText);
    await expectVisible(
      page.getByRole('link', { name: PUBLIC_LOGIN_CTA }),
      'public journal login CTA',
    );

    const plannerCtaCount = await page
      .getByRole('link', { name: PUBLIC_PLANNER_CTA })
      .count();

    if (plannerCtaCount !== 0) {
      throw new Error(
        `Expected no planner CTA on public journal while trip is private, found ${plannerCtaCount}.`,
      );
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          baseUrl: FRONTEND_BASE_URL,
          apiBaseUrl: API_BASE_URL,
          checks: [
            'register-validation-copy',
            'login-profile-logout-redirect',
            'public-journal-render-private-trip',
          ],
          tripId,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          message: error instanceof Error ? error.message : String(error),
          tripId,
          baseUrl: FRONTEND_BASE_URL,
          apiBaseUrl: API_BASE_URL,
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined);
    }

    if (tripId && accessToken) {
      await apiRequest(`/trips/${tripId}`, {
        method: 'DELETE',
        token: accessToken,
        expectedStatuses: [200, 204, 404],
      }).catch(() => undefined);
    }

    if (refreshToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: { refreshToken },
        expectedStatuses: [200, 401],
      }).catch(() => undefined);
    }
  }
}

async function apiRequest(
  path,
  { method = 'GET', token, body, expectedStatuses = [200] } = {},
) {
  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!expectedStatuses.includes(response.status)) {
    throw new Error(
      `Unexpected ${response.status} for ${method} ${path}: ${JSON.stringify(payload)}`,
    );
  }

  return payload;
}

async function expectVisible(locator, description) {
  await locator.waitFor({
    state: 'visible',
  });

  const visible = await locator.isVisible();

  if (!visible) {
    throw new Error(`Expected visible element: ${description}`);
  }
}

async function expectVisibleText(page, text) {
  await expectVisible(page.getByText(text), text);
}

function logStep(message) {
  console.log(`\n[smoke] ${message}`);
}

await main();
