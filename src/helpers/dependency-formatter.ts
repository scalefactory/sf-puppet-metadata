import * as path from 'path'

import {Dependency} from '../interfaces/dependency'
import {ModuleObject} from '../interfaces/module-object'

import ModuleHelper = require('./module-helper')

export class DependencyFormatter {
  object: ModuleObject

  constructor(moduleObject: ModuleObject) {
    this.object = moduleObject
  }

  format(): Dependency[] {
    this.object.matches = this.object.matches || []

    return this.object.matches.reduce((dependencies: Dependency[], match: string): Dependency[] => {
      dependencies.push({
        name: this.getDependencyName(match),
        vendor: this.getDependencyVendor(match),
        path: this.object.path
      })

      return dependencies
    }, [])
  }

  getDependencyVendor(modulePath: string): string {
    if (this.moduleHasMetaData(modulePath)) {
      return this.getVendorFromMetaData(modulePath)
    }

    return this.getVendorFromPath()
  }

  getDependencyName(modulePath: string): string {
    if (this.moduleHasMetaData(modulePath)) {
      return this.getNameFromMetaData(modulePath)
    }

    return modulePath
  }

  moduleHasMetaData(modulePath: string): boolean {
    return ModuleHelper.containsMetaDataFile(path.join(this.object.path, modulePath))
  }

  getVendorFromMetaData(modulePath: string): string {
    return this.readNameFromMetaData(modulePath).split(/\s*\-\s*/g)[0]
  }

  getNameFromMetaData(modulePath: string): string {
    return this.readNameFromMetaData(modulePath).split(/\s*\-\s*/g)[1]
  }

  getVendorFromPath(): string {
    const name = path.basename(path.join(this.object.path, '..'))

    return name === 'scalefactory.com' ? 'scalefactory' : name
  }

  private readNameFromMetaData(modulePath: string): string {
    const metaData = ModuleHelper.readMetaDataFile(path.join(this.object.path, modulePath))

    return metaData.name
  }
}
