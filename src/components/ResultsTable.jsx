import React from "react";
import styles from "./ResultsTable.module.css";
import confetti from "canvas-confetti";

export default function ResultsTable({ finalStats, reason }) {
  const [isConfettiPopped, setIsConfettiPopped] = React.useState(false);
  React.useEffect(() => {
    if (finalStats.some((player) => player.allSolved) && !isConfettiPopped) {
      setIsConfettiPopped(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [finalStats]);

  const formatTime = (ms) => {
    if (!ms) return "N/A";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
    <div className={styles.resultsContainer}>
      <h2 className={styles.title}>
        {reason === "all_completed"
          ? "🎉 Congratulations! Everyone found the password!"
          : reason === "time_up"
            ? "⏰ Time's Up!"
            : "🛑 Game Stopped"}
      </h2>
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
                className={index === 0 && player.allSolved ? styles.winner : ""}
              >
                <td className={styles.rank}>#{index + 1}</td>
                <td className={styles.playerName}>{player.name}</td>
                <td className={styles.rulesCell}>{renderRuleBoxes(player)}</td>
                <td className={styles.time}>{formatTime(player.timeTaken)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
