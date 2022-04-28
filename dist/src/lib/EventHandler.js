"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("glob");
const util_1 = require("util");
const PG = (0, util_1.promisify)(glob_1.glob);
class EventHandler {
    constructor(client, options, events) {
        events.map((Event) => {
            if (Event.once) {
                /* eslint-disable */
                client.once(Event.name, (...props) => Event.run(props, client));
                /* eslint-enable */
            }
            else {
                client.on(Event.name, (...props) => Event.run(props, client));
            }
        });
    }
}
exports.default = EventHandler;
