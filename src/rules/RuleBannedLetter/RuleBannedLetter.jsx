import React, { useState } from "react";
import Rule from "../Rule";
import styles from "./RuleBannedLetter.module.css";

function BannedLetterComponent({ bannedChar, setBannedChar, pswd, setPswd }) {
  const [inputVal, setInputVal] = useState("");
  const [locked, setLocked] = useState(false);

  const handleApply = () => {
    if (inputVal.length === 1 && /[a-z]/i.test(inputVal)) {
      setBannedChar(inputVal.toLowerCase());
      setLocked(true);
      // Trigger a re-evaluation of rules synchronously to unlock next rule
      setPswd(pswd);
    }
  };

  return (
    <div className={styles.container}>
      {locked ? (
        <span className={styles.lockedChar}>"{bannedChar}" is banned</span>
      ) : (
        <>
          <input
            type="text"
            maxLength={1}
            className={styles.inputBox}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
          <button onClick={handleApply} className={styles.applyBtn}>
            ✓
          </button>
        </>
      )}
    </div>
  );
}

export default class RuleBannedLetter extends Rule {
  constructor() {
    super(
      "Your password cannot contain this banned letter (Wordle exception applies): ",
    );
    this.bannedChar = null;

    this.renderItem = ({ pswd, setPswd }) => (
      <BannedLetterComponent
        bannedChar={this.bannedChar}
        setBannedChar={(char) => {
          this.bannedChar = char;
        }}
        pswd={pswd}
        setPswd={setPswd}
      />
    );
  }

  check(txt, max_unlocked, rulesArray) {
    if (!this.bannedChar) return false;

    // Get the wordle solution to exempt it
    let wordleRule = rulesArray
      ? rulesArray.find(
          (r) => r && r.constructor && r.constructor.name === "RuleWordle",
        )
      : null;
    let textToCheck = txt;
    if (wordleRule && wordleRule.solution) {
      // Find one occurrence of wordle and remove it for the check
      let regex = new RegExp(`(${wordleRule.solution})`, "i");
      textToCheck = textToCheck.replace(regex, "");
    }

    return !textToCheck.toLowerCase().includes(this.bannedChar);
  }
}
