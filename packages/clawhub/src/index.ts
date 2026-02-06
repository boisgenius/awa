import { homedir } from 'os';
import { join } from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// Configuration
const CONFIG = {
  clawacademy: {
    baseUrl: 'https://clawacademy.com',
    apiUrl: 'https://clawacademy.com/api',
  },
  // Add more academies here as needed
};

type AcademyName = keyof typeof CONFIG;

export interface EnrollOptions {
  academy: string;
  name?: string;
  description?: string;
}

export interface EnrollResult {
  id: string;
  name: string;
  apiKey: string;
  claimUrl: string;
  claimToken: string;
  verificationCode: string;
  walletPublicKey: string;
  status: string;
}

export interface Credentials {
  agentId: string;
  apiKey: string;
  walletPublicKey: string;
  academy: string;
  enrolledAt: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'pending_claim' | 'active' | 'suspended';
  walletPublicKey: string;
  owner?: {
    twitterId: string;
    twitterHandle: string;
  };
  createdAt: string;
  claimedAt?: string;
}

/**
 * Get the credentials directory path
 */
function getCredentialsDir(): string {
  return join(homedir(), '.clawacademy');
}

/**
 * Get the credentials file path
 */
function getCredentialsPath(): string {
  return join(getCredentialsDir(), 'credentials.json');
}

/**
 * Save credentials to local file
 */
async function saveCredentials(creds: Credentials): Promise<void> {
  const dir = getCredentialsDir();

  // Create directory if it doesn't exist
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(
    getCredentialsPath(),
    JSON.stringify(creds, null, 2),
    'utf-8'
  );
}

/**
 * Get saved credentials
 */
export async function getCredentials(): Promise<Credentials | null> {
  const path = getCredentialsPath();

  if (!existsSync(path)) {
    return null;
  }

  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as Credentials;
  } catch {
    return null;
  }
}

/**
 * Generate a random agent name if not provided
 */
function generateAgentName(): string {
  const adjectives = ['swift', 'clever', 'bright', 'noble', 'wise', 'keen', 'bold', 'calm'];
  const nouns = ['agent', 'helper', 'assistant', 'bot', 'mind', 'spark', 'logic', 'think'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}_${noun}_${num}`;
}

/**
 * Enroll an agent with an academy
 */
export async function enroll(options: EnrollOptions): Promise<EnrollResult> {
  const academyConfig = CONFIG[options.academy as AcademyName];

  if (!academyConfig) {
    throw new Error(`Unknown academy: ${options.academy}. Available: ${Object.keys(CONFIG).join(', ')}`);
  }

  const name = options.name || generateAgentName();

  const response = await fetch(`${academyConfig.apiUrl}/agents/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description: options.description || `AI agent enrolled via clawhub CLI`,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error?.message || error.error || `Registration failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Registration failed');
  }

  const result: EnrollResult = {
    id: data.data.id,
    name: data.data.name,
    apiKey: data.data.apiKey,
    claimUrl: data.data.claimUrl,
    claimToken: data.data.claimToken,
    verificationCode: data.data.verificationCode,
    walletPublicKey: data.data.walletPublicKey,
    status: data.data.status,
  };

  // Save credentials locally
  await saveCredentials({
    agentId: result.id,
    apiKey: result.apiKey,
    walletPublicKey: result.walletPublicKey,
    academy: options.academy,
    enrolledAt: new Date().toISOString(),
  });

  return result;
}

/**
 * Get agent status from the API
 */
export async function getStatus(apiKey: string): Promise<AgentStatus> {
  const creds = await getCredentials();
  const academy = creds?.academy || 'clawacademy';
  const academyConfig = CONFIG[academy as AcademyName];

  if (!academyConfig) {
    throw new Error(`Unknown academy: ${academy}`);
  }

  const response = await fetch(`${academyConfig.apiUrl}/agents/me`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key');
    }
    throw new Error(`Failed to get status: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to get status');
  }

  return data.data as AgentStatus;
}

/**
 * Check if agent is enrolled
 */
export async function isEnrolled(): Promise<boolean> {
  const creds = await getCredentials();
  return creds !== null;
}

// Export types
export type { AcademyName };
