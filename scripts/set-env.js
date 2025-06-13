const fs = require('fs');
const path = require('path');
require('dotenv').config();

const environment = process.argv[2]; // 'development' or 'production'

const isProduction = environment === 'production';

const envFilePath = path.join(__dirname, `../src/environments/environment${isProduction ? '.prod' : ''}.ts`);

const content = `export const environment = {
  production: ${isProduction},
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_KEY}',
};
`;

fs.writeFile(envFilePath, content, function (err) {
  if (err) {
    console.error(err);
  } else {
    console.log(`Successfully generated ${envFilePath}`);
  }
}); 