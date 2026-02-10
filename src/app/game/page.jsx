"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { createWebSocket } from "@/lib/ws";

import styles from "../game.module.css";
import PasswordBox from "../../components/PasswordBox";
import RuleBox from "../../components/RuleBox";
import GameEndModal from "../../components/GameEndModal";

import ruleList, { sort_rules } from "../../rules/rules";
import confetti from "canvas-confetti";

function MultiplayerGameInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = searchParams.get("roomCode");
  const playerId = searchParams.get("playerId");

  const [pswd, setPswd] = useState("");
  const [ruleState, setRuleState] = useState([]);
  const max_unlocked_rules = useRef(0);
  const pswdBoxRef = useRef(null);
  const [aaParent, aaEnableAnimations] = useAutoAnimate();
  const [allSolved, setAllSolved] = useState(false);
  const [ws, setWs] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [endReason, setEndReason] = useState(null);
  const [gameStartedAt, setGameStartedAt] = useState(null);
  const [timeLimit, setTimeLimit] = useState(null);
  const [timeDisplay, setTimeDisplay] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const myCompletionTime = useRef(null); // When player completes, store their time
  const wsRef = useRef(null);
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  // initialization rule numbers
  useEffect(() => {
    if (!roomCode || !playerId) {
      router.push("/");
      return;
    }

    for (let i = 0; i < ruleList.length; i++) {
      ruleList[i].num = i + 1;
    }
    max_unlocked_rules.current = 0;

    setRuleState(ruleList);

    // Connect to WebSocket server
    const websocket = createWebSocket();
    wsRef.current = websocket;

    websocket.onopen = () => {
      console.log("Connected to server");
      // Reconnect to maintain player identity
      if (roomCode && playerId && websocket.readyState === WebSocket.OPEN) {
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
      console.log("Received:", data);

      if (data.type === "reconnected") {
        console.log("Reconnected to room:", data.roomCode);
        setPlayerName(data.playerName);
        setGameStartedAt(data.startedAt || null);
        setTimeLimit(data.timeLimit || null);
        if (data.gameEnded) {
          setTimeLeft(null);
        }
      } else if (data.type === "game_started") {
        setGameStartedAt(data.startedAt || Date.now());
        setTimeLimit(data.timeLimit || null);
        console.log("Game started!");
      } else if (data.type === "game_ended") {
        setGameEnded(true);
        setFinalStats(data.finalStats);
        setEndReason(data.reason);
        setTimeLeft(null);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
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
    };
  }, [roomCode, playerId, router]);

  // Real-time time display and time left (updates every second)
  useEffect(() => {
    if (!gameStartedAt || gameEnded) return;
    const update = () => {
      const elapsed = Date.now() - gameStartedAt;
      setTimeDisplay(elapsed);
      if (timeLimit) {
        setTimeLeft(Math.max(0, timeLimit - elapsed));
      }
    };
    update(); // Run immediately
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [gameStartedAt, gameEnded, timeLimit]);

  const formatTime = (ms) => {
    if (!ms && ms !== 0) return "0:00";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // callback on textbox change, check rules along with setPswd
  function setPswdAndCheckRules(txt) {
    setPswd(txt);
    checkRules(txt);
  }

  //check rules loop
  function checkRules(txt) {
    if (ruleState.length === 0 || gameEnded) return;

    let rules = [...ruleState];

    //base case, first rule
    if (!rules[0].unlocked && txt.length > 0) {
      rules[0].unlocked = true;
      max_unlocked_rules.current++;
    }

    let solved_count = 0;
    for (let i = 0; i < rules.length; i++) {
      if (i === max_unlocked_rules.current) {
        // coming to rule that was not unlocked before
        if (solved_count === max_unlocked_rules.current) {
          // if all previous rules are solved i.e correct at this moment
          rules[i].unlocked = true; // unlock this new rule
          max_unlocked_rules.current++; // increment max unlocked rules
        } else {
          // if all previous rules are not solved
          break; // break, do not unlock a new rule
        }
      }

      rules[i].correct = rules[i].check(txt);
      if (rules[i].correct) {
        solved_count++;
      }
    }

    setRuleState(rules);

    const allRulesSolved = solved_count === rules.length;
    setAllSolved(allRulesSolved);
    if (allRulesSolved && !confettiTriggered) {
      setConfettiTriggered(true);
      var count = 200;
      var defaults = {
        origin: { y: 0.7 },
      };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }

    // Store completion time when player finishes
    if (allRulesSolved && !myCompletionTime.current && gameStartedAt) {
      myCompletionTime.current = Date.now() - gameStartedAt;
    }

    // Send progress update to server (only if game hasn't ended)
    if (ws && ws.readyState === WebSocket.OPEN && !gameEnded) {
      // Send ALL rules from ruleState (the state, not the local copy)
      // Use the updated 'rules' array which has the latest correct/unlocked status
      // But ensure we include ALL rules, not just unlocked ones
      const allRuleStates = ruleState.map((r, index) => {
        // Find the corresponding rule in the updated 'rules' array
        const updatedRule = rules.find((rule) => rule.num === r.num) || r;
        return {
          num: r.num || index + 1,
          correct: updatedRule.correct || false,
          unlocked: updatedRule.unlocked || false,
        };
      });

      ws.send(
        JSON.stringify({
          type: "update_progress",
          rulesCompleted: solved_count,
          totalRules: ruleState.length,
          password: txt, // You might want to avoid sending the full password for security
          ruleStates: allRuleStates,
          allSolved: allRulesSolved,
        }),
      );
    }
  }

  function shakePasswordBox(boolean) {
    if (boolean) {
      pswdBoxRef.current.classList.add("shake");
    } else {
      pswdBoxRef.current.classList.remove("shake");
    }
  }

  function regenerateRule(num) {
    console.log("regenerate", num);
    num--; //change to rule index
    let rules = [...ruleState];
    if ("regenerate" in rules[num]) {
      rules[num].regenerate();
      setRuleState(rules);
    }
  }

  return (
    <>
      <div className={styles.container}>
        <div
          style={{
            color: "black",
            marginBottom: "1rem",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <span>
            Room: {roomCode} | Player: {playerName}
          </span>
          {gameStartedAt && !gameEnded && (
            <>
              {timeLimit && timeLeft !== null && (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: timeLeft < 60000 ? "#ff6b6b" : "inherit",
                  }}
                >
                  Time left: {formatTime(timeLeft)}
                </span>
              )}
            </>
          )}
        </div>

        {gameEnded && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              padding: "1rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              textAlign: "center",
              color: "#333",
            }}
          >
            <strong>Game Ended!</strong> Check the results below.
          </div>
        )}

        <PasswordBox
          pswd={pswd}
          setPswd={setPswdAndCheckRules}
          ref={pswdBoxRef}
          disabled={gameEnded}
        />
        <div style={{ color: "white" }}>
          level: {max_unlocked_rules.current}
        </div>
        <div ref={aaParent}>
          {allSolved && (
            <RuleBox
              heading={"Congratulations!"}
              msg={
                "You have successfully created a password. \u{1F389}\u{1F389}"
              }
              correct={true}
            />
          )}
          {ruleState
            .filter((r) => r.unlocked)
            .sort(sort_rules)
            .map((r) => {
              return (
                <RuleBox
                  key={r.num}
                  heading={`Rule ${r.num}`}
                  msg={r.msg}
                  correct={r.correct}
                  renderItem={r.renderItem}
                  propsToChild={{
                    pswd,
                    setPswd: setPswdAndCheckRules,
                    shakePasswordBox,
                    regenerateRule,
                    correct: r.correct,
                  }}
                />
              );
            })}
        </div>
      </div>

      {gameEnded && finalStats && (
        <GameEndModal reason={endReason} finalStats={finalStats} />
      )}
    </>
  );
}

export default function MultiplayerGame() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.loading}>Creating room...</div>
        </div>
      }
    >
      <MultiplayerGameInner />
    </Suspense>
  );
}
