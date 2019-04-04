import * as fs from 'fs'
import * as path from 'path'

namespace ModuleHelper {
  export function moduleBaseName(modulePath: string): string {
    return path.basename(modulePath)
  }

  export function containsManifestDir(modulePath: string): boolean {
    return fs.existsSync(ModuleHelper.manifestDirFilePath(modulePath))
  }

  export function containsDataDir(modulePath: string): boolean {
    return fs.existsSync(ModuleHelper.dataDirFilePath(modulePath))
  }

  export function containsMetaDataFile(modulePath: string): boolean {
    return fs.existsSync(ModuleHelper.metaDataFilePath(modulePath))
  }

  export function containsReadme(modulePath: string): boolean {
    return fs.existsSync(ModuleHelper.readmeFilePath(modulePath))
  }

  export function metaDataFilePath(modulePath: string): string {
    return path.join(modulePath, 'metadata.json')
  }

  export function readmeFilePath(modulePath: string): string {
    return path.join(modulePath, 'README.md')
  }

  export function dataDirFilePath(modulePath: string): string {
    return path.join(modulePath, 'data')
  }

  export function manifestDirFilePath(modulePath: string): string {
    return path.join(modulePath, 'manifests')
  }

  export function readMetaDataFile(modulePath: string): {name: string} {
    return JSON.parse(
      fs.readFileSync(ModuleHelper.metaDataFilePath(modulePath)).toString()
    )
  }
}

export = ModuleHelper
