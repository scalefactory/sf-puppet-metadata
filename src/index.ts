import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import * as ejs from 'ejs'
import {findSync} from 'find-in-files'
import * as fs from 'fs'
import * as path from 'path'
import * as _ from 'underscore'

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
    // add --version flag to show CLI version
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

  async run() {
    this.debug(`Loading Puppet modules from ${this.puppetModuleDirs()}`)
    this.log(`Generating metadata.json for ${this.modulePath()}`)

    // Validate is a puppet module
    if (! this.isValidModule()) {
      this.error(`${this.moduleBaseName()} is not a valid puppet module`)
    }

    // Warning if metadata already exists
    if (this.containsMetaDataFile()) {
      this.warn(`${this.moduleBaseName()} module already has metadata.json file`)
    }

    this.dependencies = await this.findDependencies()

    // Output if flagged
    if (this.shouldOutput()) {
      this.printTemplate()
    } else {
      this.writeLocation = this.metaDataFileLocation()

      if (this.shouldPromptToWrite()) {
        this.writeLocation = await this.promptWriteLocation()
      }

      this.writeTemplate()
    }
  }

  async promptWriteLocation(): Promise<any> {
    return cli.prompt('Where to write metadata.json?', {
      default: this.metaDataFileLocation()
    })
  }

  writeTemplate(): void {
    fs.writeFile(this.writeLocation, this.generateOutput(), (err: any) => {
      if (err) this.error(err)
      this.log(`Successfully Written to ${this.writeLocation}.`)
    })
  }

  shouldPromptToWrite(): boolean {
    const {flags} = this.parse(SfPuppetMetadata)

    return flags.force === false
  }

  printTemplate(): void {
    this.log(this.generateOutput())
  }

  generateOutput(): string {
    const output = ejs.render(
      this.loadTemplate(),
      this.generateData()
    )

    return JSON.stringify(JSON.parse(output), null, 4)
  }

  formatDependencies(): object[] {
    let formatted: object[] = []

    if (this.dependencies !== undefined) {
      formatted = _.chain(this.dependencies)
        .map((moduleObject: ModuleObject) => {
          moduleObject.matches = moduleObject.matches || []

          return moduleObject.matches.reduce((dependencies: object[], match: string) => {
            dependencies.push({name: match})

            return dependencies
          }, [])
        })
        .flatten()
        .value()
    }

    return formatted
  }

  generateData(): object {
    return {
      MODULE_NAME: this.moduleBaseName(),
      DEPENDENCIES: this.hasDependencies() ? this.formatDependencies() : [],
      HAS_DATA_DIRECTORY: this.containsDataDir()
    }
  }

  hasDependencies(): boolean {
    return this.dependencies !== undefined && this.dependencies.length > 0
  }

  loadTemplate() {
    return sfTemplate
  }

  shouldOutput(): boolean {
    const {flags} = this.parse(SfPuppetMetadata)

    return flags.output === true
  }

  moduleBaseName(): string {
    return path.basename(this.modulePath())
  }

  moduleManifestDir(): string {
    return path.join(this.modulePath(), 'manifests')
  }

  modulePath(): string {
    const {args} = this.parse(SfPuppetMetadata)

    return path.resolve(args.modulepath)
  }

  isValidModule(): boolean {
    return this.containsManifestDir()
  }

  containsManifestDir(): boolean {
    return fs.existsSync(path.join(this.modulePath(), 'manifests'))
  }

  containsDataDir(): boolean {
    return fs.existsSync(path.join(this.modulePath(), 'data'))
  }

  containsMetaDataFile(): boolean {
    return fs.existsSync(this.metaDataFileLocation())
  }

  metaDataFileLocation(): string {
    return path.join(this.modulePath(), 'metadata.json')
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
        this.moduleManifestDir(),
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
        modules: this.modulesInDir(modulePath),
      }
    })
  }

  modulesInDir(modulePath: string): string[] {
    return fs.readdirSync(path.resolve(modulePath))
  }

  modulesToSearch(): string[] {
    return _.chain(this.puppetModuleDirs())
      .map((modulePath: string) => fs.readdirSync(path.resolve(modulePath)))
      .flatten()
      .value()
  }

  puppetModuleDirs(): string[] {
    const {flags} = this.parse(SfPuppetMetadata)

    return flags.modulepath.split(':')
  }
}

export = SfPuppetMetadata
