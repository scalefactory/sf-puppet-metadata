import {Command, flags} from '@oclif/command'
import * as ejs from 'ejs'
import * as fs from 'fs'
import * as path from 'path'

import {sfTemplate} from './template/sfModule.template'

class SfPuppetMetadata extends Command {
  static description = 'describe the command here'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),

    modulepath: flags.string({
      required: true,
      description: 'The path to puppet modules',
      default: '~/tsf/readyscale/puppet/scalefactory.com/modules'
    }),

    output: flags.boolean({
      char: 'o',
      description: 'Should output to console',
      default: true
    }),
  }

  static args = [{name: 'modulepath'}]

  async run() {
    this.debug(`Loading Puppet modules from ${this.puppetModuleDirs()}`)

    // Validate is a puppet module
    if (! this.isValidModule()) {
      this.error(`${this.moduleBaseName()} is not a valid puppet module`)
    }

    // Warning if metadata already exists
    if (this.containsMetaDataFile()) {
      this.warn(`${this.moduleBaseName()} module already has metadata.json file`)
    }

    // Output if flagged
    if (this.shouldOutput()) {
      this.printTemplate()
    }
  }

  printTemplate(): void {
    const output = ejs.render(
      this.loadTemplate(),
      this.generateData()
    )

    this.log(output)
  }

  generateData(): object {
    return {
      MODULE_NAME: this.moduleBaseName()
    }
  }

  loadTemplate() {
    return JSON.stringify(sfTemplate, null, 4)
  }

  shouldOutput(): boolean {
    const {flags} = this.parse(SfPuppetMetadata)

    return flags.output === true
  }

  moduleBaseName(): string {
    return path.basename(this.modulePath())
  }

  modulePath(): string {
    const {args} = this.parse(SfPuppetMetadata)

    return args.modulepath
  }

  isValidModule(): boolean {
    return this._containsManifestDir()
  }

  _containsManifestDir(): boolean {
    return fs.existsSync(path.join(this.modulePath(), 'manifests'))
  }

  containsMetaDataFile(): boolean {
    return fs.existsSync(path.join(this.modulePath(), 'metadata.json'))
  }

  puppetModuleDirs(): string[] {
    const {flags} = this.parse(SfPuppetMetadata)

    return flags.modulepath.split(':')
  }
}

export = SfPuppetMetadata
