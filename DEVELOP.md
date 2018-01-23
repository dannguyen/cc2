# Developer notes

Running locally:

```sh
$ npm run dev
```


## Setting up the environment

Create a copy of the [.env.sample](.env.sample) template file and rename it `.env`


### Airtable

[Sign up for an Airtable account](https://airtable.com/signup). 

In the [Account screen](https://airtable.com/account), an **API key** will be listed. Use this for the `AIRTABLE_KEY` value in `.env`

For the `AIRTABLE_BASE` value, visit this Airtable base template:

https://airtable.com/shrdpMJeeEuMJPkO1/

And make your own **copy** of it by clicking the **Copy base** button in the top right corner.

Now visit the Airbase API dashboard at: https://airtable.com/api

Look for the base that you just copied (should have a name like `cc-template`), and click on it.

Pull the Base ID from the example URL they give in the introduction to the base you chose. (It's the value between / / and looks like apphXmBxHuxynZ2Kf)

Use this value for `AIRTABLE_BASE`

More info here: [Airtable: How to connect](http://help.grow.com/connecting-your-data/airtable/airtable-how-to-connect)

### Twilio

Sign up for a [Twilio account](https://www.twilio.com/try-twilio).

The `.env` values for `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` can be found in the Twilio console: https://www.twilio.com/console





