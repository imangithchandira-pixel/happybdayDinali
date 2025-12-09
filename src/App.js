import PixelAnimator from "./PixelAnimator";
import cake1 from "./assets/cake1.png";
import cake2 from "./assets/cake2.png";
import cake3 from "./assets/cake3.png";
import cake100 from "./assets/100.png";
import cake80 from "./assets/80.png";
import cake60 from "./assets/60.png";
import cake40 from "./assets/40.png";
import cake20 from "./assets/20.png";
import birthdayText from "./assets/birthdaytext.png";
import "./App.css";
import Confetti from "./Confetti";
import { useEffect, useRef, useState } from "react";
import birthdaySong from "./assets/bdayaudo.mp3";


export default function App() {
  const audioRef = useRef(null);
  const [staticFrame, setStaticFrame] = useState(null);

  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const rafRef = useRef(null);


  useEffect(() => {
    const playAudio = async () => {
      try {
        await audioRef.current.play();
      } catch (err) {
        console.log("Autoplay blocked, waiting for user interaction:", err);
      }
    };
    playAudio();
    }, []);

  useEffect(() => {
    startMicMonitoring();
    return () => {
      stopMicMonitoring();
    };
  }, []);
  const handleCakeClick = async () => {
    const audio = audioRef.current;
    audio.play();
  };

  const pickStaticFrame = (rms) => {
    if (rms < 0.02) return null;
    if (rms >= 0.30) return cake20;
    if (rms >= 0.22) return cake40;
    if (rms >= 0.15) return cake60;
    if (rms >= 0.08) return cake80;
    return cake100;
  };

  const startMicMonitoring = async () => {
    if (micStreamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

  const source = audioCtx.createMediaStreamSource(stream);
  const gainNode = audioCtx.createGain();
  const sensitivity = 3.0;
  gainNode.gain.value = sensitivity;
  gainNodeRef.current = gainNode;

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  analyserRef.current = analyser;
  source.connect(gainNode);
  gainNode.connect(analyser);

      const data = new Float32Array(analyser.fftSize);

      const loop = () => {
        analyser.getFloatTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = data[i];
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);

        try { console.debug('mic rms=', rms.toFixed(4)); } catch (e) {}
        const chosen = pickStaticFrame(rms);
        setStaticFrame((prev) => {
          if (prev === chosen) return prev;
          return chosen;
        });
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      console.warn("Microphone access denied or failed:", err);
    }
  };

  const [celebrating, setCelebrating] = useState(false);
  const [showMatthew, setShowMatthew] = useState(false);
  let matthewSrc = null;
  try {
    matthewSrc = require("./assets/matthew.jpg");
  } catch (e) {
    matthewSrc = null;
  }
  useEffect(() => {
    if (staticFrame === cake20) {
      stopMicMonitoring(false);
      setCelebrating(true);
    }
  }, [staticFrame]);


  const stopMicMonitoring = (resetAnimation = true) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
        if (gainNodeRef.current) {
          try { gainNodeRef.current.disconnect(); } catch (e) {}
          gainNodeRef.current = null;
        }
      } catch (e) {}
      analyserRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (resetAnimation) {
      setStaticFrame(null);
    }
  };

  return (
    <div className="App">
      <audio ref={audioRef} src={birthdaySong} loop />
      <img src={birthdayText} alt="Happy Birthday" className="birthdayText" draggable={false} />
      <div className="cakeLoop">
        {staticFrame ? (
          <PixelAnimator
            className="cake"
            frames={[staticFrame]}
            fps={3}
            scale={4}
            mode="img"
            onClick={handleCakeClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleCakeClick();
            }}
          />
        ) : (
          <PixelAnimator
            className="cake"
            frames={[cake1, cake2, cake3]}
            fps={3}
            scale={4}
            mode="img"
            onClick={handleCakeClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleCakeClick();
            }}
          />
        )}
      </div>
      {celebrating && (
        <Confetti
          pieces={48}
          duration={8000}
          onDone={() => {
            setCelebrating(false);
            setTimeout(() => setShowMatthew(true), 250);
          }}
        />
      )}

      {showMatthew && (
        <div
          className="matthew-overlay"
          onClick={() => setShowMatthew(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowMatthew(false);
          }}
          role="dialog"
          tabIndex={-1}
        >
          <div className="matthew-card">
            {matthewSrc ? (
              <img src={matthewSrc} alt="Matthew" />
            ) : (
              <div style={{ color: "white", padding: 24, fontSize: 20 }}>
                Matthew
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
