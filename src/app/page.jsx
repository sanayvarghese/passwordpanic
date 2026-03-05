"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";
import { Press_Start_2P } from "next/font/google";

const climateCrisis = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-climate-crisis",
  display: "swap",
});

export default function MultiplayerPage() {
  const [mode, setMode] = useState("join"); // default 'join'
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [timeLimit, setTimeLimit] = useState(60); // default 60 minutes
  const [maxSkips, setMaxSkips] = useState(2); // default 2 skips
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("create")) {
        const pwd = window.prompt("Enter admin password to create a room:");
        if (pwd === process.env.NEXT_PUBLIC_PASSWORD) {
          setMode("create");
        } else {
          alert("Incorrect password.");
          router.replace("/"); // remove ?create from url
        }
      }
    }
  }, [router]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }
    router.push(
      `/create?name=${encodeURIComponent(playerName)}&timeLimit=${timeLimit}&maxSkips=${maxSkips}`,
    );
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!roomCode.trim()) {
      alert("Please enter a room code");
      return;
    }
    router.push(
      `/join?code=${encodeURIComponent(roomCode.toUpperCase())}&name=${encodeURIComponent(playerName)}`,
    );
  };

  return (
    <div className={styles.container}>
      {mode === "create" && (
        <div className={styles.formContainer}>
          <h2>Create a Game Room</h2>
          <div className={styles.inputGroup}>
            <label>Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className={styles.input}
              maxLength={20}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Time Limit (minutes):</label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) =>
                setTimeLimit(Math.max(1, parseInt(e.target.value) || 60))
              }
              placeholder="60"
              className={styles.input}
              min="1"
              max="300"
            />
            <small style={{ color: "#666", fontSize: "0.85rem" }}>
              Default: 60 minutes
            </small>
          </div>
          <div className={styles.inputGroup}>
            <label>Skips per Player:</label>
            <input
              type="number"
              value={maxSkips}
              onChange={(e) =>
                setMaxSkips(Math.max(0, parseInt(e.target.value) || 2))
              }
              placeholder="2"
              className={styles.input}
              min="0"
              max="20"
            />
            <small style={{ color: "#666", fontSize: "0.85rem" }}>
              Default: 2 skips. Players can skip difficult rules.
            </small>
          </div>
          <div className={styles.buttonGroup}>
            <button onClick={handleCreateRoom} className={styles.primaryButton}>
              Create Room
            </button>
            <button
              onClick={() => router.replace("/")}
              className={styles.secondaryButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === "join" && (
        <div className={styles.formContainer}>
          <h2>Join a Game Room</h2>
          <div className={styles.inputGroup}>
            <label>Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className={styles.input}
              maxLength={20}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Room Code:</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              className={styles.input}
              maxLength={6}
              style={{ textTransform: "uppercase" }}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button onClick={handleJoinRoom} className={styles.primaryButton}>
              Join Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
