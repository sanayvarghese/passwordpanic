import Rule from "../Rule";
import imgCentralLawn from "../../img/central lawn.jpeg";
import imgSouvenirsShop from "../../img/souvenirs shop.jpeg";

const imageData = [
  { src: imgCentralLawn, name: "central lawn" },
  { src: imgSouvenirsShop, name: "souvenirs shop" },
];

export default class RuleRSET extends Rule {
  constructor() {
    super("Your password must include the name of this location at RSET: ");

    const chosen = imageData[Math.floor(Math.random() * imageData.length)];
    this.placeName = chosen.name;
    this.placeWords = chosen.name.toLowerCase().split(/\s+/);

    this.renderItem = () => (
      <img
        src={chosen.src.src || chosen.src}
        alt="RSET Location"
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          width: "200px",
          height: "130px",
          objectFit: "cover",
          borderRadius: "8px",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          margin: "10px",
        }}
      />
    );
  }

  check(txt) {
    const lower = txt.toLowerCase();
    // All words in the place name must appear in the password
    return this.placeWords.every((word) => lower.includes(word));
  }
}
