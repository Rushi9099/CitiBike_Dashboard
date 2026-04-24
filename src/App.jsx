import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  LineChart, Line, ComposedChart,
} from "recharts";
import raw from "./data.json";
import "./App.css";

/* ─── palette ─── */
const C = {
  member: "#00d4aa", casual: "#f97316", classic: "#3b82f6", electric: "#a855f7",
  gray: "#64748b", grayLight: "#94a3b8", red: "#ef4444", blue: "#3b82f6",
  green: "#00d4aa", orange: "#f97316", surface: "#0f2d4a", border: "#1e3a5f",
};

const fmt = (n) => (n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n));
const ttStyle = { background: "#0a1929", border: `1px solid ${C.border}`, borderRadius: 8, color: "#e2e8f0", fontSize: 13 };

/* ─── shared components ─── */
function Card({ label, value, sub, accent }) {
  return (
    <div className="kpi" style={{ borderTop: `3px solid ${accent || C.green}` }}>
      <span className="kpi-val">{value}</span>
      <span className="kpi-label">{label}</span>
      {sub && <span className="kpi-sub">{sub}</span>}
    </div>
  );
}

function Filters({ rider, setRider, bike, setBike }) {
  return (
    <div className="filters">
      <div className="f-group">
        <label>Rider Type</label>
        <select value={rider} onChange={e => setRider(e.target.value)}>
          <option value="all">All</option>
          <option value="member">Member</option>
          <option value="casual">Casual</option>
        </select>
      </div>
      <div className="f-group">
        <label>Bike Type</label>
        <select value={bike} onChange={e => setBike(e.target.value)}>
          <option value="all">All</option>
          <option value="classic_bike">Classic</option>
          <option value="electric_bike">Electric</option>
        </select>
      </div>
    </div>
  );
}

/* ════════════════════ HOME ════════════════════ */
function Home() {
  const h = raw.home;
  return (<div className="page">
    <div className="hdr"><h1>Citi Bike Decision Support — Overview</h1>
      <p>May 2025 trip-history data · 1 million trips analyzed</p></div>
    <div className="cards c4">
      <Card label="Total Trips" value={fmt(h.totalTrips)} accent={C.green} />
      <Card label="Avg Trip Duration" value={`${h.avgDuration} min`} accent={C.blue} />
      <Card label="Member Share %" value={`${h.memberShare}%`} sub="MUR KPI" accent={C.member} />
      <Card label="Total Start Stations" value={fmt(h.totalStartStations)} accent={C.orange} />
    </div>
    <div className="panel full">
      <h3>Daily Trip Volume</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={h.dailyVolume}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="date" tick={{ fill: C.grayLight, fontSize: 11 }} angle={-35} textAnchor="end" height={60} />
          <YAxis tick={{ fill: C.grayLight }} />
          <Tooltip contentStyle={ttStyle} />
          <Area type="monotone" dataKey="trips" stroke={C.green} fill={C.green} fillOpacity={.15} name="Trips" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="hint">Navigate between pages using the menu above. Use slicers on each page to filter data. The <strong>Comparison</strong> page lets you simulate KPI improvements in real time.</div>
    <div className="panel full" style={{marginTop:"1rem"}}>
      <h3>Access the Full Power BI Dashboard</h3>
      <p style={{color:C.grayLight,fontSize:".88rem",marginBottom:".75rem"}}>Download the Power BI file (.pbix) to explore the full interactive dashboard with cross-filtering, additional slicers, and detailed station-level analysis.</p>
      <a href="https://drive.google.com/file/d/1sstMB7H-AJH3yhLMCLPFNX9jL8o-PNX1/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="dl-btn">
        Download Power BI Dashboard (.pbix)
      </a>
      <p style={{color:C.grayLight,fontSize:".75rem",marginTop:".5rem"}}>Requires Power BI Desktop (free) to open. <a href="https://www.microsoft.com/en-us/download/details.aspx?id=58494" target="_blank" rel="noopener noreferrer" style={{color:C.green}}>Get Power BI Desktop →</a></p>
    </div>
  </div>);
}

