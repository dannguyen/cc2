(function () {
'use strict';

/* eslint-env browser */

var deployFilesBase = 'https://raw.githubusercontent.com/alecglassford/cc2/master/';

var getDeployFiles = function getDeployFilesFunc() {
  return fetch('deploy-files.json')
    .then(function (res) {
      if (!res.ok) { throw new Error(("Failed to get list of deploy files: " + (res.status) + " " + (res.statusText))); }
      return res.json();
    }).then(function (filenames) {
      var files = filenames.map(function (file) { return fetch(("" + deployFilesBase + file))
          .then(function (res) {
            if (!res.ok) { throw new Error(("Failed to get " + deployFilesBase + file + ": " + (res.status) + " " + (res.statusText))); }
            return res.text();
          }).then(function (data) { return ({ file: file, data: data }); }); });
      return Promise.all(files);
    });
};

var postInit = function postInitBaseFunc(nowToken, body) {
  return {
    method: 'POST',
    headers: {
      Authorization: ("Bearer " + nowToken),
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
    mode: 'cors',
  };
};

var getAlias = function getAliasFunc(id, alias, nowToken) {
  var postBody = { alias: alias };
  fetch(("https://api.zeit.co/v2/now/deployments/" + id + "/aliases"), postInit(nowToken, postBody))
    .then(function (aliasRes) {
      if (aliasRes.status === 400) {
        setTimeout(getAlias, 10000, id, alias, nowToken);
        return;
      }
      if (!aliasRes.ok) { throw new Error('Could not get preferred URl.'); }
      alert(("Done! Your instance is available at " + alias + " 🎉"));
    }).catch(function () {
      alert('Failed to get your preferred URL. Oh well.');
    });
};

var deploy = function deployFunc(env) {
  var nowToken = document.getElementById('now-token').value;
  if (!nowToken) {
    alert('Please enter your Now token.');
    return;
  }
  var name = document.getElementById('subdomain').value;
  if (!name) {
    alert('Please enter a preferred URL.');
    return;
  }
  getDeployFiles()
    .then(function (files) {
      var postBody = {
        env: env,
        public: true,
        forceNew: true,
        name: name,
        deploymentType: 'NPM',
        files: files,
      };
      return fetch('https://api.zeit.co/v3/now/deployments', postInit(nowToken, postBody));
    })
    .then(function (nowRes) {
      if (!nowRes.ok) { throw new Error(("Deploy failed: " + (nowRes.status) + " " + (nowRes.statusText))); }
      return nowRes.json();
    }).then(function (success) {
      var url = success.url;
      var deploymentId = success.deploymentId;
      alert(("Your instance is available at " + url + " 🎉\nWe're still trying to get " + name + ".now.sh - keep this page open."));
      getAlias(deploymentId, (name + ".now.sh"), nowToken);
    })
    .catch(function (err) {
      alert(err);
    });
};

var setEnvAndDeploy = function setEnvAndDeployFunc() {
  var env = {
    AIRTABLE_KEY: document.getElementById('airtable-key').value,
    AIRTABLE_BASE: document.getElementById('airtable-base').value,
    TWILIO_ACCOUNT_SID: document.getElementById('twilio-account-sid').value,
    TWILIO_AUTH_TOKEN: document.getElementById('twilio-auth-token').value,
    PASSPHRASE: document.getElementById('passphrase').value,
  };
  var allEnvSet = Object.entries(env).every(function (ref) {
    var key = ref[0];
    var val = ref[1];

    if (!val) {
      alert(("Please set " + key));
      return false;
    }
    return true;
  });
  if (!allEnvSet) { return; }

  var googleCredsFile = document.getElementById('google-creds').files[0];
  if (!googleCredsFile) {
    alert('Please "upload"your Google key file.');
    return;
  }
  var reader = new FileReader();
  reader.onload = function doneReadingGoogleCreds() {
    env.GOOGLE_CREDS_STRING = reader.result;
    deploy(env);
  };
  reader.readAsText(googleCredsFile);
};

document.getElementById('deploy').addEventListener('click', setEnvAndDeploy);

}());
