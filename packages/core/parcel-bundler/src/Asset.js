const Parser = require('./Parser');
const path = require('path');
const fs = require('./utils/fs');

let ASSET_ID = 1;

class Asset {
  constructor(name, pkg, options) {
    this.id = ASSET_ID++;
    this.name = name;
    this.basename = path.basename(this.name);
    this.package = pkg;
    this.options = options;
    this.encoding = 'utf8';
    this.type = 'raw';

    this.processed = false;
    this.contents = null;
    this.ast = null;
    this.generated = null;
    this.dependencies = new Set;
    this.depAssets = new Map;
    this.parentBundle = null;
    this.bundles = new Set;
  }

  async loadIfNeeded() {
    if (!this.contents) {
      this.contents = await this.load();
    }
  }

  async parseIfNeeded() {
    await this.loadIfNeeded();
    if (!this.ast) {
      this.ast = this.parse(this.contents);
    }
  }

  async getDependencies() {
    await this.loadIfNeeded();

    if (this.mightHaveDependencies()) {
      await this.parseIfNeeded();
      this.collectDependencies();
    }
  }

  addDependency(name, opts) {
    this.dependencies.add(Object.assign({name}, opts));
  }

  mightHaveDependencies() {
    return true;
  }

  async load() {
    return await fs.readFile(this.name, this.encoding);
  }

  parse() {
    // do nothing by default
  }

  collectDependencies() {
    // do nothing by default
  }

  async transform() {
    // do nothing by default
  }

  generate() {
    return {
      raw: this.contents
    };
  }

  async process() {
    if (!this.generated) {
      await this.getDependencies();
      await this.transform();
      this.generated = this.generate();
    }

    return this.generated;
  }

  invalidate() {
    this.processed = false;
    this.contents = null;
    this.ast = null;
    this.generated = null;
    this.dependencies.clear();
    this.depAssets.clear();
  }
}

module.exports = Asset;