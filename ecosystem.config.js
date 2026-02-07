module.exports = {
  apps: [
    {
      name: 'samatva-crm',
      script: 'pnpm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'samatva-crm-staging',
      script: 'pnpm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      error_file: 'logs/staging-error.log',
      out_file: 'logs/staging-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
