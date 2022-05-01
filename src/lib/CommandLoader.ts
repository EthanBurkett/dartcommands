import {
  Collection,
  Client,
  ApplicationCommand,
  ApplicationCommandOptionData,
} from "discord.js";
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
  }

  private checkUnusedSlash() {
    Utils.CLILog("Checking for unused slash commands...");
    this._client.guilds.cache.map(async (guild) => {
      await guild.commands.fetch();
      guild.commands.cache.map((slash) => {
        const cmd = this._commands.find((cmd) => cmd.name == slash.name);
        if (!cmd) return;
        if (!cmd.slash) {
          slash.delete();
          Utils.CLILog(
            `Removing guild slash command "${cmd.name}" due to property "slash" being disabled.`
          );
        }
      });
    });

    (async () => await this._client.application?.commands.fetch())();

    this._client.application?.commands.cache.map((slash) => {
      const cmd = this._commands.find((cmd) => cmd.name == slash.name);
      if (!cmd) return;
      if (!cmd.slash) {
        slash.delete();
        Utils.CLILog(
          `Removing client slash command "${cmd.name}" due to property "slash" being disabled.`
        );
      }
    });
  }

  private async load() {
    this.loadInternal();
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

      if (Command.slash) {
        if (this._options.testServers && Command.testOnly) {
          this._options.testServers.map((server: string) => {
            this.create(
              Command.name!,
              Command.description,
              Command.options!,
              server
            );
          });
        } else {
          this.create(Command.name!, Command.description, Command.options!);
        }
      }

      this._commands.set(name, Command);
    });
    this.checkUnusedSlash();
    Utils.CLILog(
      `Loaded ${chalk.blueBright(`${this._commands.size}`)} command(s)`
    );
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
        if (name == "prefix" && !this._options.mongo) return;

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
  }

  public get commands() {
    return this._commands;
  }

  private didOptionsChange(
    command: ApplicationCommand,
    options: ApplicationCommandOptionData[] | any
  ): boolean {
    return (
      command.options?.filter((opt: any, index: any) => {
        return (
          opt?.required !== options[index]?.required &&
          opt?.name !== options[index]?.name &&
          opt?.options?.length !== options.length
        );
      }).length !== 0
    );
  }

  public getCommands(guildId?: string) {
    if (guildId) {
      return this._client.guilds.cache.get(guildId)?.commands;
    }

    return this._client.application?.commands;
  }

  public async create(
    name: string,
    description: string,
    options: ApplicationCommandOptionData[],
    guildId?: string
  ): Promise<ApplicationCommand<{}> | undefined> {
    let commands;

    if (guildId) {
      commands = this._client.guilds.cache.get(guildId)?.commands;
    } else {
      commands = this._client.application?.commands;
    }

    if (!commands) {
      return;
    }

    // @ts-ignore
    await commands.fetch();

    const cmd = commands.cache.find(
      (cmd) => cmd.name === name
    ) as ApplicationCommand;

    if (cmd) {
      const optionsChanged = this.didOptionsChange(cmd, options);

      if (
        (cmd.options &&
          cmd.description &&
          options &&
          cmd.options.length != options.length!) ||
        cmd.description !== description ||
        optionsChanged
      ) {
        Utils.CLILog(
          `Updating${guildId ? " guild" : ""} slash command "${name}"`
        );

        return commands?.edit(cmd.id, {
          name,
          description,
          options,
        });
      }

      return Promise.resolve(cmd);
    }

    if (commands) {
      Utils.CLILog(
        `Creating${guildId ? " guild" : ""} slash command "${name}"`
      );

      const newCommand = await commands.create({
        name,
        description,
        options,
      });

      return newCommand;
    }

    return Promise.resolve(undefined);
  }

  public async delete(
    commandId: string,
    guildId?: string
  ): Promise<ApplicationCommand<{}> | undefined> {
    const commands = this.getCommands(guildId);
    if (commands) {
      const cmd = commands.cache.get(commandId);
      if (cmd) {
        Utils.CLILog(
          `Deleted${guildId ? " guild" : ""} slash command "${cmd.name}".`
        );

        cmd.delete();
      }
    }

    return Promise.resolve(undefined);
  }
}
