import * as ejs from 'ejs'
import {findSync} from 'find-in-files'
import * as fs from 'fs'
import * as nthline from 'nthline'
import * as path from 'path'
import * as _ from 'underscore'

import {Dependency} from '../interfaces/dependency'
import {ModuleObject} from '../interfaces/module-object'
import {sfTemplate} from '../templates/sfModule.template'

import {DependencyFormatter} from './dependency-formatter'
import ModuleHelper = require('./module-helper')

export class MetaDataGenerator {
  puppetModulePaths: string[] = []
  modulePath = ''
  writePath = ''

  setPuppetModulePaths(paths: string[]): void {
    this.puppetModulePaths = paths
  }

  setModulePath(path: string): void {
    this.modulePath = path
  }

  isInvalidModule(): boolean {
    return ModuleHelper.containsManifestDir(this.modulePath) === false
  }

  containsMetaDataFile(): boolean {
    return ModuleHelper.containsMetaDataFile(this.modulePath)
  }

  async generateMetaData(): Promise<string> {
    const output = ejs.render(
      this.loadTemplate(),
      await this.generateData()
    )

    return JSON.stringify(JSON.parse(output), null, 4)
  }

  moduleBaseName(): string {
    return ModuleHelper.moduleBaseName(this.modulePath)
  }

  resetWritePath(): void {
    this.setWritePath(ModuleHelper.metaDataFilePath(this.modulePath))
  }

  setWritePath(path: string): void {
    this.writePath = path
  }

  async writeTemplate(): Promise<void> {
    return fs.writeFileSync(this.writePath, await this.generateMetaData())
  }

  private async findDependencies(): Promise<ModuleObject[]> {
    const dependencies = this.moduleDirsToModuleListObject().map(async (moduleObject: ModuleObject): Promise<ModuleObject> => {
      moduleObject.matches = this.pluckFoundDependencies(await findSync(
        moduleObject.modules.join('|'),
        ModuleHelper.manifestDirFilePath(this.modulePath),
        '.pp$'
      ))

      return moduleObject
    })

    return Promise.all(dependencies)
  }

  private foldersInDir(modulePath: string): string[] {
    return fs.readdirSync(path.resolve(modulePath))
  }

  private moduleDirsToModuleListObject(): ModuleObject[] {
    return this.puppetModulePaths.map((modulePath: string) => {
      return {
        path: modulePath,
        modules: _.without(this.foldersInDir(modulePath), this.moduleBaseName()),
      }
    })
  }

  private loadTemplate() {
    return sfTemplate
  }

  private pluckFoundDependencies(matches: object): string[] {
    return _.chain(matches)
      .values()
      .pluck('matches')
      .flatten()
      .unique()
      .value()
  }

  private async generateData(): Promise<object> {
    return {
      SUMMARY: await this.getModuleSummary(),
      MODULE_NAME: this.moduleBaseName(),
      DEPENDENCIES: await this.formatDependencies(),
      HAS_DATA_DIRECTORY: ModuleHelper.containsDataDir(this.modulePath),
    }
  }

  private async getModuleSummary(): Promise<string> {
    if (ModuleHelper.containsReadme(this.modulePath)) {
      return this.getModuleSummaryFromReadme().then(
        (line: any) => {
          return line
        }
      )
    }

    return `Installs, and configures ${this.moduleBaseName()}`
  }

  private async getModuleSummaryFromReadme(): Promise<any> {
    return nthline(2, ModuleHelper.readmeFilePath(this.modulePath))
  }

  private async formatDependencies(): Promise<object[]> {
    let formatted: {name: string}[] = []

    const dependencies = await this.findDependencies()
    if (dependencies !== undefined) {
      formatted = _.chain(dependencies)
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
}
