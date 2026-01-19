import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { Browser } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_STATE_PATH = path.resolve(__dirname, '../../auth/google.json');
// Use the actual AWS backend endpoint directly (not the Next.js proxy)
const API_BASE_URL = 'https://80vqjq7bk0.execute-api.us-east-1.amazonaws.com/v1/auth/refresh';
const ORIGIN = 'https://aistg.walle.xyz';

interface LocalStorageItem {
  name: string;
  value: string;
}

interface Origin {
  origin: string;
  localStorage: LocalStorageItem[];
}

interface StorageState {
  cookies: Array<any>;
  origins: Origin[];
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * Load and parse the storage state file
 * @returns Storage state object with tokens
 */
function loadStorageState(): { storageState: StorageState; refreshToken: string; accessToken: string } {
  if (!fs.existsSync(STORAGE_STATE_PATH)) {
    throw new Error(`Storage state file not found at: ${STORAGE_STATE_PATH}`);
  }

  const fileContent = fs.readFileSync(STORAGE_STATE_PATH, 'utf-8');
  let storageState: StorageState;

  try {
    storageState = JSON.parse(fileContent);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse storage state file: ${message}`);
  }

  // Find the origin with our app's URL
  const appOrigin = storageState.origins.find((origin) => origin.origin === ORIGIN);
  if (!appOrigin) {
    throw new Error(`Origin ${ORIGIN} not found in storage state`);
  }

  // Extract tokens from localStorage
  const refreshTokenItem = appOrigin.localStorage.find((item) => item.name === 'refreshToken');
  const accessTokenItem = appOrigin.localStorage.find((item) => item.name === 'accessToken');

  if (!refreshTokenItem || !refreshTokenItem.value) {
    throw new Error('refreshToken not found in storage state');
  }

  if (!accessTokenItem || !accessTokenItem.value) {
    throw new Error('accessToken not found in storage state');
  }

  return {
    storageState,
    refreshToken: refreshTokenItem.value,
    accessToken: accessTokenItem.value,
  };
}

/**
 * Call the refresh API to get new tokens
 * @param refreshToken Current refresh token
 * @returns New access and refresh tokens
 */
async function refreshTokens(refreshToken: string): Promise<RefreshResponse> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Token refresh API failed with status ${response.status}: ${errorText}`
      );
    }

    const data: Record<string, unknown> = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Handle nested response format: { data: { access_token, refresh_token } }
    // Also handle flat format: { access_token, refresh_token }
    const nested = data.data as Record<string, unknown> | undefined;
    const newAccessToken = (nested?.access_token || nested?.accessToken || data.access_token || data.accessToken) as string | undefined;
    const newRefreshToken = (nested?.refresh_token || nested?.refreshToken || data.refresh_token || data.refreshToken) as string | undefined;

    if (!newAccessToken || !newRefreshToken) {
      throw new Error(`Invalid response from refresh API: missing access_token or refresh_token. Got: ${JSON.stringify(data)}`);
    }

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to refresh tokens: ${error.message}`);
    }
    throw new Error('Failed to refresh tokens: Unknown error');
  }
}

/**
 * Update the storage state file with new tokens
 * @param newAccessToken New access token
 * @param newRefreshToken New refresh token
 */
function updateStorageState(newAccessToken: string, newRefreshToken: string): void {
  const { storageState } = loadStorageState();

  // Find the origin with our app's URL
  const appOrigin = storageState.origins.find((origin) => origin.origin === ORIGIN);
  if (!appOrigin) {
    throw new Error(`Origin ${ORIGIN} not found in storage state`);
  }

  // Update tokens in localStorage
  const refreshTokenItem = appOrigin.localStorage.find((item) => item.name === 'refreshToken');
  const accessTokenItem = appOrigin.localStorage.find((item) => item.name === 'accessToken');

  if (!refreshTokenItem) {
    throw new Error('refreshToken item not found in localStorage');
  }

  if (!accessTokenItem) {
    throw new Error('accessToken item not found in localStorage');
  }

  // Update the token values
  refreshTokenItem.value = newRefreshToken;
  accessTokenItem.value = newAccessToken;

  // Write back to file
  try {
    fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2), 'utf-8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to write storage state file: ${message}`);
  }
}

