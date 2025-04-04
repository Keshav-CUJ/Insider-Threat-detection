import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./realtime.css"; // Ensure CSS is imported

const socket = io("http://localhost:5000");

function Realtime() {
  const [csvFile, setCsvFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [kafkaLogs, setKafkaLogs] = useState([]);
  const [riskScores, setRiskScores] = useState([]);
  const [userData, setUserData] = useState({ user: "", date: "" });
  const [highRiskActivities, setHighRiskActivities] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [predictionComplete, setPredictionComplete] = useState(false);
  const logsEndRef = useRef(null);
  const kafkaLogsEndRef = useRef(null);
  const [processingStatus, setProcessingStatus] = useState("");
  const [emailsData, setEmailsData] = useState([]);

  useEffect(() => {
    // Listen for producer logs (Risk Score and Timestamp)
    socket.on("producer_log", ({ message }) => {
      console.log("Producer Log:", message);

      const match = message.match(/Sent risk: (\d+(\.\d+)?) at (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
      if (match) {
        const risk_score = parseFloat(match[1]);
        const timestamp = match[3];

        setRiskScores((prevScores) => [...prevScores, { timestamp, risk_score }]);
      }

      setLogs((prevLogs) => [...prevLogs, message]);
      scrollToBottom(logsEndRef);
    });

    // Listen for Kafka messages (Full Data + Extracted User & Date)
    socket.on("new_kafka_message", (data) => {
      console.log("Kafka Message:", data);

      if (data.user && data.date) {
        setUserData({ user: data.user, date: data.date });
      }

      // Store full Kafka message (as JSON)
      setKafkaLogs((prevLogs) => [...prevLogs, JSON.stringify(data, null, 2)]);

      // Extract high-risk activities
      if (data.activity && data.risk_score > 95) {
        setHighRiskActivities((prev) => {
          const category = data.activity.startsWith("http") ? "http" : data.activity.startsWith("email") ? "email" : null;
          if (category) {
            return {
              ...prev,
              [category]: [...(prev[category] || []), { activity: data.activity, risk: data.risk_score }],
            };
          }
          return prev;
        });
      }

      scrollToBottom(kafkaLogsEndRef);


    });

    return () => {
      socket.off("producer_log");
      socket.off("new_kafka_message");
    };
  }, []);

  // ✅ Listen for prediction completion event
  useEffect(() => {
    socket.on("prediction_done", () => {
      console.log("Prediction completed. Showing results...");
      setPredictionComplete(true);

      // Emit event to process email data after prediction is done
    socket.emit("process_email_data");
    });

    return () => {
      socket.off("prediction_done");
    };
  }, []);



  useEffect(() => {
    // Listen for real-time email processing updates
    socket.on("email_processing_update", ({ status }) => {
      console.log("Processing Update:", status);
      setProcessingStatus(status);
    });

    // Listen for final email analysis data
    socket.on("email_analysis", (data) => {
      console.log("Email Analysis Data:", data);
      setEmailsData(JSON.parse(data));
    });

    return () => {
      socket.off("email_processing_update");
      socket.off("email_analysis");
    };
  }, []);

  const scrollToBottom = (ref) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (csvFile) {
      // 🔹 Clear previous logs, Kafka messages, and risk scores
      setLogs([]);
      setKafkaLogs([]);
      setRiskScores([]);
      setUserData({ user: "", date: "" });
      setHighRiskActivities({});  // ✅ Reset high-risk categories
      setPredictionComplete(false); // ✅ Reset prediction state
      setEmailsData([]); // Clear previous results

      const reader = new FileReader();
      reader.readAsText(csvFile);
      reader.onload = () => {
        const fileContent = reader.result;
        socket.emit("upload_csv", { fileContent });
      };
    }
  };

  return (
    <div className="App">
      <h1>Real time anomaly Scoring Dashboard</h1>
      <h2>User: {userData.user} | Date: {userData.date}</h2>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload CSV</button>

      <div className="log-container">
        <h2>Producer Logs</h2>
        <div className="scrollable-box">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Only show after prediction completes */}
      {predictionComplete && (
        <>
          <div className="category-container">
            <h2>High-Risk Activity Categories</h2>
            {Object.keys(highRiskActivities).map((category) => (
              <button key={category} onClick={() => setSelectedCategory(category)} className="category-button">
                {category === "http" ? "HTTP Related Issues" : "Email Related Issues"} ({highRiskActivities[category]?.length})
              </button>
            ))}
          </div>

          {/* Show activities when category is clicked */}
          {selectedCategory && (
            <div className="log-container">
              <h2>{selectedCategory === "http" ? "HTTP Related Issues" : "Email Related Issues"}</h2>
              <div className="scrollable-box">
                {highRiskActivities[selectedCategory]?.map((item, index) => (
                  <div key={index} className="activity-item">
                    <span className="activity-label">{item.activity}</span> → <span className="risk-score">{item.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="log-container">
        <h2>Kafka Messages</h2>
        <div className="scrollable-box">
          {kafkaLogs.map((log, index) => {
            const parsedData = JSON.parse(log); // Parse JSON string back to object

            return (
              <pre key={index} className="json-box">
                {Object.entries(parsedData).map(([key, value]) => (
                  <div key={key}>
                    <span className="json-key">"{key}"</span>: <span className="json-value">"{value}"</span>
                  </div>
                ))}
              </pre>
            );
          })}
          <div ref={kafkaLogsEndRef} />
        </div>
      </div>

      <div className="log-container">
        <h2>Risk Score Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={riskScores}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, "auto"]} />
            <Tooltip />
            <Line type="monotone" dataKey="risk_score" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h1>Email Anomaly Detection Dashboard</h1>

      
      {/* Real-time processing status */}
      {processingStatus && <h3 className="status">{processingStatus}</h3>}

      {/* Display analyzed emails */}
      {emailsData.length > 0 && (
        <div className="email-results">
          <h2>Processed Emails</h2>
          {emailsData.map((email, index) => (
            <div key={index} className="email-card">
              <h3>Email {index + 1}</h3>
              <p dangerouslySetInnerHTML={{ __html: email.email_text }} /> {/* Highlighted Email */}
              <p><strong>Reconstruction Error:</strong> {email.reconstruction_error.toFixed(4)}</p>
              <p><strong>Anomaly Score:</strong> {email.anomaly_score.toFixed(4)}</p>
              
              {/* Display similar emails */}
              <h4>Similar Emails:</h4>
              <ul>
                {email.similar_emails.map((simEmail, i) => (
                  <li key={i}>
                    <strong>Rank {simEmail.rank}</strong> | Similarity: {simEmail.similarity_score.toFixed(4)}
                    <p>{simEmail.email}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
   

   


  );
}



export default Realtime;
