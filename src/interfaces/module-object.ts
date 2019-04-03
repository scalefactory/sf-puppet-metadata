export interface ModuleObject extends Object {
  path: string
  modules: string[],
  matches?: string[]
}
