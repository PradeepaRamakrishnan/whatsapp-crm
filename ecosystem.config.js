require('dotenv').config({ path: '.env.production' });

module.exports = {
  apps: [
    {
      name: 'samatva-crm',
      script: 'npm',
      args: 'start',
      env: process.env,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
