import fs from 'fs';
import path from 'path';
const resolve = path.resolve;
export default async function() {
  const models = await fs.promises.readdir(resolve(__dirname, '../models'));

  return models.map(fileName => {
    const split = fileName.split('.js');

    return {
      name: `${split[0]}Model`,
      model: require(resolve(__dirname, '../models', fileName)).default,
    };
  });
}
