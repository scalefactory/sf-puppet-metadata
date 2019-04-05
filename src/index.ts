import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import * as fs from 'fs'
import * as path from 'path'

import {MetaDataGenerator} from './helpers/meta-data-generator'
import ModuleHelper = require('./helpers/module-helper')
import {ModuleObject} from './interfaces/module-object'

class SfPuppetMetadata extends Command {
  static description = 'Generates metadata.json for a given Puppet module'

  static usage = 'sf-puppet-metadata --moduledata /path/to/puppet/modules_dir /path/to/puppet/module'

  static examples = [
    '$ sf-puppet-metadata --moduledata /path/to/puppet/modules_dir /path/to/puppet/module',
    '$ sf-puppet-metadata --dir --moduledata /path/to/puppet/modules_dir /path/to/puppet_modules',
    '$ sf-puppet-metadata --help',
  ]

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),

    modulepath: flags.string({
      required: true,
      description: 'The path to puppet modules. Seperate multiple directories with a colon',
      default: '/puppet/code/environments/production/modules:/puppet/code/modules'
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

    dir: flags.boolean({
      description: 'The given path is a directory of modules',
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

    if (this.flags.dir) {
      this.log(`Generating metadata.json for all modules in ${this.modulePath()}`)

      if (this.shouldOutput() === false) {
        await cli.confirm('This will overwrite any existing metadatafiles. continue?')
      }

      const allModules = this.foldersInDir(this.modulePath())

      allModules.forEach(async (moduleName: string) => {
        const modulePath = path.join(this.modulePath(), moduleName)
        this.generateMetaData(modulePath)
      })
    } else {
      this.log(`Generating metadata.json for ${this.modulePath()}`)

      this.generateMetaData(this.modulePath())
    }

    this.log('Successfully generated manifests')
  }

  private foldersInDir(modulePath: string): string[] {
    return fs.readdirSync(path.resolve(modulePath))
  }

  private puppetModuleDirs(): string[] {
    return this.flags.modulepath.split(':')
  }

  private async generateMetaData(modulePath: string): Promise<void> {
    const generator = new MetaDataGenerator()
    generator.setPuppetModulePaths(this.puppetModuleDirs())
    generator.setModulePath(modulePath)

    // Validate is a puppet module
    if (generator.isInvalidModule()) {
      this.warn(`Skipping ${path.basename(modulePath)}, it is not a valid puppet module`)
      return
    }

    // Warning if metadata already exists
    if (this.flags.dir === false && generator.containsMetaDataFile()) {
      this.warn(`${path.basename(modulePath)} module already has metadata.json file`)
    }

    if (this.shouldOutput()) {
      this.log(await generator.generateMetaData())
    } else {
      generator.resetWritePath()

      if (this.shouldPromptToWrite()) {
        generator.setWritePath(await this.promptWritePath())
      }

      generator.writeTemplate()
    }
  }

  private async promptWritePath(): Promise<any> {
    return cli.prompt('Where to write metadata.json?', {
      default: ModuleHelper.metaDataFilePath(this.modulePath())
    })
  }

  private shouldPromptToWrite(): boolean {
    return this.flags.dir === false && this.flags.force === false
  }

  private shouldOutput(): boolean {
    return this.flags.output === true
  }

  private modulePath(): string {
    return path.resolve(this.args.modulepath)
  }
}

export = SfPuppetMetadata
