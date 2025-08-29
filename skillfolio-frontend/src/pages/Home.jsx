/* Docs: see docs/pages doc/Home.jsx.md */

import { useEffect, useState } from "react";

export default function Home() {
  const message =
    "Weelcome back, learner. You're doing a great job shaping your career!\n\n" +
    "Every certificate you add, every project you build, is one more step toward your goals.\n\n" +
    "Progress is progress, no matter the size. Head over to your Dashboard anytime you need inspiration — your journey is already unfolding beautifully.";

  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setDisplayed((prev) => prev + message.charAt(i));
      i += 1;
      if (i >= message.length) clearInterval(id);
    }, 100); // typing speed
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-gray-900 to-background p-6">
      <p className="whitespace-pre-line font-mono text-xl max-w-3xl text-center leading-relaxed text-text">
        {displayed}
      </p>
    </div>
  );
}
