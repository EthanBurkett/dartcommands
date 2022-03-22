import { Client, Collection } from "discord.js";
import { IOptions, ICommand } from "../../index.d";
import { glob } from "glob";
import { promisify } from "util";
const PG = promisify(glob);
import path from "path";
import chalk from "chalk";
import CommandHandler from "./CommandHandler";
import { Utils } from "../index";

export default class CommandLoader {
  private _client: Client;
  private _options: IOptions;
  private _commands: Collection<string, ICommand> = new Collection();

  constructor(client: Client, options: IOptions) {
    this._client = client;
    this._options = options;
    this.load();
    this.loadInternal();
  }

  private async load() {
    (
      await PG(
        `${path.join(process.cwd(), this._options.commandsDir)}/**/*.${
          this._options.typescript ? "ts" : "js"
        }`
      )
    ).map((file: any) => {
      const L = file.split("/");
      let name = L[L.length - 1].substring(0, L[L.length - 1].length - 3);
      let Command: ICommand = this._options.typescript
        ? require(file).default
        : require(file);

      if (!Command) {
        console.log(
          chalk.red.bold(`Error: `) +
            "Could not load command " +
            chalk.white.bold(name)
        );
        process.exit(0);
      }
      if (Command.name) {
        name = Command.name;
      } else {
        Command.name = name;
      }

      if (!Command.run) {
        console.log(
          chalk.red.bold(`Error: `) +
            "No property named 'run' in command: " +
            chalk.white.bold(name)
        );
        process.exit(0);
      }

      this._commands.set(name, Command);
    });
  }

  // TODO: Change to JS on production build
  private async loadInternal() {
    (await PG(`${path.join(__dirname, "InternalCommands")}/**/*.js`)).map(
      (file: any) => {
        const L = file.split("/");
        let name = L[L.length - 1].substring(0, L[L.length - 1].length - 3);
        let Command: ICommand = require(file).default;

        if (!Command) {
          console.log(
            chalk.red.bold(`Error: `) +
              "Could not load command " +
              chalk.white.bold(name)
          );
          process.exit(0);
        }
        if (Command.name) {
          name = Command.name;
        } else {
          Command.name = name;
        }

        if (this._options.disabledDefaultCommands?.includes(name)) return;

        if (!Command.run) {
          console.log(
            chalk.red.bold(`Error: `) +
              "No property named 'run' in command: " +
              chalk.white.bold(name)
          );
          process.exit(0);
        }

        this._commands.set(name, Command);
      }
    );
    Utils.CLILog(`Loaded ${chalk.blueBright(this._commands.size)} command(s)`);
  }

  public get commands() {
    return this._commands;
  }
}