/* ════════════════════ DEMAND ════════════════════ */
function Demand() {
  const [rider, setRider] = useState("all");
  const [bike, setBike] = useState("all");
  const d = raw.demand;

  const bikeTotal = d.bikeType.reduce((s, x) => s + x.value, 0);
  const bikeRatio = bike === "classic_bike"
    ? d.bikeType.find(x => x.name === "Classic Bike").value / bikeTotal
    : bike === "electric_bike"
    ? d.bikeType.find(x => x.name === "Electric Bike").value / bikeTotal
    : 1;

  const hourly = useMemo(() => {
    const base = rider === "all"
      ? d.hourly
      : d.hourly.map(h => ({ ...h, total: h[rider], member: rider === "member" ? h.member : 0, casual: rider === "casual" ? h.casual : 0 }));
    if (bikeRatio === 1) return base;
    return base.map(h => ({ ...h, total: Math.round(h.total * bikeRatio), member: Math.round(h.member * bikeRatio), casual: Math.round(h.casual * bikeRatio) }));
  }, [rider, bikeRatio, d.hourly]);

  const daily = useMemo(() => {
    const base = rider === "all" ? d.daily : d.daily.map(dd => ({ ...dd, total: dd[rider] }));
    if (bikeRatio === 1) return base;
    return base.map(dd => ({ ...dd, total: Math.round(dd.total * bikeRatio) }));
  }, [rider, bikeRatio, d.daily]);

  const dailyTrend = useMemo(() => {
    if (bikeRatio === 1) return d.dailyTrend;
    return d.dailyTrend.map(dd => ({ ...dd, trips: Math.round(dd.trips * bikeRatio) }));
  }, [bikeRatio, d.dailyTrend]);

  const bikeTypeFiltered = useMemo(() => {
    if (bike === "all") return d.bikeType;
    const targetName = bike === "classic_bike" ? "Classic Bike" : "Electric Bike";
    return d.bikeType.filter(x => x.name === targetName);
  }, [bike, d.bikeType]);

  return (<div className="page">
    <div className="hdr"><h1>Demand Analysis</h1><p>When do riders use the system?</p></div>
    <Filters rider={rider} setRider={setRider} bike={bike} setBike={setBike} />

    <div className="panel full">
      <h3>Trips by Hour of Day</h3>
      <p className="note">Peak hours (7–9 AM, 5–7 PM) drive the PHDR KPI</p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={hourly}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="label" tick={{ fill: C.grayLight, fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={50} />
          <YAxis tick={{ fill: C.grayLight }} />
          <Tooltip contentStyle={ttStyle} />
          <Legend />
          {rider !== "casual" && <Bar dataKey="member" name="Member" fill={C.member} radius={[3,3,0,0]} />}
          {rider !== "member" && <Bar dataKey="casual" name="Casual" fill={C.casual} radius={[3,3,0,0]} />}
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="row2">
      <div className="panel">
        <h3>Trips by Day of Week</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="day" tick={{ fill: C.grayLight }} />
            <YAxis tick={{ fill: C.grayLight }} />
            <Tooltip contentStyle={ttStyle} />
            <Bar dataKey="total" name="Trips" fill={C.blue} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="panel">
        <h3>Trips by Bike Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={bikeTypeFiltered} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value"
              label={({name,percent})=>`${name} ${(percent*100).toFixed(1)}%`}>
              {bikeTypeFiltered.map((entry, i) => (
                <Cell key={i} fill={entry.name === "Classic Bike" ? C.classic : C.electric} />
              ))}
            </Pie>
            <Tooltip contentStyle={ttStyle} formatter={v=>fmt(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="panel full">
      <h3>Daily Trip Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={dailyTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="date" tick={{ fill: C.grayLight, fontSize: 10 }} angle={-35} textAnchor="end" height={55} />
          <YAxis tick={{ fill: C.grayLight }} />
          <Tooltip contentStyle={ttStyle} />
          <Line type="monotone" dataKey="trips" stroke={C.green} strokeWidth={2} dot={{ r: 3, fill: C.green }} name="Trips" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>);
}

/* ════════════════════ STATIONS ════════════════════ */
function Stations() {
  const s = raw.stations;
  const [sortCol, setSortCol] = useState("trips");
  const [sortDir, setSortDir] = useState("desc");
  const sorted = useMemo(() => [...s.details].sort((a,b) => sortDir==="desc" ? b[sortCol]-a[sortCol] : a[sortCol]-b[sortCol]), [sortCol, sortDir, s.details]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d==="desc"?"asc":"desc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  return (<div className="page">
    <div className="hdr"><h1>Station Performance</h1><p>Busiest departure &amp; arrival stations</p></div>
    <div className="row2">
      <div className="panel">
        <h3>Top 10 Start Stations</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={s.topStart} layout="vertical" margin={{left:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis type="number" tick={{fill:C.grayLight}} />
            <YAxis dataKey="station" type="category" width={155} tick={{fill:C.grayLight, fontSize:11}} />
            <Tooltip contentStyle={ttStyle} />
            <Bar dataKey="trips" fill={C.green} radius={[0,4,4,0]} name="Departures" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="panel">
        <h3>Top 10 End Stations</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={s.topEnd} layout="vertical" margin={{left:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis type="number" tick={{fill:C.grayLight}} />
            <YAxis dataKey="station" type="category" width={155} tick={{fill:C.grayLight, fontSize:11}} />
            <Tooltip contentStyle={ttStyle} />
            <Bar dataKey="trips" fill={C.blue} radius={[0,4,4,0]} name="Arrivals" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="panel full">
      <h3>Station Details</h3>
      <div className="table-wrap">
        <table>
          <thead><tr>
            <th>Station</th>
            <th className="sortable" onClick={()=>handleSort("trips")}>Trips {sortCol==="trips"?(sortDir==="desc"?"▼":"▲"):""}</th>
            <th className="sortable" onClick={()=>handleSort("avgDuration")}>Avg Duration {sortCol==="avgDuration"?(sortDir==="desc"?"▼":"▲"):""}</th>
          </tr></thead>
          <tbody>{sorted.map((r,i)=>(
            <tr key={i}><td>{r.station}</td><td className="num">{fmt(r.trips)}</td><td className="num">{r.avgDuration} min</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  </div>);
}

/* ════════════════════ RIDERS ════════════════════ */
function Riders() {
  const r = raw.riders;
  return (<div className="page">
    <div className="hdr"><h1>Rider Patterns</h1><p>Member vs Casual rider behavior</p></div>

    <div className="row2">
      <div className="panel">
        <h3>Member vs Casual Trips</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={r.split} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value"
              label={({name,percent})=>`${name} ${(percent*100).toFixed(1)}%`}>
              <Cell fill={C.member} /><Cell fill={C.casual} />
            </Pie>
            <Tooltip contentStyle={ttStyle} formatter={v=>fmt(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="panel">
        <h3>Average Trip Duration by Rider Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={r.duration}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="type" tick={{fill:C.grayLight}} tickFormatter={t=>t.charAt(0).toUpperCase()+t.slice(1)} />
            <YAxis tick={{fill:C.grayLight}} label={{value:"Minutes",angle:-90,position:"insideLeft",fill:C.grayLight}} />
            <Tooltip contentStyle={ttStyle} />
            <Bar dataKey="avgDuration" name="Avg Duration (min)">
              <Cell fill={C.member}/><Cell fill={C.casual}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="panel full">
      <h3>Hourly Trip Pattern by Rider Type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={r.hourly}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="label" tick={{fill:C.grayLight,fontSize:10}} interval={0} angle={-45} textAnchor="end" height={50} />
          <YAxis tick={{fill:C.grayLight}} />
          <Tooltip contentStyle={ttStyle} />
          <Legend />
          <Line type="monotone" dataKey="member" name="Member" stroke={C.member} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="casual" name="Casual" stroke={C.casual} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div className="panel full">
      <h3>Bike Type Usage by Rider Type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={r.bikeByRider}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="rider" tick={{fill:C.grayLight}} tickFormatter={t=>t.charAt(0).toUpperCase()+t.slice(1)} />
          <YAxis tick={{fill:C.grayLight}} />
          <Tooltip contentStyle={ttStyle} formatter={v=>fmt(v)} />
          <Legend />
          <Bar dataKey="classic_bike" name="Classic Bike" fill={C.classic} radius={[3,3,0,0]} />
          <Bar dataKey="electric_bike" name="Electric Bike" fill={C.electric} radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>);
}

/* ════════════════════ IMBALANCE ════════════════════ */
function Imbalance() {
  const im = raw.imbalance;
  return (<div className="page">
    <div className="hdr"><h1>Station Imbalance</h1>
      <p>SII = Starts − Ends. Positive = station loses bikes. Negative = station gains bikes.</p></div>

    <div className="row2">
      <div className="panel">
        <h3>Stations Losing Bikes (Positive Imbalance)</h3>
        <ResponsiveContainer width="100%" height={460}>
          <BarChart data={im.losing} layout="vertical" margin={{left:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis type="number" tick={{fill:C.grayLight}} />
            <YAxis dataKey="station" type="category" width={170} tick={{fill:C.grayLight,fontSize:11}} />
            <Tooltip contentStyle={ttStyle} />
            <Bar dataKey="imbalance" fill={C.red} radius={[0,4,4,0]} name="Imbalance" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="panel">
        <h3>Stations Gaining Bikes (Negative Imbalance)</h3>
        <ResponsiveContainer width="100%" height={460}>
          <BarChart data={im.gaining} layout="vertical" margin={{left:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis type="number" tick={{fill:C.grayLight}} />
            <YAxis dataKey="station" type="category" width={170} tick={{fill:C.grayLight,fontSize:11}} />
            <Tooltip contentStyle={ttStyle} />
            <Bar dataKey="imbalance" fill={C.blue} radius={[0,4,4,0]} name="Imbalance" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="panel full">
      <h3>Station Imbalance Table</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Station</th><th>Starts</th><th>Ends</th><th>Imbalance</th></tr></thead>
          <tbody>{im.table.map((r,i)=>(
            <tr key={i}>
              <td>{r.station}</td>
              <td className="num">{fmt(r.starts)}</td>
              <td className="num">{fmt(r.ends)}</td>
              <td className="num" style={{color: r.imbalance > 0 ? C.red : r.imbalance < 0 ? C.blue : C.grayLight, fontWeight:600}}>{r.imbalance > 0 ? "+" : ""}{r.imbalance}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  </div>);
}

/* ════════════════════ DATA FLOW ════════════════════ */
function DataFlow() {
  return (<div className="page">
    <div className="hdr"><h1>Data Flow &amp; System Logic</h1>
      <p>How raw Citi Bike trip data is cleaned, processed, modeled, and transformed into insights.</p></div>
    <div className="panel full" style={{textAlign:"center"}}>
      <img src="/dataflow.png" alt="Data Flow Diagram" style={{maxWidth:"100%",borderRadius:12,border:`1px solid ${C.border}`}} />
    </div>
    <div className="row2">
      <div className="panel">
        <h3>Data Pipeline</h3>
        <div className="flow-steps">
          <div className="flow-step"><span className="flow-num">1</span><div><strong>Raw Data</strong><p>Citi Bike trip-history CSV (1M rows) — ride_id, timestamps, station names, coordinates, rider type, bike type</p></div></div>
          <div className="flow-step"><span className="flow-num">2</span><div><strong>Power Query Cleaning</strong><p>Remove nulls, filter invalid durations, create derived fields (hour, day, date, trip duration)</p></div></div>
          <div className="flow-step"><span className="flow-num">3</span><div><strong>DAX Measures</strong><p>Calculate KPIs — Station Imbalance Index (SII), Peak Hour Demand Ratio (PHDR), Member Utilization Rate (MUR)</p></div></div>
          <div className="flow-step"><span className="flow-num">4</span><div><strong>Dashboard Visuals</strong><p>Interactive charts, cards, tables, slicers, and cross-filtering across 7 report pages</p></div></div>
        </div>
      </div>
      <div className="panel">
        <h3>Target Users</h3>
        <div className="flow-steps">
          <div className="flow-step"><span className="flow-num" style={{background:C.green}}>→</span><div><strong>Service Planners</strong><p>Use Demand page to plan bike allocation during peak hours and days</p></div></div>
          <div className="flow-step"><span className="flow-num" style={{background:C.blue}}>→</span><div><strong>Operations Managers</strong><p>Use Imbalance page to schedule rebalancing trucks to high-pressure stations</p></div></div>
          <div className="flow-step"><span className="flow-num" style={{background:C.orange}}>→</span><div><strong>Leadership</strong><p>Use KPI cards and Comparison page for system health checks and strategic planning</p></div></div>
          <div className="flow-step"><span className="flow-num" style={{background:C.electric}}>→</span><div><strong>Rebalancing Teams</strong><p>Use station-level data to prioritize which stations need immediate attention</p></div></div>
        </div>
      </div>
    </div>
    <div className="hint">
      <strong>Full Power BI file:</strong> <a href="https://drive.google.com/file/d/1sstMB7H-AJH3yhLMCLPFNX9jL8o-PNX1/view?usp=sharing" target="_blank" rel="noopener noreferrer" style={{color:C.green}}>Download the .pbix file from Google Drive</a> to explore the complete dashboard with cross-filtering and additional interaction. Requires Power BI Desktop (free).
    </div>
  </div>);
}

/* ════════════════════ COMPARISON ════════════════════ */
function Comparison() {
  const k = raw.comparison;
  const [rebal, setRebal] = useState(20);
  const [peak, setPeak] = useState(10);
  const [memConv, setMemConv] = useState(14);

  const iPHDR = +(k.phdr * (1 - peak/100)).toFixed(2);
  const iMUR  = +(k.mur  * (1 + memConv/100)).toFixed(2);
  const iImb  = +(k.avgImbalance * (1 - rebal/100)).toFixed(2);

  const phdrChart = [{ kpi:"Original", value: k.phdr },{ kpi:"Improved", value: iPHDR }];
  const murChart  = [{ kpi:"Original", value: k.mur  },{ kpi:"Improved", value: iMUR  }];
  const imbChart  = [{ kpi:"Original", value: k.avgImbalance },{ kpi:"Improved", value: iImb }];

  return (<div className="page">
    <div className="hdr"><h1>Comparison Dashboard</h1>
      <p>Simulated KPI improvements — drag sliders to see changes in real time</p></div>

    <div className="cards c6">
      <Card label="Original PHDR" value={`${k.phdr}%`} accent={C.gray} />
      <Card label="Improved PHDR" value={`${iPHDR}%`} accent={C.green} sub={`↓ ${(k.phdr - iPHDR).toFixed(1)}pp`} />
      <Card label="Original MUR" value={`${k.mur}%`} accent={C.gray} />
      <Card label="Improved MUR" value={`${iMUR}%`} accent={C.green} sub={`↑ ${(iMUR - k.mur).toFixed(1)}pp`} />
      <Card label="Original Imbalance" value={k.avgImbalance.toFixed(0)} accent={C.gray} />
      <Card label="Improved Imbalance" value={iImb.toFixed(0)} accent={C.green} sub={`↓ ${(k.avgImbalance - iImb).toFixed(0)}`} />
    </div>

    <div className="sliders">
      <div className="slider-card">
        <label>Peak Hour Smoothing %</label>
        <input type="range" min={0} max={30} step={5} value={peak} onChange={e=>setPeak(+e.target.value)} />
        <span className="slider-val">{peak}%</span>
        <div className="slider-range"><span>0%</span><span>30%</span></div>
      </div>
      <div className="slider-card">
        <label>Member Conversion %</label>
        <input type="range" min={0} max={20} step={2} value={memConv} onChange={e=>setMemConv(+e.target.value)} />
        <span className="slider-val">{memConv}%</span>
        <div className="slider-range"><span>0%</span><span>20%</span></div>
      </div>
      <div className="slider-card">
        <label>Rebalancing Improvement %</label>
        <input type="range" min={0} max={50} step={5} value={rebal} onChange={e=>setRebal(+e.target.value)} />
        <span className="slider-val">{rebal}%</span>
        <div className="slider-range"><span>0%</span><span>50%</span></div>
      </div>
    </div>

    <div className="row3">
      <div className="panel">
        <h3>Peak Hour Demand: Before vs After</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={phdrChart}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="kpi" tick={{fill:C.grayLight}} />
            <YAxis tick={{fill:C.grayLight}} domain={[0, 'auto']} />
            <Tooltip contentStyle={ttStyle} formatter={v=>`${v}%`} />
            <Bar dataKey="value" name="PHDR %">
              <Cell fill={C.gray}/><Cell fill={C.green}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="panel">
        <h3>Member Utilization: Before vs After</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={murChart}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="kpi" tick={{fill:C.grayLight}} />
            <YAxis tick={{fill:C.grayLight}} domain={[0, 'auto']} />
            <Tooltip contentStyle={ttStyle} formatter={v=>`${v}%`} />
            <Bar dataKey="value" name="MUR %">
              <Cell fill={C.gray}/><Cell fill={C.blue}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="panel">
        <h3>Avg Station Imbalance: Before vs After</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={imbChart}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="kpi" tick={{fill:C.grayLight}} />
            <YAxis tick={{fill:C.grayLight}} domain={[0, 'auto']} />
            <Tooltip contentStyle={ttStyle} />
            <Bar dataKey="value" name="Avg Imbalance">
              <Cell fill={C.gray}/><Cell fill={C.orange}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="hint"><strong>How to read this page:</strong> Drag the sliders to simulate improvements. Lower PHDR = demand less concentrated in rush hours. Higher MUR = more members. Lower Imbalance = stations more balanced. Gray = current. Colored = simulated improvement.</div>
  </div>);
}

/* ════════════════════ APP SHELL ════════════════════ */
const PAGES = [
  { id:"home", label:"Home", icon:"⌂" },
  { id:"demand", label:"Demand", icon:"◔" },
  { id:"stations", label:"Stations", icon:"◎" },
  { id:"riders", label:"Riders", icon:"♟" },
  { id:"imbalance", label:"Imbalance", icon:"⇅" },
  { id:"dataflow", label:"Data Flow", icon:"⛗" },
  { id:"comparison", label:"Comparison", icon:"⟺" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const views = { home:<Home/>, demand:<Demand/>, stations:<Stations/>, riders:<Riders/>, imbalance:<Imbalance/>, dataflow:<DataFlow/>, comparison:<Comparison/> };

  return (<div className="app">
    <nav className="nav">
      <div className="nav-brand" onClick={()=>setPage("home")}>◆ Citi Bike DSS</div>
      <button className="burger" onClick={()=>setMenuOpen(!menuOpen)}>☰</button>
      <div className={`nav-links ${menuOpen?"open":""}`}>
        {PAGES.map(p=>(
          <button key={p.id} className={`nav-btn${page===p.id?" on":""}`} onClick={()=>{setPage(p.id);setMenuOpen(false);}}>
            <span className="ni">{p.icon}</span>{p.label}
          </button>
        ))}
      </div>
    </nav>
    <main className="main">{views[page]}</main>
    <footer className="foot">Citi Bike Demand &amp; Station-Imbalance Decision Support — Group 15 — May 2025 Data</footer>
  </div>);
}
