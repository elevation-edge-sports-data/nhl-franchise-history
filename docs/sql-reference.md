# SQL reference

The page loads playoff results, regular-season totals, and advanced metrics into an in-browser SQLite database (sql.js). Team mode filters one abbreviation. Franchise mode filters every member of a continuous history, oldest to newest.

## Schema

```sql
CREATE TABLE playoff_results (
    season INTEGER NOT NULL,
    team_abbr TEXT NOT NULL,
    elim_order INTEGER,
    elim_rank INTEGER,
    playoff_wins INTEGER,
    PRIMARY KEY (season, team_abbr)
);

CREATE TABLE regular_season (
    season INTEGER NOT NULL,
    team_abbr TEXT NOT NULL,
    gp INTEGER,
    w INTEGER,
    l INTEGER,
    otl INTEGER,
    pts INTEGER,
    pts_pct REAL,
    gf INTEGER,
    ga INTEGER,
    gd INTEGER,
    PRIMARY KEY (season, team_abbr)
);

CREATE TABLE team_advanced (
    season INTEGER NOT NULL,
    team_abbr TEXT NOT NULL,
    xgf_pct REAL,   -- Expected Goals For %
    cf_pct REAL,    -- Corsi For %
    ff_pct REAL,    -- Fenwick For %
    PRIMARY KEY (season, team_abbr)
);  -- Only populated ~2008 onward
```

The app runs the wide-view `SELECT` directly. It does not create a SQL view. `team_advanced` is populated from about 2008 onward.

## Wide view

The table and charts use this join. Team mode binds one abbreviation. Franchise mode binds the member list. The default order is year descending. Choosing a column header replaces that `ORDER BY`.

```sql
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
WHERE p.team_abbr IN (?)   -- one abbreviation in Team mode; the member list in Franchise mode
ORDER BY year DESC;
```

## Franchise continuity

Relocations and renames chain. A player sale or a merger does not. Utah is expansion. UTA is not PHX/ARI. WIN is not part of WPG. OAK/CGS/CLE are not part of DAL. Cleveland merged into the North Stars in 1978, and those seasons stay on CLE. Modern OTT is not SEN.

Members are listed oldest to newest. The key is the last member.

### Current franchises

32 entries.

| Key | Name | Members |
| --- | --- | --- |
| ANA | Anaheim Ducks | ANA |
| BOS | Boston Bruins | BOS |
| BUF | Buffalo Sabres | BUF |
| CAR | Carolina Hurricanes | HFD, CAR |
| CBJ | Columbus Blue Jackets | CBJ |
| CGY | Calgary Flames | AFM, CGY |
| CHI | Chicago Blackhawks | CHI |
| COL | Colorado Avalanche | QUE, COL |
| DAL | Dallas Stars | MNS, DAL |
| DET | Detroit Red Wings | DCG, DFL, DET |
| EDM | Edmonton Oilers | EDM |
| FLA | Florida Panthers | FLA |
| LAK | Los Angeles Kings | LAK |
| MIN | Minnesota Wild | MIN |
| MTL | Montreal Canadiens | MTL |
| NJD | New Jersey Devils | KCS, CLR, NJD |
| NSH | Nashville Predators | NSH |
| NYI | New York Islanders | NYI |
| NYR | New York Rangers | NYR |
| OTT | Ottawa Senators | OTT |
| PHI | Philadelphia Flyers | PHI |
| PIT | Pittsburgh Penguins | PIT |
| SEA | Seattle Kraken | SEA |
| SJS | San Jose Sharks | SJS |
| STL | St. Louis Blues | STL |
| TBL | Tampa Bay Lightning | TBL |
| TOR | Toronto Maple Leafs | TAN, TSP, TOR |
| UTA | Utah Mammoth | UTA |
| VAN | Vancouver Canucks | VAN |
| VGK | Vegas Golden Knights | VGK |
| WPG | Winnipeg Jets | ATL, WPG |
| WSH | Washington Capitals | WSH |

### Historical franchises

8 entries.

| Key | Name | Members |
| --- | --- | --- |
| WIN | Winnipeg Jets (original) → Arizona Coyotes | WIN, PHX, ARI |
| CLE | Oakland Seals → Cleveland Barons | OAK, CGS, CLE |
| HAM | Quebec Bulldogs → Hamilton Tigers | QBD, HAM |
| PIR | Pittsburgh Pirates → Philadelphia Quakers | PIR, QUA |
| NYA | New York Americans → Brooklyn Americans | NYA, BRK |
| SEN | Ottawa Senators (original) → St. Louis Eagles | SEN, SLE |
| MMR | Montreal Maroons | MMR |
| MWN | Montreal Wanderers | MWN |

### 24 September 2026 Jets records decision

Not applied.

On 24 September 2026 the Winnipeg Jets and the NHL announced that the Jets' official statistical history now includes the original Winnipeg Jets (1979–96), the Atlanta Thrashers (1999–2011), and the current Jets from 2011–12. The inactive Coyotes franchise keeps only its Arizona seasons (1996–2024).

This dataset still treats WPG as ATL then WPG, and WIN, PHX, and ARI as one historical franchise.

Source: [Jets and NHL announce consolidation of Winnipeg Jets' history](https://www.nhl.com/jets/news/jets-and-nhl-announce-consolidation-of-winnipeg-jets-history).

## Visualization notes

- **Trend:** Regular-season form (PTS%) and possession (xGF%, CF%) share an axis. Playoff wins are bars on a second axis.
- **Scatter:** xGF% against playoff wins. Bubble size is PTS%.
- **Playoff-wins histogram:** Season counts by playoff-win total, with a mean line.
- **Radar:** Modern-era snapshot of the latest seasons that have advanced stats, scaled 0–100. Axes are PTS%, xGF%, CF%, FF%, scaled playoff wins, and scaled goal differential.
- **Insights:** One row of Cups, playoff appearances, career playoff wins, and average PTS% in Cup years.
