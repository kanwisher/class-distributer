const { 
  trilogyDir,
  classDir,
  activityRoot
} = require("./config.json");

/*
* Simple-git
* https://www.npmjs.com/package/simple-git
*/
const simpleGit = require('simple-git');
const trilogyRepo = simpleGit(trilogyDir);
const classRepo = simpleGit(classDir);

/*
* Inquirer
* https://www.npmjs.com/package/inquirer
*/
const inquirer = require('inquirer');
/*
* fs-extra
* includes all of fs, plus additional enhancements
*/
const fse = require('fs-extra');
const path = require('path');

/*
* extra features
* if no config, make user create one using inquirer
* if no matching files are found, ask if you would like to open the directory in explorer/finder
*/

const backString = "<< BACK"

function getFolderNames(parentDir) {
  return fse.readdirSync(parentDir, { withFileTypes: true })
  .filter((file) => file.isDirectory())
  .map((dir) => dir.name);
}

function getSolutions(parentDir) {
  return fse.readdirSync(parentDir)
  .filter((file) => file === 'Solved');
}

function getUnsolved(parentDir) {
  return fse.readdirSync(parentDir, { withFileTypes: true})
  .map((file) => file.name)
  .filter((fileName) => fileName !== "Solved");
}

function init() {
  updateRepos().then(mainMenu);
}

function mainMenu() {
  const choices = [
    {
      name: 'Push solutions for a single activity',
      value: 'solved'
    },
    {
      name: 'Push unsolved activities for an entire week',
      value: 'unsolved'
    },
    {
      name: 'Exit',
      value: 'exit'
    }
  ];

  const question = {
    type: 'rawlist',
    name: 'menuChoice',
    message: 'What would you like to do?',
    choices
  };
  
  inquirer.prompt([question])
    .then(({menuChoice}) => {
      switch (menuChoice) {
        case 'solved':
        case 'unsolved':
          pickWeek(menuChoice);
          break;
        case 'exit':
          exit();
          break;
      }
    });
}

function exit() {
  process.exit()
}

function updateRepos() {
  return new Promise((resolve, reject) => {
    trilogyRepo.pull((err, {summary}) => {
      if (err) {
        reject(err);
      } else {
        console.log('TrilogyRepo Updated: ', summary);
        classRepo.pull((err, {summary}) => {
          if (err) {
            reject(err);
          } else {
            console.log('ClassRepo Updated: ', summary);
            resolve();
          }
        })
      }
    });
  });
}

function pickWeek(task) {
  const action = task === 'unsolved' ? 'Copy unsolved' : 'Explore';
  const folders = getFolderNames(trilogyDir);
  const question = {
    type: 'rawlist',
    name: 'weekDir',
    message: `${action} activities for which week?`,
    choices: [...folders, backString ]
  };
  
  inquirer.prompt([question])
    .then(({weekDir}) => {
      if(weekDir.indexOf(backString)) !== -1) {
        mainMenu();
      } else if (task === 'solved') {
        pickActivity(weekDir, task);
      } else {
        copyUnsolved(weekDir);
      }
    });
}

function pickActivity(weekDir, task) {
  const weekPath = path.join(trilogyDir, weekDir, activityRoot);
  const question = {
    type: 'rawlist',
    name: 'activityDir',
    message: 'Which activity?',
    choices: [...getFolderNames(weekPath), backString ]
  }

  inquirer.prompt([question])
    .then(({activityDir}) => {
      if(activityDir.indexOf(backString) !== -1) {
        pickWeek(task);
      } else {
        copySolutions(weekDir, activityDir)
      }
    });
}

function copySolutions(weekDir, activityDir) {
  const trilogyPath = path.join(trilogyDir, weekDir, activityRoot, activityDir);
  let classPath = path.join(classDir, weekDir, activityRoot, activityDir);
  const solutions = getSolutions(trilogyPath);
  if (solutions.length) {
    solutions.forEach(file => {
      const fromPath = path.join(trilogyPath, file);
      const toPath = path.join(classPath, file);
      fse.copySync(fromPath, toPath);
    });
    console.log(`Copied solutions folder with all contents`);
    gitMenu(weekDir, activityDir);
  } else {
    console.log('No Solutions for this activity');
    console.log('Returning To Menu');
    pickActivity(weekDir);
  }
}

function copyUnsolved(weekDir) {
  const trilogyPath = path.join(trilogyDir, weekDir, activityRoot);
  const classPath = path.join(classDir, weekDir, activityRoot);
  const folders = getFolderNames(trilogyPath);
  folders.forEach((folderName) => {
    const folderPath = path.join(trilogyPath, folderName);
    const unsolved = getUnsolved(folderPath);
    unsolved.forEach((unsolvedName) => {
      const fromPath = path.join(folderPath, unsolvedName);
      const toPath = path.join(classPath, folderName, unsolvedName);
      fse.copySync(fromPath, toPath);
    });
    addCommitPush(weekDir);
  });


}

function gitMenu(weekDir, activityDir) {
  classRepo.status((err, { not_added: notAdded }) => {
    if (notAdded.length) {
      console.log(notAdded);

      const question = {
        type: 'confirm',
        name: 'confirmed',
        default: true,
        message: 'Would you like to push the above files?'
      };
      
      inquirer.prompt([question])
      .then(({confirmed}) => {
        if (confirmed) {
          addCommitPush(weekDir, activityDir);
        } else {
          console.log('Returning to menu');
          pickActivity(weekDir);
        }
      });
    } else {
      console.log('Nothing to commit, you must have already pushed these files, returning to menu');
      pickActivity(weekDir);
    }
  });
}

function addCommitPush(weekDir, activityDir) {
  let message = `Adding unsolved content for ${weekDir}`;
  if (activityDir) {
    message = `Adding solutions for ${activityDir}`;
  }
  classRepo.add('.', (err, response) => {
    if (!err) {;
      classRepo.commit(message, (err, { summary }) => {
        if (!err) {
          classRepo.push((err, result) => {
            if (!err) {
              console.log('Content is pushed')
            }
            console.log('Returning to menu');
            updateRepos().then(() => {
              pickActivity(weekDir);
            })
          });
        }
      });
    }
  });
}

init();