/* eslint-env browser */

const deployFilesBase = 'https://raw.githubusercontent.com/alecglassford/cc2/master/';

const getDeployFiles = function getDeployFilesFunc() {
  return fetch('deploy-files.json')
    .then(res => res.json())
    .then((filenames) => {
      const files = filenames.map(file =>
        fetch(`${deployFilesBase}${file}`)
          .then(res => res.text())
          .then(data => ({ file, data })));
      return Promise.all(files);
    });
};

const deploy = function deployFunc(env) {
  getDeployFiles()
    .then((files) => {
      const postBody = {
        env,
        public: true,
        forceNew: true,
        name: document.getElementById('subdomain').value,
        deploymentType: 'NPM',
        files,
      };
      console.log(postBody);
      const nowToken = document.getElementById('now-token').value;
      console.log(nowToken);
      return fetch('https://api.zeit.co/v3/now/deployments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${nowToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(postBody),
        mode: 'cors',
      });
    })
    .then(nowRes => nowRes.json()).then((success) => {
      console.log('success?');
      console.log(success);
    })
    .catch((err) => {
      console.error(err);
    });
};

const setEnv = function setEnvFunc() {
  const env = {
    AIRTABLE_KEY: document.getElementById('airtable-key').value,
    AIRTABLE_BASE: document.getElementById('airtable-base').value,
    TWILIO_ACCOUNT_SID: document.getElementById('twilio-account-sid').value,
    TWILIO_AUTH_TOKEN: document.getElementById('twilio-auth-token').value,
    PASSPHRASE: document.getElementById('passphrase').value,
  };

  const gooogleCredsFile = document.getElementById('google-creds').files[0];
  const reader = new FileReader();
  reader.onload = function doneReadingGoogleCreds() {
    env.GOOGLE_CREDS_STRING = reader.result;
    deploy(env);
  };
  reader.readAsText(gooogleCredsFile);
};

document.getElementById('deploy').addEventListener('click', setEnv);
