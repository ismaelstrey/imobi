# Configuração de CI/CD para Testes E2E

Este documento descreve como configurar um pipeline de CI/CD para executar os testes E2E do projeto Imobi.

## GitHub Actions

Crie um arquivo `.github/workflows/e2e-tests.yml` com o seguinte conteúdo:

```yaml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## Azure DevOps

Crie um arquivo `azure-pipelines.yml` com o seguinte conteúdo:

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: |
    npm ci
  displayName: 'Install dependencies'

- script: |
    npx playwright install --with-deps
  displayName: 'Install Playwright browsers'

- script: |
    npx playwright test
  displayName: 'Run Playwright tests'

- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: '**/test-results.xml'
    mergeTestResults: true
    testRunTitle: 'E2E Tests'
  condition: succeededOrFailed()

- task: PublishBuildArtifacts@1
  inputs:
    pathtoPublish: 'playwright-report'
    artifactName: 'playwright-report'
  condition: succeededOrFailed()
```

## GitLab CI

Crie um arquivo `.gitlab-ci.yml` com o seguinte conteúdo:

```yaml
image: mcr.microsoft.com/playwright:v1.40.0-jammy

stages:
  - test

e2e-tests:
  stage: test
  script:
    - npm ci
    - npx playwright test
  artifacts:
    when: always
    paths:
      - playwright-report/
    expire_in: 1 week
```

## Jenkins

Crie um arquivo `Jenkinsfile` com o seguinte conteúdo:

```groovy
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.40.0-jammy'
        }
    }
    stages {
        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Run tests') {
            steps {
                sh 'npx playwright test'
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
    }
}
```

## Configurações Adicionais

### Execução Paralela

Para acelerar a execução dos testes em ambientes de CI/CD, você pode configurar a execução paralela no arquivo `playwright.config.ts`:

```typescript
export default defineConfig({
  // ... outras configurações
  workers: process.env.CI ? 4 : undefined, // 4 workers em CI, automático em desenvolvimento
});
```

### Relatórios

Para gerar relatórios em diferentes formatos, você pode configurar os reporters no arquivo `playwright.config.ts`:

```typescript
export default defineConfig({
  // ... outras configurações
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results.xml' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
});
```

### Execução Seletiva de Testes

Para executar apenas um subconjunto de testes em ambientes de CI/CD, você pode usar tags:

```typescript
// Em um arquivo de teste
test.describe('Testes críticos', () => {
  test.use({ tag: '@critical' });
  
  test('deve fazer login com sucesso', async ({ page }) => {
    // ...
  });
});
```

E no pipeline de CI/CD:

```bash
npx playwright test --grep @critical
```

### Capturas de Tela e Vídeos

Para capturar screenshots e vídeos apenas em caso de falha:

```typescript
export default defineConfig({
  // ... outras configurações
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```