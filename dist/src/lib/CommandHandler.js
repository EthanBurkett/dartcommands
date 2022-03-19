"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const english_1 = require("../lang/english");
const permissions_1 = require("../Validation/permissions");
function CheckLang(input) {
    if (typeof input == "object") {
        return "embed";
    }
    return "string";
}
class CommandHandler {
    constructor(client, options, instance) {
        this._client = client;
        this._options = options;
        client.on("messageCreate", (message) => this.handleMessage(message, instance));
    }
    async handleMessage(message, instance) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!message)
            return;
        const Prefix = (_c = (_b = (_a = instance.Cache) === null || _a === void 0 ? void 0 : _a.GuildPrefixes) === null || _b === void 0 ? void 0 : _b.get(message.guild.id)) !== null && _c !== void 0 ? _c : instance.prefix;
        const MessagePrefix = message.content.substring(0, Prefix.length);
        let args = message.content.split(" ");
        if (Prefix !== MessagePrefix ||
            (this._options.ignoreBots && message.author.bot))
            return;
        const Commands = instance.commands;
        let Command = Commands.get(args[0].substring(Prefix.length, args[0].length));
        args = args.slice(1);
        if (!Command)
            Command = Commands.find((cmd) => cmd.aliases &&
                cmd.aliases.includes(args[0].substring(Prefix.length, args[0].length)));
        if (!Command)
            return;
        if (!Command.description)
            throw new Error(`${Command.name} does not have a "description" property`);
        if (Command.permission) {
            if (!permissions_1.permissionList.includes(Command.permission))
                throw new Error(`Dart | "${Command.permission}" is an invalid permission node.`);
            if (!((_d = message.member) === null || _d === void 0 ? void 0 : _d.permissions.has(Command.permission))) {
                let msg = english_1.Messages.noPermission;
                if (typeof msg == "object") {
                    msg.description = (_e = msg.description) === null || _e === void 0 ? void 0 : _e.replace(/{PERMISSION}/g, `${Command.permission}`);
                    return message.reply({
                        embeds: [msg],
                    });
                }
                else if (typeof msg == "string") {
                    msg = msg.replace(/{PERMISSION}/g, `${Command.permission}`);
                    return message.reply({
                        content: `${msg}`,
                    });
                }
            }
        }
        if (Command.minArgs && args.length < Command.minArgs) {
            if (typeof english_1.Messages.minArgs == "object") {
                if (!english_1.Messages.minArgs || !english_1.Messages.minArgs.description)
                    return;
                english_1.Messages.minArgs.description = english_1.Messages.minArgs.description
                    .replace(/{MIN}/g, `${Command.minArgs}`)
                    .replace(/{EXPECTED}/g, `${Command.expectedArgs
                    ? Command.expectedArgs
                    : `${instance.prefix}${Command.name}`}`);
                return message.reply({
                    embeds: [english_1.Messages.minArgs],
                });
            }
            if (!(english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.minArgs))
                return;
            english_1.Messages.minArgs = english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.minArgs.replace(/{MIN}/g, `${Command.minArgs}`).replace(/{EXPECTED}/g, `${Command.expectedArgs
                ? Command.expectedArgs
                : `${instance.prefix}${Command.name}`}`);
            return message.reply({
                content: english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.minArgs,
            });
        }
        if (Command.maxArgs && args.length > Command.maxArgs) {
            if (typeof (english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.maxArgs) == "object") {
                if (!english_1.Messages.maxArgs || !english_1.Messages.maxArgs.description)
                    return;
                english_1.Messages.maxArgs.description = english_1.Messages.maxArgs.description
                    .replace(/{MAX}/g, `${Command.maxArgs}`)
                    .replace(/{EXPECTED}/g, `${Command.expectedArgs
                    ? Command.expectedArgs
                    : `${instance.prefix}${Command.name}`}`);
                return message.reply({
                    embeds: [english_1.Messages.maxArgs],
                });
            }
            if (!(english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.maxArgs))
                return;
            english_1.Messages.maxArgs = english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.maxArgs.replace(/{MAX}/g, `${Command.maxArgs}`).replace(/{EXPECTED}/g, `${Command.expectedArgs
                ? Command.expectedArgs
                : `${instance.prefix}${Command.name}`}`);
            return message.reply({
                content: english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.maxArgs,
            });
        }
        if (Command.ownerOnly && !instance.settings.botOwners)
            throw new Error(`${Command.name} has property "ownerOnly" but "botOwners" is not defined in the setup method.`);
        if (Command.ownerOnly &&
            instance.settings.botOwners &&
            !((_f = instance.settings.botOwners) === null || _f === void 0 ? void 0 : _f.includes(message.author.id))) {
            if (!(english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.ownerOnly))
                return;
            if (typeof (english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.ownerOnly) == "object") {
                return message.reply({
                    embeds: [english_1.Messages.ownerOnly],
                });
            }
            return message.reply({
                content: english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.ownerOnly,
            });
        }
        if (Command.testOnly && !instance.settings.testServers)
            throw new Error(`${Command.name} has property "testOnly" but "testServers" is not defined in the setup method.`);
        if (Command.testOnly &&
            instance.settings.testServers &&
            !((_g = instance.settings.testServers) === null || _g === void 0 ? void 0 : _g.includes((_h = message.guild) === null || _h === void 0 ? void 0 : _h.id))) {
            if (!(english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.testOnly))
                return;
            if (typeof (english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.testOnly) == "object") {
                return message.reply({
                    embeds: [english_1.Messages.testOnly],
                });
            }
            return message.reply({
                content: english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.testOnly,
            });
        }
        const inst = instance;
        let result = Command.run({
            args,
            channel: message.channel,
            guild: message.guild,
            instance: inst,
            member: message.member,
            message: message,
            text: args.join(" "),
            user: message.author,
            client: this._client,
        });
        if (result instanceof Promise)
            result = await result;
        if (typeof result == "object") {
            if (result.custom) {
                return message.reply(result);
            }
            if (result.type == "rich") {
                if (!Array.isArray(result)) {
                    result = [result];
                }
                return message.reply({
                    embeds: result,
                });
            }
            return result;
        }
        else if (typeof result == "string") {
            return message.reply({
                content: result,
            });
        }
        else {
            return;
        }
    }
}
exports.default = CommandHandler;
