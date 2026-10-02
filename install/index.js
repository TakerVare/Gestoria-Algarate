import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text,
} from '@clack/prompts';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import color from 'picocolors';
import { spawn } from 'child_process';

const checkPorts = async () => {
  let portsInUse = false;

  //Check if port 3306 is free
  const ports = [3306];
  var allPortsFree = true;
  for (const port of ports) {
    const portInUse = await new Promise((resolve, reject) => {
      exec(`lsof -i :${port}`, (error, stdout, stderr) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

    if (portInUse) {
      allPortsFree = false;
      console.log(color.red(`Port ${port} is in use by another process`));
    }
  }

  if (!allPortsFree) {
    portsInUse = await confirm({
      message: 'Please make sure that the port 3306 is available. Continue?',
      initialValue: false,
    });

    if (isCancel(portsInUse)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    await checkPorts();
  }
};

async function main() {
  console.log();
  intro(color.inverse(' flat101-wp-boilerplate installation '));

  var s = spinner();
  s.start('Initializing...');

  var project_name = 'wp-boilerplate';
  var docker = true;
  var domain = '';
  var user_id = '1000';
  var group_id = '1000';
  var final_user_id = '1000';
  var final_group_id = '1000';
  var db_root_password = '';
  var php_version = '8.3';
  var engine = 'docker';

  var environment = 'local';
  // Get latest WP version from WP API
  var wp_version = '';
  var wp_api_version = await new Promise((resolve, reject) => {
    exec(
      'curl -s https://api.wordpress.org/core/version-check/1.7/',
      (error, stdout, stderr) => {
        resolve(stdout);
      }
    );
  });

  if (wp_api_version) {
    wp_api_version = JSON.parse(wp_api_version);
    wp_version = wp_api_version.offers[0].version;
  }

  var wp_title = 'WP Boilerplate';
  var wp_admin_user = 'wp_admin';
  var wp_admin_password = '';
  var wp_admin_email = 'wpadmin@flat101.es';
  var wp_admin_nickname = 'Gestor 101';
  var wp_database_user = 'wp_user';
  var wp_database_password = '';
  var wp_database_name = 'wordpress';
  var wp_table_prefix = 'f101_';

  //Check if operating system is Windows or Mac/Unix
  var is_windows = false;
  if (process.platform === 'win32') {
    is_windows = true;
  }

  s.stop('Initialized');

  try {
    project_name = await text({
      message: 'Project name:',
      placeholder: project_name,
      initialValue: project_name,
    });

    if (isCancel(project_name)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    docker = await confirm({
      message: 'Do you want to use Docker?',
      initialValue: docker,
    });

    if (isCancel(docker)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    if (docker) {
      if (!is_windows) {
        //Exec "id -u" and "id -g" to get the user and group id, and await the result
        user_id = await new Promise((resolve, reject) => {
          exec('id -u', (error, stdout, stderr) => {
            if (error) {
              reject(error);
            }
            resolve(stdout.trim());
          });
        });

        group_id = await new Promise((resolve, reject) => {
          exec('id -g', (error, stdout, stderr) => {
            if (error) {
              reject(error);
            }
            resolve(stdout.trim());
          });
        });

        if (!user_id || !group_id) {
          console.error('Error getting user and group id');
          return;
        } else {
          if (group_id < 500) {
            group_id = user_id;
          }
        }
      }

      final_user_id = await text({
        message: 'User ID:',
        placeholder: user_id,
        initialValue: user_id,
      });

      if (isCancel(final_user_id)) {
        cancel('Installation canceled');
        return process.exit(0);
      }

      final_group_id = await text({
        message: 'Group ID:',
        placeholder: group_id,
        initialValue: group_id,
      });

      if (isCancel(final_group_id)) {
        cancel('Installation canceled');
        return process.exit(0);
      }

      domain = await text({
        message: 'Domain:',
        placeholder: 'local.wp-boilerplate.com',
        initialValue: 'local.wp-boilerplate.com',
      });

      if (isCancel(domain)) {
        cancel('Installation canceled');
        return process.exit(0);
      }

      db_root_password = await text({
        message: 'Database root password:',
        placeholder: '****',
        validate(value) {
          if (value.length === 0) return `Value is required!`;
        },
      });

      if (isCancel(db_root_password)) {
        cancel('Installation canceled');
        return process.exit(0);
      }

      php_version = await text({
        message: 'PHP version:',
        placeholder: php_version,
        initialValue: php_version,
      });

      if (isCancel(php_version)) {
        cancel('Installation canceled');
        return process.exit(0);
      }

      const hostsLine = '127.0.0.1    ' + domain;

      if (!is_windows) {
        await new Promise((resolve, reject) => {
          // Check if the domain is already in /etc/hosts and add it if not
          const hostsFilePath = '/etc/hosts';

          console.log('Adding ' + hostsLine + ' to ' + hostsFilePath);
          console.log();

          exec(
            `grep -qxF '${hostsLine}' ${hostsFilePath} || echo '${hostsLine}' | sudo tee -a ${hostsFilePath}`,
            (error, stdout, stderr) => {
              if (error || stderr) {
                resolve(error || stderr);
                cancel(
                  'Error adding line to /etc/hosts. You must add it manually.'
                );
              } else {
                console.log('Domain added to /etc/hosts');
                resolve();
              }
            }
          );
        });
      } else {
        console.log(
          'Add the following line to your hosts file (C:\\Windows\\System32\\drivers\\etc\\hosts):'
        );
        console.log(hostsLine);
        console.log();
      }
    } else {
      engine = 'host';
    }

    environment = await select({
      message: 'Environment:',
      options: [
        { value: 'local', label: 'Local' },
        { value: 'development', label: 'Development' },
        { value: 'staging', label: 'Staging' },
        { value: 'production', label: 'Production' },
      ],
      initialValue: environment,
    });

    if (isCancel(environment)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    wp_version = await text({
      message: 'WordPress version:',
      placeholder: wp_version,
      initialValue: wp_version,
    });

    if (isCancel(wp_version)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    wp_title = await text({
      message: 'WordPress title:',
      placeholder: wp_title,
      initialValue: wp_title,
    });

    if (isCancel(wp_title)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    wp_admin_user = await text({
      message: 'WordPress admin user (login):',
      placeholder: wp_admin_user,
      initialValue: wp_admin_user,
    });

    if (isCancel(wp_admin_user)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    wp_admin_password = await text({
      message: 'WordPress admin password:',
      placeholder: '****',
      validate(value) {
        if (value.length === 0) return `Value is required!`;
      },
    });

    if (isCancel(wp_admin_password)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    wp_admin_email = await text({
      message: 'WordPress admin email:',
      placeholder: wp_admin_email,
      initialValue: wp_admin_email,
    });

    if (isCancel(wp_admin_email)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    wp_admin_nickname = await text({
      message: 'WordPress admin nickname:',
      placeholder: wp_admin_nickname,
      initialValue: wp_admin_nickname,
    });

    if (isCancel(wp_admin_nickname)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    wp_database_user = await text({
      message: 'WordPress database user:',
      placeholder: wp_database_user,
      initialValue: wp_database_user,
    });

    if (isCancel(wp_database_user)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    wp_database_password = await text({
      message: 'WordPress database password:',
      placeholder: '****',
      validate(value) {
        if (value.length === 0) return `Value is required!`;
      },
    });

    if (isCancel(wp_database_password)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    wp_database_name = await text({
      message: 'WordPress database name:',
      placeholder: wp_database_name,
      initialValue: wp_database_name,
    });

    if (isCancel(wp_database_name)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    wp_table_prefix = await text({
      message: 'WordPress table prefix:',
      placeholder: wp_table_prefix,
      initialValue: wp_table_prefix,
    });

    if (isCancel(wp_table_prefix)) {
      cancel('Installation canceled');
      return process.exit(0);
    }

    console.log();

    const directoryPath = process.cwd();
    const parentDirectory = path.dirname(directoryPath);

    // Delete .git subdirectory if exists and await the result
    const gitPath = path.join(parentDirectory, '.git');
    await new Promise((resolve, reject) => {
      if (fs.existsSync(gitPath)) {
        fs.rm(gitPath, { recursive: true }, (err) => {
          if (err) {
            reject(err);
            cancel('Error deleting .git directory');
            return;
          }

          resolve();
        });
      } else {
        resolve();
      }
    });

    //Replace php in composer.json with the selected PHP version
    const composerPath = path.join(parentDirectory, 'composer.json');
    const composerContent = fs.readFileSync(composerPath, 'utf8');
    const newComposerContent = composerContent
      .replace(/"php": ">=8.3"/, `"php": ">=${php_version}"`)
      .replace(/"php": "8.3"/, `"php": "${php_version}"`);

    await new Promise((resolve, reject) => {
      fs.writeFile(composerPath, newComposerContent, (err) => {
        if (err) {
          reject(err);
          cancel('Error writing to composer.json file');
          return;
        }

        resolve();
      });
    });

    if (docker) {
      // Duplicate .env.example to .env in parent subdirectory docker
      const envExamplePath = path.join(
        parentDirectory,
        'docker',
        '.env.example'
      );
      const envPath = path.join(parentDirectory, 'docker', '.env');

      // Delete .env file if exists and await the result
      await new Promise((resolve, reject) => {
        if (fs.existsSync(envPath)) {
          fs.rm(envPath, (err) => {
            if (err) {
              reject(err);
              cancel('Error deleting .env file');
              return;
            }

            resolve();
          });
        } else {
          resolve();
        }
      });

      await new Promise((resolve, reject) => {
        fs.copyFile(envExamplePath, envPath, (err) => {
          if (err) {
            reject(err);
            cancel('Error copying .env.example to .env');
            return;
          }

          resolve();
        });
      });

      // Replace placeholders in .env file
      const envContent = fs.readFileSync(envPath, 'utf8');
      const newEnvContent = envContent
        .replaceAll('local.wp-boilerplate.com', domain)
        .replace(
          /COMPOSE_PROJECT_NAME=.*/,
          `COMPOSE_PROJECT_NAME='${project_name}'`
        )
        .replace(/DOMAIN=.*/, `DOMAIN=${domain}`)
        .replace(/USER_ID=.*/, `USER_ID=${final_user_id}`)
        .replace(/GROUP_ID=.*/, `GROUP_ID=${final_group_id}`)
        .replace(
          /DB_ROOT_PASSWORD=.*/,
          `DB_ROOT_PASSWORD='${db_root_password}'`
        )
        .replace(/DB_USER=.*/, `DB_USER=${wp_database_user}`)
        .replace(/DB_PASSWORD=.*/, `DB_PASSWORD='${wp_database_password}'`)
        .replace(/PHP_VERSION=.*/, `PHP_VERSION=${php_version}`);

      await new Promise((resolve, reject) => {
        fs.writeFile(envPath, newEnvContent, (err) => {
          if (err) {
            reject(err);
            cancel('Error writing to .env file');
            return;
          }

          resolve();
        });
      });
    }

    // Edit .wp.env file
    const wpEnvPath = path.join(parentDirectory, 'sh', 'wp', '.wp.env');
    const wpEnvContent = fs.readFileSync(wpEnvPath, 'utf8');

    const newWpEnvContent = wpEnvContent
      .replace(/ENGINE=.*/, `ENGINE=${engine}`)
      .replace(/ENVIRONMENT=.*/, `ENVIRONMENT=${environment}`)
      .replace(/VERSION=.*/, `VERSION=${wp_version}`)
      .replace(/DOMAIN=.*/, `DOMAIN=${domain}`)
      .replace(/TITLE=.*/, `TITLE='${wp_title}'`)
      .replace(/DB_PREFIX=.*/, `DB_PREFIX=${wp_table_prefix}`);

    //Create new .wp.local.env file and write the content
    const wpLocalEnvPath = path.join(
      parentDirectory,
      'sh',
      'wp',
      '.wp.local.env'
    );

    var newWpLocalEnvContent = `# Admin user
ADMIN_NAME=${wp_admin_user}
ADMIN_PASSWORD='${wp_admin_password}'
ADMIN_EMAIL=${wp_admin_email}
ADMIN_NICKNAME='${wp_admin_nickname}'

# Database
DB_USER=${wp_database_user}
DB_PASSWORD='${wp_database_password}'
DB_DATABASE=${wp_database_name}
`;

    //Remove indent from the content
    newWpLocalEnvContent = newWpLocalEnvContent.replace(/ {8}/g, '');

    await new Promise((resolve, reject) => {
      fs.writeFile(wpLocalEnvPath, newWpLocalEnvContent, (err) => {
        if (err) {
          reject(err);
          cancel('Error writing to .wp.local.env file');
          return;
        }

        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      fs.writeFile(wpEnvPath, newWpEnvContent, (err) => {
        if (err) {
          reject(err);
          cancel('Error writing to .wp.env file');
          return;
        }

        resolve();
      });
    });

    // Move to parent directory
    process.chdir(parentDirectory);

    // Initialize git repository
    await new Promise((resolve, reject) => {
      exec('git init', (error, stdout, stderr) => {
        if (error || stderr) {
          reject(error || stderr);
          cancel(`Error executing 'git init': ${error || stderr}`);
          return;
        }

        //Console log success message with green color
        console.log(color.green('Git repository initialized successfully.'));
        resolve();
      });
    });

    // Exec docker/install.sh script
    if (docker) {
      // Move to docker directory
      process.chdir(path.join(parentDirectory, 'docker'));

      // Set COMPOSE_PROJECT_NAME environment variable
      process.env.COMPOSE_PROJECT_NAME = project_name;

      await checkPorts();

      await new Promise((resolve, reject) => {
        exec('bash install.sh', (error, stdout, stderr) => {
          if (error) {
            reject(error);
            cancel(
              `Error al ejecutar 'docker/install.sh': ${error.message} with exit code ${error.code}`
            );
            return;
          }
          if (stderr) {
            reject(stderr);
            cancel(`Error al ejecutar 'docker/install.sh': ${stderr}`);
            return;
          }

          //Console log success message with green color
          console.log(stdout);
          console.log(color.green('Docker initialized successfully.'));
          resolve();
        });
      });

      //Exec docker compose up -d with spawn to show the output in the console
      await new Promise((resolve, reject) => {
        spawn('docker', ['compose', 'up', '--build', '-d'], {
          stdio: 'inherit',
        }).on('exit', (code) => {
          if (code !== 0) {
            resolve(code);
            return;
          } else {
            resolve();
          }
        });
      });

      //Sleep 5 seconds to wait for the database to be ready
      s.start('Waiting for database to be ready...');
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 5000);
      });
      s.stop('Database ready');

      // Exec docker exec -it -u www-data ${COMPOSE_PROJECT_NAME}-wordpress composer update in interactive mode
      await new Promise((resolve, reject) => {
        spawn(
          'docker',
          [
            'exec',
            '-it',
            '-u',
            'www-data',
            `${project_name}-wordpress`,
            'composer',
            'update',
          ],
          { stdio: 'inherit' }
        ).on('exit', (code) => {
          if (code !== 0) {
            reject(code);
            cancel(`Error executing 'composer update': ${code}`);
            return;
          } else {
            resolve();
          }
        });
      });
    } else {
      //Exec composer update from parent directory
      process.chdir(parentDirectory);

      await new Promise((resolve, reject) => {
        spawn('composer', ['update'], { stdio: 'inherit' }).on(
          'exit',
          (code) => {
            if (code !== 0) {
              resolve(code);
              return;
            } else {
              resolve();
            }
          }
        );
      });
    }

    outro(color.inverse(' Installation completed '));
    outro(color.inverse(' Open https://' + domain + ' in your browser'));
  } catch (error) {
    console.error(error);
  }
}

main();
