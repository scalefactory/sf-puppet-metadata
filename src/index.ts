import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import * as ejs from 'ejs'
import {findSync} from 'find-in-files'
import * as fs from 'fs'
import * as nthline from 'nthline'
import * as path from 'path'
import * as _ from 'underscore'

import {DependencyFormatter} from './helpers/dependency-formatter'
import ModuleHelper = require('./helpers/module-helper')
import {Dependency} from './interfaces/dependency'
import {ModuleObject} from './interfaces/module-object'
import {sfTemplate} from './templates/sfModule.template'

class SfPuppetMetadata extends Command {
  static description = 'Generates metadata.json for a given Puppet module'

  static usage = 'sf-puppet-metadata --moduledata /path/to/puppet/modules_dir /path/to/puppet/module'

  static examples = [
    '$ sf-puppet-metadata --moduledata /path/to/puppet/modules_dir /path/to/puppet/module -o',
    '$ sf-puppet-metadata --help',
  ]

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),

    modulepath: flags.string({
      required: true,
      description: 'The path to puppet modules',
      default: '/home/steve/tsf/readyscale/puppet/scalefactory.com/modules'
    }),

    output: flags.boolean({
      char: 'o',
      description: 'Should output to console',
      default: false
    }),

    force: flags.boolean({
      char: 'f',
      description: 'Force writing without prompt',
      default: false
    }),
  }

  static args = [{name: 'modulepath', required: true}]

  dependencies: Array<ModuleObject> | undefined
  writeLocation!: string
  flags: any
  args: any

  async init() {
    const {args, flags} = this.parse(SfPuppetMetadata)

    this.args = args
    this.flags = flags
  }

  async run() {
    this.debug(`Loading Puppet modules from ${this.puppetModuleDirs()}`)
    this.log(`Generating metadata.json for ${this.modulePath()}`)

    // Validate is a puppet module
    if (! this.isValidModule()) {
      this.error(`${ModuleHelper.moduleBaseName(this.modulePath())} is not a valid puppet module`)
    }

    // Warning if metadata already exists
    if (ModuleHelper.containsMetaDataFile(this.modulePath())) {
      this.warn(`${ModuleHelper.moduleBaseName(this.modulePath())} module already has metadata.json file`)
    }

    this.dependencies = await this.findDependencies()
    this.formatDependencies()

    // Output if flagged
    await this.output()
  }

  async promptWritePath(): Promise<any> {
    return cli.prompt('Where to write metadata.json?', {
      default: ModuleHelper.metaDataFilePath(this.modulePath())
    })
  }

  writeTemplate(): void {
    fs.writeFile(this.writeLocation, this.generateOutput(), (err: any) => {
      if (err) this.error(err)
      this.log(`Successfully Written to ${this.writeLocation}.`)
    })
  }

  shouldPromptToWrite(): boolean {
    return this.flags.force === false
  }

  async printTemplate(): Promise<void> {
    this.log(await this.generateOutput())
  }

  async generateOutput(): Promise<string> {
    const output = ejs.render(
      this.loadTemplate(),
      await this.generateData()
    )

    return JSON.stringify(JSON.parse(output), null, 4)
  }

  formatDependencies(): object[] {
    let formatted: {name: string}[] = []

    if (this.dependencies !== undefined) {
      formatted = _.chain(this.dependencies)
        .map((moduleObject: ModuleObject) => {
          const formatter = new DependencyFormatter(moduleObject)
          return formatter.format()
        })
        .flatten()
        .map((dependency: Dependency) => {
          return {name: `${dependency.vendor}-${dependency.name}`}
        })
        .value()
    }

    return formatted
  }

  async generateData(): Promise<object> {
    return {
      SUMMARY: await this.getModuleSummary(),
      MODULE_NAME: ModuleHelper.moduleBaseName(this.modulePath()),
      DEPENDENCIES: this.hasDependencies() ? this.formatDependencies() : [],
      HAS_DATA_DIRECTORY: ModuleHelper.containsDataDir(this.modulePath()),
    }
  }

  async getModuleSummary(): Promise<string> {
    if (ModuleHelper.containsReadme(this.modulePath())) {
      return this.getModuleSummaryFromReadme().then(
        (line: any) => {
          return line
        }
      )
    }

    return `Installs, and configures ${ModuleHelper.moduleBaseName(this.modulePath())}`
  }

  async getModuleSummaryFromReadme(): Promise<any> {
    return nthline(2, ModuleHelper.readmeFilePath(this.modulePath()))
  }

  hasDependencies(): boolean {
    return this.dependencies !== undefined && this.dependencies.length > 0
  }

  loadTemplate() {
    return sfTemplate
  }

  shouldOutput(): boolean {
    return this.flags.output === true
  }

  modulePath(): string {
    return path.resolve(this.args.modulepath)
  }

  isValidModule(): boolean {
    return ModuleHelper.containsManifestDir(this.modulePath())
  }

  pluckFoundDependencies(matches: object): string[] {
    return _.chain(matches)
      .values()
      .pluck('matches')
      .flatten()
      .unique()
      .value()
  }

  async findDependencies(): Promise<ModuleObject[]> {
    const dependencies = this.moduleDirsToModuleListObject().map(async (moduleObject: ModuleObject): Promise<ModuleObject> => {
      moduleObject.matches = this.pluckFoundDependencies(await findSync(
        moduleObject.modules.join('|'),
        ModuleHelper.manifestDirFilePath(this.modulePath()),
        '.pp$'
      ))

      return moduleObject
    })

    return Promise.all(dependencies)
  }

  moduleDirsToModuleListObject(): ModuleObject[] {
    return this.puppetModuleDirs().map((modulePath: string) => {
      return {
        path: modulePath,
        modules: this.foldersInDir(modulePath),
      }
    })
  }

  private foldersInDir(modulePath: string): string[] {
    return fs.readdirSync(path.resolve(modulePath))
  }

  private modulesToSearch(): string[] {
    return _.chain(this.puppetModuleDirs())
      .map((modulePath: string) => this.foldersInDir(modulePath))
      .flatten()
      .value()
  }

  private puppetModuleDirs(): string[] {
    return this.flags.modulepath.split(':')
  }

  private async output() {
    if (this.shouldOutput()) {
      this.printTemplate()
    } else {
      this.writeLocation = ModuleHelper.metaDataFilePath(this.modulePath())
      if (this.shouldPromptToWrite()) {
        this.writeLocation = await this.promptWritePath()
      }
      this.writeTemplate()
    }
  }
}

export = SfPuppetMetadata
