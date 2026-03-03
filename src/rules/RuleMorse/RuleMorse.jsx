import Rule from "../Rule";

const morse = {
  a: ".-",
  b: "-...",
  c: "-.-.",
  d: "-..",
  e: ".",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  m: "--",
  n: "-.",
  o: "---",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",
};

export default class RuleMorse extends Rule {
  constructor() {
    super(
      "Your password must contain the Morse code of the first 3 english alphabets in your password. (Use . and -, spaces between letters are optional)",
    );
  }

  check(txt) {
    let letters = txt.match(/[A-Za-z]/g)?.slice(0, 3);
    if (letters?.length === 3) {
      let m1 = morse[letters[0].toLowerCase()];
      let m2 = morse[letters[1].toLowerCase()];
      let m3 = morse[letters[2].toLowerCase()];

      // Escape dots for regex
      let escape = (s) => s.replaceAll(".", "\\.");

      // Check with spaces between codes
      let withSpaces = `${escape(m1)} ${escape(m2)} ${escape(m3)}`;
      // Check without spaces (concatenated)
      let withoutSpaces = `${escape(m1)}${escape(m2)}${escape(m3)}`;

      let r1 = new RegExp(withSpaces);
      let r2 = new RegExp(withoutSpaces);
      return r1.test(txt) || r2.test(txt);
    }
    return false;
  }
}
