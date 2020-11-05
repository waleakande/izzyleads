# docs.izzyleads.com

Serves the Swagger Open API docs for IzzyLeads

## Installation

1. Clone the repo `git clone git@bitbucket.org:izzyleads/documentation.git`
2. Change directory to the project's directory `cd documentation`
3. Run `npm install` to install build dependencies.
4. edit the yaml files in `yaml/` directoru to make changes.
5. Use `npm run watch yaml/FILE` to view in swagger.
6. Use `npm run build` to build all the json config files before pushing.
7. Pushing to master will deploy using CircleCI to https://docs.izzyleads.com
8. To run locally, run `npm run serve`

## Contribution

_**NB**: A full understanding of Open API is required. and could be found [here](https://swagger.io/specification/)_

Create/Edit a yaml file inside the yaml directory following the Open API Specs. For example `touch authentication.yml`

Append a new script inside of the package.json file to build the yaml file to json. An example to build `yaml/authentication.yml` to a valid Open API json format should look like this:

```js
{
    // ...
    scripts: {
        // ...
        "build:authentication": "cd yaml && ../node_modules/multi-file-swagger/resolve.js authentication.yml > ../html/config/authentication.json"
    }
}

```

Next, append the new npm script command to the build script command.

```js
// package.json
{
    // ...
    scripts: {
        // ...
        build: "npm run build:authentication",
        "build:authentication": "cd yaml && ../node_modules/multi-file-swagger/resolve.js authentication.yml > ../html/config/authentication.json"
    }
}
```

Such that each time a new build is required, `npm run build` would be the command to call for rescue.

The above would convert a valid open api yml file to json and push.

To have the specs displayed in the frontend.

Open `/html/index.html` find a section of the file that looks like this:

```js
const ui = SwaggerUIBundle({
  urls: [
    {
      name: "Index",
      url: base + "/html/config/index.json",
    },
  ],
  dom_id: "#swagger-ui",
  deepLinking: true,
  presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
  plugins: [SwaggerUIBundle.plugins.DownloadUrl],
  layout: "StandaloneLayout",
});
```

Update the `urls` array to include the newly build spec file. To have `/config/authentication.json` included, we can set the array to be:

```js
const ui = SwaggerUIBundle({
  urls: [
    {
      name: "Index",
      url: base + "/config/authentication.json",
    },
  ],
  dom_id: "#swagger-ui",
  deepLinking: true,
  presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
  plugins: [SwaggerUIBundle.plugins.DownloadUrl],
  layout: "StandaloneLayout",
});
```

That is it!

We can now confirm by running:

```bash
npm run build && npm serve
```

Enjoy!!!
