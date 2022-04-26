import {
  Client,
  Message,
  Collection,
  Guild,
  GuildChannel,
  GuildMember,
  User,
  MessageEmbed,
  DMChannel,
  PermissionString,
  HexColorString,
  ColorResolvable,
  Interaction,
} from "discord.js";
import { ConnectOptions } from "mongoose";

export interface IOptions {
  prefix?: string;
  commandsDir: strinhg;
  eventsDir?: string;
  botOwners?: string[];
  ignoreBots?: true | false;
  testServers?: string[];
  typescript?: boolean;
  disabledDefaultCommands?: string[];
  mongo?: {
    uri: string;
    options?: ConnectOptions;
  };
}

export interface IEventObject {
  client: Client;
  [key: string]: any;
}

export interface IEvent {
  name?: string;
  once?: boolean;
  run(obj: IEventObject): any;
}

export interface ExecuteOptions {
  user?: User;
  options?: CommandInteractionOption[];
  message?: Message<boolean>;
  interaction?: CommandInteraction<CacheType>;
  guild?: Guild;
  args?: string[];
  text?: string;
  client?: Client;
  channel?:
    | DMChannel
    | PartialDMChannel
    | NewsChannel
    | TextChannel
    | ThreadChannel;
  instance?: any;
  member?: GuildMember;
}

export interface ICommand {
  name?: string;
  description: string;
  ownerOnly?: boolean;
  testOnly?: boolean;
  minArgs?: number;
  maxArgs?: number;
  expectedArgs?: string;
  aliases?: string[];
  permission?: PermissionString;
  slash?: true | "both";
  options?: ApplicationCommandOptionData[];
  [key: string]: any;
  run(obj: ExecuteOptions):
    | {
        custom?: boolean;
        content?: string;
        components?: any[];
        embeds?: MessageEmbed[];
        files?: any[];
        attachments?: any[];
      }
    | string
    | MessageEmbed;
}

export default class DartCommands {
  private _client: Client;
  private _options: IOptions;
  private _prefix: string;
  constructor(client: Client, options: IOptions);
  public defaultPrefix(p: string): this;
  public get prefix(): string;
  public get commands(): Collection<string, ICommand>;
  public get options(): IOptions;
  public get Cache(): Cache;
  public UpdatePrefix(guildId: string, newPrefix: string);
  public setLanguageSettings(props: LANG_ENGLISH): this;
  public defaultColor(color: ColorResolvable): this;
  public get getDefaultColor(): ColorResolvable;
  public get self(): this;
}

export interface LANG_ENGLISH {
  noPermission?: string | MessageEmbed;
  minArgs?: string | MessageEmbed;
  maxArgs?: string | MessageEmbed;
  ownerOnly?: string | MessageEmbed;
  testOnly?: string | MessageEmbed;
  prefixUpdated?: string | MessageEmbed;
}

export interface Cache {
  GuildPrefixes?: Collection<string, string>;
  InititalCache?: () => Collection<String, string>;
  UpdatePrefix?: (GuildID: string, Prefix: String) => void;
}

export interface ICache {
  GuildPrefixes?: Collection<string, string>;
}
