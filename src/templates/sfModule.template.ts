/* tslint:disable */

export let sfTemplate: any = `{
    "name": "scalefactory-<%= MODULE_NAME; %>",
    "description": "sf-readyscale module",
    "version": "1.0.0",
    "author": "The Scale Factory Limited",
    "summary": "<%= SUMMARY; %>",
    "license": "All rights reserved",
    "source": "https://github.com/scalefactory/readyscale",
    "dependencies": <%- JSON.stringify(DEPENDENCIES) %>,
    "operatingsystem_support": [
        {
            "operatingsystem": "CentOS",
            "operatingsystemrelease": [
                "6",
                "7"
            ]
        }
    ],
    "requirements": [
        {
            "name": "puppet",
            "version_requirement": ">=3.8"
        }
    ]
}`
