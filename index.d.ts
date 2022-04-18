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
} from "discord.js";

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
    options?: {};
  };
}

export interface IEventObject {
  client: Client;
  [key: string]: any;
}

export interface IEvent {
  name: string;
  once?: boolean;
  run(obj: IEventObject): any;
}

export interface ExecuteOptions {
  message?: Message<boolean>;
  guild?: Guild;
  channel?: GuildChannel | TextChannel;
  member?: GuildMember;
  user?: User;
  text?: string;
  instance?: DartCommands;
  args?: string[];
  client?: Client;
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
  run(obj: ExecuteOptions): any;
}

export default class DartCommands {
  private _client: Client;
  private _options: IOptions;
  private _prefix: string;
  constructor(client: Client, options: IOptions);
  public defaultPrefix(p: string): any;
  public get prefix(): string;
  public get commands(): Collection<string, ICommand>;
  public get options(): IOptions;
  public get Cache(): Cache;
  public UpdatePrefix(guildId: string, newPrefix: string);
  public setLanguageSettings(props: LANG_ENGLISH): any;
  public defaultColor(color: string);
  public get getDefaultColor(): number;
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
