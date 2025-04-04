import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function AnomalyDashboard() {
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anomalyData, setAnomalyData] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post("http://localhost:5001/upload", formData);
      alert("File uploaded successfully!");
      const response = await axios.get("http://localhost:5001/get_user_dates");
      setUsers(response.data.users);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Error uploading file!");
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5001/predict");
      const rawAnomalyData = response.data.anomaly_data;

      const minScore = Math.min(...rawAnomalyData.map((d) => d.anomaly_score));
      const maxScore = Math.max(...rawAnomalyData.map((d) => d.anomaly_score));

      const scaledAnomalyData = rawAnomalyData.map((entry) => ({
        ...entry,
        anomaly_score: ((entry.anomaly_score - minScore) / (maxScore - minScore)) * 99 + 1,
      }));

      setAnomalyData(scaledAnomalyData);
      alert("Prediction complete!");
    } catch (error) {
      console.error("Prediction failed:", error);
      alert("Error during prediction!");
    } finally {
      setLoading(false);
    }
  };
  
  const groupedData = anomalyData.reduce((acc, { user, day, anomaly_score }) => {
    if (!acc[user]) acc[user] = [];
    acc[user].push({ day, anomaly_score: Math.round(anomaly_score) });
    return acc;
  }, {});

  const maxAnomalyByDay = anomalyData.reduce((acc, { user, day, anomaly_score }) => {
    if (!acc[day] || anomaly_score > acc[day].anomaly_score) {
      acc[day] = { day, anomaly_score, user }; // Store user with max anomaly score
    }
    return acc;
  }, {});

  const lineChartData = Object.values(maxAnomalyByDay); // Convert object to array

  const userMaxScores = anomalyData.reduce((acc, { user, anomaly_score }) => {
    if (!acc[user] || anomaly_score > acc[user]) {
      acc[user] = anomaly_score;
    }
    return acc;
  }, {});

  // Convert object to array for plotting
  const histogramData = Object.entries(userMaxScores).map(([user, maxScore]) => ({
    user,
    maxScore,
    category: maxScore > 50 ? "Anomalous" : "Benign",
  }));

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <Link to="/" className="nav-brand">
          <i className="fas fa-shield-alt"></i>
          Daily basis threat Detection
        </Link>
        <div className="nav-controls">
          <div className="file-upload-wrapper">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".csv"
              id="file-upload"
              className="file-upload-input"
            />
            <label htmlFor="file-upload" className="file-upload-label">
              <i className="fas fa-upload"></i>
              Choose File
            </label>
          </div>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="action-button"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-cloud-upload-alt"></i>
            )}
            {loading ? "Uploading..." : "Upload & Load Data"}
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h2 className="dashboard-title">
          <i className="fas fa-chart-line"></i>
          Threat Detection Analysis
        </h2>

        {users && Object.keys(users).length > 0 ? (
          <div className="data-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-users"></i>
                Users & Available Dates
              </h3>
              <button
                onClick={handlePredict}
                disabled={loading}
                className="action-button"
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-brain"></i>
                )}
                {loading ? "Analyzing..." : "Get Anomaly Scores"}
              </button>
            </div>

            <div className="users-table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Available Dates</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(users).map(([user, dates]) => (
                    <tr key={user}>
                      <td>{user}</td>
                      <td>
                        <div className="date-container">
                          {dates.map((date) => (
                            <span key={date} className="date-circle">
                              {date}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={histogramData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <YAxis type="category" dataKey="user" width={100} />
                <XAxis type="number" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="maxScore">
                  {histogramData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.maxScore > 50 ? "#FF5733" : "#33FF57"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {Object.keys(groupedData).length > 0 && (
              <div>
                <h3>Anomaly Score Histograms</h3>
                {Object.entries(groupedData).map(([user, data]) => (
                  <div key={user} style={{ marginBottom: "80px", textAlign: "center" }}>
                    <h4>{user}</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="anomaly_score">
                          {data.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.anomaly_score > 50 ? "#FF5733" : "#2ECC71"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>


            )}

            {lineChartData.length > 0 && (
              <div>
                <h3>Max Anomaly Score Per Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `Anomaly Score: ${value.toFixed(2)}`,
                        `User: ${props.payload.user}`,
                      ]}
                    />

                    <Line type="monotone" dataKey="anomaly_score" stroke="#FF5733" strokeWidth={2} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-cloud-upload-alt"></i>
            <p>No data available. Please upload a CSV file to begin analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnomalyDashboard;
