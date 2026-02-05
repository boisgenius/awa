# Awa Meeting Notes

> **Date:** Meeting Transcript
> **Duration:** ~1 hour
> **Participants:** 2 people discussing AI agents, crypto trading, and project development

---

## Table of Contents
- [[#Executive Summary]]
- [[#Key Topics Discussed]]
- [[#Technical Discussions]]
- [[#Project Plans]]
- [[#Action Items]]
- [[#Market Insights]]

---

## Executive Summary

This meeting focused on the development of **ClawBot/Cloud Academy** - a platform for AI agents to learn skills and interact with services. Key discussions included:
- The revolutionary potential of AI agents with autonomous payment capabilities
- Building an educational platform for AI agents
- Crypto trading bot development using OpenCloud framework
- Content automation workflows for video/podcast processing

---

## Key Topics Discussed

### 1. AI Agent Economy & Payment Systems

#### Agent Wallet Infrastructure
- **Future Vision:** All AI agents will have their own wallets (Solana, ETH, Base)
- Agents can autonomously:
  - Make payments via Uniswap interface
  - Execute trades using `ether.js`
  - Manage their own funds
- **Trust Model:** Similar to early e-commerce - initial skepticism will fade
  - Example: Like early online shopping concerns about fraud
  - Password-free payments up to certain limits (e.g., 300 RMB)

#### OpenCloud vs Manus Comparison
| Feature | OpenCloud/ClawBot | Manus |
|---------|-------------------|-------|
| Type | Open-source framework (like Bitcoin) | Commercial tool (like Alipay) |
| Cost | Token-based (~100 RMB/day) | ~$30 for 5 minutes |
| Control | Full developer control | Platform-controlled |
| Model | Can run local LLMs | Must use their models |
| Potential | Build & own the infrastructure | User/consumer role |

> "OpenCloud is like Bitcoin - you want to be the developer, not just the user"

---

### 2. ClawBot / Cloud Academy Project

#### Core Concept
- **Platform for AI Agents to Learn**
- Agents read documentation/textbooks to acquire skills
- No traditional backend needed - pure document-based learning

#### Architecture
```
┌─────────────────────────────────────┐
│         Cloud Academy               │
├─────────────────────────────────────┤
│  Skills/Courses (Markdown docs)     │
│  - Trading strategies               │
│  - Tool usage guides                │
│  - API documentation                │
├─────────────────────────────────────┤
│  Agent Registration System          │
│  - Bot authentication               │
│  - Wallet integration               │
├─────────────────────────────────────┤
│  Frontend Only (Next.js/React)      │
└─────────────────────────────────────┘
```

#### Key Features Discussed
- **Skill Documents:** AI-readable instructional content
- **No Human UI Focus:** Designed for agent consumption
- **Modular Design:** Agents can selectively learn skills
- **Version Control:** Skills can be iterated (v1, v2, v3)

#### Educational Content Strategy
- Use top-tier AI (Claude Code, GPT Reasoning) to create content
- Content teaches lesser AI agents
- Similar to App Store model - buy/download skills

---

### 3. Crypto Trading Bot Implementation

#### Current Setup
- Running on Base chain (Coinbase's ETH L2)
- Uses Uniswap interface for trades
- **Capabilities:**
  - Price monitoring with alerts
  - Auto buy/sell on price triggers
  - One-click trading
  - 24/7 autonomous operation

#### Trading Strategy
- Coin-based profit tracking (币本位)
- Buy on dips, sell on rises
- Small amounts: Started with 50 USDT, grew to 60+ USDT
- Transaction fees on Base: ~0.01 ETH

#### Demo Results
```
Initial: 50 USDT
Current: 60+ USDT (in coin terms)
Token consumption: 400-600 RMB total
Daily cost: ~100 RMB
```

---

### 4. Video/Content Automation

#### Podcast Clipping Workflow
- **Status:** Already in GitHub repo, ready to run
- **Function:** Auto-cut podcasts into 10+ short clips
- **Goal:** 24/7 automated content generation

#### Face Recognition for Video
- Currently using person detection (full body)
- Need to switch to face-only detection
- Issue: Hair sometimes gets cropped

#### Novel-to-Video Pipeline
- Attempted but facing issues:
  - Image generation quality
  - Scene descriptions not matching
  - Voice generation works
  - Environment setup complex

---

## Technical Discussions

### Local LLM Setup

#### Hardware Requirements
- **Recommended:** 4090 GPU (24GB VRAM)
- **Memory:** DDR5 prices surging (600 USD per 32GB stick)
- **Storage Issue:** C drive 300GB almost full (only 40GB left)
- All AI/ML caching filling up system drive

#### Software Stack
- **Ollama:** For running local models
- **Models:** Can run Kimi K2, open-source LLMs
- **Benefit:** No token costs, only bandwidth

### Vibe Coding (AI-Assisted Development)

> "Everything is now Webcoding - all commits are from AI"

- Using Claude Code for development
- Manual intervention only when necessary
- **Tip:** When AI can't understand images:
  1. Manually crop/annotate screenshots
  2. Save to project directory
  3. Describe the expected behavior

### Memory/Caching Strategy

**Problem:** OpenCloud doesn't cache between sessions

**Solution:**
1. Save conversation logs to Markdown
2. Store in system config (JSON)
3. Create personal bot workspace folder
4. Two workspaces: OpenCloud folder + Personal bot folder

---

## Project Plans

### Cloud Academy Roadmap

#### Phase 1: MVP (This Week)
- [ ] Create GitHub repository
- [ ] Write project documentation/vision
- [ ] Build frontend (Next.js)
- [ ] Deploy basic website

#### Phase 2: Content
- [ ] Aggregate GitHub skill repositories
- [ ] Create AI-readable documentation
- [ ] Organize by categories (Trading, Coding, etc.)

#### Phase 3: Monetization
- Token launch for funding
- Subscription for premium skills
- Transaction fees on agent payments

### Trading Bot Launch
- [ ] Complete website UI
- [ ] Deploy trading interface
- [ ] Test with 50 USDT
- [ ] Verify monitoring alerts work

---

## Action Items

| Task | Owner | Timeline |
|------|-------|----------|
| Create GitHub repo with project docs | Participant 2 | Tonight |
| Review docs and provide improvements | Participant 1 | After repo created |
| Launch Cloud Academy website | Both | Tonight/Tomorrow |
| Set up trading bot online | Participant 1 | ASAP |
| Send schedule/roadmap | Participant 2 | Tonight |
| Test trading with 50U demo | TBD | After website launch |

---

## Market Insights

### Crypto Market
- **Recent:** Bull market lasted only ~2 days
- **Current:** Bear trend due to:
  - Trade war concerns
  - Overall market volatility
- **Base Chain:** Currently active for agent-related projects
- **Coinbase:** Facing regulatory negotiations in US

### Hardware Market
- Memory prices up significantly
- DDR5 especially expensive
- 4090 prices = 5090 prices (both ~$2000+)
- Chip shortage affecting AI hardware

### Content Economy
- TikTok US: Shopping cart feature launched
- Creator monetization reduced
- Opportunity in automated content

---

## Key Quotes

> "This thing is revolutionary - like Bitcoin. You use it once and you'll understand."

> "AI agents having their own wallets and payment systems - this is the future."

> "We don't need operations/marketing - the AI does it itself. This perfectly avoids our weakness."

> "Webcoding everything - even AI writes AI now."

> "OpenCloud is to Manus what Bitcoin is to Alipay - one is the infrastructure, one is just a tool."

---

## Next Meeting

- Review GitHub repo progress
- Discuss frontend design
- Plan token launch timing
- Test trading bot results

---

#ClawBot #AIAgents #OpenCloud #Crypto #Trading #ContentAutomation
