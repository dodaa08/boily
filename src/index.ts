#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs';

const program = new Command();

async function run() {
  const { framework } = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Select framework:',
      choices: [
        { name: '⚛️  React (Vite)', value: 'react' },
        { name: '🚀  Next.js (Fullstack)', value: 'next' },
      ],
    },
  ]);
  

  const { appName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'appName',
      message: 'Project folder name:',
      validate: (input) => input ? true : 'Folder name required',
    },
  ]);

  const { packages } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'packages',
      message: 'Select additional packages:',
      choices: [
        { name: 'Tailwind CSS', value: 'tailwind' },
        { name: 'Prisma ORM', value: 'prisma' },
        { name: 'ESLint + Prettier', value: 'linting' },
        { name: 'Dockerfile', value: 'docker' },
      ],
    },
  ]);

  console.log(chalk.green(`\n→ Generating ${framework} project: ${appName}\n`));

  // Generate base project
  if (framework === 'react') {
    await execa('npm', ['create', 'vite@latest', appName, '--', '--template', 'react-ts'], { stdio: 'inherit' });
  } else if (framework === 'next') {
    await execa('npx', ['create-next-app@latest', appName, '--typescript'], { stdio: 'inherit' });
  }

  // Move into project folder
  process.chdir(appName);

  // Install optional packages
  if (packages.includes('tailwind')) {
    await execa('npm', ['install', '-D', 'tailwindcss', 'postcss', 'autoprefixer'], { stdio: 'inherit' });
    await execa('npx', ['tailwindcss', 'init', '-p'], { stdio: 'inherit' });

    const inputFile = framework === 'react'
      ? './src/index.css'
      : './app/globals.css';

    if (fs.existsSync(inputFile)) {
      fs.writeFileSync(inputFile,
        '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n'
      );
      console.log(chalk.green(`✔ Added Tailwind directives to ${inputFile}`));
    }
  }

  if (packages.includes('prisma')) {
    await execa('npm', ['install', 'prisma', '@prisma/client'], { stdio: 'inherit' });
    await execa('npx', ['prisma', 'init'], { stdio: 'inherit' });
  }

  if (packages.includes('linting')) {
    await execa('npm', ['install', '-D', 'eslint', 'prettier'], { stdio: 'inherit' });
    console.log(chalk.green('✔ ESLint and Prettier installed.'));
  }

  if (packages.includes('docker')) {
    const dockerfile = `
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "run", "dev"]
`;
    fs.writeFileSync('Dockerfile', dockerfile.trim());
    console.log(chalk.green('✔ Dockerfile created.'));
  }

  console.log(chalk.blue('\n🎉 Done! Happy coding 🚀'));
}

program
  .command('init')
  .description('Interactive setup for new React/Next.js project')
  .action(run);

program.parse(process.argv);
