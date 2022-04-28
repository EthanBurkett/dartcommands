import { Client, Collection } from "discord.js";
import { IOptions, IEvent } from "../../index.d";
import { glob } from "glob";
import { promisify } from "util";
import DartCommands from "../index";
import path from "path";
const PG = promisify(glob);

export default class EventHandler {
  constructor(
    client: Client,
    options: IOptions,
    events: Collection<string, IEvent>
  ) {
    events.map((Event: IEvent) => {
      if (Event.once) {
        /* eslint-disable */
        client.once(Event.name!, (...props) => Event.run(props, client));
        /* eslint-enable */
      } else {
        client.on(Event.name!, (...props) => Event.run(props, client));
      }
    });
  }
}
