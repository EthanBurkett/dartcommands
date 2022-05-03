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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (((_a = message.author) === null || _a === void 0 ? void 0 : _a.id) == ((_b = this._client.user) === null || _b === void 0 ? void 0 : _b.id))
            return;
        if (!message.guild && message.content.startsWith(instance.prefix))
            return message.channel.send("Legacy commands may only be ran in servers.");
        if (this._options.ignoreDMs && message.channel.type == "DM")
            return message.reply({ content: "DMs are disabled for this bot." });
        if (((_c = message.member) === null || _c === void 0 ? void 0 : _c.user.id) == this._client.user.id)
            return;
        const Prefix = message.guild
            ? (_f = (_e = (_d = instance.Cache) === null || _d === void 0 ? void 0 : _d.GuildPrefixes) === null || _e === void 0 ? void 0 : _e.get(message.guild.id)) !== null && _f !== void 0 ? _f : instance.prefix
            : instance.prefix;
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
            if (!((_g = message.member) === null || _g === void 0 ? void 0 : _g.permissions.has(Command.permission))) {
                let msg = english_1.Messages.noPermission;
                if (typeof msg == "object") {
                    msg.description = (_h = msg.description) === null || _h === void 0 ? void 0 : _h.replace(/{PERMISSION}/g, `${Command.permission}`);
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
            !((_j = instance.settings.botOwners) === null || _j === void 0 ? void 0 : _j.includes(message.author.id))) {
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
        this._client.emit("Dart.LegacyCommand", Command, message);
        this.replyFromCallback(message, result);
    }
    async InteractionEvent(interaction, instance, client) {
        var _a, _b, _c, _d, _e, _f;
        if (!interaction.isCommand())
            return;
        const { user, commandName, options, guild, channelId } = interaction;
        if (this._options.ignoreDMs && ((_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.type) == "DM")
            return interaction.reply({ content: "DMs are disabled for this bot." });
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
            if (!((_b = interaction.memberPermissions) === null || _b === void 0 ? void 0 : _b.has(Command.permission))) {
                let msg = english_1.Messages.noPermission;
                if (typeof msg == "object") {
                    msg.description = (_c = msg.description) === null || _c === void 0 ? void 0 : _c.replace(/{PERMISSION}/g, `${Command.permission}`);
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
            !((_d = instance.settings.botOwners) === null || _d === void 0 ? void 0 : _d.includes(interaction.user.id))) {
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
            !((_e = instance.settings.testServers) === null || _e === void 0 ? void 0 : _e.includes((_f = interaction.guild) === null || _f === void 0 ? void 0 : _f.id))) {
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
        this._client.emit("Dart.SlashCommand", Command, interaction);
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
