import Rule from "../Rule";
import { useRef, useEffect } from "react";
import captchaStyles from "./RuleCaptcha.module.css";

function CaptchaComponent({ captchaText, onRefresh }) {
  // Using canvas to draw something confusing but readable enough as a captcha
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear

    // draw background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw some noise lines
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.strokeStyle = `rgba(0,0,0, ${Math.random() * 0.5})`;
      ctx.lineWidth = Math.random() * 3;
      ctx.stroke();
    }

    // draw text
    ctx.font = "bold 30px monospace";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // add small rotation for distortion
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((Math.random() - 0.5) * 0.2); // ~ -5 to 5 degrees
    ctx.fillText(captchaText, 0, 0);
    ctx.restore();

    // add some dots noise
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(0,0,0, ${Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }, [captchaText]);

  return (
    <div className={captchaStyles.captchaContainer}>
      <canvas
        ref={canvasRef}
        width={150}
        height={50}
        className={captchaStyles.captchaCanvas}
      ></canvas>
      <button
        onClick={onRefresh}
        className={captchaStyles.refreshBtn}
        title="Generate new captcha"
      >
        ↻
      </button>
    </div>
  );
}

export default class RuleCaptcha extends Rule {
  constructor() {
    super("Your password must include this CAPTCHA: ");
    this.captchaText = this.generateRandomText();

    this.renderItem = ({ regenerateRule }) => (
      <CaptchaComponent
        captchaText={this.captchaText}
        onRefresh={() => regenerateRule(this.num)}
      />
    );
  }

  generateRandomText() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // Removed tricky chars like 0,O,1,I,l
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  regenerate() {
    this.captchaText = this.generateRandomText();
  }

  check(txt) {
    return txt.includes(this.captchaText);
  }
}
