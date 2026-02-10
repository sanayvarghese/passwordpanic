import Rule from "../Rule";

export default class RuleRomanSum extends Rule {
  constructor() {
    super("The Roman numerals in your password must add up to ");
    this.target = 25;
    this.renderItem = () => <span>{this.target}. </span>;
  }

  check = (txt) => {
    const romanValues = {
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000,
    };
    const romanSumEquals25 = (password) => {
      console.log("password:", password);

      const matches = password.match(/[IVXLCDM]/g);

      const sum = matches.reduce((total, char) => total + romanValues[char], 0);

      return sum === 25;
    };
    return romanSumEquals25(txt);
  };
}
