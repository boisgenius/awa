// AWA - AI Agent Ecosystem
// Interactive JavaScript

// Agent Data
const agents = [
    {
        id: 1,
        name: "AlphaTrader",
        category: "Trading Bot",
        emoji: "🤖",
        gradient: "linear-gradient(135deg, #FF6B00, #FF8533)",
        description: "Autonomous trading agent with advanced market analysis and DeFi integration. Optimized for SOL pairs.",
        status: "live",
        priority: "high",
        priorityLabel: "HIGH ROI",
        website: "#",
        github: "#",
        change: "+127.4%",
        positive: true,
        starred: false
    },
    {
        id: 2,
        name: "ArtisanAI",
        category: "Creative Agent",
        emoji: "🎨",
        gradient: "linear-gradient(135deg, #7C3AED, #A855F7)",
        description: "AI-powered generative art agent. Creates unique NFT collections and manages on-chain art galleries.",
        status: "live",
        priority: "emerging",
        priorityLabel: "EMERGING",
        website: "#",
        github: null,
        change: "+42.8%",
        positive: true,
        starred: true
    },
    {
        id: 3,
        name: "DataMiner",
        category: "Analytics Agent",
        emoji: "📊",
        gradient: "linear-gradient(135deg, #00FF88, #00CC6A)",
        description: "On-chain analytics and whale tracking agent. Provides real-time insights and market intelligence.",
        status: "dev",
        priority: "medium",
        priorityLabel: "MEDIUM",
        website: null,
        github: "#",
        change: "Coming Soon",
        positive: null,
        starred: false
    },
    {
        id: 4,
        name: "GameMaster",
        category: "Gaming Agent",
        emoji: "🎮",
        gradient: "linear-gradient(135deg, #FF4757, #FF6B81)",
        description: "Autonomous gaming agent for on-chain games. Competes in tournaments and earns rewards automatically.",
        status: "live",
        priority: "medium",
        priorityLabel: "ACTIVE",
        website: "#",
        github: "#",
        change: "-8.2%",
        positive: false,
        starred: false
    },
    {
        id: 5,
        name: "SocialPulse",
        category: "Social Agent",
        emoji: "💬",
        gradient: "linear-gradient(135deg, #FFD93D, #FFC107)",
        description: "Social media management agent. Automates engagement, content creation, and community building.",
        status: "live",
        priority: "high",
        priorityLabel: "TRENDING",
        website: "#",
        github: null,
        change: "+89.1%",
        positive: true,
        starred: false
    },
    {
        id: 6,
        name: "FlashArb",
        category: "DeFi Agent",
        emoji: "⚡",
        gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)",
        description: "Lightning-fast arbitrage agent optimized for cross-chain opportunities. MEV-protected execution.",
        status: "live",
        priority: "high",
        priorityLabel: "TOP EARNER",
        website: "#",
        github: "#",
        change: "+234.7%",
        positive: true,
        starred: false
    }
];

// Leaderboard data
const leaderboardData = [
    { rank: 1, name: "AlphaTrader", emoji: "🤖", gradient: "linear-gradient(135deg, #FF6B00, #FF8533)", category: "Trading", floor: "2.34", change24h: "+12.4%", change24hPos: true, change7d: "+127.4%", change7dPos: true, volume: "1,234.56", holders: "2,847", verified: true },
    { rank: 2, name: "FlashArb", emoji: "⚡", gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)", category: "DeFi", floor: "1.87", change24h: "+8.7%", change24hPos: true, change7d: "+234.7%", change7dPos: true, volume: "987.32", holders: "1,923", verified: true },
    { rank: 3, name: "SocialPulse", emoji: "💬", gradient: "linear-gradient(135deg, #FFD93D, #FFC107)", category: "Social", floor: "0.98", change24h: "+15.2%", change24hPos: true, change7d: "+89.1%", change7dPos: true, volume: "678.45", holders: "3,421", verified: false },
    { rank: 4, name: "ArtisanAI", emoji: "🎨", gradient: "linear-gradient(135deg, #7C3AED, #A855F7)", category: "Creative", floor: "0.76", change24h: "-2.3%", change24hPos: false, change7d: "+42.8%", change7dPos: true, volume: "456.78", holders: "1,567", verified: false },
    { rank: 5, name: "GameMaster", emoji: "🎮", gradient: "linear-gradient(135deg, #FF4757, #FF6B81)", category: "Gaming", floor: "0.54", change24h: "-5.4%", change24hPos: false, change7d: "-8.2%", change7dPos: false, volume: "234.12", holders: "987", verified: false }
];

// SVG Icons
const icons = {
    star: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    starFilled: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    external: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    github: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>`,
    verified: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#00FF88"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>`
};

