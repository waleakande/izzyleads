import fs from 'fs';
import path from 'path';
const resolve = path.resolve;
export default async function () {
  const models = await fs.promises.readdir(resolve(__dirname, '../services'));

  return models.map(fileName => {
    const split = fileName.split('.js');
    return {
      name: `${split[0]}Service`,
      service: require(resolve(__dirname, '../services', fileName)).default,
    };
  });
}
