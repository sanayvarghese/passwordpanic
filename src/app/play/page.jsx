"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAutoAnimate } from "@formkit/auto-animate/react";

import styles from "../game.module.css";
import PasswordBox from "../../components/PasswordBox";
import RuleBox from "../../components/RuleBox";

import ruleList, { sort_rules } from "../../rules/rules";
import confetti from "canvas-confetti";

export default function SoloGame() {
  const router = useRouter();

  const [pswd, setPswd] = useState("");
  const [ruleState, setRuleState] = useState([]);
  const max_unlocked_rules = useRef(0);
  const pswdBoxRef = useRef(null);
  const [aaParent] = useAutoAnimate();
  const [allSolved, setAllSolved] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameStartedAt, setGameStartedAt] = useState(null);
  const [timeDisplay, setTimeDisplay] = useState(0);
  const myCompletionTime = useRef(null);
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  // Set default values for solo game
  const maxSkips = 2;
  const [skipsUsed, setSkipsUsed] = useState(0);
  const [skippedRules, setSkippedRules] = useState(new Set());

  // initialization rule numbers
  useEffect(() => {
    for (let i = 0; i < ruleList.length; i++) {
      ruleList[i].num = i + 1;
    }
    max_unlocked_rules.current = 0;

    setRuleState(ruleList);
    setGameStartedAt(Date.now());
  }, []);

  // Real-time time display
  useEffect(() => {
    if (!gameStartedAt || gameEnded) return;
    const update = () => {
      const elapsed = Date.now() - gameStartedAt;
      setTimeDisplay(elapsed);
    };
    update(); // Run immediately
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [gameStartedAt, gameEnded]);

  const formatTime = (ms) => {
    if (!ms && ms !== 0) return "0:00";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Re-check rules when skippedRules changes
  useEffect(() => {
    if (skippedRules.size > 0 && ruleState.length > 0) {
      checkRules(pswd);
    }
  }, [skippedRules]);

  function setPswdAndCheckRules(txt) {
    setPswd(txt);
    checkRules(txt);
  }

  //check rules loop
  function checkRules(txt, currentRules = ruleState) {
    if (currentRules.length === 0 || gameEnded) return;

    let rules = [...currentRules];

    if (!rules[0].unlocked && txt.length > 0) {
      rules[0].unlocked = true;
      max_unlocked_rules.current++;
    }

    let solved_count = 0;
    for (let i = 0; i < rules.length; i++) {
      if (i === max_unlocked_rules.current) {
        if (solved_count === max_unlocked_rules.current) {
          rules[i].unlocked = true;
          max_unlocked_rules.current++;
        } else {
          break;
        }
      }

      if (skippedRules.has(rules[i].num)) {
        rules[i].correct = true;
      } else {
        rules[i].correct = rules[i].check(
          txt,
          max_unlocked_rules.current,
          rules,
        );
      }
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

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }

    // Store completion time when player finishes
    if (allRulesSolved && !myCompletionTime.current && gameStartedAt) {
      myCompletionTime.current = Date.now() - gameStartedAt;
      setGameEnded(true); // Stop the timer when solved
    }
  }

  function shakePasswordBox(boolean) {
    if (boolean) {
      pswdBoxRef.current?.classList.add("shake");
    } else {
      pswdBoxRef.current?.classList.remove("shake");
    }
  }

  function swapAnimation() {
    pswdBoxRef.current?.classList.add("swap-anim");
    setTimeout(() => {
      pswdBoxRef.current?.classList.remove("swap-anim");
    }, 500);
  }

  function regenerateRule(num) {
    num--; //change to rule index
    let rules = [...ruleState];
    if ("regenerate" in rules[num]) {
      rules[num].regenerate();
      checkRules(pswd, rules);
    }
  }

  function skipRule(num) {
    if (num >= 15) return;
    if (skipsUsed >= maxSkips) return;
    if (skippedRules.has(num)) return;

    setSkippedRules((prev) => new Set([...prev, num]));
    setSkipsUsed((prev) => prev + 1);
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
          <span>Play Solo Mode</span>
          {gameStartedAt && (
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              Time: {formatTime(timeDisplay)}
            </span>
          )}
        </div>

        {gameEnded && !allSolved && (
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
            <strong>Time's up! Game over.</strong>
          </div>
        )}

        {gameEnded && allSolved && (
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
            <strong>Great job!</strong> Check your completion time below.
          </div>
        )}

        <PasswordBox
          pswd={pswd}
          setPswd={setPswdAndCheckRules}
          ref={pswdBoxRef}
          disabled={gameEnded}
        />

        <div
          style={{
            color: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <div>
            level: {max_unlocked_rules.current}
            {maxSkips > 0 && (
              <span style={{ marginLeft: "1rem", opacity: 0.8 }}>
                skips: {skipsUsed}/{maxSkips}
              </span>
            )}
          </div>
          <div>
            <button
              onClick={() => router.push("/")}
              style={{
                background: "#000",
                color: "#fff",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Quit Game
            </button>
          </div>
        </div>

        <div ref={aaParent}>
          {allSolved && (
            <RuleBox
              heading={"Congratulations!"}
              msg={
                "You have successfully created a password. \u{1F389}\u{1F389}" +
                (myCompletionTime.current
                  ? `\nTime taken: ${formatTime(myCompletionTime.current)}`
                  : "")
              }
              correct={true}
            />
          )}
          {ruleState
            .filter((r) => r.unlocked)
            .sort(sort_rules)
            .map((r) => {
              const isSkipped = skippedRules.has(r.num);
              const canSkip =
                !isSkipped &&
                !r.correct &&
                r.unlocked &&
                skipsUsed < maxSkips &&
                r.num < 15 &&
                !gameEnded &&
                gameStartedAt;
              return (
                <RuleBox
                  key={r.num}
                  heading={`Rule ${r.num}`}
                  msg={r.msg}
                  correct={r.correct || isSkipped}
                  skipped={isSkipped}
                  canSkip={canSkip}
                  onSkip={() => skipRule(r.num)}
                  renderItem={r.renderItem}
                  propsToChild={{
                    pswd,
                    setPswd: setPswdAndCheckRules,
                    shakePasswordBox,
                    swapAnimation,
                    regenerateRule,
                    correct: r.correct || isSkipped,
                    rulesArray: ruleState,
                  }}
                />
              );
            })}
        </div>
      </div>
    </>
  );
}
