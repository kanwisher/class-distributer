<h1 align="center">Welcome to Class Distributer 👋</h1>
<p>
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://twitter.com/kanwisher">
    <img alt="Twitter: kanwisher" src="https://img.shields.io/twitter/follow/kanwisher.svg?style=social" target="_blank" />
  </a>
</p>

> Allows TA/Instructor to update the class repository with an activity solution

## Install

```sh
npm install
```

## Usage

Rename `config.json.example` to `config.json`

In `config.json`, update `trilogyDir` and `classDir` values to their respective repo directory locations on your machine, then run:

```sh
node class-distributer
```

Each action will update both the trilogy and class repositories, error handling for git issues is not very sophisticated at this time.

`Push solutions for a single activity` will open a menu to select the curriculum week and activity, then it will move the activity from your trilogy repo folder to your class folder. Then it will add, commit (with message) and push to your class remote repository.

`Push unsolved activities for an entire week` will open a menu to select the curriculum week, then it will move everything but the `Solved` folder from your trilogy repo folder to your class repo folder. Then it will add, commit (with message) and push to your class remote repository.





## Run tests

```sh
npm run test
```

## Author

👤 **David Kanwisher**

* Twitter: [@kanwisher](https://twitter.com/kanwisher)
* Github: [@kanwisher](https://github.com/kanwisher)

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_