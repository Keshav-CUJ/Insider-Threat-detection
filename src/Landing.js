import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    const [particles, setParticles] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [connections, setConnections] = useState([]);
    // Initialize particles
    useEffect(() => {
        const particleCount = 50;
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            startX: Math.random() * window.innerWidth,
            startY: Math.random() * window.innerHeight,
            endX: Math.random() * window.innerWidth,
            endY: Math.random() * window.innerHeight,
            duration: 3 + Math.random() * 7
        }));
        setParticles(newParticles);
    }, []);
    // Initialize network nodes and connections
    useEffect(() => {
        const nodeCount = 6;
        const newNodes = Array.from({ length: nodeCount }, (_, i) => ({
            id: i,
            x: 200 + Math.cos(2 * Math.PI * i / nodeCount) * 150,
            y: 200 + Math.sin(2 * Math.PI * i / nodeCount) * 150,
            delay: i * 0.5
        }));
        const newConnections = [];
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (Math.random() > 0.5) {
                    newConnections.push({
                        id: `${i}-${j}`,
                        from: newNodes[i],
                        to: newNodes[j]
                    });
                }
            }
        }
        setNodes(newNodes);
        setConnections(newConnections);
    }, []);
    return (
        <div className="landing">
            {/* Particles Background */}
            <div className="particles">
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className="particle"
                        style={{
                            '--start-x': `${particle.startX}px`,
                            '--start-y': `${particle.startY}px`,
                            '--end-x': `${particle.endX}px`,
                            '--end-y': `${particle.endY}px`,
                            '--particle-duration': `${particle.duration}s`,
                            left: 0,
                            top: 0
                        }}
                    />
                ))}
            </div>
            <div className="hero">
                <h1>Insider Threat Detection</h1>
                <p className="subtitle">Advanced AI-powered security monitoring system</p>
                <Link to="/realtime" className="cta-button">
                    Go for Realtime detection
                </Link>
                <Link to="/dashboard" className="cta-button">
                    Go for Daily basis Detection
                </Link>
            </div>
            <div className="animation-section">
                {/* Histogram Animation */}
                            <div className="histogram-container">
                                {Array.from({ length: 10 }, (_, i) => (

                                    <div
                                        key={i}
                                        className="histogram-bar"
                                        style={{
                                            '--min-height': `${20 + Math.random() * 30}px`,
                                            '--max-height': `${120 + Math.random() * 80}px`,
                                            animationDelay: `${i * 0.2}s`
                                        }}
                                    />
                                ))}
                            </div>
                {/* Alert Animation */}
                            <div className="alert-container">
                                <div className="alert-ring" />
                                <div className="alert-ring" style={{ animationDelay: '0.5s' }} />
                                <div className="alert-ring" style={{ animationDelay: '1s' }} />
                                <i className="fas fa-exclamation-triangle alert-icon" />
                            </div>
                {/* Network Visualization */}
                            <div className="network-container">
                                {connections.map(connection => {
                                    const angle = Math.atan2(
                                        connection.to.y - connection.from.y,
                                        connection.to.x - connection.from.x
                                    );
                                    const length = Math.sqrt(
                                        Math.pow(connection.to.x - connection.from.x, 2) +
                                        Math.pow(connection.to.y - connection.from.y, 2)
                                    );
                                    return (
                                        <div
                                            key={connection.id}
                                            className="connection"
                                            style={{
                                                left: `${connection.from.x}px`,
                                                top: `${connection.from.y}px`,
                                                width: `${length}px`,
                                                transform: `rotate(${angle}rad)`
                                            }}
                                        />
                                    );
                                })}
                                {nodes.map(node => (
                                    <div
                                        key={node.id}
                                        className="node"
                                        style={{
                                            left: `${node.x}px`,
                                            top: `${node.y}px`,
                                            animationDelay: `${node.delay}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="features">
                            <div className="feature-card">
                                <i className="fas fa-shield-alt"></i>
                                <h3>Real-time Detection</h3>
                                <p>Monitor and detect potential insider threats in real-time using LSTM Autoencoders and GCN</p>
                            </div>
                            <div className="feature-card">
                                <i className="fas fa-chart-line"></i>
                                <h3>Anomaly Analysis</h3>
                                <p>Sophisticated anomaly detection and insider network detection to identify unusual patterns and behaviors</p>
                            </div>
                            <div className="feature-card">
                                <i className="fas fa-user-shield"></i>
                                <h3>User Profiling</h3>
                                <p>Build comprehensive user profiles to establish normal behavior patterns</p>
                            </div>
                        </div>
                        <div className="how-it-works">
                            <h2>How It Works</h2>
                            <div className="steps">
                                <div className="step">
                                    <div className="step-number">1</div>
                                    <h4>Data Collection</h4>
                                    <p>Upload user activity data through our secure interface</p>
                                </div>
                                <div className="step">
                                    <div className="step-number">2</div>
                                    <h4>AI Analysis</h4>
                                    <p>Our AI model processes and analyzes behavior patterns</p>
                                </div>
                                <div className="step">
                                    <div className="step-number">3</div>
                                    <h4>Threat Detection</h4>
                                    <p>Receive instant alerts on potential security threats</p>
                                </div>
                </div>
            </div>    
        </div>
    );
};

export default Landing;
