import { WS_URL } from "@/lib/ws";
import Rule from "../Rule";

async function get_todays_wordle() {
  let url = WS_URL.replace("wss", "https") + "/wordle";
  const options = {
    method: "GET",
  };

  let response = await fetch(url, options);
  let json = await response.json();
  json = JSON.parse(json.contents);
  console.log("WORDLE: ", json);

  return json.solution;
}

export default class RuleWordle extends Rule {
  constructor() {
    // super("Your password must contain today's Wordle answer.");
    super("Your password must contain today's ");

    get_todays_wordle()
      .then((solution) => {
        this.solution = solution;
      })
      .catch((error) => {
        console.log(error);
      });

    this.renderItem = () => (
      <span>
        <a
          href="https://www.nytimes.com/games/wordle/index.html"
          target="_blank"
        >
          Wordle
        </a>{" "}
        answer.
      </span>
    );
  }

  check(txt) {
    // console.log("check", this.solution)
    let r = new RegExp(`(${this.solution})`, "i");
    return r.test(txt);
  }
}