// Render Agent Card
function renderAgentCard(agent) {
    const statusBadge = agent.status === 'live' ? 'badge-live' : 'badge-dev';
    const statusText = agent.status === 'live' ? 'LIVE' : 'IN DEV';
    
    let priorityClass = 'badge-priority-medium';
    if (agent.priority === 'high') priorityClass = 'badge-priority-high';
    if (agent.priority === 'emerging') priorityClass = 'badge-emerging';
    
    let changeClass = 'stat-neutral';
    if (agent.positive === true) changeClass = 'stat-positive';
    if (agent.positive === false) changeClass = 'stat-negative';
    
    const links = [];
    if (agent.website) {
        links.push(`<a href="${agent.website}" class="link-btn">${icons.external} Website</a>`);
    }
    if (agent.github) {
        links.push(`<a href="${agent.github}" class="link-btn">${icons.github} GitHub</a>`);
    }
    
    return `
        <article class="agent-card" data-id="${agent.id}">
            <div class="card-header">
                <div class="agent-avatar" style="background: ${agent.gradient};">
                    <span>${agent.emoji}</span>
                </div>
                <button class="star-btn ${agent.starred ? 'starred' : ''}" data-id="${agent.id}" aria-label="Toggle favorite">
                    ${agent.starred ? icons.starFilled : icons.star}
                </button>
            </div>
            <h3 class="agent-name">${agent.name}</h3>
            <span class="agent-category">${agent.category}</span>
            <p class="agent-description">${agent.description}</p>
            <div class="agent-badges">
                <span class="badge ${statusBadge}">${statusText}</span>
                <span class="badge ${priorityClass}">${agent.priorityLabel}</span>
            </div>
            <div class="card-footer">
                <div class="agent-links">${links.join('')}</div>
                <div class="agent-stats">
                    <span class="${changeClass}">${agent.change}</span>
                </div>
            </div>
        </article>
    `;
}

// Render Leaderboard Table
function renderLeaderboard() {
    const rows = leaderboardData.map(item => `
        <tr>
            <td class="td-rank">${item.rank}</td>
            <td class="td-agent">
                <div class="agent-cell">
                    <div class="mini-avatar" style="background: ${item.gradient};">${item.emoji}</div>
                    <span>${item.name}</span>
                    ${item.verified ? icons.verified : ''}
                </div>
            </td>
            <td class="td-category">${item.category}</td>
            <td class="td-floor"><span class="mono">${item.floor}</span> SOL</td>
            <td class="td-change ${item.change24hPos ? 'positive' : 'negative'}">${item.change24h}</td>
            <td class="td-change ${item.change7dPos ? 'positive' : 'negative'}">${item.change7d}</td>
            <td class="td-volume"><span class="mono">${item.volume}</span> SOL</td>
            <td class="td-owners"><span class="mono">${item.holders}</span></td>
        </tr>
    `).join('');

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th class="th-rank">#</th>
                    <th class="th-agent">AGENT</th>
                    <th class="th-category">CATEGORY</th>
                    <th class="th-floor">FLOOR</th>
                    <th class="th-change">24H</th>
                    <th class="th-change">7D</th>
                    <th class="th-volume">VOLUME</th>
                    <th class="th-owners">HOLDERS</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Render agent cards
    const cardsContainer = document.getElementById('cards');
    if (cardsContainer) {
        cardsContainer.innerHTML = agents.map(renderAgentCard).join('');
    }

    // Render leaderboard
    const tableContainer = document.getElementById('table');
    if (tableContainer) {
        tableContainer.innerHTML = renderLeaderboard();
    }

    // Star button handlers
    document.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const agent = agents.find(a => a.id === id);
            if (agent) {
                agent.starred = !agent.starred;
                btn.classList.toggle('starred');
                btn.innerHTML = agent.starred ? icons.starFilled : icons.star;
            }
        });
    });

    // Filter pills
    document.querySelectorAll('.filter-pills .pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    // Time pills
    document.querySelectorAll('.time-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.time-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    // Mobile nav
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = agents.filter(agent => 
                agent.name.toLowerCase().includes(query) ||
                agent.category.toLowerCase().includes(query) ||
                agent.description.toLowerCase().includes(query)
            );
            if (cardsContainer) {
                cardsContainer.innerHTML = filtered.map(renderAgentCard).join('');
                // Re-attach star handlers
                document.querySelectorAll('.star-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = parseInt(btn.dataset.id);
                        const agent = agents.find(a => a.id === id);
                        if (agent) {
                            agent.starred = !agent.starred;
                            btn.classList.toggle('starred');
                            btn.innerHTML = agent.starred ? icons.starFilled : icons.star;
                        }
                    });
                });
            }
        });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Number animations on viewport enter
    const animateNumbers = () => {
        const stats = document.querySelectorAll('.stat-value');
        stats.forEach(stat => {
            const text = stat.textContent;
            if (text.includes(',') || text.includes('$')) {
                // Already formatted, animate opacity
                stat.style.opacity = '0';
                setTimeout(() => {
                    stat.style.transition = 'opacity 0.5s ease';
                    stat.style.opacity = '1';
                }, 200);
            }
        });
    };

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.agent-card, .hero-stats').forEach(el => {
        observer.observe(el);
    });

    // Connect button handler
    const connectBtn = document.querySelector('.connect-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            // Placeholder for wallet connection
            connectBtn.textContent = 'Connecting...';
            setTimeout(() => {
                connectBtn.innerHTML = '0x1234...5678';
                connectBtn.style.background = 'var(--bg-tertiary)';
            }, 1500);
        });
    }

    console.log('🚀 AWA Agent Ecosystem initialized');
});
