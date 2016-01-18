# Jekyll Audit

Audit Jekyll sites for sanity

## Installation

```bash
npm install -g jekyll-audit
```

## Usage

```bash
$ cd /path/to/my-blog/_posts

$ jekyll-audit categories list
Baseball
Football
Basketball
```

## Commands

#### `categories list`

List all the categories being used by posts right now

#### `categories list-underused`

List categories that account for a very small amount of the total posts. By default, categories that account for <= 2% of all posts will be considered underused. This threshold can be adjusted by adding the `--threshold` option with a number between 0 and 1, e.g: `--threshold 0.05` to show all categories that account for <= 5% of total posts.

#### `categories list-similar`

List categories with very similar names, which could benefit from being merged into one. By default, lists categories whose names have a [Jaro-Winkler distance](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance) of 0.9 or greater. This threshold can be adjusted by adding the `--threshold` option with a number between 0 and 1, e.g: `--threshold 0.85` to show all category pairs with a Jaro-Winkler distance >= 0.85.
