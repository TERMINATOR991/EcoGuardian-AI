
import { useEffect, useState } from "react";
import "./App.css";

const makeDemoReadings = () => ({
  temperature: (29 + Math.random() * 6).toFixed(1),
  humidity: Math.round(48 + Math.random() * 25),
  light: Math.round(180 + Math.random() * 500),
  motion: Math.random() > 0.45,
  current: (0.3 + Math.random() * 2).toFixed(2),
  waste: (0.02 + Math.random() * 0.12).toFixed(3),
});

export default function App() {
  const [demoMode, setDemoMode] = useState(true);
  const [readings, setReadings] = useState(makeDemoReadings);

  const [devOpen, setDevOpen] = useState(false);
  const [espUrl, setEspUrl] = useState("http://192.168.1.100");

  const [connectionStatus, setConnectionStatus] = useState("Not connected");
  const [lastUpdated, setLastUpdated] = useState(null);

 
useEffect(() => {
  let timer;
  let cancelled = false;

  const update = async () => {
    if (demoMode) {
      setReadings(makeDemoReadings());
      setConnectionStatus("Demo mode — simulated");
      setLastUpdated(new Date().toLocaleTimeString());
    } else {
      try {
        const baseUrl = espUrl.trim().replace(/\/+$/, "");
        const response = await fetch(`${baseUrl}/api/sensors`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (cancelled) return;

        setReadings((previous) => ({
          ...previous,
          temperature: data.temperature ?? previous.temperature,
          humidity: data.humidity ?? previous.humidity,
          light: data.light ?? previous.light,
          current: data.current ?? previous.current,
          motion: data.motion ?? previous.motion,
          waste: "—",
        }));

        setConnectionStatus("Connected to ESP32");
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        if (!cancelled) {
          setConnectionStatus("Connection failed");
          console.error("ESP32 connection error:", error);
        }
      }
    }

    if (!cancelled) {
      timer = setTimeout(update, 5000 + Math.random() * 5000);
    }
  };

  update();

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}, [demoMode, espUrl]);


  const metrics = [
    ["Temperature", readings.temperature, "°C", "Classroom temperature"],
    ["Humidity", readings.humidity, "%", "Relative humidity"],
    ["Light intensity", readings.light, "lux", "Classroom brightness"],
    ["Occupancy", readings.motion ? "Motion detected" : "No motion", "", "PIR demo status"],
    ["Current", readings.current, "A", "Simulated current reading"],
    ["Estimated energy waste", readings.waste, "kWh", "Illustrative demo estimate"],
  ];

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">SMART CLASSROOM MONITORING</p>
          <h1>EcoGuardian <span>AI</span></h1>
          <p className="subtitle">
            Environmental intelligence for sustainable classrooms.
          </p>
        </div>
        <div className="status">
          <span className="status-dot" />
          {demoMode ? "Demo data · Simulated" : "Live mode · Not connected"}
        </div>

        <button
        className="dev-trigger"
        onClick={() => setDevOpen(!devOpen)}
        title="Developer settings"
      >
  ⚙
    </button>

      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">CLASSROOM OVERVIEW</p>
          <h2>Your classroom, at a glance.</h2>
          <p>
            {demoMode
              ? "Preview with simulated readings. These are not actual sensor measurements."
              : "Live readings are not connected yet. ESP32 firmware integration is required."}
          </p>
        </div>
        <button onClick={() => setDemoMode(!demoMode)}>
          {demoMode ? "Switch to live mode" : "Switch to demo mode"}
        </button>
      </section>

      <section className="metrics">
        
{devOpen && (
  <section className="welcome dev-panel">
    <div>
      <p className="eyebrow">DEVELOPER SETTINGS</p>
      <h2>Device connection</h2>
      <p>Enter the ESP32 address on your Wi-Fi or mobile hotspot network.</p>
      <input
        className="esp-input"
        value={espUrl}
        onChange={(e) => setEspUrl(e.target.value)}
        placeholder="http://192.168.1.100"
      />
      <p>Connection: {connectionStatus}</p>
<p>Last update: {lastUpdated || "No live data received"}</p>
    </div>
    <button onClick={() => setDevOpen(false)}>Close settings</button>
  </section>
)}

        {metrics.map(([label, value, unit, description]) => (
          <article className="metric-card" key={label}>
            <p>{label}</p>
            <h2>
              {value} {unit && <small>{unit}</small>}
            </h2>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <footer>
        EcoGuardian AI · ESP32 Environmental Monitoring · Demo values are simulated
      </footer>
    </main>
  );
}
