import Rule from "./Rule";
import RuleWordle from "./RuleWordle/RuleWordle";
import RuleSlidingPuzzle from "./RuleSlidingPuzzle/RuleSlidingPuzzle";
import RuleMorse from "./RuleMorse/RuleMorse";
import RuleRiddle from "./RuleRiddle/RuleRiddle";
import RuleTimeEmoji from "./RuleTimeEmoji/RuleTimeEmoji";
import RuleSum from "./RuleSum/RuleSum";
import RuleRomanSum from "./RuleRoman/RuleRomanSum";
import RuleEarthquake from "./RuleEarthquake/RuleEarthquake";
import RuleHexColor from "./RuleHexColor/RuleHexColor";
import RuleRSET from "./RuleRSET/RuleRSET";
import RuleAtomicSum, { elementsData } from "./RuleAtomicSum/RuleAtomicSum";

function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

const periodicSymbols2 = Object.keys(elementsData).filter(
  (e) => e.length === 2,
);

var rules = [
  new RuleWordle(),

  // 1
  new Rule(
    "Your password must be at least 6 characters.",
    (t) => t?.length >= 6,
  ),
  // 2
  new Rule(
    "Your password must include an uppercase and a lowercase letter.",
    (t) => /[A-Z]/.test(t) && /[a-z]/.test(t),
  ),
  // 3
  new Rule("Your password must include a special character.", (t) =>
    /\W/.test(t),
  ),
  // 4
  new Rule("Your password must include a 2-digit prime number.", (t) =>
    /(?:11)|(?:13)|(?:17)|(?:19)|(?:23)|(?:29)|(?:31)|(?:37)|(?:41)|(?:43)|(?:47)|(?:53)|(?:59)|(?:61)|(?:67)|(?:71)|(?:73)|(?:79)|(?:83)|(?:89)|(?:97)/.test(
      t,
    ),
  ),
  // 5
  new RuleSum(),
  // 6
  new Rule("Your password must include a Roman numeral.", (t) =>
    /[IVXLCDM]/.test(t),
  ),
  // 7
  new RuleRomanSum(),
  // 8
  new Rule("Your password must include a negative number.", (t) =>
    /-\d/.test(t),
  ),
  // 9
  new Rule(
    "Your password must contain the value of pi up to first 5 decimal places.",
    (t) => /(?:3\.14159)/.test(t),
  ),
  // 10
  new Rule("Your password must include a leap year.", (t) => {
    let match = t.match(/\d{4}/g);
    if (!match) return false;
    for (let yStr of match) {
      let y = parseInt(yStr);
      if (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) return true;
    }
    return false;
  }),
  // 11
  new RuleEarthquake(),
  // 12
  new Rule("Your password must include the name of a continent.", (t) =>
    /asia|europe|africa|australia|oceania|north america|south america|antarctica/i.test(
      t,
    ),
  ),
  // 13
  new RuleRSET(),
  // 14
  new RuleHexColor(),
  // 15
  new Rule(
    "Your password must include a two-letter symbol from the periodic table.",
    (t) => {
      return periodicSymbols2.some((symbol) => t.includes(symbol));
    },
  ),
  // 16
  new RuleAtomicSum(),
  // 17
  new RuleWordle(),
  // 18
  new RuleRiddle(),
  // 19
  new RuleSlidingPuzzle(),
  // 20
  new RuleMorse(),
  // 21
  new Rule(
    "Your password must have as many vowels as consonants.",
    (t) =>
      (t.match(/[aeiou]/gi) || []).length ===
      (t.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length,
  ),
  // 22
  new Rule("The length of your password must be a prime number.", (t) =>
    isPrime(t.length),
  ),
  // 23
  new Rule("Your password must include the length of your password.", (t) => {
    let l = t.length;
    let r = new RegExp(`${l}`);
    return r.test(t);
  }),
  // 24
  new Rule("Your password must include the current time.", (t) => {
    let d = new Date();
    let h24 = d.getHours();
    let m = d.getMinutes();
    let h12 = h24 % 12 || 12;
    let mStr = m.toString().padStart(2, "0");

    let timeStr1 = `${h12}:${mStr}`;
    let timeStr2 = `${h24}:${mStr}`;
    let timeStr3 = `${h24.toString().padStart(2, "0")}:${mStr}`;

    return t.includes(timeStr1) || t.includes(timeStr2) || t.includes(timeStr3);
  }),
  // 25
  new RuleTimeEmoji(),
];

function sort_rules(a, b) {
  if (a.correct == b.correct) {
    return b.num - a.num;
  } else if (!a.correct && b.correct) {
    return -1;
  } else {
    return 1;
  }
}

export default rules;
export { sort_rules };
