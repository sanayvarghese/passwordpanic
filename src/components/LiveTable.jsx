import React, { useState, useEffect } from "react";
import styles from "./LiveTable.module.css";

export default function LiveTable({ players, startedAt }) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    // Update current time every second for live time display
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      setForceUpdate((prev) => prev + 1); // Force re-render
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Force re-render when players prop changes
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
    console.log("LiveTable: players updated", players);
  }, [players]);

  // Also check if players array content changed
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 500); // Force update every 500ms to catch changes

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    if (!ms && ms !== 0) return "00:00";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getCurrentTimeTaken = (player) => {
    if (!startedAt) return 0;
    // If player finished, use their finished time, otherwise use current time
    if (player.finishedAt) {
      return player.finishedAt - startedAt;
    }
    return currentTime - startedAt;
  };

  const renderRuleBoxes = (player) => {
    const totalRules = player.totalRules || 0;
    const ruleStates = player.ruleStates || [];

    // Debug: log rule states
    if (ruleStates.length > 0) {
      console.log(`Player ${player.name} ruleStates:`, ruleStates);
    }

    // Create array of all rules with their completion status
    const rules = [];
    for (let i = 1; i <= totalRules; i++) {
      const ruleState = ruleStates.find((r) => r.num === i);
      rules.push({
        num: i,
        completed: ruleState ? ruleState.correct : false,
      });
    }

    // If no rule states yet but we have totalRules, show all as incomplete
    if (rules.length === 0 && totalRules > 0) {
      for (let i = 1; i <= totalRules; i++) {
        rules.push({
          num: i,
          completed: false,
        });
      }
    }

    return (
      <div className={styles.ruleBoxes}>
        {rules.map((rule) => (
          <div
            key={`${player.id}-rule-${rule.num}`}
            className={`${styles.ruleBox} ${rule.completed ? styles.completedBox : styles.incompleteBox}`}
            title={`Rule ${rule.num}${rule.completed ? " - Completed" : " - Incomplete"}`}
          >
            {rule.completed ? "✓" : rule.num}
          </div>
        ))}
      </div>
    );
  };

  // Sort players: completed first, then by rules completed, then by time
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.allSolved && !b.allSolved) return -1;
    if (!a.allSolved && b.allSolved) return 1;
    if (a.rulesCompleted !== b.rulesCompleted)
      return b.rulesCompleted - a.rulesCompleted;
    const timeA = getCurrentTimeTaken(a);
    const timeB = getCurrentTimeTaken(b);
    return timeA - timeB;
  });

  return (
    <div className={styles.liveTableContainer}>
      <h2 className={styles.title}>Live Table</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.liveTable}>
          <thead>
            <tr>
              <th>Position</th>
              <th>Name</th>
              <th>Rules Completed</th>
              <th>Time Taken</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const currentTimeTaken = getCurrentTimeTaken(player);
              return (
                <tr
                  key={`${player.id}-${forceUpdate}`}
                  className={player.allSolved ? styles.completedRow : ""}
                >
                  <td className={styles.rank}>#{index + 1}</td>
                  <td className={styles.playerName}>{player.name}</td>
                  <td className={styles.rulesCell}>
                    {renderRuleBoxes(player)}
                  </td>
                  <td className={styles.time}>
                    {formatTime(currentTimeTaken)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
