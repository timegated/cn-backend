import * as fs from 'fs-extra';

async function copyYAML() {
  try {
    await fs.copy('./src/swagger.yaml', './dist/src/swagger.yaml');
    console.log('YAML file copied successfully');
  } catch (err) {
    console.error(err);
  }
}

copyYAML();