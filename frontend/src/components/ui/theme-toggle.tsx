"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { useMounted } from "@/hooks/use-mounted";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mounted && checkboxRef.current) {
      checkboxRef.current.checked = theme === "dark";
    }
  }, [theme, mounted]);

  if (!mounted) return <div style={{ width: 56, height: 25 }} />;

  const handleChange = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="sky-toggle-wrap">
      <label className="sky-toggle" aria-label="Toggle theme">
        <input
          ref={checkboxRef}
          type="checkbox"
          className="sky-toggle__cb"
          defaultChecked={theme === "dark"}
          onChange={handleChange}
        />
        <div className="sky-toggle__track">
          <div className="sky-toggle__clouds" />
          <div className="sky-toggle__stars">
            <svg viewBox="0 0 144 55" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="sky-toggle__thumb-area">
            <div className="sky-toggle__thumb">
              <div className="sky-toggle__moon">
                <div className="sky-toggle__crater" />
                <div className="sky-toggle__crater" />
                <div className="sky-toggle__crater" />
              </div>
            </div>
          </div>
        </div>
      </label>

      <style jsx>{`
        .sky-toggle-wrap {
          --sz: 16px;
          line-height: 0;
        }
        .sky-toggle,
        .sky-toggle *,
        .sky-toggle *::before,
        .sky-toggle *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-size: var(--sz);
        }
        .sky-toggle__cb { display: none; }
        .sky-toggle__track {
          width: 3.5em;
          height: 1.55em;
          background: #3d7eae;
          border-radius: 5em;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          transition: background 0.5s cubic-bezier(0, -0.02, 0.4, 1.25);
          box-shadow: 0 -1px 1px rgba(0,0,0,0.2) inset, 0 1px 2px rgba(255,255,255,0.3) inset;
        }
        .sky-toggle__track::before {
          content: "";
          position: absolute;
          z-index: 1;
          inset: 0;
          border-radius: 5em;
          box-shadow: 0 0.05em 0.15em rgba(0,0,0,0.2) inset;
        }
        .sky-toggle__thumb-area {
          width: 2.1em;
          height: 2.1em;
          position: absolute;
          left: -0.27em;
          top: -0.27em;
          border-radius: 5em;
          background: rgba(255,255,255,0.1);
          box-shadow:
            inset 0 0 0 2.1em rgba(255,255,255,0.1),
            0 0 0 0.4em rgba(255,255,255,0.1),
            0 0 0 0.75em rgba(255,255,255,0.1);
          display: flex;
          transition: 0.3s cubic-bezier(0, -0.02, 0.35, 1.17);
          pointer-events: none;
        }
        .sky-toggle__thumb {
          pointer-events: auto;
          position: relative;
          z-index: 2;
          width: 1.35em;
          height: 1.35em;
          margin: auto;
          border-radius: 5em;
          background: #ecca2f;
          box-shadow:
            0.04em 0.04em 0.04em 0 rgba(254,255,239,0.6) inset,
            0 -0.04em 0.04em 0 #a1872a inset;
          filter: drop-shadow(0.04em 0.08em 0.08em rgba(0,0,0,0.25));
          overflow: hidden;
          transition: 0.5s cubic-bezier(0, -0.02, 0.4, 1.25);
        }
        .sky-toggle__moon {
          transform: translateX(100%);
          width: 100%;
          height: 100%;
          background: #c4c9d1;
          border-radius: inherit;
          box-shadow:
            0.04em 0.04em 0.04em 0 rgba(254,255,239,0.6) inset,
            0 -0.04em 0.04em 0 #969696 inset;
          transition: 0.5s cubic-bezier(0, -0.02, 0.4, 1.25);
          position: relative;
        }
        .sky-toggle__crater {
          position: absolute;
          border-radius: 5em;
          background: #959db1;
          box-shadow: 0 0.02em 0.04em rgba(0,0,0,0.25) inset;
        }
        .sky-toggle__crater:nth-child(1) { width: 0.45em; height: 0.45em; top: 0.47em; left: 0.2em; }
        .sky-toggle__crater:nth-child(2) { width: 0.22em; height: 0.22em; top: 0.6em; left: 0.85em; }
        .sky-toggle__crater:nth-child(3) { width: 0.15em; height: 0.15em; top: 0.2em; left: 0.5em; }
        .sky-toggle__clouds {
          width: 0.8em;
          height: 0.8em;
          background: #f3fdff;
          border-radius: 5em;
          position: absolute;
          bottom: -0.25em;
          left: 0.2em;
          box-shadow:
            0.6em 0.2em #f3fdff,
            -0.2em -0.2em #aacadf,
            0.9em 0.24em #f3fdff,
            0.3em -0.08em #aacadf,
            1.4em 0 #f3fdff,
            0.8em -0.04em #aacadf,
            1.9em 0.2em #f3fdff,
            1.3em -0.2em #aacadf,
            2.3em -0.04em #f3fdff,
            1.7em 0 #aacadf,
            2.8em -0.1em #f3fdff;
          transition: 0.5s cubic-bezier(0, -0.02, 0.4, 1.25);
        }
        .sky-toggle__stars {
          position: absolute;
          color: #fff;
          top: -100%;
          left: 0.2em;
          width: 1.7em;
          height: auto;
          transition: 0.5s cubic-bezier(0, -0.02, 0.4, 1.25);
        }
        .sky-toggle__cb:checked + .sky-toggle__track {
          background: #1d1f2c;
        }
        .sky-toggle__cb:checked + .sky-toggle__track .sky-toggle__thumb-area {
          left: calc(100% + 0.27em - 2.1em);
        }
        .sky-toggle__cb:checked + .sky-toggle__track .sky-toggle__moon {
          transform: translateX(0);
        }
        .sky-toggle__cb:checked + .sky-toggle__track .sky-toggle__clouds {
          bottom: -2.5em;
        }
        .sky-toggle__cb:checked + .sky-toggle__track .sky-toggle__stars {
          top: 50%;
          transform: translateY(-50%);
        }
      `}</style>
    </div>
  );
}
