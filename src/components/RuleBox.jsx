import React from "react";
import "./RuleBox.css";

function RuleBox({
  heading,
  msg,
  correct,
  skipped,
  canSkip,
  onSkip,
  renderItem,
  propsToChild,
}) {
  // Using renderItem prop to render child component so that we can pass props to them
  // the props coming from parent, that are to be passed to the child component are in 'propsToChild'
  // this pattern is discussed in: https://react.dev/reference/react/cloneElement#alternatives

  const stateClass = skipped
    ? "rule-skipped"
    : correct
      ? "rule-correct"
      : "rule-err";

  return (
    <div className={`rulebox ${stateClass}`}>
      <div className={`rulebox-top ${stateClass}`}>
        <span>
          {skipped ? "⏭" : correct ? "\u{2705}" : "\u{274C}"} {heading}
        </span>
        {skipped && <span className="skipped-badge">SKIPPED</span>}
        {canSkip && !skipped && (
          <button className="skip-btn" onClick={onSkip} title="Skip this rule">
            Skip
          </button>
        )}
      </div>
      <div className="rulebox-desc">
        {msg}
        {renderItem === undefined ? null : renderItem(propsToChild)}
      </div>
    </div>
  );
}

export default RuleBox;
