import { Client, Collection, HexColorString } from "discord.js";
import { Cache, ICache, IOptions, LANG_ENGLISH } from "../index.d";
import CommandLoader from "./lib/CommandLoader";
import CommandHandler from "./lib/CommandHandler";
import { Messages } from "./lang/english";
import EventLoader from "./lib/EventLoader";
import { Connect, Cache as cache } from "./lib/Mongo";
import chalk from "chalk";

export const Utils: {
  CLILog: (...messages: string[]) => any;
  CLIError: (...messages: string[]) => any;
} = {
  CLILog: (...messages) =>
    console.log(
      chalk.blueBright.bold("DartCommands"),
      chalk.white.bold(">"),
      ...messages
    ),
  CLIError: (...messages) => {
    console.log(
      chalk.redBright.bold("DartCommands Error"),
      chalk.white.bold(">"),
      ...messages
    );
  },
};

export default class {
  private _client: Client;
  private _options: IOptions;
  private _prefix: string;
  private _commandLoader: any;
  private _eventHandler: any;
  private _defaultColor: number;
  private _cache?: any = {
    GuildPrefixes: new Collection<string, string>(),
  };
  constructor(client: Client, options: IOptions) {
    this._client = client;
    this._options = options;
    this._prefix = "!";
    this._defaultColor = 0xffffff;
    this._CommandLoader();
    this._EventHandler();
    if (options.mongo) this.Mongo();
  }
  private async Mongo() {
    if (!this._options.mongo) return;
    if (!this._options.mongo.options) {
      await Connect(this._options.mongo.uri);
    } else {
      await Connect(this._options.mongo.uri, this._options.mongo.options);
    }
    cache.InitialCache();
    this._cache = cache;
  }
  private _CommandLoader() {
    this._commandLoader = new CommandLoader(this._client, this._options);
    new CommandHandler(this._client, this._options, this);
    Utils.CLILog("Bot is now online");
  }
  private _EventHandler() {
    if (!this._options.eventsDir) return;
    this._eventHandler = new EventLoader(this._client, this._options, this);
  }
  public defaultPrefix(p: string) {
    this._prefix = p;
    return this;
  }
  public get client() {
    return this._client;
  }
  public get prefix() {
    return this._prefix;
  }
  public get events() {
    return this._eventHandler.events;
  }
  public get commands() {
    return this._commandLoader.commands;
  }
  public get settings() {
    return this._options;
  }
  public get Cache() {
    return this._cache;
  }
  public UpdatePrefix(guildId: string, newPrefix: string) {
    this._cache?.UpdatePrefix!(guildId, newPrefix);
  }
  public setLanguageSettings(props: LANG_ENGLISH) {
    if (props) {
      Object.assign(Messages, props);
    }
    return this;
  }
  public defaultColor(color: number) {
    this._defaultColor = color;
    return this;
  }
  public get getDefaultColor() {
    return this._defaultColor;
  }
  public get self() {
    return this;
  }
}
