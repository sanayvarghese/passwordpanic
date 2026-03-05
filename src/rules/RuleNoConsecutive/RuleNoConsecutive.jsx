import Rule from "../Rule";

export default class RuleNoConsecutive extends Rule {
  constructor() {
    super(
      "Same letter repeating consecutive is not allowed (Wordle exception applies).",
    );
  }

  check(txt, max_unlocked, rulesArray) {
    if (txt.length === 0) return true; // Empty string technically doesn't have consecutives

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

    // Check for consecutive letters
    for (let i = 0; i < textToCheck.length - 1; i++) {
      const current = textToCheck[i].toLowerCase();
      const next = textToCheck[i + 1].toLowerCase();
      // Ignore non-alphabetic? Requirements say "letter". Yes, limit to letters.
      if (/[a-z]/.test(current) && current === next) {
        return false;
      }
    }
    return true;
  }
}
