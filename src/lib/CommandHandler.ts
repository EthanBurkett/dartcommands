import {
  Client,
  Message,
  Guild,
  GuildMember,
  User,
  Collection,
  MessageEmbed,
  Permissions,
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

  constructor(client: Client, options: IOptions, instance: DartCommands) {
    this._client = client;
    this._options = options;
    client.on("messageCreate", (message: Message<boolean>): any =>
      this.handleMessage(message, instance)
    );
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

    args = args.slice(1);
    if (!Command)
      Command = Commands.find(
        (cmd) =>
          cmd.aliases! &&
          cmd.aliases.includes(args[0].substring(Prefix.length, args[0].length))
      );
    if (!Command) return;
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
      args,
      channel: message.channel!,
      guild: message.guild!,
      instance: inst,
      member: message.member!,
      message: message!,
      text: args.join(" "),
      user: message.author!,
      client: this._client,
    });

    if (result instanceof Promise) result = await result;

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
    } else if (typeof result == "string") {
      return message.reply({
        content: result,
      });
    } else {
      return;
    }
  }
}
