# Automation testing for Session

This repository holds the code to do integration tests with appium and Session on iOS and Android.

# Setup

First, install nvm for your system (https://github.com/nvm-sh/nvm). For windows, head here: https://github.com/coreybutler/nvm-windows

```
nvm install #install node version from the .nvmrc file, currently v16.13.0
nvm use # use that same node version, currently v16.13.0
npm ci # to install packages references from package-lock.json
```

The, choose and option:

```
npm run build-and-test # build typescript and run the tests
npm run test # just run the tests
npm run tsc # just build typescript
```

## Create files and folders
