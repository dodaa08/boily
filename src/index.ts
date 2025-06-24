#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

interface MenuOption {
  name: string;
  value: string;
  description: string;
}

class TurboCLI {
  private selectedIndex = 0;
  private options: MenuOption[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    console.log('🚀 Turborepo Easy Setup CLI\n');
    
    // Step 1: Create testing folder and navigate
    await this.createTestingFolder();
    
    // Step 2: Initialize Turborepo
    console.log('📦 Initializing Turborepo...\n');
    await this.initTurborepo();
    
    // Step 3: Show app options
    await this.showAppOptions();
    
    // Step 4: Show package options
    await this.showPackageOptions();
    
    console.log('\n✅ Setup complete! Your Turborepo is ready to use.');
  }

  private async createTestingFolder() {
    const folderName = 'testing';
    
    if (!existsSync(folderName)) {
      console.log(`📁 Creating folder: ${folderName}`);
      mkdirSync(folderName);
    } else {
      console.log(`📁 Folder ${folderName} already exists`);
    }
    
    process.chdir(folderName);
    console.log(`📂 Changed directory to: ${process.cwd()}\n`);
  }

  private async initTurborepo() {
    try {
      console.log('Running: npx create-turbo@latest');
      
      // Run create-turbo in interactive mode
      const child = spawn('npx', ['create-turbo@latest'], {
        stdio: 'inherit',
        shell: true
      });
      
      return new Promise<void>((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            console.log('\n✅ Turborepo initialized successfully!\n');
            resolve();
          } else {
            reject(new Error(`create-turbo exited with code ${code}`));
          }
        });
        
        child.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Error initializing Turborepo:', error);
      process.exit(1);
    }
  }

  private async showAppOptions() {
    const appOptions: MenuOption[] = [
      {
        name: '⚛️  Create React App',
        value: 'react-app',
        description: 'Traditional React application with CRA'
      },
      {
        name: '🔺 Next.js App',
        value: 'nextjs',
        description: 'Next.js application with App Router'
      },
      {
        name: '🎯 Vite React App',
        value: 'vite-react',
        description: 'Fast React app with Vite bundler'
      },
      {
        name: '🌐 Full Stack App',
        value: 'fullstack',
        description: 'Next.js with API routes and database'
      },
      {
        name: '🚀 Express Server',
        value: 'express',
        description: 'Node.js Express server'
      },
      {
        name: '📱 React Native App',
        value: 'react-native',
        description: 'React Native mobile application'
      },
      {
        name: '✨ Skip Apps',
        value: 'skip',
        description: 'Continue without adding apps'
      }
    ];

    console.log('🎯 Select applications to add to your workspace:');
    const selectedApps = await this.showMultiSelectMenu(appOptions);
    
    for (const app of selectedApps) {
      if (app !== 'skip') {
        await this.createApp(app);
      }
    }
  }

  private async showPackageOptions() {
    const packageOptions: MenuOption[] = [
      {
        name: '🗃️  Prisma ORM',
        value: 'prisma',
        description: 'Database ORM and schema management'
      },
      {
        name: '🎨 Shared UI Components',
        value: 'ui-components',
        description: 'Reusable React components library'
      },
      {
        name: '🔧 ESLint Config',
        value: 'eslint-config',
        description: 'Shared ESLint configuration'
      },
      {
        name: '💼 TypeScript Config',
        value: 'ts-config',
        description: 'Shared TypeScript configuration'
      },
      {
        name: '🛠️  Utilities',
        value: 'utils',
        description: 'Shared utility functions'
      },
      {
        name: '🔐 Auth Package',
        value: 'auth',
        description: 'Authentication utilities'
      },
      {
        name: '✨ Skip Packages',
        value: 'skip',
        description: 'Continue without adding packages'
      }
    ];

    console.log('\n📦 Select packages to add to your workspace:');
    const selectedPackages = await this.showMultiSelectMenu(packageOptions);
    
    for (const pkg of selectedPackages) {
      if (pkg !== 'skip') {
        await this.createPackage(pkg);
      }
    }
  }

  private async showMultiSelectMenu(options: MenuOption[]): Promise<string[]> {
    return new Promise((resolve) => {
      const selected: boolean[] = new Array(options.length).fill(false);
      let currentIndex = 0;

      const render = () => {
        console.clear();
        console.log('🚀 Turborepo Easy Setup CLI\n');
        console.log('Use ↑↓ to navigate, SPACE to select, ENTER to continue\n');
        
        options.forEach((option, index) => {
          const isSelected = selected[index];
          const isCurrent = index === currentIndex;
          const checkbox = isSelected ? '✅' : '⬜';
          const arrow = isCurrent ? '👉 ' : '   ';
          
          console.log(`${arrow}${checkbox} ${option.name}`);
          if (isCurrent) {
            console.log(`      ${option.description}\n`);
          }
        });
        
        console.log('\nSelected items will be created in your workspace.');
      };

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      process.stdin.setRawMode(true);
      process.stdin.resume();

      render();

      process.stdin.on('data', (key) => {
        const keyStr = key.toString();
        
        switch (keyStr) {
          case '\u001b[A': // Up arrow
            currentIndex = Math.max(0, currentIndex - 1);
            render();
            break;
            
          case '\u001b[B': // Down arrow
            currentIndex = Math.min(options.length - 1, currentIndex + 1);
            render();
            break;
            
          case ' ': // Space
            selected[currentIndex] = !selected[currentIndex];
            render();
            break;
            
          case '\r': // Enter
          case '\n':
            process.stdin.setRawMode(false);
            process.stdin.pause();
            rl.close();
            
            const selectedValues = options
              .filter((_, index) => selected[index])
              .map(option => option.value);
            
            resolve(selectedValues.length > 0 ? selectedValues : ['skip']);
            break;
            
          case '\u0003': // Ctrl+C
            process.exit(0);
            break;
        }
      });
    });
  }

  private async createApp(appType: string) {
    console.log(`\n🏗️  Creating ${appType} app...`);
    
    try {
      switch (appType) {
        case 'react-app':
          await this.runCommand('npx create-react-app apps/react-app --template typescript');
          break;
          
        case 'nextjs':
          await this.runCommand('npx create-next-app@latest apps/nextjs --typescript --tailwind --eslint --app');
          break;
          
        case 'vite-react':
          await this.runCommand('npm create vite@latest apps/vite-react -- --template react-ts');
          break;
          
        case 'fullstack':
          await this.runCommand('npx create-next-app@latest apps/fullstack --typescript --tailwind --eslint --app');
          // Add additional fullstack setup here
          break;
          
        case 'express':
          await this.createExpressServer();
          break;
          
        case 'react-native':
          await this.runCommand('npx react-native init ReactNativeApp --directory apps/react-native --version latest');
          break;
      }
      
      console.log(`✅ ${appType} app created successfully!`);
    } catch (error) {
      console.error(`❌ Error creating ${appType} app:`, error);
    }
  }

  private async createExpressServer() {
    const serverPath = 'apps/express-server';
    mkdirSync(serverPath, { recursive: true });
    
    // Create basic Express server structure
    const packageJson = {
      name: 'express-server',
      version: '1.0.0',
      main: 'src/index.ts',
      scripts: {
        dev: 'ts-node src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js'
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        dotenv: '^16.3.1'
      },
      devDependencies: {
        '@types/express': '^4.17.17',
        '@types/cors': '^2.8.13',
        'ts-node': '^10.9.1',
        typescript: '^5.1.6'
      }
    };
    
    require('fs').writeFileSync(
      join(serverPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  private async createPackage(packageType: string) {
    console.log(`\n📦 Creating ${packageType} package...`);
    
    try {
      switch (packageType) {
        case 'prisma':
          await this.createPrismaPackage();
          break;
          
        case 'ui-components':
          await this.createUIPackage();
          break;
          
        case 'eslint-config':
          await this.createESLintConfig();
          break;
          
        case 'ts-config':
          await this.createTSConfig();
          break;
          
        case 'utils':
          await this.createUtilsPackage();
          break;
          
        case 'auth':
          await this.createAuthPackage();
          break;
      }
      
      console.log(`✅ ${packageType} package created successfully!`);
    } catch (error) {
      console.error(`❌ Error creating ${packageType} package:`, error);
    }
  }

  private async createPrismaPackage() {
    const prismaPath = 'packages/prisma';
    mkdirSync(prismaPath, { recursive: true });
    
    await this.runCommand(`cd ${prismaPath} && npm init -y`);
    await this.runCommand(`cd ${prismaPath} && npm install prisma @prisma/client`);
    await this.runCommand(`cd ${prismaPath} && npx prisma init`);
  }

  private async createUIPackage() {
    const uiPath = 'packages/ui';
    mkdirSync(uiPath, { recursive: true });
    
    const packageJson = {
      name: '@repo/ui',
      version: '0.0.0',
      main: 'index.ts',
      types: 'index.ts',
      dependencies: {
        react: '^18.2.0'
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        typescript: '^5.1.6'
      }
    };
    
    require('fs').writeFileSync(
      join(uiPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  private async createESLintConfig() {
    const eslintPath = 'packages/eslint-config';
    mkdirSync(eslintPath, { recursive: true });
    // Add ESLint config creation logic
  }

  private async createTSConfig() {
    const tsPath = 'packages/typescript-config';
    mkdirSync(tsPath, { recursive: true });
    // Add TypeScript config creation logic
  }

  private async createUtilsPackage() {
    const utilsPath = 'packages/utils';
    mkdirSync(utilsPath, { recursive: true });
    // Add utils package creation logic
  }

  private async createAuthPackage() {
    const authPath = 'packages/auth';
    mkdirSync(authPath, { recursive: true });
    // Add auth package creation logic
  }

  private async runCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      execSync(command, { stdio: 'inherit' });
      resolve();
    });
  }
}

// Initialize the CLI when run directly
if (require.main === module) {
  new TurboCLI();
}

export default TurboCLI;