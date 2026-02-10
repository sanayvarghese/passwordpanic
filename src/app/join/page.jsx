"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createWebSocket } from "@/lib/ws";
import styles from "../host/page.module.css";

function JoinRoomPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = searchParams.get("code");
  const playerName = searchParams.get("name") || "Player";
  const [playerId, setPlayerId] = useState("");
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const wsRef = useRef(null);
  const playerIdRef = useRef("");
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!roomCode || !playerName) {
      router.push("/");
      return;
    }

    // Prevent duplicate joins in Strict Mode
    if (hasJoinedRef.current) {
      return;
    }

    // Connect to WebSocket server
    const websocket = createWebSocket();
    wsRef.current = websocket;
    hasJoinedRef.current = true;

    websocket.onopen = () => {
      console.log("Connected to server");
      if (websocket.readyState === WebSocket.OPEN && hasJoinedRef.current) {
        websocket.send(
          JSON.stringify({
            type: "join_room",
            roomCode: roomCode,
            playerName: playerName,
          }),
        );
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);

      switch (data.type) {
        case "room_joined":
          setPlayerId(data.playerId);
          playerIdRef.current = data.playerId;
          setConnected(true);
          // Wait for game to start
          break;
        case "join_failed":
          setError(data.message || "Failed to join room");
          break;
        case "game_started":
          // Redirect to game
          router.push(
            `/game?roomCode=${roomCode}&playerId=${playerIdRef.current}`,
          );
          break;
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError(
        "Failed to connect to server. Make sure the server is running on port 3001.",
      );
    };

    websocket.onclose = () => {
      console.log("WebSocket closed");
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
      // Don't reset hasJoinedRef here - it prevents duplicate joins on remount
    };
    // We deliberately omit `playerId` so we don't reconnect every time it changes
  }, [roomCode, playerName, router]);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push("/")}
            className={styles.startButton}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Joining room...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loading}>
        <h1>Joined Room: {roomCode}</h1>
        Waiting for host to start the game...
      </div>
    </div>
  );
}

export default function JoinRoomPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.loading}>Creating room...</div>
        </div>
      }
    >
      <JoinRoomPageInner />
    </Suspense>
  );
}
