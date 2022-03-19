"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("glob");
const util_1 = require("util");
const PG = (0, util_1.promisify)(glob_1.glob);
class EventHandler {
    constructor(client, options, events) {
        events.map((Event) => {
            if (Event.once) {
                client.once(Event.name, Event.run);
            }
            else {
                client.on(Event.name, Event.run);
            }
        });
    }
}
exports.default = EventHandler;
