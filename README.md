sf-puppet-metadata
==================

Generates metadata.json for a puppet module

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
<!-- [![Version](https://img.shields.io/npm/v/sf-puppet-metadata.svg)](https://npmjs.org/package/sf-puppet-metadata) -->
[![CircleCI](https://circleci.com/gh/StevePorter92/sf-puppet-metadata.svg?style=svg&circle-token=dcef9f0fac2d02df3c7a9900750b2b7d89f4064a)](https://circleci.com/gh/StevePorter92/sf-puppet-metadata)
<!-- [![Downloads/week](https://img.shields.io/npm/dw/sf-puppet-metadata.svg)](https://npmjs.org/package/sf-puppet-metadata) -->
<!-- [![License](https://img.shields.io/npm/l/sf-puppet-metadata.svg)](https://github.com/StevePorter92/sf-puppet-metadata/blob/master/package.json) -->

<!-- toc -->
* [Usage](#usage)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ sf-puppet-metadata sf-puppet-metadata --moduledata /path/to/puppet/modules_dir /path/to/puppet/module
Generating metadata.json for /path/to/puppet/module
Where to write metadata.json? [/path/to/puppet/module/metadata.json]: y
Successfully Written to /path/to/puppet/module/metadata.jsonn.

$ sf-puppet-metadata (-v|--version|version)
sf-puppet-metadata/1.0.0 linux-x64 node-v10.15.3

$ sf-puppet-metadata --help [COMMAND]
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
<!-- usagestop -->
