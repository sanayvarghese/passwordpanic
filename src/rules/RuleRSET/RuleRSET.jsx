import Rule from "../Rule";
import { useRef } from "react";

export default class RuleRSET extends Rule {
  constructor() {
    super(
      "Your password must include the formal name of this location at RSET (e.g. Rajagiri School of Engineering and Technology): ",
    );

    this.renderItem = () => (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "120px",
          height: "80px",
          backgroundColor: "#3b82f6",
          borderRadius: "8px",
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
          margin: "10px",
          textAlign: "center",
          padding: "5px",
        }}
      >
        RSET Location
        <br />
        (Image Placeholder)
      </div>
    );
  }

  check(txt) {
    let regex = /Rajagiri School of Engineering and Technology/i;
    return regex.test(txt);
  }
}
