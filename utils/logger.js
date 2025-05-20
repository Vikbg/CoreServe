// logger.mjs
import chalk from "chalk";
import dayjs from "dayjs";
import ora from "ora";

const now = () => dayjs().format("HH:mm:ss");

const levels = {
  info: chalk.blue("[INFO]"),
  success: chalk.green("[OK]"),
  warn: chalk.yellow("[WARN]"),
  error: chalk.red("[ERROR]"),
  debug: chalk.magenta("[DEBUG]"),
};

export const log = {
  info: (msg) => console.log(`${chalk.gray(now())} ${levels.info} ${msg}`),
  success: (msg) =>
    console.log(`${chalk.gray(now())} ${levels.success} ${msg}`),
  warn: (msg) => console.warn(`${chalk.gray(now())} ${levels.warn} ${msg}`),
  error: (msg) => console.error(`${chalk.gray(now())} ${levels.error} ${msg}`),
  debug: (msg) => console.debug(`${chalk.gray(now())} ${levels.debug} ${msg}`),

  // Animation spinner
  spinner: (text) =>
    ora({
      text,
      prefixText: chalk.cyan(`[${now()}]`),
      color: "cyan",
    }),
};
