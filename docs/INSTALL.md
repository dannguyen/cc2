# Setting up your own instance of Call Collect

Updated 2018-02-27

## Overview

Currently there is no central/"pro" version of Call Collect that exists out on the Internet that you can pay to use. Instead, it's designed so you can run your own copy of the software for your newsroom/organization, easily and with little cost (probably around $2-10 a month). For example, if your publication is called *Hogsmeade Quarterly*, you could host it at [hqcallcollect.now.sh](https://hqcallcollect.now.sh) behind a passphrase that you share with your team.

Call Collect relies on several other Internet services—to store your data, handle phone calls, transcribe audio, and host its web server. This guide will help you set up and retrieve a key (🗝) or two from each one, which you'll input into this page. Then it will spit out your running Call Collect instance! 🔓🎁

This setup webpage **does not store any of the private information** you input! It just combines the keys you provide by running some code in your web browser, on your own computer, and then sends them to a service [Zeit Now](https://zeit.co/now) that will create and host your new web server. *Always be wary of sharing sensitive info like keys.*

The setup process should take you 5-20 minutes total, depending on whether you already have accounts for some of the services. **You don't need any special technical expertise to do this setup!** I know that working with various web services and signing up for new accounts can be intimidating/annoying, but I really hope that this guide makes it as painless as possible. If you run into issues, please feel free to leave a message [through this form](https://github.com/alecglassford/cc2/issues/new) if you have a GitHub account, or [over email](mailto:glassford@cs.stanford.edu).

Ready? Here we go!

## Gathering your keys

### Airtable

Airtable is a product that makes it easy to store data online. It lets you make "bases" which are sort of hybrid databases/spreadsheets, but they also make it easy to store "binary" data (in our case, audio files). This handles much of Call Collect's data storage needs.

[You can read about their pricing here](https://airtable.com/pricing), but you don't need a credit card to sign up and you'll probably be fine with their free plan. We'll only be storing the audio for your prompts (not the recordings your receive from listeners) in Airtable, so the 2GB of space shouldn't be a problem, and if you get more than 1,200 records you can upgrade to a paid plan or swap out your key for a new base. (TK information on this)

Here's what you need to do:

1. Go to [this link, which will attempt to clone a template Call Collect "base"](https://airtable.com/addBaseFromShare/shrNrZaQDNc8VxsKg). If you don't have an Airtable account, you'll be prompted to create one.

2. You may be asked to choose a workspace to add the base to, in which case you can choose any (preferably an empty one). If you just created a new Airtable account, it will probably automatically put it in a workspace called "My First Workspace." You can rename the workspace and base if you want, but you don't need to.

3. Go to [your account page](https://airtable.com/account). Toward the bottom, you'll see blue text that reads "Generate API Key." Click on this, and you should see a string of text that looks something like `keyMBHYWYitmZM92U`—this key will let Call Collect access your base. Copy and paste it into the box below:

  🗝 Your Airtable API key: <input id="airtable-key" type="text">

4. Now go to [this page, which leads to some documentation](https://airtable.com/api). (You don't actually have to read anything if you don't want; we just need to get an ID that identifies your base.) You should see the base we created somewhere under "Select a base to view API documentation"; it should have a little purple megaphone icon. Click on this.

5. This should take you to a page with a URL like `https://airtable.com/appKnWnJTYPq9Wrxd/api/docs#curl/introduction` (it doesn't matter if the format matches exactly). Copy the ID string in that URL (in my case it would be `appKnWnJTYPq9Wrxd`) and paste it into the box below:

  🗝 Your Airtable base ID: <input id="airtable-base" type="text">

6. You're done! 🎉

### Twilio

Twilio is a web service that lets you programmatically do all sorts of useful stuff with phones. Call Collect uses it to create digital phone numbers and use them to handle and record calls.

[It does cost a little bit of money.](https://www.twilio.com/voice/pricing/us) You'll pay $1/month for each phone number you create as long as it exists and about 1.1 cents/minute for handling and recording calls. Twilio also stores these recordings for us; the first 10,000 minutes of storage are free, which is more than enough for long time, and then it starts to charge a very small amount per month.

A rough cost estimate here, so you can get an idea: If you have 2 projects active in Call Collect and gather an hour of audio for each one over a month, that's going to cost about $3.50.

Here's what you need to do:

1. [Sign up for a Twilio account](https://www.twilio.com/try-twilio), if you don't have one, or else [log in](https://www.twilio.com/login). While Twilio offers a free trial, it doesn't allow for all the features we need, so you'll need to [load in some money](https://www.twilio.com/console/billing). Twilio requires you load at least $20, but as noted above, this will probably last you months. Thankfully it lets you disable "auto recharge," which means that if you use up all your money it won't automatically bill your credit card; it'll just shut down your phone numbers.

2. Go to [your Twilio console](https://www.twilio.com/console/). In the upper left box, titled "Project Info," you'll see something called "Account SID." (It should look like `ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`.) This identifies your Twilio account for Call Collect. Copy that string of text and paste it into the box below:

  🗝 Your Twilio account SID: <input id="twilio-account-sid" type="text">

3. In that same "Project Info" box, under the account SID, there should be something called "Auth Token." It will likely be hidden, so you'll need to click a little eye symbol (👁) to display it. (It should look like `04e7e977ead8da315a806288ca162cd5`.) This, together with the Account SID, lets Call Collect access your Twilio account. Copy it and paste it into the box below:

  🗝 Your Twilio auth token: <input id="twilio-auth-token" type="text">

4. You're done! 🎉

### Google Cloud Platform (optional)

Google's [speech service](https://cloud.google.com/speech/) provides pretty decent audio-to-text transcription affordably. The service currently requires that Call Collect transfers audio from Twilio into Google's own [storage service](https://cloud.google.com/storage/) so we'll need to enable that too.

While these services can incur charges, you get a lot of stuff for free every month, and if you've never used Google's "Cloud Platform" before they'll also give you $300 credit for your first year. So while you'll need to give a credit card number, you probably won't have to pay anything for at least a year. (🔥 tip: Many credit cards let you create "virtual" cards via their websites, with limited amounts of money in them. I made one with a $10 limit, so even if I accidentally use these services more than intended, Google won't be able to charge me much.) (TK more useful pricing info)

This one takes a few steps, and you can skip it if you want; your instance of Call Collect just won't do transcription.

Here's what you need to do:

1. [Go here and create a new project in Google Cloud Platform](https://console.cloud.google.com/projectcreate) You'll be prompted to create a Google account if you don't have one, or to sign in. You can name your project whatever you want (e.g. `hogsmeade-quarterly-call-collect`).

2. [Go to the Speech API page.](https://console.cloud.google.com/apis/library/speech.googleapis.com) The name of your new project should be in the blue bar at the top of the page; if it isn't, you may have to wait a minute or so for it to finish getting created (refresh …). Click the blue "Enable" button to turn on the speech service. If you haven't added a credit card to your account, you'll be directed to "enable billing." Do that, then try this step again, making sure that you see a green checkmark and "API enabled."

3. [Go to the Google Cloud Storage page](https://console.cloud.google.com/storage) and enable Storage as well.

4. Okay, here's the most convoluted part! After this, it's all downhill. Ready? [Go to the credentials page.](https://console.cloud.google.com/apis/credentials), make sure your project is active (in the blue bar at the top), and click "Create credentials" then select "Service account key." Use the "Service account" dropdown to create a new service account. Name it whatever you want (e.g. `call-collect-user`) and from the "Role" dropdown, scroll all the way to the bottom, hover over "Storage" and choose "Storage Admin." What we're doing here is selecting some permissions to give to Call Collect, so it's able to do all the things it needs with your Google account but no more.

  Make sure "JSON" is elected under "Key type" and click the blue "Create" button. A file with a name like `hogsmeade-quarterly-62460ff5e214.json` should get downloaded to your computer. Now use the button below to load that file into this web page:

  🗝 Your Google key file: <input id="google-creds" type="file" accept=".json">

  *Please know that the file is not actually getting uploaded anywhere, just loaded into your web browser so we can deploy it to your new Call Collect instance. I promise I'm not saving any of your sensitive information, and I encourage you to view the source of this page and [the code of the project more generally](https://github.com/alecglassford/cc2) to verify this!!!*

5. You're done! 🎉

### Zeit Now

Zeit Now is where your instance of Call Collect will live. It will provide the admin interface that you can use to work with projects and submissions, and it will run all the code that ties together these different pieces. This is the last key, and we're almost done!

This will be totally free. Here's what you need to do:

1. [Create a Zeit account, or login if you already have one.](https://zeit.co/login)

2. [Go to the tokens page in your account settings.](https://zeit.co/account/tokens) Type "call-collect" (or any other memorable name) into the box that says "Create a new token by entering its name…" and hit enter. It should show up in the list above. Click "reveal" next to your new token and copy the "Secret" string of text that shows up (it should look like `oDGiEsH7irIvB5871buaVMzs`) and paste it into the box below:

    🗝 Your Zeit Now token: <input id="now-token" type="text">

3. You're done! 🎉

### 🎊🎊🎊

You've gathered all your keys! *Phew!* Good work.

## Extra bits for configuration

A couple of last things before we get this show on the road:

* What would you like the URL for your Call Collect instance to be? (e.g. `hqcallcollect.now.sh`) We'll try to get it; if it's not available, we'll get something similar but with random letters or numbers appended to the first part.

  🔖 Your preferred URL: <input id="subdomain" type="text">.now.sh

* Pick a passphrase that you can share with your whole team (e.g. `the three broomsticks`). They'll need it to access the admin interface.

  🔖 Your team's passphrase: <input id="passphrase" type="text">

## Deploy!

When you're ready to go, click this button and we'll try to make you wonderful little thing on the Internet: <button id="deploy">Make it.</button>
