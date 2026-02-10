"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createWebSocket } from "@/lib/ws";
import styles from "../../host/page.module.css";
import ResultsTable from "../../../components/ResultsTable";
import LiveTable from "../../../components/LiveTable";
import rules from "@/rules/rules";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = params.roomCode;
  const playerId = searchParams.get("playerId");
  const isHost = searchParams.get("isHost") === "true";

  const [ws, setWs] = useState(null);
  const [stats, setStats] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [endReason, setEndReason] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLiveTableFullscreen, setIsLiveTableFullscreen] = useState(false);
  const wsRef = useRef(null);
  const timerRef = useRef(null);
  const liveTableRef = useRef(null);

  useEffect(() => {
    if (!roomCode || !playerId || !isHost) {
      router.push("/");
      return;
    }

    const websocket = createWebSocket();
    wsRef.current = websocket;

    websocket.onopen = () => {
      // Reconnect to existing room as host
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(
          JSON.stringify({
            type: "reconnect",
            playerId: playerId,
          }),
        );
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "reconnected":
          if (data.roomCode !== roomCode) {
            router.push("/");
            return;
          }
          setConnected(true);
          setGameStarted(data.gameStarted || false);
          setGameEnded(data.gameEnded || false);
          if (
            data.gameStarted &&
            !data.gameEnded &&
            data.startedAt &&
            data.timeLimit
          ) {
            const updateTimer = () => {
              const elapsed = Date.now() - data.startedAt;
              const remaining = Math.max(0, data.timeLimit - elapsed);
              setTimeRemaining(remaining);
              if (remaining === 0) {
                clearInterval(timerRef.current);
              }
            };
            updateTimer();
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(updateTimer, 1000);
          }
          // Request current stats
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: "get_stats" }));
          }
          break;
        case "room_stats":
          const newStats = {
            ...data.stats,
            players: (data.stats?.players || []).map((p) => ({
              ...p,
              ruleStates: p.ruleStates ? [...p.ruleStates] : [],
            })),
          };
          setStats(newStats);
          setGameStarted(data.stats?.gameStarted || false);
          setGameEnded(data.stats?.gameEnded || false);
          if (
            data.stats?.startedAt &&
            data.stats?.timeLimit &&
            !data.stats?.gameEnded
          ) {
            const updateTimer = () => {
              const elapsed = Date.now() - data.stats.startedAt;
              const remaining = Math.max(0, data.stats.timeLimit - elapsed);
              setTimeRemaining(remaining);
              if (remaining === 0) {
                clearInterval(timerRef.current);
              }
            };
            updateTimer();
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(updateTimer, 1000);
          }
          break;
        case "player_joined":
        case "player_left":
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: "get_stats" }));
          }
          break;
        case "game_started":
          setGameStarted(true);
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: "get_stats" }));
          }
          break;
        case "game_ended":
          setGameEnded(true);
          setGameStarted(false);
          setFinalStats(data.finalStats);
          setEndReason(data.reason);
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeRemaining(0);
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: "get_stats" }));
          }
          break;
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      alert(
        "Failed to connect to server. Make sure the server is running on port 3001.",
      );
    };

    setWs(websocket);

    return () => {
      if (wsRef.current) {
        // Only close if WebSocket is OPEN or CLOSING, not CONNECTING
        if (
          wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CLOSING
        ) {
          wsRef.current.close();
        }
      }
      wsRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomCode, playerId, isHost, router]);

  useEffect(() => {
    if (gameStarted && !gameEnded && ws && ws.readyState === WebSocket.OPEN) {
      const pollInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "get_stats" }));
        }
      }, 1000);
      return () => clearInterval(pollInterval);
    }
  }, [gameStarted, gameEnded, ws]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ?? document.webkitFullscreenElement
      );
      setIsLiveTableFullscreen(isFs);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange,
      );
    };
  }, []);

  const handleLiveTableFullscreen = () => {
    if (!liveTableRef.current) return;
    const el = liveTableRef.current;
    if (document.fullscreenElement ?? document.webkitFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else {
      (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el);
    }
  };

  const handleStartGame = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "start_game" }));
    }
  };

  const handleStopGame = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "stop_game" }));
    }
  };

  const formatTime = (ms) => {
    if (!ms) return "00:00";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!connected) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Reconnecting to room...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.roomCodeSection}>
        <h2>Room Code</h2>
        <div className={styles.roomCode}>{roomCode}</div>
        <p>Share this code with players to join your room</p>
      </div>

      {gameStarted && timeRemaining !== null && (
        <div className={styles.timerSection}>
          <h2>Time Remaining</h2>
          <div
            className={styles.timer}
            style={{ color: timeRemaining < 60000 ? "#f44336" : "#333" }}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      )}

      {stats && !gameStarted && !gameEnded && (
        <div className={styles.statsSection}>
          <h2>Players ({stats.totalPlayers})</h2>
          {stats.players.length === 0 ? (
            <p className={styles.noPlayers}>Waiting for players to join...</p>
          ) : (
            <div className={styles.playersList}>
              {stats.players.map((player) => (
                <div key={player.id} className={styles.playerCard}>
                  <div className={styles.playerName}>{player.name}</div>
                  <div className={styles.playerStats}>
                    <span>
                      Rules Completed: {player.rulesCompleted}/
                      {player.totalRules || rules.length}
                    </span>
                    {player.allSolved && (
                      <span className={styles.completed}>✓ Completed!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {stats && gameStarted && !gameEnded && stats.players.length > 0 && (
        <div ref={liveTableRef} className={styles.liveTableFullscreenWrapper}>
          <button
            type="button"
            onClick={handleLiveTableFullscreen}
            className={styles.fullscreenTableButton}
            title={
              isLiveTableFullscreen
                ? "Exit fullscreen"
                : "Fullscreen live table"
            }
          >
            {isLiveTableFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
          <LiveTable
            key={`live-table-${stats.players.map((p) => `${p.id}-${p.rulesCompleted}-${p.ruleStates?.length || 0}`).join("-")}`}
            players={stats.players}
            startedAt={stats.startedAt}
          />
        </div>
      )}

      {gameEnded && finalStats && (
        <ResultsTable finalStats={finalStats} reason={endReason} />
      )}

      <div className={styles.actions}>
        {!gameStarted && !gameEnded && (
          <button
            onClick={handleStartGame}
            className={styles.startButton}
            disabled={!stats || stats.totalPlayers === 0}
          >
            Start Game
          </button>
        )}
        {gameStarted && !gameEnded && (
          <button onClick={handleStopGame} className={styles.stopButton}>
            Stop Game
          </button>
        )}
      </div>
    </div>
  );
}
