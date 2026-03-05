import React, { useEffect, useRef, useState } from "react";
import Rule from "../Rule";

function ViolationObserverComponent({
  rulesArray,
  regenerateRule,
  ruleInstance,
  pswd,
  setPswd,
}) {
  const previousSolvedCount = useRef(null);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const targetCount = useRef(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!rulesArray) return;
    // sum up how many are correct, ignoring this specific rule instance so its own state doesn't ruin the count
    const currentSolvedCount = rulesArray.filter(
      (r) => r.correct && r !== ruleInstance,
    ).length;

    if (previousSolvedCount.current !== null) {
      if (currentSolvedCount < previousSolvedCount.current) {
        // A rule was violated! Find the Captcha rule
        const captchaRule = rulesArray.find(
          (r) => r && r.constructor && r.constructor.name === "RuleCaptcha",
        );
        // Only start timeout if Captcha is currently solved
        if (captchaRule && captchaRule.correct) {
          if (!timeoutRef.current) {
            targetCount.current = previousSolvedCount.current;
            setTimeLeft(3);
            ruleInstance.isViolated = true; // Immediately mark rule as failed
            setTimeout(() => setPswd(pswd), 50); // Re-eval to turn box red

            intervalRef.current = setInterval(() => {
              setTimeLeft((prev) => {
                if (prev !== null && prev > 1) return prev - 1;
                return prev;
              });
            }, 1000);

            timeoutRef.current = setTimeout(() => {
              regenerateRule(captchaRule.num);
              timeoutRef.current = null;
              clearInterval(intervalRef.current);
              intervalRef.current = null;
              setTimeLeft(null);
              ruleInstance.isViolated = false;
            }, 3000);
          }
        }
      }
    }

    // If an active timeout is running, and we recovered back to the target count
    if (timeoutRef.current && currentSolvedCount >= targetCount.current) {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
      timeoutRef.current = null;
      intervalRef.current = null;
      setTimeLeft(null);
      ruleInstance.isViolated = false;
      setTimeout(() => setPswd(pswd), 50); // Re-eval to turn box green again
    }

    previousSolvedCount.current = currentSolvedCount;
  }, [rulesArray, regenerateRule]);

  if (timeLeft !== null) {
    return (
      <span style={{ color: "red", marginLeft: "10px", fontWeight: "bold" }}>
        (Resetting in {timeLeft}...)
      </span>
    );
  }
  return null;
}

export default class RuleViolationChangeCaptcha extends Rule {
  constructor() {
    super("Violating a rule changes the CAPTCHA.");
    this.isViolated = false;

    // We don't have direct access to rulesArray in standard renderItem args right now because page.jsx doesn't pass it yet.
    // Wait, we need to modify page.jsx to pass `rulesArray: rules` in propsToChild string.
    this.renderItem = ({ rulesArray, regenerateRule, pswd, setPswd }) => {
      return (
        <ViolationObserverComponent
          rulesArray={rulesArray}
          regenerateRule={regenerateRule}
          ruleInstance={this}
          pswd={pswd}
          setPswd={setPswd}
        />
      );
    };
  }

  check() {
    return !this.isViolated; // Return false if currently tracking a violation countdown
  }
}
