import { Client, Collection } from "discord.js";
import { EventConfig, IOptions } from "../..";
import { glob } from "glob";
import { promisify } from "util";
import path from "path";
import { Utils } from "..";
import DartCommands from "..";
const PG = promisify(glob);

export default class EventLoader {
  private _client: Client;
  private _instance: DartCommands;
  private _options: IOptions;
  private _eventConfigs: Collection<string, EventConfig>;
  constructor(client: Client, options: IOptions, instance: DartCommands) {
    (this._client = client),
      (this._instance = instance),
      (this._options = options);
    this._eventConfigs = new Collection();
    this.Load();
  }

  private async Load() {
    (
      await PG(
        `${path.join(process.cwd(), this._options.eventsDir!)}/**/*.${
          this._options.typescript ? "ts" : "js"
        }`
      )
    ).map(async (file) => {
      const L = file.split("/");
      let name = L[L.length - 1].substring(0, L[L.length - 1].length - 3);
      let func: any = require(file).default
        ? require(file).default.run
        : require(file).run;
      let config: EventConfig = require(file).default
        ? require(file).default.config
        : require(file).config;

      if (!func || typeof func != "function") {
        Utils.CLIError(
          `${name} needs to have a 'run' export that is a function.`
        );
        process.exit(0);
      }
      if (!config) {
        Utils.CLIError(`${name} is missing the config export.`);
        process.exit(0);
      }
      if (!config.name) {
        Utils.CLIError(`${name} missing an event name`);
        process.exit(0);
      }

      func(this._client, this._instance);
    });
  }
}
