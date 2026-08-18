import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const separatorIndex = args.indexOf('--');
if (separatorIndex === -1) {
  console.error(
    'Usage: node scripts/run.mjs [--cwd <dir>] [--port-var <VAR> --port-default <n>] -- <command> [args...]',
  );
  process.exit(1);
}

const options = args.slice(0, separatorIndex);
const command = args.slice(separatorIndex + 1);

let cwd;
let portVar;
let portDefault;

for (let i = 0; i < options.length; i += 1) {
  switch (options[i]) {
    case '--cwd':
      cwd = options[++i];
      break;
    case '--port-var':
      portVar = options[++i];
      break;
    case '--port-default':
      portDefault = options[++i];
      break;
    default:
      console.error(`Unknown option: ${options[i]}`);
      process.exit(1);
  }
}

if (portVar) {
  const port = process.env[portVar] || portDefault;
  command.push('--port', port);
}

const child = spawn(command[0], command.slice(1), {
  cwd,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
