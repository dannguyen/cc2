/* eslint-env browser */

const deployFilesBase = 'https://raw.githubusercontent.com/alecglassford/cc2/master/';

const getDeployFiles = function getDeployFilesFunc() {
  return fetch('deploy-files.json')
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to get list of deploy files: ${res.status} ${res.statusText}`);
      return res.json();
    }).then((filenames) => {
      const files = filenames.map(file =>
        fetch(`${deployFilesBase}${file}`)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to get ${deployFilesBase}${file}: ${res.status} ${res.statusText}`);
            return res.text();
          }).then(data => ({ file, data })));
      return Promise.all(files);
    });
};

const postInit = function postInitBaseFunc(nowToken, body) {
  return {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${nowToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
    mode: 'cors',
  };
};

const getAlias = function getAliasFunc(id, alias, nowToken) {
  const postBody = { alias };
  fetch(`https://api.zeit.co/v2/now/deployments/${id}/aliases`, postInit(nowToken, postBody))
    .then((aliasRes) => {
      if (aliasRes.status === 400) {
        setTimeout(getAlias, 10000, id, alias, nowToken);
        return;
      }
      if (!aliasRes.ok) throw new Error('Could not get preferred URl.');
      alert(`Done! Your instance is available at ${alias} 🎉`);
    }).catch(() => {
      alert('Failed to get your preferred URL. Oh well.');
    });
};

const deploy = function deployFunc(env) {
  const nowToken = document.getElementById('now-token').value;
  if (!nowToken) {
    alert('Please enter your Now token.');
    return;
  }
  const name = document.getElementById('subdomain').value;
  if (!name) {
    alert('Please enter a preferred URL.');
    return;
  }
  getDeployFiles()
    .then((files) => {
      const postBody = {
        env,
        public: true,
        forceNew: true,
        name,
        deploymentType: 'NPM',
        files,
      };
      return fetch('https://api.zeit.co/v3/now/deployments', postInit(nowToken, postBody));
    })
    .then((nowRes) => {
      if (!nowRes.ok) throw new Error(`Deploy failed: ${nowRes.status} ${nowRes.statusText}`);
      return nowRes.json();
    }).then((success) => {
      const { url, deploymentId } = success;
      alert(`Your instance is available at ${url} 🎉\nWe're still trying to get ${name}.now.sh - keep this page open.`);
      getAlias(deploymentId, `${name}.now.sh`, nowToken);
    })
    .catch((err) => {
      alert(err);
    });
};

const setEnvAndDeploy = function setEnvAndDeployFunc() {
  const env = {
    AIRTABLE_KEY: document.getElementById('airtable-key').value,
    AIRTABLE_BASE: document.getElementById('airtable-base').value,
    TWILIO_ACCOUNT_SID: document.getElementById('twilio-account-sid').value,
    TWILIO_AUTH_TOKEN: document.getElementById('twilio-auth-token').value,
    PASSPHRASE: document.getElementById('passphrase').value,
  };
  const allEnvSet = Object.entries(env).every(([key, val]) => {
    if (!val) {
      alert(`Please set ${key}`);
      return false;
    }
    return true;
  });
  if (!allEnvSet) return;

  const googleCredsFile = document.getElementById('google-creds').files[0];
  if (!googleCredsFile) {
    alert('Please "upload"your Google key file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function doneReadingGoogleCreds() {
    env.GOOGLE_CREDS_STRING = reader.result;
    deploy(env);
  };
  reader.readAsText(googleCredsFile);
};

Array.from(document.querySelectorAll('.user-input input')).forEach((el) => {
  el.addEventListener('change', () => {
    if (el.value) el.parentNode.classList.add('filled');
    else el.parentNode.classList.remove('filled');
  });
});
document.getElementById('deploy').addEventListener('click', setEnvAndDeploy);
