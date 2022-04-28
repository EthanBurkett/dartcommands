import {
  Client,
  Message,
  Guild,
  GuildMember,
  User,
  Collection,
  MessageEmbed,
  Permissions,
  CacheType,
  Interaction,
  CommandInteraction,
} from "discord.js";
import { IOptions, ICommand, ExecuteOptions } from "../../index.d";
import DartCommands from "../index";
import { Messages } from "../lang/english";
import { permissionList } from "../Validation/permissions";

function CheckLang(input: string | object | undefined) {
  if (typeof input == "object") {
    return "embed";
  }

  return "string";
}

export default class CommandHandler {
  private _client: Client;
  private _options: IOptions;
  private _instance: DartCommands;

  constructor(client: Client, options: IOptions, instance: DartCommands) {
    this._client = client;
    this._options = options;
    this._instance = instance;
    client.on("messageCreate", (message: Message<boolean>): any =>
      this.handleMessage(message, instance)
    );
    client.on("interactionCreate", (interaction: Interaction<CacheType>) => {
      this.InteractionEvent(interaction, instance, client);
    });
  }

  private async handleMessage(
    message: Message<boolean>,
    instance: DartCommands
  ) {
    if (!message) return;
    const Prefix: string =
      instance.Cache?.GuildPrefixes?.get(message.guild!.id) ?? instance.prefix;
    const MessagePrefix: string = message.content.substring(0, Prefix.length);
    let args: string[] = message.content.split(" ");
    if (
      Prefix !== MessagePrefix ||
      (this._options.ignoreBots && message.author.bot)
    )
      return;

    const Commands: Collection<string, ICommand> = instance.commands;

    let Command: ICommand | undefined = Commands.get(
      args[0].substring(Prefix.length, args[0].length)
    );

    if (!Command)
      Command = Commands.find(
        (cmd) =>
          cmd.aliases! &&
          cmd.aliases.includes(args[0].substring(Prefix.length, args[0].length))
      );
    if (!Command) return;
    args = args.slice(1);
    if (Command.slash === true) return;

    if (!Command.description)
      throw new Error(`${Command.name} does not have a "description" property`);

    if (Command.permission) {
      if (!permissionList.includes(Command.permission))
        throw new Error(
          `Dart | "${Command.permission}" is an invalid permission node.`
        );
      if (!message.member?.permissions.has(Command.permission)) {
        let msg = Messages.noPermission;
        if (typeof msg == "object") {
          msg.description = msg.description?.replace(
            /{PERMISSION}/g,
            `${Command.permission}`
          )!;
          return message.reply({
            embeds: [msg],
          });
        } else if (typeof msg == "string") {
          msg = msg.replace(/{PERMISSION}/g, `${Command.permission}`);
          return message.reply({
            content: `${msg}`,
          });
        }
      }
    }

    if (Command.minArgs && args.length < Command.minArgs) {
      if (typeof Messages.minArgs == "object") {
        if (!Messages.minArgs || !Messages.minArgs.description) return;
        Messages.minArgs.description = Messages.minArgs.description
          .replace(/{MIN}/g, `${Command.minArgs}`)
          .replace(
            /{EXPECTED}/g,
            `${
              Command.expectedArgs
                ? Command.expectedArgs
                : `${instance.prefix}${Command.name}`
            }`
          );
        return message.reply({
          embeds: [Messages.minArgs],
        });
      }
      if (!Messages?.minArgs) return;
      Messages!.minArgs = Messages?.minArgs
        .replace(/{MIN}/g, `${Command.minArgs}`)
        .replace(
          /{EXPECTED}/g,
          `${
            Command.expectedArgs
              ? Command.expectedArgs
              : `${instance.prefix}${Command.name}`
          }`
        );

      return message.reply({
        content: Messages?.minArgs,
      });
    }

    if (Command.maxArgs && args.length > Command.maxArgs) {
      if (typeof Messages?.maxArgs == "object") {
        if (!Messages.maxArgs || !Messages.maxArgs.description) return;
        Messages.maxArgs.description = Messages!.maxArgs.description
          .replace(/{MAX}/g, `${Command.maxArgs}`)
          .replace(
            /{EXPECTED}/g,
            `${
              Command.expectedArgs
                ? Command.expectedArgs
                : `${instance.prefix}${Command.name}`
            }`
          );
        return message.reply({
          embeds: [Messages.maxArgs],
        });
      }

      if (!Messages?.maxArgs) return;

      Messages!.maxArgs = Messages?.maxArgs
        .replace(/{MAX}/g, `${Command.maxArgs}`)
        .replace(
          /{EXPECTED}/g,
          `${
            Command.expectedArgs
              ? Command.expectedArgs
              : `${instance.prefix}${Command.name}`
          }`
        );

      return message.reply({
        content: Messages?.maxArgs,
      });
    }

    if (Command.ownerOnly && !instance.settings.botOwners)
      throw new Error(
        `${Command.name} has property "ownerOnly" but "botOwners" is not defined in the setup method.`
      );

    if (
      Command.ownerOnly &&
      instance.settings.botOwners &&
      !instance.settings.botOwners?.includes(message.author.id)
    ) {
      if (!Messages?.ownerOnly) return;
      if (typeof Messages?.ownerOnly == "object") {
        return message.reply({
          embeds: [Messages.ownerOnly],
        });
      }

      return message.reply({
        content: Messages?.ownerOnly,
      });
    }

    if (Command.testOnly && !instance.settings.testServers)
      throw new Error(
        `${Command.name} has property "testOnly" but "testServers" is not defined in the setup method.`
      );

    if (
      Command.testOnly &&
      instance.settings.testServers &&
      !instance.settings.testServers?.includes(message.guild?.id!)
    ) {
      if (!Messages?.testOnly) return;
      if (typeof Messages?.testOnly == "object") {
        return message.reply({
          embeds: [Messages.testOnly],
        });
      }

      return message.reply({
        content: Messages?.testOnly,
      });
    }

    const inst: any = instance;

    let result = Command.run({
      args: args!,
      channel: message.channel!,
      guild: message.guild!,
      instance: inst!,
      member: message.member!,
      message: message!,
      text: args.join(" ")!,
      user: message.author!,
      client: this._client!,
    });

    if (result instanceof Promise) result = await result;

    this.replyFromCallback(message, result);
  }

