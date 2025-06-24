#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const execa_1 = require("execa");
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const program = new commander_1.Command();
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const { framework } = yield inquirer_1.default.prompt([
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
        const { appName } = yield inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'appName',
                message: 'Project folder name:',
                validate: (input) => input ? true : 'Folder name required',
            },
        ]);
        const { packages } = yield inquirer_1.default.prompt([
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
        console.log(chalk_1.default.green(`\n→ Generating ${framework} project: ${appName}\n`));
        // Generate base project
        if (framework === 'react') {
            yield (0, execa_1.execa)('npm', ['create', 'vite@latest', appName, '--', '--template', 'react-ts'], { stdio: 'inherit' });
        }
        else if (framework === 'next') {
            yield (0, execa_1.execa)('npx', ['create-next-app@latest', appName, '--typescript'], { stdio: 'inherit' });
        }
        // Move into project folder
        process.chdir(appName);
        // Install optional packages
        if (packages.includes('tailwind')) {
            yield (0, execa_1.execa)('npm', ['install', '-D', 'tailwindcss', 'postcss', 'autoprefixer'], { stdio: 'inherit' });
            yield (0, execa_1.execa)('npx', ['tailwindcss', 'init', '-p'], { stdio: 'inherit' });
            const inputFile = framework === 'react'
                ? './src/index.css'
                : './app/globals.css';
            if (fs_1.default.existsSync(inputFile)) {
                fs_1.default.writeFileSync(inputFile, '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
                console.log(chalk_1.default.green(`✔ Added Tailwind directives to ${inputFile}`));
            }
        }
        if (packages.includes('prisma')) {
            yield (0, execa_1.execa)('npm', ['install', 'prisma', '@prisma/client'], { stdio: 'inherit' });
            yield (0, execa_1.execa)('npx', ['prisma', 'init'], { stdio: 'inherit' });
        }
        if (packages.includes('linting')) {
            yield (0, execa_1.execa)('npm', ['install', '-D', 'eslint', 'prettier'], { stdio: 'inherit' });
            console.log(chalk_1.default.green('✔ ESLint and Prettier installed.'));
        }
        if (packages.includes('docker')) {
            const dockerfile = `
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "run", "dev"]
`;
            fs_1.default.writeFileSync('Dockerfile', dockerfile.trim());
            console.log(chalk_1.default.green('✔ Dockerfile created.'));
        }
        console.log(chalk_1.default.blue('\n🎉 Done! Happy coding 🚀'));
    });
}
program
    .command('init')
    .description('Interactive setup for new React/Next.js project')
    .action(run);
program.parse(process.argv);
