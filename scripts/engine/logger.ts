import chalk from 'chalk';

export const logger = {
    info: (msg: string) => console.log(chalk.blue(`[INFO] ${msg}`)),
    success: (msg: string) => console.log(chalk.green(`[SUCCESS] ${msg}`)),
    warn: (msg: string) => console.log(chalk.yellow(`[WARN] ${msg}`)),
    error: (msg: string, err?: any) => {
        console.error(chalk.red(`[ERROR] ${msg}`));
        if (err) console.error(chalk.red(err));
    }
};