  private async InteractionEvent(
    interaction: CommandInteraction | Interaction<CacheType>,
    instance: DartCommands,
    client: Client
  ) {
    if (!interaction.isCommand()) return;
    const { user, commandName, options, guild, channelId } = interaction;
    const member = interaction.member as GuildMember;
    const channel = guild?.channels.cache.get(channelId) || null;
    let Command: ICommand | undefined =
      this._instance.commands.get(commandName);
    if (!Command) return;

    if (!Command.slash)
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setDescription("That command is slash disabled.")
            .setColor("RED"),
        ],
      });

    if (Command.permission) {
      if (!permissionList.includes(Command.permission))
        throw new Error(
          `Dart | "${Command.permission}" is an invalid permission node.`
        );
      if (!interaction.memberPermissions?.has(Command.permission)) {
        let msg = Messages.noPermission;
        if (typeof msg == "object") {
          msg.description = msg.description?.replace(
            /{PERMISSION}/g,
            `${Command.permission}`
          )!;
          return interaction.reply({
            embeds: [msg],
          });
        } else if (typeof msg == "string") {
          msg = msg.replace(/{PERMISSION}/g, `${Command.permission}`);
          return interaction.reply({
            content: `${msg}`,
          });
        }
      }
    }

    if (Command.ownerOnly && !instance.settings.botOwners)
      throw new Error(
        `${Command.name} has property "ownerOnly" but "botOwners" is not defined in the setup method.`
      );

    if (
      Command.ownerOnly &&
      instance.settings.botOwners &&
      !instance.settings.botOwners?.includes(interaction.user.id)
    ) {
      if (!Messages?.ownerOnly) return;
      if (typeof Messages?.ownerOnly == "object") {
        return interaction.reply({
          embeds: [Messages.ownerOnly],
        });
      }

      return interaction.reply({
        content: Messages?.ownerOnly,
      });
    }

    if (Command.testOnly && !instance.settings.testServers)
      throw new Error(
        `${Command.name} has property "testOnly" but "testServers" is not defined in the setup method.`
      );

    if (
      Command.testOnly &&
      instance.settings.testServers &&
      !instance.settings.testServers?.includes(interaction.guild?.id!)
    ) {
      if (!Messages?.testOnly) return;
      if (typeof Messages?.testOnly == "object") {
        return interaction.reply({
          embeds: [Messages.testOnly],
        });
      }

      return interaction.reply({
        content: Messages?.testOnly,
      });
    }

    let reply: { [key: string]: any } | string | undefined = Command.run({
      user: interaction.user!,
      guild: interaction.guild!,
      channel: interaction.channel!,
      member,
      interaction: interaction!,
      instance: this._instance,
    });

    if (reply instanceof Promise) reply = await reply;

    this.replyFromCallback(interaction, reply);
  }

  private replyFromCallback(msgOrInter: any, reply: any) {
    if (!reply) {
      return;
    } else if (reply.type == "rich" && typeof reply == "object") {
      msgOrInter.reply({
        embeds: [reply],
      });
    } else if (typeof reply == "object" && reply.custom) {
      msgOrInter.reply(reply);
    } else if (typeof reply == "string") {
      msgOrInter.reply({
        content: reply,
      });
    } else {
      return;
    }
  }
}
