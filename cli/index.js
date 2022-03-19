#!/usr/bin/env node
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

inquirer
  .prompt([
    {
      name: "dir",
      message:
        "Enter a directory name (If directory doesn't exist, nothing will be made).",
      type: "text",
    },
    {
      name: "lang",
      message: "Select language DartCommands will be setup with",
      type: "list",
      choices: ["TypeScript", "JavaScript"],
    },
    {
      name: "token",
      message: "Enter your bot token (Input will not be shown)",
      type: "password",
    },
  ])
  .then(({ lang, dir, token }) => {
    const ts = lang == "TypeScript";
    if (!dir) {
      console.log(
        chalk.red.bold("DartCommands Error:"),
        "Invalid directory provided"
      );
      process.exit(0);
    }
    fs.writeFile(
      `${path.join(
        process.cwd(),
        `${
          dir == "."
            ? `/index.${ts ? "ts" : "js"}`
            : `${dir}/index.${ts ? "ts" : "js"}`
        }`
      )}`,
      ts
        ? `import { Client, Intents } from "discord.js";
import DartCommands from "dartcommands";
import Config from './Config';

const client: Client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

client.on("ready", () => {
  new DartCommands(client, {
    typescript: true,
    commandsDir: "Commands",
  })
});

client.login(Config.BOT_TOKEN);
`
        : `const { Client, Intents } = require("discord.js");
const DartCommands = require('dartcommands')
const Config = require('./Config')
        
/**
 * @param {Client} client
 */
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

client.on("ready", () => {
  new DartCommands(client, {
    commandsDir: "Commands",
  })
});

client.login(Config.BOT_TOKEN);
`,
      () => {}
    );
    fs.mkdir(
      `${path.join(
        process.cwd(),
        `${dir == "." ? `Commands` : `${dir}/Commands`}`
      )}`,
      () => {}
    );
    fs.writeFile(
      `${path.join(
        process.cwd(),
        `${
          dir == "."
            ? `/Commands/ping.${ts ? "ts" : "js"}`
            : `${dir}/Commands/ping.${ts ? "ts" : "js"}`
        }`
      )}`,
      ts
        ? `import { ICommand } from 'dartcommands'

export default {
  description: 'Sends pong!',
  async run() {
    return "Pong!"
  }
} as ICommand`
        : `module.exports = {
  description: "Sends pong!",
  async run() {
    return "Pong!"
  }
}`,
      () => {}
    );
    fs.writeFile(
      `${path.join(
        process.cwd(),
        `${
          dir == "."
            ? `/Config.${ts ? "ts" : "js"}`
            : `${dir}/Config.${ts ? "ts" : "js"}`
        }`
      )}`,
      ts
        ? `export default {
  BOT_TOKEN: '${token}'
}`
        : `module.exports = {
  BOT_TOKEN: '${token}'
}`,
      () => {}
    );
  });
