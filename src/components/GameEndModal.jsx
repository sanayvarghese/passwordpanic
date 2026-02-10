import React from "react";
import styles from "./GameEndModal.module.css";

export default function GameEndModal({ reason, finalStats }) {
  const formatTime = (ms) => {
    if (!ms) return "N/A";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getMessage = () => {
    if (reason === "all_completed") {
      return "🎉 Congratulations! You have found the password!";
    } else if (reason === "time_up") {
      return "⏰ Time's Up! The game has ended.";
    } else if (reason === "stopped") {
      return "🛑 The host has stopped the game.";
    }
    return "Game has ended.";
  };

  const renderRuleBoxes = (player) => {
    const totalRules = player.totalRules || 0;
    const ruleStates = player.ruleStates || [];

    // Create array of all rules with their completion status
    const rules = [];
    for (let i = 1; i <= totalRules; i++) {
      const ruleState = ruleStates.find((r) => r.num === i);
      rules.push({
        num: i,
        completed: ruleState ? ruleState.correct : false,
      });
    }

    return (
      <div className={styles.ruleBoxes}>
        {rules.map((rule) => (
          <div
            key={rule.num}
            className={`${styles.ruleBox} ${rule.completed ? styles.completedBox : styles.incompleteBox}`}
            title={`Rule ${rule.num}${rule.completed ? " - Completed" : " - Incomplete"}`}
          >
            {rule.completed ? "✓" : rule.num}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{getMessage()}</h2>
        </div>

        <div className={styles.content}>
          <h3>
            {reason === "all_completed"
              ? "Final Results - Everyone Completed!"
              : "Final Results"}
          </h3>
          <div className={styles.tableWrapper}>
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Name</th>
                  <th>Rules Completed</th>
                  <th>Time Taken</th>
                </tr>
              </thead>
              <tbody>
                {finalStats.map((player, index) => (
                  <tr
                    key={player.id}
                    className={
                      index === 0 && player.allSolved ? styles.winner : ""
                    }
                  >
                    <td className={styles.rank}>#{index + 1}</td>
                    <td className={styles.playerName}>{player.name}</td>
                    <td className={styles.rulesCell}>
                      {renderRuleBoxes(player)}
                    </td>
                    <td className={styles.time}>
                      {formatTime(player.timeTaken)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
