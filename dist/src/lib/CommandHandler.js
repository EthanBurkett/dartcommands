"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
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
        this._instance = instance;
        client.on("messageCreate", (message) => this.handleMessage(message, instance));
        client.on("interactionCreate", (interaction) => {
            this.InteractionEvent(interaction, instance, client);
        });
    }
    async handleMessage(message, instance) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!message || !message.guild)
            return;
        if (((_a = message.member) === null || _a === void 0 ? void 0 : _a.user.id) == this._client.user.id)
            return;
        const Prefix = (_d = (_c = (_b = instance.Cache) === null || _b === void 0 ? void 0 : _b.GuildPrefixes) === null || _c === void 0 ? void 0 : _c.get(message.guild.id)) !== null && _d !== void 0 ? _d : instance.prefix;
        const MessagePrefix = message.content.substring(0, Prefix.length);
        let args = message.content.split(" ");
        if (Prefix !== MessagePrefix ||
            (this._options.ignoreBots && message.author.bot))
            return;
        const Commands = instance.commands;
        let Command = Commands.get(args[0].substring(Prefix.length, args[0].length));
        if (!Command)
            Command = Commands.find((cmd) => cmd.aliases &&
                cmd.aliases.includes(args[0].substring(Prefix.length, args[0].length)));
        if (!Command)
            return;
        args = args.slice(1);
        if (Command.slash === true)
            return;
        if (!Command.description)
            throw new Error(`${Command.name} does not have a "description" property`);
        if (Command.permission) {
            if (!permissions_1.permissionList.includes(Command.permission))
                throw new Error(`Dart | "${Command.permission}" is an invalid permission node.`);
            if (!((_e = message.member) === null || _e === void 0 ? void 0 : _e.permissions.has(Command.permission))) {
                let msg = english_1.Messages.noPermission;
                if (typeof msg == "object") {
                    msg.description = (_f = msg.description) === null || _f === void 0 ? void 0 : _f.replace(/{PERMISSION}/g, `${Command.permission}`);
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
            !((_g = instance.settings.botOwners) === null || _g === void 0 ? void 0 : _g.includes(message.author.id))) {
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
        const inst = instance;
        let result = Command.run({
            args: args,
            channel: message.channel,
            guild: message.guild,
            instance: inst,
            member: message.member,
            message: message,
            text: args.join(" "),
            user: message.author,
            client: this._client,
            interaction: null,
        });
        if (result instanceof Promise)
            result = await result;
        this.replyFromCallback(message, result);
    }
    async InteractionEvent(interaction, instance, client) {
        var _a, _b, _c, _d, _e;
        if (!interaction.isCommand())
            return;
        const { user, commandName, options, guild, channelId } = interaction;
        const member = interaction.member;
        const channel = (guild === null || guild === void 0 ? void 0 : guild.channels.cache.get(channelId)) || null;
        let Command = this._instance.commands.get(commandName);
        if (!Command)
            return;
        if (!Command.slash)
            return interaction.reply({
                embeds: [
                    new discord_js_1.MessageEmbed()
                        .setDescription("That command is slash disabled.")
                        .setColor("RED"),
                ],
            });
        if (Command.permission) {
            if (!permissions_1.permissionList.includes(Command.permission))
                throw new Error(`Dart | "${Command.permission}" is an invalid permission node.`);
            if (!((_a = interaction.memberPermissions) === null || _a === void 0 ? void 0 : _a.has(Command.permission))) {
                let msg = english_1.Messages.noPermission;
                if (typeof msg == "object") {
                    msg.description = (_b = msg.description) === null || _b === void 0 ? void 0 : _b.replace(/{PERMISSION}/g, `${Command.permission}`);
                    return interaction.reply({
                        embeds: [msg],
                    });
                }
                else if (typeof msg == "string") {
                    msg = msg.replace(/{PERMISSION}/g, `${Command.permission}`);
                    return interaction.reply({
                        content: `${msg}`,
                    });
                }
            }
        }
        if (Command.ownerOnly && !instance.settings.botOwners)
            throw new Error(`${Command.name} has property "ownerOnly" but "botOwners" is not defined in the setup method.`);
        if (Command.ownerOnly &&
            instance.settings.botOwners &&
            !((_c = instance.settings.botOwners) === null || _c === void 0 ? void 0 : _c.includes(interaction.user.id))) {
            if (!(english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.ownerOnly))
                return;
            if (typeof (english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.ownerOnly) == "object") {
                return interaction.reply({
                    embeds: [english_1.Messages.ownerOnly],
                });
            }
            return interaction.reply({
                content: english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.ownerOnly,
            });
        }
        if (Command.testOnly && !instance.settings.testServers)
            throw new Error(`${Command.name} has property "testOnly" but "testServers" is not defined in the setup method.`);
        if (Command.testOnly &&
            instance.settings.testServers &&
            !((_d = instance.settings.testServers) === null || _d === void 0 ? void 0 : _d.includes((_e = interaction.guild) === null || _e === void 0 ? void 0 : _e.id))) {
            if (!(english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.testOnly))
                return;
            if (typeof (english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.testOnly) == "object") {
                return interaction.reply({
                    embeds: [english_1.Messages.testOnly],
                });
            }
            return interaction.reply({
                content: english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.testOnly,
            });
        }
        let reply = Command.run({
            user: interaction.user,
            guild: interaction.guild,
            channel: interaction.channel,
            member: member,
            interaction: interaction,
            instance: this._instance,
            client: this._client,
            message: null,
        });
        if (reply instanceof Promise)
            reply = await reply;
        this.replyFromCallback(interaction, reply);
    }
    replyFromCallback(msgOrInter, reply) {
        if (!reply) {
            return;
        }
        else if (reply.type == "rich" && typeof reply == "object") {
            msgOrInter.reply({
                embeds: [reply],
            });
        }
        else if (typeof reply == "object" && reply.custom) {
            msgOrInter.reply(reply);
        }
        else if (typeof reply == "string") {
            msgOrInter.reply({
                content: reply,
            });
        }
        else {
            return;
        }
    }
}
exports.default = CommandHandler;
