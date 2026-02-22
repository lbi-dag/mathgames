import { useId } from "react";
import { useTheme } from "./ThemeProvider";
import styles from "../../styles/theme/ThemeToggle.module.css";
import type { ThemeMode } from "./theme";

const options: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function ThemeToggle() {
  const id = useId();
  const { mode, setMode } = useTheme();

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={id}>
        Theme
      </label>
      <select
        id={id}
        className={styles.select}
        value={mode}
        onChange={(event) => setMode(event.target.value as ThemeMode)}
        aria-label="Theme mode"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
