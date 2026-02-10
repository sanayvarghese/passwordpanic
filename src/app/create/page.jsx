"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createWebSocket } from "@/lib/ws";
import styles from "../host/page.module.css";

function CreateRoomPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const playerName = searchParams.get("name") || "Host";
  const wsRef = useRef(null);
  const hasCreatedRef = useRef(false);

  useEffect(() => {
    if (!playerName) {
      router.push("/");
      return;
    }

    // Prevent duplicate room creation in Strict Mode
    if (hasCreatedRef.current) {
      return;
    }

    const websocket = createWebSocket();
    wsRef.current = websocket;
    hasCreatedRef.current = true;

    websocket.onopen = () => {
      console.log("Connected to server");
      const timeLimit = parseInt(searchParams.get("timeLimit")) || 60;
      if (websocket.readyState === WebSocket.OPEN && hasCreatedRef.current) {
        websocket.send(
          JSON.stringify({
            type: "create_room",
            playerName: playerName,
            timeLimit: timeLimit,
          }),
        );
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);

      switch (data.type) {
        case "room_created":
          // Redirect to room-specific URL so host can reconnect on reload
          router.replace(
            `/room/${data.roomCode}?playerId=${data.playerId}&isHost=true`,
          );
          break;
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      alert(
        "Failed to connect to server. Make sure the server is running on port 3001.",
      );
    };

    websocket.onclose = () => {
      console.log("WebSocket closed");
    };

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
      // Don't reset hasCreatedRef here - it prevents duplicate room creation on remount
    };
  }, [playerName, router, searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.loading}>Creating room...</div>
    </div>
  );
}

export default function CreateRoomPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.loading}>Creating room...</div>
        </div>
      }
    >
      <CreateRoomPageInner />
    </Suspense>
  );
}
