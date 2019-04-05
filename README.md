sf-puppet-metadata
==================

Generates metadata.json for a puppet module

![GitHub package.json version](https://img.shields.io/github/package-json/v/ScaleFactory/sf-puppet-metadata.svg)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
<!-- [![Version](https://img.shields.io/npm/v/sf-puppet-metadata.svg)](https://npmjs.org/package/sf-puppet-metadata) -->
[![CircleCI](https://circleci.com/gh/ScaleFactory/sf-puppet-metadata.svg?style=svg&circle-token=dcef9f0fac2d02df3c7a9900750b2b7d89f4064a)](https://circleci.com/gh/ScaleFactory/sf-puppet-metadata)
<!-- [![Downloads/week](https://img.shields.io/npm/dw/sf-puppet-metadata.svg)](https://npmjs.org/package/sf-puppet-metadata)
[![License](https://img.shields.io/npm/l/sf-puppet-metadata.svg)](https://github.com/ScaleFactory/sf-puppet-metadata/blob/master/package.json) -->
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

<!-- toc -->
* [Usage](#usage)
<!-- tocstop -->
# Usage
<!-- usage -->

### Node
```sh-session
$ npm install -g sf-puppet-metadata
$ sf-puppet-metadata --moduledata /path/to/puppet/modules_dir /path/to/puppet/module
Generating metadata.json for /path/to/puppet/module
Where to write metadata.json? [/path/to/puppet/module/metadata.json]: y
Successfully Written to /path/to/puppet/module/metadata.jsonn.

$ sf-puppet-metadata (-v|--version|version)
sf-puppet-metadata/1.0.0 linux-x64 node-v10.15.3

$ sf-puppet-metadata --help
USAGE
  $ sf-puppet-metadata sf-puppet-metadata --moduledata /path/to/puppet/modules_dir /path/to/puppet/module

OPTIONS
  -f, --force              Force writing without prompt
  -h, --help               show CLI help
  -o, --output             Should output to console
  -v, --version            show CLI version
  --modulepath=modulepath  (required) [default: /puppet/code/environments/production/modules:/puppet/code/modules] The path to puppet modules

EXAMPLES
  $ sf-puppet-metadata --moduledata /path/to/puppet/modules_dir /path/to/puppet/module -o
  $ sf-puppet-metadata --help
...
```

### Docker

Mount your puppetry to a folder called `/puppet` and use relative paths inside as parameters.
```sh-session
$ docker run -it -v /path/to/puppet/code:/puppet scalefactory/sf-puppet-metadata --moduledata=/puppet/modules /puppet/modules/module
...
```
<!-- usagestop -->
