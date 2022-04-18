import { Client, Collection } from "discord.js";
import { IEvent, IOptions } from "../../index.d";
import path from "path";
import { glob } from "glob";
import { promisify } from "util";
import EventHandler from "./EventHandler";
import { Utils } from "../index";
import chalk from "chalk";
const PG = promisify(glob);

export default class EventLoader {
  private _options: IOptions;
  private _client: Client;
  private _events: Collection<string, IEvent>;
  constructor(client: Client, options: IOptions) {
    this._client = client;
    this._options = options;
    this._events = new Collection();
    this.handleFiles();
  }
  private async handleFiles() {
    if (!this._options.eventsDir) return;
    try {
      (
        await PG(
          `${path.join(process.cwd(), this._options.eventsDir)}/**/*.${
            this._options.typescript ? "ts" : "js"
          }`
        )
      ).map((file: any) => {
        let Event: IEvent = this._options.typescript
          ? require(file).default
          : require(file);
        const L = file.split("/");
        let name = L[L.length - 1].substring(0, L[L.length - 1].length - 3);

        if (!Event) throw new Error(`Error loading events`);
        if (!Event.name) {
          Event.name = name;
        }
        if (!Event.run) {
          Utils.CLIError(
            chalk.bold(`${name}`),
            'is missing the required "run" property.'
          );
          process.exit(0);
        }

        this._events.set(Event.name!, Event);
      });
      Utils.CLILog(`Loaded ${chalk.blueBright(this._events.size)} event(s)`);
      new EventHandler(this._client, this._options, this._events);
    } catch (e: any) {
      throw new Error(e);
    }
  }
}
