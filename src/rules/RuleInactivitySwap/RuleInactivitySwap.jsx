import React, { useEffect } from "react";
import Rule from "../Rule";

function InactivityComponent({
  pswd,
  setPswd,
  shakePasswordBox,
  swapAnimation,
  rulesArray,
  setRuleActive,
}) {
  const [isActive, setIsActive] = React.useState(false);

  // 2 seconds grace period or until first keystroke
  useEffect(() => {
    if (isActive) return;

    if (pswd && pswd.length > 0) {
      setRuleActive(true);
      setIsActive(true);
      return;
    }

    const graceTimer = setTimeout(() => {
      setRuleActive(true);
      setIsActive(true);
      setPswd(pswd || "");
    }, 2000);
    return () => clearTimeout(graceTimer);
  }, [isActive, pswd, setPswd, setRuleActive]);

  useEffect(() => {
    if (!isActive) return;
    if (!pswd || pswd.length < 2) return;

    // Check if all rules are completed or skipped
    if (rulesArray && rulesArray.length > 0) {
      const allDone = rulesArray.every((r) => r.correct);
      if (allDone) return;
    }

    const timeout = setTimeout(() => {
      // safely split into grapheme clusters to support complex emojis/flags
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      const charArray = Array.from(segmenter.segment(pswd)).map(
        (s) => s.segment,
      );

      let idx1 = Math.floor(Math.random() * charArray.length);
      let idx2 = Math.floor(Math.random() * charArray.length);
      while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * charArray.length);
      }

      const temp = charArray[idx1];
      charArray[idx1] = charArray[idx2];
      charArray[idx2] = temp;

      const newPswd = charArray.join("");
      setPswd(newPswd);

      // Flash the box for swap
      if (typeof swapAnimation === "function") {
        swapAnimation();
      } else {
        shakePasswordBox(true);
        setTimeout(() => shakePasswordBox(false), 500);
      }
    }, 10000); // 10s inactivity limit

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pswd, isActive, rulesArray]);

  return (
    <span style={{ marginLeft: "10px", color: isActive ? "orange" : "gray" }}>
      {isActive ? "[Active]" : "[Starting...]"}
    </span>
  );
}

export default class RuleInactivitySwap extends Rule {
  constructor() {
    super(
      "If there is a inactivity for 10s random characters swap each other.",
    );

    this.isActive = false;

    this.renderItem = ({
      pswd,
      setPswd,
      shakePasswordBox,
      swapAnimation,
      rulesArray,
    }) => {
      return (
        <InactivityComponent
          pswd={pswd}
          setPswd={setPswd}
          shakePasswordBox={shakePasswordBox}
          swapAnimation={swapAnimation}
          rulesArray={rulesArray}
          setRuleActive={(active) => {
            this.isActive = active;
          }}
        />
      );
    };
  }

  check() {
    return this.isActive;
  }
}
