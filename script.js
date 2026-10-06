document.addEventListener('DOMContentLoaded', () => {
    console.log('SQL-powered NHL Playoff Team Stats initialized');

    // ===== PLAYOFF FIELD SIZE LOOKUP (confirmed 1918–present) =====
    function getPlayoffFieldSize(year) {
        if (year >= 1980) return 16;
        if (year >= 1975) return 12;
        if (year >= 1968) return 8;
        if (year >= 1943) return 4;
        if (year >= 1927) return 6;
        if (year === 1926) return 3;
        if (year >= 1918) return 2;
        return 16;
    }

    const teamNames = {
        'AFM': 'Atlanta Flames', 'ANA': 'Anaheim Ducks', 'ARI': 'Arizona Coyotes',
        'ATL': 'Atlanta Thrashers', 'BOS': 'Boston Bruins', 'BRK': 'Brooklyn Americans',
        'BUF': 'Buffalo Sabres', 'CAR': 'Carolina Hurricanes', 'CBJ': 'Columbus Blue Jackets',
        'CGS': 'California Golden Seals', 'CGY': 'Calgary Flames', 'CHI': 'Chicago Blackhawks',
        'CLE': 'Cleveland Barons', 'CLR': 'Colorado Rockies', 'COL': 'Colorado Avalanche',
        'DAL': 'Dallas Stars', 'DCG': 'Detroit Cougars', 'DET': 'Detroit Red Wings',
        'DFL': 'Detroit Falcons', 'EDM': 'Edmonton Oilers', 'FLA': 'Florida Panthers',
        'HAM': 'Hamilton Tigers', 'HFD': 'Hartford Whalers', 'KCS': 'Kansas City Scouts',
        'LAK': 'Los Angeles Kings', 'MIN': 'Minnesota Wild', 'MMR': 'Montreal Maroons',
        'MNS': 'Minnesota North Stars', 'MTL': 'Montreal Canadiens', 'MWN': 'Montreal Wanderers',
        'NJD': 'New Jersey Devils', 'NSH': 'Nashville Predators', 'NYA': 'New York Americans',
        'NYI': 'New York Islanders', 'NYR': 'New York Rangers', 'OAK': 'Oakland Seals',
        'OTT': 'Ottawa Senators', 'PHI': 'Philadelphia Flyers', 'PHX': 'Phoenix Coyotes',
        'PIR': 'Pittsburgh Pirates', 'PIT': 'Pittsburgh Penguins', 'QBD': 'Quebec Bulldogs',
        'QUA': 'Philadelphia Quakers', 'QUE': 'Quebec Nordiques', 'SEA': 'Seattle Kraken',
        'SEN': 'Ottawa Senators (Original)', 'SJS': 'San Jose Sharks', 'SLE': 'St. Louis Eagles',
        'STL': 'St. Louis Blues', 'TAN': 'Toronto Arenas', 'TBL': 'Tampa Bay Lightning',
        'TOR': 'Toronto Maple Leafs', 'TSP': 'Toronto St. Patricks', 'UTA': 'Utah Mammoth',
        'VAN': 'Vancouver Canucks', 'VGK': 'Vegas Golden Knights', 'WIN': 'Winnipeg Jets (Original)',
        'WPG': 'Winnipeg Jets', 'WSH': 'Washington Capitals'
    };

    // ===== FRANCHISE CONTINUITY =====
    // Policy:
    //   • Exactly 32 entries — one per current active NHL team.
    //   • Include predecessor abbreviations only when records continuously transfer.
    //   • Utah is treated as expansion (NHL official position) — not linked to ARI/WIN.
    //   • MDA is not present in this dataset; ANA is current-only.
    // Label format (consistent): "ABB · Full Official Name"
    // Keys sorted alphabetically by abbreviation.
    const FRANCHISES = {
        ANA: {
            name: "Anaheim Ducks",
            members: ["ANA"],
            label: "ANA · Anaheim Ducks"
        },
        BOS: {
            name: "Boston Bruins",
            members: ["BOS"],
            label: "BOS · Boston Bruins"
        },
        BUF: {
            name: "Buffalo Sabres",
            members: ["BUF"],
            label: "BUF · Buffalo Sabres"
        },
        CAR: {
            name: "Carolina Hurricanes",
            members: ["HFD", "CAR"],
            label: "CAR · Carolina Hurricanes"
        },
        CBJ: {
            name: "Columbus Blue Jackets",
            members: ["CBJ"],
            label: "CBJ · Columbus Blue Jackets"
        },
        CGY: {
            name: "Calgary Flames",
            members: ["AFM", "CGY"],
            label: "CGY · Calgary Flames"
        },
        CHI: {
            name: "Chicago Blackhawks",
            members: ["CHI"],
            label: "CHI · Chicago Blackhawks"
        },
        COL: {
            name: "Colorado Avalanche",
            members: ["QUE", "COL"],
            label: "COL · Colorado Avalanche"
        },
        DAL: {
            name: "Dallas Stars",
            members: ["MNS", "DAL"],
            label: "DAL · Dallas Stars"
        },
        DET: {
            name: "Detroit Red Wings",
            members: ["DCG", "DFL", "DET"],
            label: "DET · Detroit Red Wings"
        },
        EDM: {
            name: "Edmonton Oilers",
            members: ["EDM"],
            label: "EDM · Edmonton Oilers"
        },
        FLA: {
            name: "Florida Panthers",
            members: ["FLA"],
            label: "FLA · Florida Panthers"
        },
        LAK: {
            name: "Los Angeles Kings",
            members: ["LAK"],
            label: "LAK · Los Angeles Kings"
        },
        MIN: {
            name: "Minnesota Wild",
            members: ["MIN"],
            label: "MIN · Minnesota Wild"
        },
        MTL: {
            name: "Montreal Canadiens",
            members: ["MTL"],
            label: "MTL · Montreal Canadiens"
        },
        NJD: {
            name: "New Jersey Devils",
            members: ["KCS", "CLR", "NJD"],
            label: "NJD · New Jersey Devils"
        },
        NSH: {
            name: "Nashville Predators",
            members: ["NSH"],
            label: "NSH · Nashville Predators"
        },
        NYI: {
            name: "New York Islanders",
            members: ["NYI"],
            label: "NYI · New York Islanders"
        },
        NYR: {
            name: "New York Rangers",
            members: ["NYR"],
            label: "NYR · New York Rangers"
        },
        OTT: {
            name: "Ottawa Senators",
            members: ["OTT"],
            label: "OTT · Ottawa Senators"
        },
        PHI: {
            name: "Philadelphia Flyers",
            members: ["PHI"],
            label: "PHI · Philadelphia Flyers"
        },
        PIT: {
            name: "Pittsburgh Penguins",
            members: ["PIT"],
            label: "PIT · Pittsburgh Penguins"
        },
        SEA: {
            name: "Seattle Kraken",
            members: ["SEA"],
            label: "SEA · Seattle Kraken"
        },
        SJS: {
            name: "San Jose Sharks",
            members: ["SJS"],
            label: "SJS · San Jose Sharks"
        },
        STL: {
            name: "St. Louis Blues",
            members: ["STL"],
            label: "STL · St. Louis Blues"
        },
        TBL: {
            name: "Tampa Bay Lightning",
            members: ["TBL"],
            label: "TBL · Tampa Bay Lightning"
        },
        TOR: {
            name: "Toronto Maple Leafs",
            members: ["TAN", "TSP", "TOR"],
            label: "TOR · Toronto Maple Leafs"
        },
        UTA: {
            name: "Utah Mammoth",
            members: ["UTA"],
            label: "UTA · Utah Mammoth"
        },
        VAN: {
            name: "Vancouver Canucks",
            members: ["VAN"],
            label: "VAN · Vancouver Canucks"
        },
        VGK: {
            name: "Vegas Golden Knights",
            members: ["VGK"],
            label: "VGK · Vegas Golden Knights"
        },
        WPG: {
            name: "Winnipeg Jets",
            members: ["ATL", "WPG"],
            label: "WPG · Winnipeg Jets"
        },
        WSH: {
            name: "Washington Capitals",
            members: ["WSH"],
            label: "WSH · Washington Capitals"
        }
    };

    // Defunct lines stay separate from the 32 current franchises.
    // OAK/CGS/CLE are not folded into DAL. WIN is not added to WPG.
    // SEN is not connected to OTT. HAM is not connected to NYA.
    const HISTORICAL_FRANCHISES = {
        WIN: { name: "Winnipeg Jets (original) → Arizona Coyotes", members: ["WIN", "PHX", "ARI"], label: "WIN · Original Jets → Coyotes" },
        CLE: { name: "Oakland Seals → Cleveland Barons", members: ["OAK", "CGS", "CLE"], label: "CLE · Seals → Barons (merged into North Stars, 1978)" },
        HAM: { name: "Quebec Bulldogs → Hamilton Tigers", members: ["QBD", "HAM"], label: "HAM · Bulldogs → Tigers" },
        PIR: { name: "Pittsburgh Pirates → Philadelphia Quakers", members: ["PIR", "QUA"], label: "PIR · Pirates → Quakers" },
        NYA: { name: "New York Americans → Brooklyn Americans", members: ["NYA", "BRK"], label: "NYA · Americans" },
        SEN: { name: "Ottawa Senators (original) → St. Louis Eagles", members: ["SEN", "SLE"], label: "SEN · Original Senators → Eagles" },
        MMR: { name: "Montreal Maroons", members: ["MMR"], label: "MMR · Montreal Maroons" },
        MWN: { name: "Montreal Wanderers", members: ["MWN"], label: "MWN · Montreal Wanderers" }
    };

    const CURRENT_TEAM_ABBRS = Object.keys(FRANCHISES);

    function franchiseByKey(key) {
        return FRANCHISES[key] || HISTORICAL_FRANCHISES[key];
    }

    let data = {};
    let teamColors = {}, teamSecondaryColors = {}, teamTertiaryColors = {};
    let teamQuaternaryColors = {}, teamQuinaryColors = {};
    let uniqueLogos = {};
    let seasonsByAbbr = null;
    let sortColumn = 'year';
    let sortDirection = 'desc';
    let db = null;

    const defaultColors = { c1: '#111111', c2: '#A4A9AD', c3: '#A4A9AD', c4: '#111111', c5: '#A4A9AD' };

    function hexToRgb(hex) {
        const n = parseInt(hex.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function rgbToHex(r, g, b) {
        const h = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
        return `#${h(r)}${h(g)}${h(b)}`;
    }

    function mixHex(a, b, weightB) {
        const [ar, ag, ab] = hexToRgb(a);
        const [br, bg, bb] = hexToRgb(b);
        const t = weightB;
        return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
    }

    function channelLuminance(c) {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    }

    function relativeLuminance(hex) {
        const [r, g, b] = hexToRgb(hex);
        return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
    }

    function contrastRatio(a, b) {
        const l1 = relativeLuminance(a);
        const l2 = relativeLuminance(b);
        const hi = Math.max(l1, l2);
        const lo = Math.min(l1, l2);
        return (hi + 0.05) / (lo + 0.05);
    }

    function validHex(value, fallback) {
        return (value && /^#[0-9A-F]{6}$/i.test(value)) ? value : fallback;
    }

    // Near-white team colors disappear on white cards.
    // Darken only those, and only toward neutral black, so the hue family stays.
    function paintOnLight(hex) {
        if (contrastRatio(hex, '#ffffff') >= 1.4) return hex;
        let color = hex;
        for (let step = 1; step <= 8; step++) {
            color = mixHex(hex, '#1a1a1a', step / 10);
            if (contrastRatio(color, '#ffffff') >= 2.2) return color;
        }
        return color;
    }

    // Secondary text on the primary bar. White only when secondary is too close.
    function barTextColor(secondary, primary) {
        return contrastRatio(secondary, primary) < 3 ? '#ffffff' : secondary;
    }

    // Scrollbar thumb hover stays in the secondary family and still shifts.
    function scrollThumbHover(secondary) {
        const toward = relativeLuminance(secondary) > 0.45 ? '#101010' : '#ffffff';
        return mixHex(secondary, toward, 0.3);
    }

    function strokeOnFill(stroke, fill) {
        return contrastRatio(stroke, fill) >= 1.6 ? stroke : paintOnLight(stroke);
    }

    // Prefer tertiary for xGF%. Use quaternary when tertiary matches the PTS% line.
    function xgfLineColor(tertiary, quaternary, secondary) {
        if (tertiary.toLowerCase() !== secondary.toLowerCase()) return tertiary;
        return quaternary;
    }

    function resolveTeamColors(abbr) {
        return {
            primary: validHex(teamColors[abbr], defaultColors.c1),
            secondary: validHex(teamSecondaryColors[abbr], defaultColors.c2),
            tertiary: validHex(teamTertiaryColors[abbr], defaultColors.c3),
            quaternary: validHex(teamQuaternaryColors[abbr], defaultColors.c4),
            quinary: validHex(teamQuinaryColors[abbr], defaultColors.c5)
        };
    }

    function applyTeamChrome(primary, secondary) {
        const pageBg = primary;
        const barText = barTextColor(secondary, primary);
        const ink = paintOnLight(secondary);
        const root = document.documentElement;
        root.style.setProperty('--page-bg', pageBg);
        root.style.setProperty('--team-c1', primary);
        root.style.setProperty('--team-c2', secondary);
        root.style.setProperty('--team-c2-ink', ink);
        root.style.setProperty('--team-bar-text', barText);
        root.style.setProperty('--team-scroll-thumb', secondary);
        root.style.setProperty('--team-scroll-thumb-hover', scrollThumbHover(secondary));
        document.body.style.backgroundColor = pageBg;
        const teamHeaderEl = document.querySelector('.team-header');
        if (teamHeaderEl) {
            teamHeaderEl.style.backgroundColor = primary;
            teamHeaderEl.style.color = barText;
        }
        const title = document.querySelector('h1.header');
        if (title) title.style.color = barText;
        return { pageBg, barText, ink };
    }

    function datasetHasPoint(data) {
        if (!Array.isArray(data)) return false;
        return data.some(v => {
            if (v == null || v === '') return false;
            if (typeof v === 'object') {
                return [v.x, v.y].some(n => n != null && n !== '' && !isNaN(Number(n)));
            }
            return !isNaN(Number(v));
        });
    }

    function setChartCardVisible(id, visible) {
        const canvas = document.getElementById(id);
        const card = canvas ? canvas.closest('.chart') : null;
        if (!card) return false;
        card.hidden = false;
        if (!visible) {
            const existing = typeof Chart !== 'undefined' ? Chart.getChart(canvas) : null;
            if (existing) existing.destroy();
            card.style.display = 'none';
            return false;
        }
        card.style.display = '';
        return true;
    }

    function publishChart(id, chart) {
        const datasets = chart && chart.data ? chart.data.datasets : null;
        if (!chart || !Array.isArray(datasets) || !datasets.some(ds => datasetHasPoint(ds.data))) {
            if (chart) chart.destroy();
            setChartCardVisible(id, false);
            return false;
        }
        return true;
    }

    function setAdvancedGroupVisible(visible) {
        const table = document.getElementById('teamDataTable');
        if (!table) return;
        table.classList.toggle('no-advanced', !visible);
    }

    function hasNumber(rows, key) {
        return rows.some(r => r[key] != null && r[key] !== '' && !isNaN(Number(r[key])));
    }
    // Files live next to this page. GitHub project pages are served from
    // /<repo>/, and that prefix changes when the repository is renamed, so
    // derive it from the current URL instead of a hardcoded repo name.
    function siteBase() {
        let path = window.location.pathname || '/';
        const last = path.split('/').pop() || '';
        if (!path.endsWith('/')) {
            path = /\.[a-z0-9]+$/i.test(last) ? path.slice(0, path.length - last.length) : `${path}/`;
        }
        return path.endsWith('/') ? path : `${path}/`;
    }
    const basePaths = [siteBase(), './'];

    async function tryFetch(filePath, paths = basePaths) {
        for (const base of paths) {
            const url = `${base}${filePath}`;
            try {
                const response = await fetch(url);
                if (response.ok) {
                    if (!window.basePath) window.basePath = base;
                    return { response, base };
                }
            } catch (e) {}
        }
        return null;
    }

    function getProperty(obj, prop) {
        if (!obj || typeof obj !== 'object') return undefined;
        const key = Object.keys(obj).find(k => k.toLowerCase() === prop.toLowerCase());
        return key ? obj[key] : undefined;
    }

    function parseCSV(text) {
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const vals = line.split(',');
            const obj = {};
            headers.forEach((h, i) => obj[h] = vals[i] !== undefined ? vals[i].trim() : '');
            return obj;
        });
    }

    async function initSQL(jsonData) {
        if (typeof initSqlJs === 'undefined') {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        db = new SQL.Database();

        db.run(`
            CREATE TABLE playoff_results (
                season INTEGER NOT NULL, team_abbr TEXT NOT NULL,
                elim_order INTEGER, elim_rank INTEGER, playoff_wins INTEGER,
                PRIMARY KEY (season, team_abbr)
            );
            CREATE TABLE regular_season (
                season INTEGER NOT NULL, team_abbr TEXT NOT NULL,
                gp INTEGER, w INTEGER, l INTEGER, otl INTEGER,
                pts INTEGER, pts_pct REAL, gf INTEGER, ga INTEGER, gd INTEGER,
                PRIMARY KEY (season, team_abbr)
            );
            CREATE TABLE team_advanced (
                season INTEGER NOT NULL, team_abbr TEXT NOT NULL,
                xgf_pct REAL, cf_pct REAL, ff_pct REAL,
                PRIMARY KEY (season, team_abbr)
            );
            CREATE INDEX idx_pr_team ON playoff_results(team_abbr);
            CREATE INDEX idx_rs_team ON regular_season(team_abbr);
            CREATE INDEX idx_adv_team ON team_advanced(team_abbr);
        `);

        // 1. Playoff data from data.json
        const insertPlayoff = db.prepare(
            `INSERT OR REPLACE INTO playoff_results (season, team_abbr, elim_order, elim_rank, playoff_wins) VALUES (?,?,?,?,?)`
        );
        Object.entries(jsonData).forEach(([year, yearData]) => {
            if (!Array.isArray(yearData)) return;
            yearData.forEach(entry => {
                if (!entry || !entry.team) return;
                insertPlayoff.run([
                    parseInt(year),
                    entry.team,
                    getProperty(entry, 'elim order') ?? null,
                    getProperty(entry, 'elim rank') ?? null,
                    getProperty(entry, 'playoff wins') ?? 0
                ]);
            });
        });
        insertPlayoff.free();

        // 2. Regular season CSV (real data only)
        const rsFetch = await tryFetch('data/regular_season.csv');
        if (rsFetch) {
            try {
                const text = await rsFetch.response.text();
                const rows = parseCSV(text);
                const insertRS = db.prepare(
                    `INSERT OR REPLACE INTO regular_season 
                     (season, team_abbr, gp, w, l, otl, pts, pts_pct, gf, ga, gd) 
                     VALUES (?,?,?,?,?,?,?,?,?,?,?)`
                );
                rows.forEach(r => {
                    if (!r.season || !r.team_abbr) return;
                    insertRS.run([
                        parseInt(r.season), r.team_abbr,
                        parseInt(r.gp) || null, parseInt(r.w) || null, parseInt(r.l) || null, parseInt(r.otl) || null,
                        parseInt(r.pts) || null, parseFloat(r.pts_pct) || null,
                        parseInt(r.gf) || null, parseInt(r.ga) || null, parseInt(r.gd) || null
                    ]);
                });
                insertRS.free();
            } catch (e) { console.warn('regular_season.csv parse error', e); }
        }

        // 3. Advanced stats CSV (real data only)
        let advFetch = await tryFetch('data/team_advanced.csv');
        if (!advFetch) advFetch = await tryFetch('data/advanced_stats.csv');
        if (advFetch) {
            try {
                const text = await advFetch.response.text();
                const rows = parseCSV(text);
                const insertAdv = db.prepare(
                    `INSERT OR REPLACE INTO team_advanced (season, team_abbr, xgf_pct, cf_pct, ff_pct) VALUES (?,?,?,?,?)`
                );
                rows.forEach(r => {
                    if (!r.season || !r.team_abbr) return;
                    insertAdv.run([
                        parseInt(r.season), r.team_abbr,
                        parseFloat(r.xgf_pct) || null,
                        parseFloat(r.cf_pct) || null,
                        parseFloat(r.ff_pct) || null
                    ]);
                });
                insertAdv.free();
            } catch (e) { console.warn('advanced CSV parse error', e); }
        }

        // No mock / synthetic data generation of any kind

        const counts = db.exec(`SELECT (SELECT COUNT(*) FROM playoff_results), (SELECT COUNT(*) FROM regular_season), (SELECT COUNT(*) FROM team_advanced)`)[0].values[0];
        console.log(`SQL ready → playoffs: ${counts[0]} | regular_season: ${counts[1]} | advanced: ${counts[2]}`);
    }

    function runQuery(sql, params = []) {
        if (!db) return [];
        try {
            const stmt = db.prepare(sql);
            if (params.length) stmt.bind(params);
            const results = [];
            while (stmt.step()) results.push(stmt.getAsObject());
            stmt.free();
            return results;
        } catch (e) {
            console.error('SQL error:', e.message);
            return [];
        }
    }


    // Compute padded min/max from an array of numbers (nulls ignored)
    function computeRange(values, { padding = 0.08, floor = null, ceil = null, minSpan = 8 } = {}) {
        const nums = values.filter(v => v != null && !isNaN(v)).map(Number);
        if (nums.length === 0) return { min: floor ?? 30, max: ceil ?? 75 };
        let lo = Math.min(...nums);
        let hi = Math.max(...nums);
        const pad = Math.max((hi - lo) * padding, 2);
        lo = lo - pad;
        hi = hi + pad;
        if (hi - lo < minSpan) {
            const mid = (lo + hi) / 2;
            lo = mid - minSpan / 2;
            hi = mid + minSpan / 2;
        }
        if (floor != null) lo = Math.min(lo, floor);
        if (ceil  != null) hi = Math.max(hi, ceil);
        // Nice rounding
        lo = Math.floor(lo);
        hi = Math.ceil(hi);
        return { min: lo, max: hi };
    }

    // ===== LOAD =====
    tryFetch('NHLteamcolors.json')
        .then(r => r ? r.response.json() : [])
        .then(colorData => {
            if (Array.isArray(colorData)) {
                colorData.forEach(entry => {
                    if (entry.team) {
                        teamColors[entry.team] = entry.c1 || defaultColors.c1;
                        teamSecondaryColors[entry.team] = entry.c2 || defaultColors.c2;
                        teamTertiaryColors[entry.team] = entry.c3 || defaultColors.c3;
                        teamQuaternaryColors[entry.team] = entry.c4 || defaultColors.c4;
                        teamQuinaryColors[entry.team] = entry.c5 || defaultColors.c5;
                    }
                });
            }
            return tryFetch('uniquelogos.json');
        })
        .then(r => r ? r.response.json() : [])
        .then(logoData => {
            if (Array.isArray(logoData)) {
                logoData.forEach(entry => {
                    if (entry.team) {
                        uniqueLogos[entry.team] = [];
                        for (let key in entry) {
                            if (key.startsWith('Column') && entry[key]) uniqueLogos[entry.team].push(entry[key]);
                        }
                    }
                });
            }
            return tryFetch('data.json');
        })
        .then(r => r ? r.response.json() : {})
        .then(async jsonData => {
            data = jsonData || {};
            await initSQL(data);
            populateTeamSelector();
            updateVisualization();
        })
        .catch(err => {
            console.error(err);
            alert('Failed to load core data files.');
        });

    function getSegmentValue(group, fallback) {
        const pressed = document.querySelector(`.segment-btn[data-group="${group}"][aria-pressed="true"]`);
        return pressed?.value || fallback;
    }

    function getViewMode() {
        return getSegmentValue("viewMode", "team");
    }

    function getEraMode() {
        return getSegmentValue("eraMode", "current");
    }

    window.onModeChange = function () {
        if (!document.querySelector('.segment-btn[data-group="eraMode"]') || !document.getElementById('teamList')) return;
        populateTeamSelector();
        updateVisualization();
    };

    function selectSegment(button) {
        const group = button?.dataset?.group;
        if (!group || button.getAttribute("aria-pressed") === "true") return;
        document.querySelectorAll(`.segment-btn[data-group="${group}"]`).forEach(el => {
            el.setAttribute("aria-pressed", el === button ? "true" : "false");
        });
        onModeChange();
    }

    function selectorEntries() {
        const mode = getViewMode();
        const era = getEraMode();
        const current = new Set(CURRENT_TEAM_ABBRS);

        if (mode === "franchise") {
            const entries = [];
            if (era === "current" || era === "all") {
                Object.entries(FRANCHISES).forEach(([key, f]) => entries.push([key, f.label]));
            }
            if (era === "historical" || era === "all") {
                Object.entries(HISTORICAL_FRANCHISES).forEach(([key, f]) => entries.push([key, f.label]));
            }
            return { label: "Select Franchise:", entries };
        }

        let teams;
        if (era === "current") teams = CURRENT_TEAM_ABBRS.slice();
        else if (era === "historical") teams = Object.keys(teamNames).filter(t => !current.has(t));
        else teams = Object.keys(teamNames);
        teams.sort();
        return {
            label: "Select Team:",
            entries: teams.map(team => [team, `${team} · ${teamNames[team] || team}`])
        };
    }

    function latestLogoYear(abbr) {
        const years = uniqueLogos[abbr];
        if (!Array.isArray(years) || !years.length) return null;
        let max = null;
        for (const year of years) {
            const n = parseInt(year, 10);
            if (Number.isNaN(n)) continue;
            if (max === null || n > max) max = n;
        }
        return max;
    }

    function chipLogoAbbr(key) {
        if (getViewMode() === "franchise") {
            const info = franchiseByKey(key);
            const members = info && info.members;
            if (members && members.length) return members[members.length - 1];
        }
        return key;
    }

    function teamSecondaryOrNull(abbr) {
        const color = teamSecondaryColors[abbr];
        return (color && /^#[0-9A-F]{6}$/i.test(color)) ? color : null;
    }

    function applySelectedChipBorder(btn) {
        const color = teamSecondaryOrNull(btn.dataset.logo || btn.dataset.key);
        btn.style.borderColor = color ? paintOnLight(color) : "var(--team-c2-ink, #222)";
    }

    function clearChipBorder(btn) {
        btn.style.borderColor = "";
    }

    function filterQuery() {
        return (document.getElementById("teamFilter")?.value || "").trim().toLowerCase();
    }

    function entryMatchesQuery(key, text, query) {
        if (!query) return true;
        return `${key} ${text}`.toLowerCase().includes(query);
    }

    function getSelectedTeamKey() {
        const pressed = document.querySelector('#teamList .team-chip[aria-pressed="true"]');
        return pressed?.dataset.key || "";
    }

    function chooseSelectedKey(entries, previous) {
        const values = new Set(entries.map(([key]) => key));
        if (previous && values.has(previous)) return previous;
        if (values.has("COL")) return "COL";
        if (entries.length) return entries[0][0];
        return "";
    }

    function renderTeamChip(key, text, selectedKey) {
        const sep = text.indexOf(" · ");
        const abbr = sep >= 0 ? text.slice(0, sep) : key;
        const shortName = sep >= 0 ? text.slice(sep + 3) : text;
        const logoAbbr = chipLogoAbbr(key);
        const selected = key === selectedKey;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "team-chip";
        btn.dataset.key = key;
        btn.dataset.logo = logoAbbr;
        btn.dataset.label = text;
        btn.setAttribute("aria-pressed", selected ? "true" : "false");

        const img = document.createElement("img");
        img.className = "team-chip-logo";
        img.alt = "";
        img.width = 40;
        img.height = 40;
        const year = latestLogoYear(logoAbbr);
        if (year) {
            img.src = `${window.basePath || ""}logos/NHL${year}/${logoAbbr}.png`;
            img.addEventListener("error", () => { img.hidden = true; });
        } else {
            img.hidden = true;
        }

        const abbrEl = document.createElement("span");
        abbrEl.className = "team-chip-abbr";
        abbrEl.textContent = abbr;

        const dot = document.createElement("span");
        dot.className = "team-chip-sep";
        dot.setAttribute("aria-hidden", "true");
        dot.textContent = "·";

        const nameEl = document.createElement("span");
        nameEl.className = "team-chip-name";
        nameEl.textContent = shortName;

        btn.append(img, abbrEl, dot, nameEl);
        if (selected) applySelectedChipBorder(btn);
        return btn;
    }

    function applyTeamFilter() {
        const list = document.getElementById("teamList");
        const empty = document.getElementById("teamListEmpty");
        if (!list) return;
        const query = filterQuery();
        const chips = list.querySelectorAll(".team-chip");
        let visible = 0;
        chips.forEach(chip => {
            const match = entryMatchesQuery(chip.dataset.key, chip.dataset.label || chip.textContent, query);
            chip.hidden = !match;
            if (match) visible += 1;
        });
        if (empty) empty.hidden = !(query && chips.length > 0 && visible === 0);
    }

    function selectTeamChip(key) {
        const list = document.getElementById("teamList");
        if (!list || !key) return;
        const chips = [...list.querySelectorAll(".team-chip")];
        const target = chips.find(chip => chip.dataset.key === key);
        if (!target || target.hidden) return;
        if (target.getAttribute("aria-pressed") === "true") return;
        chips.forEach(chip => {
            const on = chip === target;
            chip.setAttribute("aria-pressed", on ? "true" : "false");
            if (on) applySelectedChipBorder(chip);
            else clearChipBorder(chip);
        });
        updateVisualization();
    }

    function populateTeamSelector() {
        const list = document.getElementById("teamList");
        const labelEl = document.getElementById("selectorLabel");
        const countEl = document.getElementById("eraCount");
        if (!list) return;

        const previous = getSelectedTeamKey();
        const { label, entries } = selectorEntries();
        if (labelEl) labelEl.textContent = label;

        const selectedKey = chooseSelectedKey(entries, previous);
        list.replaceChildren();
        const fragment = document.createDocumentFragment();
        entries.forEach(([key, text]) => {
            fragment.appendChild(renderTeamChip(key, text, selectedKey));
        });
        list.appendChild(fragment);

        if (countEl) countEl.textContent = String(entries.length);
        applyTeamFilter();
    }

    function seasonsForAbbr(abbr) {
        if (!seasonsByAbbr) {
            const sets = {};
            Object.entries(data).forEach(([year, rows]) => {
                const n = parseInt(year, 10);
                if (Number.isNaN(n) || !Array.isArray(rows)) return;
                rows.forEach(entry => {
                    const team = entry && entry.team;
                    if (!team) return;
                    if (!sets[team]) sets[team] = new Set();
                    sets[team].add(n);
                });
            });
            seasonsByAbbr = {};
            Object.entries(sets).forEach(([team, set]) => {
                seasonsByAbbr[team] = [...set].sort((a, b) => a - b);
            });
        }
        return seasonsByAbbr[abbr] || [];
    }

    function logoAnchorYears(abbr) {
        const raw = uniqueLogos[abbr];
        if (!Array.isArray(raw)) return [];
        const years = [];
        raw.forEach(value => {
            const year = parseInt(value, 10);
            if (year >= 1917 && year <= 2100 && !years.includes(year)) years.push(year);
        });
        years.sort((a, b) => a - b);
        return years;
    }

    function collapseYearRanges(years) {
        if (!years.length) return [];
        const ranges = [];
        let start = years[0];
        let prev = years[0];
        for (let i = 1; i < years.length; i++) {
            const year = years[i];
            if (year === prev + 1) prev = year;
            else {
                ranges.push(start === prev ? String(start) : `${start}\u2013${prev}`);
                start = prev = year;
            }
        }
        ranges.push(start === prev ? String(start) : `${start}\u2013${prev}`);
        return ranges;
    }

    // One tile per distinct logo. uniqueLogos years are the first season of each
    // identity; later seasons keep that logo until the next anchor.
    function identityTilesFor(abbr) {
        const anchors = logoAnchorYears(abbr);
        const seasons = seasonsForAbbr(abbr);
        if (!anchors.length) {
            const ranges = seasons.length ? collapseYearRanges(seasons) : [abbr];
            return [{
                abbr,
                logoYear: seasons.length ? seasons[seasons.length - 1] : null,
                seasons: seasons.slice(),
                ranges,
                label: ranges.join(', ')
            }];
        }
        const buckets = anchors.map(year => ({ year, seasons: [] }));
        seasons.forEach(season => {
            let idx = -1;
            for (let i = 0; i < anchors.length; i++) {
                if (anchors[i] <= season) idx = i;
                else break;
            }
            if (idx < 0) idx = 0;
            buckets[idx].seasons.push(season);
        });
        return buckets.map(bucket => {
            const ranges = bucket.seasons.length ? collapseYearRanges(bucket.seasons) : [String(bucket.year)];
            return {
                abbr,
                logoYear: bucket.year,
                seasons: bucket.seasons,
                ranges,
                label: ranges.join(', ')
            };
        });
    }

    function buildIdentityTile(tile) {
        const mark = document.createElement('figure');
        mark.className = 'identity-mark';

        const windowEl = document.createElement('div');
        windowEl.className = 'identity-tile';
        const border = teamTertiaryColors[tile.abbr];
        windowEl.style.borderColor = (border && /^#[0-9A-F]{6}$/i.test(border)) ? border : '#d0d0d0';

        const caption = document.createElement('figcaption');
        caption.className = 'identity-years';
        (tile.ranges || []).forEach(text => {
            const line = document.createElement('span');
            line.className = 'identity-year-range';
            line.textContent = text;
            caption.appendChild(line);
        });

        const yearsToTry = [];
        if (tile.logoYear != null) yearsToTry.push(tile.logoYear);
        (tile.seasons || []).forEach(year => {
            if (!yearsToTry.includes(year)) yearsToTry.push(year);
        });

        if (!yearsToTry.length) {
            mark.append(windowEl, caption);
            return mark;
        }

        const img = document.createElement('img');
        img.className = 'team-logo';
        img.alt = tile.label === tile.abbr ? tile.abbr : `${tile.abbr} ${tile.label}`;

        let attempt = 0;
        let failed = false;
        const tryLogo = () => {
            if (attempt >= yearsToTry.length) {
                img.remove();
                failed = true;
                if ((!tile.seasons || !tile.seasons.length) && mark.isConnected) mark.remove();
                return;
            }
            const year = yearsToTry[attempt++];
            img.src = `${window.basePath || ''}logos/NHL${year}/${tile.abbr}.png`;
        };
        img.addEventListener('error', tryLogo);
        img.addEventListener('load', () => pinLogoStrip(mark.parentElement));
        windowEl.appendChild(img);
        mark.append(windowEl, caption);
        tryLogo();
        if (failed && (!tile.seasons || !tile.seasons.length)) return null;
        return mark;
    }

    function renderIdentityTiles(logosEl, abbrs) {
        logosEl.replaceChildren();
        const nodes = [];
        abbrs.forEach(abbr => {
            identityTilesFor(abbr).forEach(tile => {
                const node = buildIdentityTile(tile);
                if (node) nodes.push(node);
            });
        });
        nodes.forEach(node => logosEl.appendChild(node));
        // Keep the current identity in view when a long chain overflows.
        logosEl.dataset.followLatest = '1';
        logosEl.dataset.userScroll = '0';
        if (!logosEl.dataset.scrollBound) {
            logosEl.dataset.scrollBound = '1';
            const noteUser = () => { logosEl.dataset.userScroll = '1'; };
            logosEl.addEventListener('pointerdown', noteUser);
            logosEl.addEventListener('wheel', noteUser, { passive: true });
            logosEl.addEventListener('scroll', () => {
                if (logosEl.dataset.pinning === '1' || logosEl.dataset.userScroll !== '1') return;
                const max = logosEl.scrollWidth - logosEl.clientWidth;
                logosEl.dataset.followLatest = (max - logosEl.scrollLeft < 32) ? '1' : '0';
            });
        }
        pinLogoStrip(logosEl);
        requestAnimationFrame(() => pinLogoStrip(logosEl));
    }

    function pinLogoStrip(logosEl) {
        if (!logosEl || logosEl.dataset.followLatest === '0') return;
        const max = Math.max(0, logosEl.scrollWidth - logosEl.clientWidth);
        if (Math.abs(logosEl.scrollLeft - max) < 2) return;
        logosEl.dataset.pinning = '1';
        logosEl.scrollLeft = max;
        requestAnimationFrame(() => { logosEl.dataset.pinning = '0'; });
    }

    function syncIdentityBarOffset() {
        const bar = document.querySelector('.team-header');
        const barHeight = bar ? Math.ceil(bar.getBoundingClientRect().height) : 0;
        document.documentElement.style.setProperty('--identity-bar-height', `${barHeight}px`);
        const groupCell = document.querySelector('#teamDataTable .group-header th');
        if (groupCell) {
            const groupHeight = Math.ceil(groupCell.getBoundingClientRect().height);
            document.documentElement.style.setProperty('--group-header-height', `${groupHeight}px`);
        }
        pinLogoStrip(document.getElementById('teamLogos'));
        syncTableHeaderPin();
        syncRailViewport();
    }

    function syncTableHeaderPin() {
        const table = document.querySelector('.table-container');
        const bar = document.querySelector('.team-header');
        if (!table || !bar) return;
        const overlap = Math.max(0, Math.round(bar.getBoundingClientRect().bottom - table.getBoundingClientRect().top));
        const next = overlap + 'px';
        if (document.documentElement.style.getPropertyValue('--table-header-stick').trim() !== next) {
            document.documentElement.style.setProperty('--table-header-stick', next);
        }
    }

    function syncRailViewport() {
        const rail = document.querySelector('.team-rail');
        const bar = document.querySelector('.team-header');
        if (!rail || !bar) return;
        const barBottom = bar.getBoundingClientRect().bottom;
        const railTop = rail.getBoundingClientRect().top;
        const topEdge = Math.max(railTop, barBottom);
        const available = Math.max(240, Math.floor(window.innerHeight - topEdge));
        const px = `${available}px`;
        if (rail.style.height !== px) {
            rail.style.height = px;
            rail.style.maxHeight = px;
        }
    }

    window.updateVisualization = function () {
        const selected = getSelectedTeamKey();
        const teamNameEl = document.getElementById('teamName');
        const teamAbbrEl = document.getElementById('teamAbbreviation');
        const logosEl = document.getElementById('teamLogos');
        const mode = getViewMode();

        if (!selected) {
            applyTeamChrome(defaultColors.c1, defaultColors.c2);
            teamNameEl.textContent = '';
            teamAbbrEl.textContent = '';
            logosEl.replaceChildren();
            syncIdentityBarOffset();
            document.querySelector('#teamDataTable tbody').innerHTML = '';
            ['trendChart', 'scatterChart', 'playoffWinsHistogram', 'radarChart'].forEach(id => {
                setChartCardVisible(id, false);
            });
            setAdvancedGroupVisible(false);
            document.getElementById('insightsPanel').innerHTML = '';
            return;
        }

        // Resolve Team vs Franchise
        let abbrs, displayName, primaryAbbr, franchiseInfo = null;
        if (mode === "franchise") {
            franchiseInfo = franchiseByKey(selected);
            if (!franchiseInfo) return;
            abbrs = franchiseInfo.members;
            displayName = franchiseInfo.name;
            primaryAbbr = franchiseInfo.members[franchiseInfo.members.length - 1];
        } else {
            abbrs = [selected];
            displayName = teamNames[selected] || selected;
            primaryAbbr = selected;
        }

        // Header:
        //   Left  (#teamAbbreviation): stacked abbreviations (current first, then predecessors)
        //   Right (#teamName): current franchise name only
        if (mode === "franchise") {
            teamNameEl.textContent = franchiseInfo.name;
            // Primary (current) first, then historical members
            const ordered = [primaryAbbr, ...abbrs.filter(a => a !== primaryAbbr)];
            teamAbbrEl.innerHTML = ordered
                .map(a => `<div class="franchise-abbr">${a}</div>`)
                .join("");
        } else {
            teamNameEl.textContent = displayName;
            teamAbbrEl.textContent = primaryAbbr;
        }

        // Oldest identity first. Franchise mode walks members in that same order.
        const logoAbbrs = mode === 'franchise' ? abbrs.slice() : [primaryAbbr];
        renderIdentityTiles(logosEl, logoAbbrs);
        syncIdentityBarOffset();

        const { primary, secondary, tertiary, quaternary, quinary } = resolveTeamColors(primaryAbbr);
        applyTeamChrome(primary, secondary);
        const ptsColor = paintOnLight(secondary);
        const xgfColor = paintOnLight(xgfLineColor(tertiary, quaternary, secondary));
        const cfColor = paintOnLight(quinary);
        const scatterStroke = strokeOnFill(secondary, primary);

        const orderMap = {
            year: 'year', rs_gp: 'rs_gp', rs_w: 'rs_w', rs_l: 'rs_l', rs_otl: 'rs_otl',
            rs_pts: 'rs_pts', rs_pts_pct: 'rs_pts_pct', rs_gf: 'rs_gf', rs_ga: 'rs_ga', rs_gd: 'rs_gd',
            elim_rank: 'elim_rank', elim_order: 'elim_order', playoff_wins: 'playoff_wins',
            xgf_pct: 'xgf_pct', cf_pct: 'cf_pct', ff_pct: 'ff_pct'
        };
        const col = orderMap[sortColumn] || 'year';
        const dir = sortDirection === 'asc' ? 'ASC' : 'DESC';

        const placeholders = abbrs.map(() => '?').join(',');
        const sql = `
            SELECT 
                p.season AS year, p.team_abbr,
                r.gp AS rs_gp, r.w AS rs_w, r.l AS rs_l, r.otl AS rs_otl,
                r.pts AS rs_pts, r.pts_pct AS rs_pts_pct,
                r.gf AS rs_gf, r.ga AS rs_ga, r.gd AS rs_gd,
                p.elim_rank, p.elim_order, p.playoff_wins,
                a.xgf_pct, a.cf_pct, a.ff_pct
            FROM playoff_results p
            LEFT JOIN regular_season r ON p.season = r.season AND p.team_abbr = r.team_abbr
            LEFT JOIN team_advanced a ON p.season = a.season AND p.team_abbr = a.team_abbr
            WHERE p.team_abbr IN (${placeholders})
            ORDER BY ${col} ${dir}
        `;
        const rows = runQuery(sql, abbrs);

        // ===== TABLE =====
        const tbody = document.querySelector('#teamDataTable tbody');
        tbody.innerHTML = '';
        const fmt = (v) => (v == null || v === '') ? '<span class="null-value">—</span>' : v;
        const fmtPct = (v) => (v == null) ? '<span class="null-value">—</span>' : (Number(v) * 100).toFixed(1) + '%';
        const fmtAdv = (v) => (v == null) ? '<span class="null-value">—</span>' : Number(v).toFixed(1);

        rows.forEach(r => {
            const tr = document.createElement('tr');
            // Use the actual team_abbr for that season's logo (critical for franchise mode)
            const logoAbbr = r.team_abbr || primaryAbbr;
            const logoSrc = `${window.basePath || ''}logos/NHL${r.year}/${logoAbbr}.png`;
            tr.innerHTML = `
                <td class="sticky-col"><img class="logo-img" src="${logoSrc}" onerror="this.style.display='none'"></td>
                <td class="sticky-col">${r.year}</td>
                <td class="group-regular">${fmt(r.rs_gp)}</td>
                <td class="group-regular">${fmt(r.rs_w)}</td>
                <td class="group-regular">${fmt(r.rs_l)}</td>
                <td class="group-regular">${fmt(r.rs_otl)}</td>
                <td class="group-regular">${fmt(r.rs_pts)}</td>
                <td class="group-regular">${fmtPct(r.rs_pts_pct)}</td>
                <td class="group-regular">${fmt(r.rs_gf)}</td>
                <td class="group-regular">${fmt(r.rs_ga)}</td>
                <td class="group-regular">${fmt(r.rs_gd)}</td>
                <td class="group-playoffs">${fmt(r.elim_rank)}</td>
                <td class="group-playoffs">${fmt(r.elim_order)}</td>
                <td class="group-playoffs">${fmt(r.playoff_wins)}</td>
                <td class="group-advanced">${fmtAdv(r.xgf_pct)}</td>
                <td class="group-advanced">${fmtAdv(r.cf_pct)}</td>
                <td class="group-advanced">${fmtAdv(r.ff_pct)}</td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.column-header .sortable').forEach(th => {
            th.classList.toggle('sorted', th.getAttribute('data-column') === sortColumn);
            const arrow = th.querySelector('.sort-arrow');
            if (arrow) arrow.textContent = th.getAttribute('data-column') === sortColumn ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : '';
        });

        // ===== CHARTS =====
        ['trendChart', 'scatterChart', 'playoffWinsHistogram', 'radarChart'].forEach(id => {
            const c = Chart.getChart(id); if (c) c.destroy();
        });

        const chron = [...rows].filter(r => r.year != null).sort((a,b) => a.year - b.year);
        const years = chron.map(r => r.year);
        const ptsPct = chron.map(r => r.rs_pts_pct != null ? +(r.rs_pts_pct * 100).toFixed(1) : null);
        const xgf = chron.map(r => r.xgf_pct != null ? +Number(r.xgf_pct).toFixed(1) : null);
        const cf = chron.map(r => r.cf_pct != null ? +Number(r.cf_pct).toFixed(1) : null);
        const pWins = chron.map(r => r.playoff_wins != null ? r.playoff_wins : null);
        const hasPts = hasNumber(chron, 'rs_pts_pct');
        const hasXgf = hasNumber(chron, 'xgf_pct');
        const hasCf = hasNumber(chron, 'cf_pct');
        const hasFf = hasNumber(chron, 'ff_pct');
        const hasAdvanced = hasXgf || hasCf || hasFf;
        const hasPlayoffWins = hasNumber(chron, 'playoff_wins');
        setAdvancedGroupVisible(hasAdvanced);

        // Trend stays when PTS% or playoff wins exist. Advanced lines are omitted
        // when this selection has no advanced-stat season, so empty series are not drawn.
        if (setChartCardVisible('trendChart', hasPts || hasPlayoffWins)) {
            const trendDatasets = [
                { type: 'bar', label: 'Playoff Wins', data: pWins, backgroundColor: primary, borderColor: primary, borderWidth: 0, yAxisID: 'y1', order: 2 },
                { type: 'line', label: 'PTS%', data: ptsPct, borderColor: ptsColor, backgroundColor: ptsColor, pointBackgroundColor: ptsColor, yAxisID: 'y', tension: 0.2, pointRadius: 2, order: 1 }
            ];
            const yTitleParts = ['PTS%'];
            const yValues = [...ptsPct];
            if (hasXgf) {
                trendDatasets.push({ type: 'line', label: 'xGF%', data: xgf, borderColor: xgfColor, backgroundColor: xgfColor, pointBackgroundColor: xgfColor, yAxisID: 'y', tension: 0.2, pointRadius: 2, order: 1 });
                yTitleParts.push('xGF%');
                yValues.push(...xgf);
            }
            if (hasCf) {
                trendDatasets.push({ type: 'line', label: 'CF%', data: cf, borderColor: cfColor, backgroundColor: cfColor, pointBackgroundColor: cfColor, yAxisID: 'y', tension: 0.2, pointRadius: 2, borderDash: [4, 2], order: 1 });
                yTitleParts.push('CF%');
                yValues.push(...cf);
            }
            const yRange = computeRange(yValues, { padding: 0.10, minSpan: 12 });
            publishChart('trendChart', new Chart(document.getElementById('trendChart'), {
                type: 'bar',
                data: { labels: years, datasets: trendDatasets },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { title: { display: true, text: 'Regular Season Form · Process Metrics · Playoff Results', font: { size: 14 } }, legend: { position: 'top' } },
                    scales: {
                        y: {
                            type: 'linear', position: 'left',
                            title: { display: true, text: yTitleParts.join(' / ') },
                            min: yRange.min, max: yRange.max
                        },
                        y1: {
                            type: 'linear', position: 'right',
                            title: { display: true, text: 'Playoff Wins' },
                            min: 0, max: Math.max(16, Math.ceil((Math.max(...pWins.filter(v=>v!=null), 0) || 0) + 1)),
                            grid: { drawOnChartArea: false }
                        }
                    }
                }
            }));
        }

        // Scatter: hide the card when no season has an xGF% value.
        const scatterData = hasXgf ? chron.filter(r => r.xgf_pct != null).map(r => ({
            x: +Number(r.xgf_pct).toFixed(1),
            y: r.playoff_wins || 0,
            r: r.rs_pts_pct != null ? Math.max(4, r.rs_pts_pct * 40) : 6
        })) : [];
        if (setChartCardVisible('scatterChart', hasXgf && scatterData.length > 0)) {
            const xRange = computeRange(
                scatterData.map(d => d.x),
                { padding: 0.12, minSpan: 8 }
            );
            publishChart('scatterChart', new Chart(document.getElementById('scatterChart'), {
                type: 'bubble',
                data: { datasets: [{ label: 'Season', data: scatterData, backgroundColor: primary + '99', borderColor: scatterStroke, borderWidth: 2 }] },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { title: { display: true, text: 'xGF% vs Playoff Wins (bubble = PTS%)', font: { size: 14 } }, legend: { display: false } },
                    scales: {
                        x: {
                            title: { display: true, text: 'xGF%' },
                            min: xRange.min, max: xRange.max
                        },
                        y: {
                            title: { display: true, text: 'Playoff Wins' },
                            min: 0,
                            max: Math.max(16, Math.ceil((Math.max(...scatterData.map(d => d.y), 0) || 0) + 1))
                        }
                    }
                }
            }));
        }

        // Histogram: hide only when no playoff-win values exist.
        const winCounts = {};
        if (hasPlayoffWins) {
            chron.forEach(r => {
                const w = r.playoff_wins;
                if (w != null && !isNaN(Number(w))) winCounts[w] = (winCounts[w] || 0) + 1;
            });
        }
        const histLabels = Object.keys(winCounts).map(Number).sort((a,b)=>a-b);
        const winVals = chron.map(r => r.playoff_wins).filter(v => v != null && !isNaN(v)).map(Number);
        const meanWins = winVals.length ? winVals.reduce((a, b) => a + b, 0) / winVals.length : null;
        const meanColor = paintOnLight(secondary);
        if (setChartCardVisible('playoffWinsHistogram', hasPlayoffWins && histLabels.length > 0)) {
            publishChart('playoffWinsHistogram', new Chart(document.getElementById('playoffWinsHistogram'), {
                type: 'bar',
                data: {
                    labels: histLabels,
                    datasets: [{ label: 'Seasons', data: histLabels.map(w => winCounts[w]), backgroundColor: primary, borderColor: primary, borderWidth: 1 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { title: { display: true, text: (mode === 'franchise' ? 'Playoff Wins Distribution (Franchise History)' : 'Playoff Wins Distribution (Team History)'), font: { size: 14 } }, legend: { display: false } },
                    scales: { x: { title: { display: true, text: 'Playoff Wins' } }, y: { title: { display: true, text: 'Seasons' }, beginAtZero: true, ticks: { stepSize: 1 } } }
                },
                plugins: [{
                    id: 'playoffMeanLine',
                    afterDatasetsDraw(chart) {
                        if (meanWins == null || !histLabels.length) return;
                        const { ctx, chartArea, scales } = chart;
                        if (!scales.x || !chartArea || chartArea.width < 2) return;
                        const px = histLabels.map(label => scales.x.getPixelForValue(label));
                        if (px.some(v => !Number.isFinite(v))) return;
                        let x = px[0];
                        if (histLabels.length > 1 && meanWins > histLabels[0]) {
                            const last = histLabels.length - 1;
                            if (meanWins >= histLabels[last]) x = px[last];
                            else {
                                for (let i = 0; i < last; i++) {
                                    if (meanWins >= histLabels[i] && meanWins <= histLabels[i + 1]) {
                                        const span = histLabels[i + 1] - histLabels[i];
                                        const t = span ? (meanWins - histLabels[i]) / span : 0;
                                        x = px[i] + t * (px[i + 1] - px[i]);
                                        break;
                                    }
                                }
                            }
                        }
                        ctx.save();
                        ctx.beginPath();
                        ctx.strokeStyle = meanColor;
                        ctx.lineWidth = 2;
                        ctx.moveTo(x, chartArea.top);
                        ctx.lineTo(x, chartArea.bottom);
                        ctx.stroke();
                        ctx.fillStyle = meanColor;
                        ctx.font = '600 11px sans-serif';
                        ctx.textBaseline = 'top';
                        const rightSide = x > (chartArea.left + chartArea.right) / 2;
                        ctx.textAlign = rightSide ? 'right' : 'left';
                        ctx.fillText(`Mean ${meanWins.toFixed(1)}`, rightSide ? x - 6 : x + 6, chartArea.top + 2);
                        ctx.restore();
                    }
                }]
            }));
        }

        // ===== RADAR (real advanced data only) =====
        const modern = chron.filter(r => r.xgf_pct != null && r.year >= 2008);
        const lastN = modern.slice(-5);

        if (!hasXgf || lastN.length === 0) {
            setChartCardVisible('radarChart', false);
        } else {
            setChartCardVisible('radarChart', true);
            const radarCanvas = document.getElementById('radarChart');

            const avg = (arr, key) => {
                const vals = arr.map(r => r[key]).filter(v => v != null && !isNaN(v));
                return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
            };

            const avgPts = avg(lastN, 'rs_pts_pct');
            const avgX   = avg(lastN, 'xgf_pct');
            const avgC   = avg(lastN, 'cf_pct');
            const avgF   = avg(lastN, 'ff_pct');
            const avgW   = avg(lastN, 'playoff_wins');
            const avgGD  = avg(lastN, 'rs_gd');

            const scaledW  = avgW  != null ? +(avgW * 100 / 16).toFixed(1) : null;
            const scaledGD = avgGD != null ? Math.max(0, Math.min(100, 50 + avgGD / 2)) : null;

            const radarLabels = ['PTS%', 'xGF%', 'CF%', 'FF%', 'Playoff Wins (scaled)', 'Goal Diff (scaled)'];
            const radarValues = [
                avgPts != null ? +(avgPts * 100).toFixed(1) : null,
                avgX   != null ? +avgX.toFixed(1)           : null,
                avgC   != null ? +avgC.toFixed(1)           : null,
                avgF   != null ? +avgF.toFixed(1)           : null,
                scaledW,
                scaledGD
            ];

            const validIndices = radarValues
                .map((v, i) => (v != null ? i : -1))
                .filter(i => i >= 0);

            const cleanLabels = validIndices.map(i => radarLabels[i]);
            const cleanValues = validIndices.map(i => radarValues[i]);

            const realTooltipValues = validIndices.map(i => {
                if (i === 4) return avgW;
                if (i === 5) return avgGD;
                return radarValues[i];
            });

            publishChart('radarChart', new Chart(radarCanvas, {
                type: 'radar',
                data: {
                    labels: cleanLabels,
                    datasets: [{
                        label: `Last ${lastN.length} Seasons Avg`,
                        data: cleanValues,
                        backgroundColor: secondary + '2e',
                        borderColor: primary,
                        pointBackgroundColor: primary,
                        pointBorderColor: primary,
                        borderWidth: 2,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Modern Era Competitive Profile (scaled metrics)',
                            font: { size: 14 }
                        },
                        legend: { position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const idx = context.dataIndex;
                                    const real = realTooltipValues[idx];
                                    const label = cleanLabels[idx];

                                    if (label.includes('Playoff Wins')) {
                                        return `Playoff Wins: ${real != null ? real.toFixed(1) : '—'}`;
                                    }
                                    if (label.includes('Goal Diff')) {
                                        return `Goal Diff: ${real != null ? real.toFixed(1) : '—'}`;
                                    }
                                    return `${label}: ${context.parsed.r}`;
                                }
                            }
                        }
                    },
                    scales: {
                        r: {
                            min: 0,
                            max: 100,
                            ticks: { stepSize: 20, backdropColor: 'transparent' },
                            pointLabels: { font: { size: 11 } },
                            grid: { color: 'rgba(0,0,0,0.08)' },
                            angleLines: { color: 'rgba(0,0,0,0.08)' }
                        }
                    }
                }
            }));
        }

        // ===== INSIGHT STRIPS =====
        const insightsEl = document.getElementById('insightsPanel');
        if (insightsEl) {
            // A finish counts only when elim_rank is present, it meets the cut,
            // and that year's field was at least as large as the cut. Cups are
            // elim_rank 1 in any field. elim_rank 8 in a 4-team year is not a
            // Final 8. If the selection never played a season in which the
            // cut existed, the count is an em dash rather than 0.
            const atCut = (maxRank) => rows.filter(r => {
                if (r.elim_rank == null || r.year == null) return false;
                const rank = Number(r.elim_rank);
                const field = getPlayoffFieldSize(Number(r.year));
                if (!Number.isFinite(rank) || rank > field || field < maxRank) return false;
                return rank <= maxRank;
            });
            const gameWins = (arr) => arr.reduce((sum, r) => sum + (Number(r.playoff_wins) || 0), 0);

            const cupSeasons = rows.filter(r => {
                if (r.elim_rank == null || r.year == null) return false;
                return Number(r.elim_rank) === 1;
            });
            const finalSeasons = atCut(2);
            const final4Seasons = atCut(4);
            const final8Seasons = atCut(8);
            const final16Seasons = atCut(16);

            const wins = gameWins(rows);
            const seasonRows = runQuery(
                `SELECT DISTINCT season AS year FROM regular_season WHERE team_abbr IN (${placeholders})`,
                abbrs
            );
            const seasonCount = seasonRows.length;
            // A cut was possible if any selected season, regular or playoff,
            // had a field at least as large as the cut. Totals Seasons stays
            // the regular-season count above.
            const seasonYears = new Set();
            seasonRows.forEach(r => {
                const year = Number(r.year);
                if (Number.isFinite(year)) seasonYears.add(year);
            });
            rows.forEach(r => {
                const year = Number(r.year);
                if (Number.isFinite(year)) seasonYears.add(year);
            });
            const cutPossible = (minField) => {
                for (const year of seasonYears) {
                    if (getPlayoffFieldSize(year) >= minField) return true;
                }
                return false;
            };
            const depthCount = (minField, seasons) => (
                cutPossible(minField) ? seasons.length : '—'
            );

            const insightCell = (kind, label, value) =>
                `<div class="insight-cell" data-insight="${kind}"><div class="insight-label">${label}</div><div class="insight-value">${value}</div></div>`;

            insightsEl.innerHTML = `<div class="insight-strip">${[
                insightCell('cups', 'Cups', depthCount(1, cupSeasons)),
                insightCell('finals', 'Finals', depthCount(2, finalSeasons)),
                insightCell('final4', 'Final 4', depthCount(4, final4Seasons)),
                insightCell('final8', 'Final 8', depthCount(8, final8Seasons)),
                insightCell('final16', 'Final 16', depthCount(16, final16Seasons)),
                insightCell('seasons', 'Seasons', seasonCount),
                insightCell('wins', 'Playoff wins', wins)
            ].join('')}</div>`;
        }
        syncIdentityBarOffset();
    };

    const identityBar = document.querySelector('.team-header');
    const groupHeaderRow = document.querySelector('#teamDataTable .group-header');
    if (window.ResizeObserver && (identityBar || groupHeaderRow)) {
        const stickyWatch = new ResizeObserver(() => syncIdentityBarOffset());
        if (identityBar) stickyWatch.observe(identityBar);
        if (groupHeaderRow) stickyWatch.observe(groupHeaderRow);
    } else {
        window.addEventListener('resize', syncIdentityBarOffset);
    }
    window.addEventListener('scroll', () => {
        syncTableHeaderPin();
        syncRailViewport();
    }, { passive: true });
    window.addEventListener('resize', () => {
        syncTableHeaderPin();
        syncRailViewport();
    });

    document.querySelector(".team-rail")?.addEventListener("click", (event) => {
        const segmentBtn = event.target.closest(".segment-btn");
        if (segmentBtn) selectSegment(segmentBtn);
    });

    document.getElementById("teamList")?.addEventListener("click", (event) => {
        const btn = event.target.closest(".team-chip");
        if (!btn) return;
        selectTeamChip(btn.dataset.key);
    });

    document.getElementById("teamFilter")?.addEventListener("input", () => {
        applyTeamFilter();
    });

    document.querySelectorAll('.column-header .sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.getAttribute('data-column');
            sortDirection = (col === sortColumn) ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'desc';
            sortColumn = col;
            updateVisualization();
        });
    });
});