/**
 * Main entry point: Refresh authentication tokens
 * Loads current refresh token, calls API, and updates storage state
 */
export async function refreshAuthTokens(): Promise<void> {
  try {
    // Load current storage state
    const { refreshToken, accessToken } = loadStorageState();
    console.log(`Current access token: ${accessToken.substring(0, 20)}...`);

    // Call refresh API
    console.log('Calling token refresh API...');
    const { access_token, refresh_token } = await refreshTokens(refreshToken);

    // Update storage state file
    console.log('Updating storage state with new tokens...');
    updateStorageState(access_token, refresh_token);

    console.log(`New access token: ${access_token.substring(0, 20)}...`);
    console.log(`Tokens updated successfully at ${new Date().toISOString()}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token refresh failed: ${error.message}\n\nPlease run the authentication setup manually to re-authenticate.`);
    }
    throw new Error('Token refresh failed: Unknown error');
  }
}

/**
 * Check if a JWT token is expired or will expire within the buffer time
 * @param token JWT token string
 * @param bufferMinutes Minutes before actual expiry to consider it expired (default 5)
 * @returns true if token is expired or will expire within buffer time
 */
function isTokenExpired(token: string, bufferMinutes: number = 5): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const now = Math.floor(Date.now() / 1000);
    const bufferSeconds = bufferMinutes * 60;
    return payload.exp < now + bufferSeconds;
  } catch {
    // If we can't parse the token, assume it's expired
    return true;
  }
}

/**
 * Refresh tokens using Playwright browser context
 * This makes the API call from within the browser, including all cookies and headers
 */
export async function refreshAuthTokensViaBrowser(browser: Browser): Promise<void> {
  try {
    // Load current storage state
    const { refreshToken, accessToken } = loadStorageState();
    console.log(`Current access token: ${accessToken.substring(0, 20)}...`);

    // Check if access token is still valid (with 5 minute buffer)
    if (!isTokenExpired(accessToken, 5)) {
      console.log('Access token is still valid, skipping refresh');
      return;
    }
    console.log('Access token expired or expiring soon, attempting refresh...');

    // Create a new context with the existing storage state
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
    });

    const page = await context.newPage();

    // Navigate to the app first to set up the context properly
    await page.goto(ORIGIN, { waitUntil: 'domcontentloaded' });

    // Make the refresh API call from within the browser
    console.log('Calling token refresh API via browser...');
    const response = await page.evaluate(async (refreshTokenValue: string) => {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });

      const data = await res.json();
      return {
        ok: res.ok,
        status: res.status,
        data,
      };
    }, refreshToken);

    console.log('API Response:', JSON.stringify(response.data, null, 2));

    if (!response.ok) {
      throw new Error(`Token refresh API failed with status ${response.status}: ${JSON.stringify(response.data)}`);
    }

    // Extract tokens from response (handle nested format)
    const nested = response.data.data;
    const newAccessToken = nested?.access_token || nested?.accessToken || response.data.access_token || response.data.accessToken;
    const newRefreshToken = nested?.refresh_token || nested?.refreshToken || response.data.refresh_token || response.data.refreshToken;

    if (!newAccessToken || !newRefreshToken) {
      throw new Error(`Invalid response from refresh API: missing tokens. Got: ${JSON.stringify(response.data)}`);
    }

    // Update storage state file
    console.log('Updating storage state with new tokens...');
    updateStorageState(newAccessToken, newRefreshToken);

    console.log(`New access token: ${newAccessToken.substring(0, 20)}...`);
    console.log(`Tokens updated successfully at ${new Date().toISOString()}`);

    // Clean up
    await context.close();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token refresh failed: ${error.message}\n\nPlease run the authentication setup manually to re-authenticate.`);
    }
    throw new Error('Token refresh failed: Unknown error');
  }
}
