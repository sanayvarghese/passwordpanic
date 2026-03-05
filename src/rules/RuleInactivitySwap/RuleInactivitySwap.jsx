import React, { useEffect } from "react";
import Rule from "../Rule";

function InactivityComponent({ pswd, setPswd, shakePasswordBox }) {
  useEffect(() => {
    if (!pswd || pswd.length < 2) return;

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

      // Optionally shake the box to notify user
      shakePasswordBox(true);
      setTimeout(() => shakePasswordBox(false), 500);
    }, 10000); // 10s

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pswd]);

  return <span style={{ marginLeft: "10px", color: "orange" }}>[Active]</span>;
}

export default class RuleInactivitySwap extends Rule {
  constructor() {
    super(
      "If there is a inactivity for 10s random characters swap each other.",
    );

    this.renderItem = ({ pswd, setPswd, shakePasswordBox }) => {
      return (
        <InactivityComponent
          pswd={pswd}
          setPswd={setPswd}
          shakePasswordBox={shakePasswordBox}
        />
      );
    };
  }

  check() {
    return true; // The rule is inherently always 'correct' state, as it's an action enforcer
  }
}
