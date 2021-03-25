# Super Dynamic React Form

Normal dynamic forms assume the backend sends everything at once. But what if you have to get the Options for a select with a separate async call? What if you have to get the Conditional Fields by pseudo-submitting the unfinished unvalidated form to a second endpoint to get back a similar half-finished form with new fields added? (That breaks Formik's assumptions.)

### `npm run start`

Runs the app in the development mode on [http://localhost:3000](http://localhost:3000)

Was formerly a create-react-app app, but react-scripts breaks the Typescript on useAsync's tuple.
