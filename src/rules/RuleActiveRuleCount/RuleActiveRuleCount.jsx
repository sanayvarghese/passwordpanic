import Rule from "../Rule";

export default class RuleActiveRuleCount extends Rule {
  constructor() {
    super("Password must contain the number of currently active rules.");
  }

  check(txt, max_unlocked) {
    if (!max_unlocked) return false;
    let r = new RegExp(`${max_unlocked}`);
    return r.test(txt);
  }
}
