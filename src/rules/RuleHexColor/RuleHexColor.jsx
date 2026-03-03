import Rule from "../Rule";
import { useRef } from "react";

export default class RuleHexColor extends Rule {
  constructor() {
    super(
      "Your password must include this color in hex format (e.g. #000000): ",
    );
    this.hexColor = this.generateRandomHex();

    this.renderItem = () => (
      <span
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          width: "30px",
          height: "30px",
          backgroundColor: this.hexColor,
          borderRadius: "5px",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          margin: "0 5px",
        }}
      ></span>
    );
  }

  generateRandomHex() {
    let hex = Math.floor(Math.random() * 16777215).toString(16);
    return `#${hex.padStart(6, "0")}`;
  }

  check(txt) {
    return txt.toLowerCase().includes(this.hexColor.toLowerCase());
  }
}
