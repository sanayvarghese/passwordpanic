import Rule from "../Rule";

async function get_todays_wordle() {
  const d = new Date();
  const year = d.getFullYear();
  const month = ("0" + (d.getMonth() + 1)).slice(-2);
  const day = ("0" + d.getDate()).slice(-2);
  const dateStr = `${year}-${month}-${day}`;

  let url = `/api/wordle?date=${dateStr}`;
  const options = {
    method: "GET",
  };

  let response = await fetch(url, options);
  let json = await response.json();
  console.log("WORDLE: ", json);

  return json.solution ?? "swoop";
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
