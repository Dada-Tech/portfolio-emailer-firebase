## Usage
npm install

## Back End - Contact Form
### Technologies used:
* Firebase
* Firestore (NoSQL DB)
* Node
* Express
* Captcha v3
* Security Middleware (CORS, input validation)

I built this API to connect to my "Contact us" form and hosted on Google's Firebase (Cloud). Upon submitting, the form generates a token via Google's captcha V3 api.
With the form values and the generated captcha token, the form is submitted to my server via a POST request.
On my server, I implemented middleware and an Express endpoint to handle such a request.
I used CORS middleware to only allow traffic from whitelisted domains as a security measure.
I created middleware for basic input validation.
I created middleware to validate the submitted form Captcha token sent with the form to prevent spam.
Finally, I upload the valid form data into Firestore, Google's NoSQL database. 

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) installed.

```
npm install
npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).
