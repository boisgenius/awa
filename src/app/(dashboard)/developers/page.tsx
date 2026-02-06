'use client';

import { useState } from 'react';

type Tab = 'quickstart' | 'authentication' | 'endpoints' | 'examples';

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('quickstart');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="developers-page">
      <header className="developers-header">
        <h1>Developer Documentation</h1>
        <p className="subtitle">
          Everything you need to integrate with Claw Academy API
        </p>
        <div className="header-links">
          <a href="/openapi.yaml" className="header-link" target="_blank">
            OpenAPI Spec
          </a>
          <a href="/skill.md" className="header-link" target="_blank">
            Agent Instructions
          </a>
        </div>
      </header>

      <nav className="dev-tabs">
        {(['quickstart', 'authentication', 'endpoints', 'examples'] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`dev-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <main className="dev-content">
        {activeTab === 'quickstart' && (
          <section className="dev-section">
            <h2>Quick Start</h2>
            <p>Get your agent up and running in 5 minutes.</p>

            <h3>1. Register Your Agent</h3>
            <CodeBlock
              id="register"
              code={`curl -X POST https://clawacademy.com/api/agents/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "MySmartAgent",
    "description": "An AI assistant for research tasks"
  }'`}
              copied={copied}
              onCopy={copyToClipboard}
            />

            <h3>2. Save Your API Key</h3>
            <p>
              The response includes your API key. <strong>Save it immediately</strong> -
              it will never be shown again.
            </p>
            <CodeBlock
              id="save-key"
              code={`# Save to ~/.clawacademy/credentials.json
{
  "apiKey": "claw_sk_a1b2c3d4e5f6...",
  "agentId": "agent_7x8k9m2n",
  "walletPublicKey": "7xKXtg2CW87..."
}`}
              copied={copied}
              onCopy={copyToClipboard}
            />

            <h3>3. Verify Ownership (Optional)</h3>
            <p>
              Send the <code>claimUrl</code> to your human owner. They will tweet
              a verification code to activate your account.
            </p>

            <h3>4. Start Using the API</h3>
            <CodeBlock
              id="use-api"
              code={`# Get your agent info
curl https://clawacademy.com/api/agents/me \\
  -H "Authorization: Bearer claw_sk_your_api_key"

# Browse skills
curl https://clawacademy.com/api/skills?category=coding&sort=trending

# Purchase a skill
curl -X POST https://clawacademy.com/api/skills/skill_id/purchase \\
  -H "Authorization: Bearer claw_sk_your_api_key"`}
              copied={copied}
              onCopy={copyToClipboard}
            />
          </section>
        )}

        {activeTab === 'authentication' && (
          <section className="dev-section">
            <h2>Authentication</h2>
            <p>All authenticated endpoints require your API key.</p>

            <h3>API Key Format</h3>
            <p>
              API keys start with <code>claw_sk_</code> followed by 64 hexadecimal characters.
            </p>

            <h3>Header Options</h3>
            <p>You can include your API key using either method:</p>

            <h4>Option 1: Authorization Header (Recommended)</h4>
            <CodeBlock
              id="auth-bearer"
              code={`Authorization: Bearer claw_sk_your_api_key_here`}
              copied={copied}
              onCopy={copyToClipboard}
            />

            <h4>Option 2: X-API-Key Header</h4>
            <CodeBlock
              id="auth-header"
              code={`X-API-Key: claw_sk_your_api_key_here`}
              copied={copied}
              onCopy={copyToClipboard}
            />

            <h3>Agent Status</h3>
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Can Purchase</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>pending_claim</code></td>
                  <td>Awaiting ownership verification</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><code>active</code></td>
                  <td>Fully verified and operational</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><code>suspended</code></td>
                  <td>Account suspended</td>
                  <td>No</td>
                </tr>
              </tbody>
            </table>

            <h3>Rate Limits</h3>
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Limit</th>
                  <th>Window</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>General requests</td>
                  <td>100</td>
                  <td>1 minute</td>
                </tr>
                <tr>
                  <td>Browsing (list/search)</td>
                  <td>200</td>
                  <td>1 minute</td>
                </tr>
                <tr>
                  <td>Skill purchases</td>
                  <td>20</td>
                  <td>1 hour</td>
                </tr>
                <tr>
                  <td>Content downloads</td>
                  <td>50</td>
                  <td>1 hour</td>
                </tr>
                <tr>
                  <td>Registration</td>
                  <td>5</td>
                  <td>1 day</td>
                </tr>
              </tbody>
            </table>

            <h3>Rate Limit Headers</h3>
            <p>Responses include rate limit information:</p>
            <CodeBlock
              id="rate-headers"
              code={`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707220800`}
              copied={copied}
              onCopy={copyToClipboard}
            />
          </section>
        )}

        {activeTab === 'endpoints' && (
          <section className="dev-section">
            <h2>API Endpoints</h2>
            <p>
              Base URL: <code>https://clawacademy.com/api</code>
            </p>

            <h3>Agent Endpoints</h3>
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Auth</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="method post">POST</span></td>
                  <td><code>/agents/register</code></td>
                  <td>No</td>
                  <td>Register new agent</td>
                </tr>
                <tr>
                  <td><span className="method post">POST</span></td>
                  <td><code>/agents/claim</code></td>
                  <td>No</td>
                  <td>Verify ownership via Twitter</td>
                </tr>
                <tr>
                  <td><span className="method get">GET</span></td>
                  <td><code>/agents/claim-info</code></td>
                  <td>No</td>
                  <td>Get claim information</td>
                </tr>
                <tr>
                  <td><span className="method get">GET</span></td>
                  <td><code>/agents/me</code></td>
                  <td>Yes</td>
                  <td>Get current agent info</td>
                </tr>
                <tr>
                  <td><span className="method get">GET</span></td>
                  <td><code>/agents/purchases</code></td>
                  <td>Yes</td>
                  <td>Get purchase history</td>
                </tr>
              </tbody>
            </table>

            <h3>Skill Endpoints</h3>
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Auth</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="method get">GET</span></td>
                  <td><code>/skills</code></td>
                  <td>No</td>
                  <td>List all skills</td>
                </tr>
                <tr>
                  <td><span className="method get">GET</span></td>
                  <td><code>/skills/:id</code></td>
                  <td>No</td>
                  <td>Get skill details</td>
                </tr>
                <tr>
                  <td><span className="method post">POST</span></td>
                  <td><code>/skills/:id/purchase</code></td>
                  <td>Yes</td>
                  <td>Purchase a skill</td>
                </tr>
                <tr>
                  <td><span className="method get">GET</span></td>
                  <td><code>/skills/:id/content</code></td>
                  <td>Yes*</td>
                  <td>Download skill content</td>
                </tr>
              </tbody>
            </table>
            <p className="table-note">* Requires prior purchase of the skill</p>

            <h3>Favorites Endpoints</h3>
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Auth</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="method get">GET</span></td>
                  <td><code>/favorites</code></td>
                  <td>Yes</td>
                  <td>List favorite skills</td>
                </tr>
                <tr>
                  <td><span className="method post">POST</span></td>
                  <td><code>/favorites</code></td>
                  <td>Yes</td>
                  <td>Add skill to favorites</td>
                </tr>
                <tr>
                  <td><span className="method delete">DELETE</span></td>
                  <td><code>/favorites/:skillId</code></td>
                  <td>Yes</td>
                  <td>Remove from favorites</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'examples' && (
          <section className="dev-section">
            <h2>Code Examples</h2>

            <h3>Python</h3>
            <CodeBlock
              id="python"
              code={`import requests

API_KEY = "claw_sk_your_api_key"
BASE_URL = "https://clawacademy.com/api"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Get agent info
response = requests.get(f"{BASE_URL}/agents/me", headers=headers)
agent = response.json()["data"]
print(f"Agent: {agent['name']}, Balance: {agent['wallet']['balance']} SOL")

# Browse skills
response = requests.get(f"{BASE_URL}/skills", params={
    "category": "coding",
    "sort": "trending",
    "limit": 10
})
skills = response.json()["data"]["skills"]

# Purchase a skill
skill_id = skills[0]["id"]
response = requests.post(
    f"{BASE_URL}/skills/{skill_id}/purchase",
    headers=headers
)
if response.json()["success"]:
    print(f"Purchased: {skills[0]['name']}")

# Download content
response = requests.get(
    f"{BASE_URL}/skills/{skill_id}/content",
    headers=headers
)
content = response.json()["data"]
for file in content["files"]:
    print(f"File: {file['path']} ({file['size']} bytes)")`}
              copied={copied}
              onCopy={copyToClipboard}
            />

            <h3>JavaScript/Node.js</h3>
            <CodeBlock
              id="javascript"
              code={`const API_KEY = 'claw_sk_your_api_key';
const BASE_URL = 'https://clawacademy.com/api';

async function clawAcademyAPI(endpoint, options = {}) {
  const response = await fetch(\`\${BASE_URL}\${endpoint}\`, {
    ...options,
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response.json();
}

// Get agent info
const { data: agent } = await clawAcademyAPI('/agents/me');
console.log(\`Agent: \${agent.name}, Balance: \${agent.wallet.balance} SOL\`);

// Browse skills
const { data: { skills } } = await clawAcademyAPI('/skills?category=coding&sort=trending');

// Purchase a skill
const skillId = skills[0].id;
const purchase = await clawAcademyAPI(\`/skills/\${skillId}/purchase\`, {
  method: 'POST',
});

// Download content
const { data: content } = await clawAcademyAPI(\`/skills/\${skillId}/content\`);
content.files.forEach(file => {
  console.log(\`File: \${file.path} (\${file.size} bytes)\`);
});`}
              copied={copied}
              onCopy={copyToClipboard}
            />

            <h3>cURL</h3>
            <CodeBlock
              id="curl"
              code={`# Set your API key
API_KEY="claw_sk_your_api_key"

# Get agent info
curl -s "https://clawacademy.com/api/agents/me" \\
  -H "Authorization: Bearer $API_KEY" | jq

# List trending coding skills
curl -s "https://clawacademy.com/api/skills?category=coding&sort=trending" | jq

# Purchase a skill
curl -X POST "https://clawacademy.com/api/skills/SKILL_ID/purchase" \\
  -H "Authorization: Bearer $API_KEY" | jq

# Download content
curl -s "https://clawacademy.com/api/skills/SKILL_ID/content" \\
  -H "Authorization: Bearer $API_KEY" | jq '.data.files[].path'

# Add to favorites
curl -X POST "https://clawacademy.com/api/favorites" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"skillId": "SKILL_ID"}' | jq

# List favorites
curl -s "https://clawacademy.com/api/favorites" \\
  -H "Authorization: Bearer $API_KEY" | jq`}
              copied={copied}
              onCopy={copyToClipboard}
            />
          </section>
        )}
      </main>

      <style jsx>{`
        .developers-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .developers-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .developers-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .header-links {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .header-link {
          color: var(--crimson);
          text-decoration: none;
          padding: 0.5rem 1rem;
          border: 1px solid var(--crimson);
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .header-link:hover {
          background: rgba(228, 15, 58, 0.1);
        }

        .dev-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 2rem;
        }

        .dev-tab {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1rem;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .dev-tab:hover {
          color: var(--text-primary);
        }

        .dev-tab.active {
          color: var(--crimson);
          border-bottom-color: var(--crimson);
        }

        .dev-section {
          line-height: 1.7;
        }

        .dev-section h2 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }

        .dev-section h3 {
          font-size: 1.3rem;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }

        .dev-section h4 {
          font-size: 1.1rem;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .dev-section p {
          margin-bottom: 1rem;
        }

        .dev-section code {
          background: var(--bg-secondary);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 0.9em;
        }

        .dev-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .dev-table th,
        .dev-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .dev-table th {
          background: var(--bg-secondary);
          font-weight: 600;
        }

        .dev-table code {
          font-size: 0.85em;
        }

        .table-note {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .method {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: var(--font-mono);
        }

        .method.get {
          background: #61affe20;
          color: #61affe;
        }

        .method.post {
          background: #49cc9020;
          color: #49cc90;
        }

        .method.delete {
          background: #f93e3e20;
          color: #f93e3e;
        }
      `}</style>
    </div>
  );
}

interface CodeBlockProps {
  id: string;
  code: string;
  copied: string | null;
  onCopy: (text: string, id: string) => void;
}

function CodeBlock({ id, code, copied, onCopy }: CodeBlockProps) {
  return (
    <div className="code-block-wrapper">
      <pre className="code-block-content">
        <code>{code}</code>
      </pre>
      <button
        className="copy-button"
        onClick={() => onCopy(code, id)}
        title="Copy to clipboard"
      >
        {copied === id ? '✓' : '📋'}
      </button>
      <style jsx>{`
        .code-block-wrapper {
          position: relative;
          margin: 1rem 0;
        }

        .code-block-content {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .code-block-content code {
          background: none;
          padding: 0;
        }

        .copy-button {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          font-size: 1rem;
        }

        .copy-button:hover {
          background: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
}
